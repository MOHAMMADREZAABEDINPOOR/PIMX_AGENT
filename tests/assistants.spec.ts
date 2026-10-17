import { test, expect } from '@playwright/test';
import { createServer } from 'node:http';
import { SEEDED_PERSONAS, assembleSystemPrompt } from '../lib/prompt/assembly.ts';
import { mergePersonas, personaSelectionPatch, personaReasoningEffort } from '../lib/prompt/personas';
import { DEFAULT_SETTINGS } from '../lib/store/useAppStore';
import type { ChatEntity } from '../lib/types';

const origin = 'http://localhost:3010';
const chat: ChatEntity = { id: 'assistant-test', title: 'Assistant checks', toolMode: 'NONE', activeTools: [], modelIds: ['custom-assistant/test-model'], createdAt: 1, updatedAt: 1 };

test('catalog upgrades existing libraries without losing edits or custom profiles', () => {
  expect(SEEDED_PERSONAS).toHaveLength(30);
  expect(new Set(SEEDED_PERSONAS.map(p => p.id)).size).toBe(30);
  expect(new Set(SEEDED_PERSONAS.map(p => p.instructions)).size).toBe(30);
  const edited = { ...SEEDED_PERSONAS[0], instructions: 'My own architecture instructions' };
  const custom = { ...edited, id: 'my-custom', builtIn: false };
  const result = mergePersonas([edited, ...SEEDED_PERSONAS.slice(1, 10), custom], SEEDED_PERSONAS);
  expect(result).toHaveLength(31);
  expect(result.find(p => p.id === edited.id)?.instructions).toBe(edited.instructions);
  expect(mergePersonas(result, SEEDED_PERSONAS)).toEqual(result);
});

test('selection preserves chat directives and cleans legacy copies on switching and detaching', () => {
  const [first, next] = SEEDED_PERSONAS;
  const configured = { ...chat, personaId: first.id, systemPrompt: 'Keep my own chat instructions', temperature: 0.8 };
  expect({ ...configured, ...personaSelectionPatch(configured, first, next) }).toMatchObject({ personaId: next.id, systemPrompt: configured.systemPrompt, temperature: 0.8 });
  const legacy = { ...chat, personaId: first.id, systemPrompt: first.instructions, temperature: first.temperature };
  const switched = { ...legacy, ...personaSelectionPatch(legacy, first, next) };
  const prompt = assembleSystemPrompt({ chat: switched, persona: next });
  expect(prompt).toContain(next.instructions);
  expect(prompt).not.toContain(first.instructions);
  const detached = { ...switched, ...personaSelectionPatch(switched, next) };
  expect(assembleSystemPrompt({ chat: detached })).not.toContain('ASSISTANT PERSONA');
  expect(personaReasoningEffort({ ...first, reasoningEffort: 'OFF' }, 'LOW')).toBe('LOW');
});

for (const [index, persona] of SEEDED_PERSONAS.entries()) {
  test(`${persona.name}: activate in Hub, send through real API and receive upstream answer`, async ({ page }) => {
    let upstream: any;
    let submitted: any;
    page.on('request', request => {
      if (request.url().endsWith('/api/chat') && request.method() === 'POST') submitted = request.postDataJSON();
    });
    const server = createServer(async (req, res) => {
      let raw = ''; for await (const chunk of req) raw += chunk;
      upstream = JSON.parse(raw);
      const content = `Upstream reply for ${persona.name}.`;
      res.setHeader('Content-Type', upstream.stream ? 'text/event-stream' : 'application/json');
      res.end(upstream.stream
        ? `data: ${JSON.stringify({ choices: [{ delta: { content } }] })}\n\ndata: [DONE]\n\n`
        : JSON.stringify({ choices: [{ message: { content } }] }));
    });
    await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
    try {
      const baseUrl = `http://127.0.0.1:${(server.address() as { port: number }).port}`;
      const api = page.context().request;
      await api.get('/api/workspace?key=1');
      const credentials = await (await api.get('/api/credentials')).json();
      for (const credential of credentials.credentials) await api.delete('/api/credentials?id=' + credential.id, { headers: { Origin: origin } });
      const added = await api.post('/api/credentials', { headers: { Origin: origin }, data: { providerId: 'custom-assistant', label: 'Assistant test', apiKey: 'local-test-key', baseUrl } });
      expect(added.ok()).toBeTruthy();
      const { credential } = await added.json();
      const data = {
        settings: { ...DEFAULT_SETTINGS, themeMode: index % 2 ? 'LIGHT' : 'DARK', aiReactions: false, thinkingMode: false, streamResponses: index % 2 === 0, reasoningEffort: 'LOW' },
        models: [{ id: chat.modelIds![0], providerId: 'custom-assistant', upstreamId: 'test-model', displayName: 'Local test model', apiFormat: 'OPENAI', visible: true, reasoningCapable: true, maxOutputTokens: 16000, contextWindow: 32000 }],
        customProviders: [{ id: 'custom-assistant', name: 'Assistant test', baseUrl, apiFormat: 'OPENAI' }],
        accounts: [{ id: 'assistant-account', providerId: 'custom-assistant', credentialId: credential.id, enabled: true, baseUrlOverride: baseUrl }],
        selectedModelIds: chat.modelIds, chats: [chat], activeChatId: chat.id, messages: {},
        // Simulate an existing installation with only the old ten profiles.
        personas: SEEDED_PERSONAS.slice(0, 10),
      };
      await page.addInitScript(data => {
        localStorage.setItem('pimx_cookie_consent', 'rejected');
        localStorage.setItem('pimx_agent_v1_store', JSON.stringify(data));
      }, data);
      await page.route('**/api/chat/title', route => route.fulfill({ json: { title: 'Assistant checks' } }));
      await page.route('**/api/search?*', route => route.fulfill({ json: { results: [{ title: 'Test evidence', url: 'https://example.com/evidence', snippet: 'Controlled research evidence.' }] } }));
      await page.route('https://fonts.googleapis.com/**', route => route.abort());
      await page.route('https://fonts.gstatic.com/**', route => route.abort());
      if (index % 3 === 0) await page.setViewportSize({ width: 390, height: 844 });
      await page.goto('/chat');
      await expect(page.locator('#composer-input')).toBeVisible();
      // Desktop drawer stays visible; mobile opens it through the header.
      if (page.viewportSize()!.width < 1024) await page.locator('#btn-toggle-drawer').click();
      await page.locator('#btn-open-workspace').click();
      await expect(page.locator('[data-assistant-id]')).toHaveCount(30);
      const card = page.locator(`[data-assistant-id="${persona.id}"]`);
      await card.getByRole('button', { name: 'Activate for This Chat', exact: true }).click();
      const welcome = page.locator('.assistant-welcome');
      await expect(welcome.getByRole('heading', { name: persona.name, exact: true })).toBeVisible();
      await expect(welcome).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
      await expect(welcome).toHaveCSS('border-top-width', '0px');
      expect(await welcome.evaluate(el => {
        for (let node: Element | null = el; node; node = node.parentElement) {
          const css = getComputedStyle(node);
          if (css.filter !== 'none' || css.perspective !== 'none') return false;
        }
        return getComputedStyle(el).transform === 'none';
      })).toBe(true);
      const width = await welcome.boundingBox();
      expect(width!.x).toBeGreaterThanOrEqual(0);
      expect(width!.x + width!.width).toBeLessThanOrEqual(page.viewportSize()!.width);
      if (index < 2) await page.screenshot({ path: `artifacts/qa/assistant-${index ? 'light-desktop' : 'dark-mobile'}.png` });
      await page.locator('#composer-input').fill('Help me evaluate the supplied example.');
      await page.locator('#btn-send-message').click();
      await expect(page.locator('.assistant-message').last()).toContainText(`Upstream reply for ${persona.name}.`, { timeout: 20000 });
      const system = upstream.messages.find((m: any) => m.role === 'system').content;
      expect(system).toContain(`ASSISTANT PERSONA: ${persona.name}`);
      expect(system).toContain(persona.instructions);
      expect(system.split(persona.instructions)).toHaveLength(2);
      expect(upstream.temperature).toBe(persona.temperature);
      expect(upstream.top_p).toBe(persona.topP);
      expect(upstream.stream).toBe(index % 2 === 0);
      expect(submitted.reasoningEffort).toBe(persona.reasoningEffort ?? 'LOW');
      await page.getByTitle('Detach Assistant', { exact: true }).click();
      await page.locator('#composer-input').fill('Reply again after detaching.');
      await page.locator('#btn-send-message').click();
      await expect(page.locator('.assistant-message')).toHaveCount(2);
      await expect(page.locator('.assistant-message').last()).toContainText('Upstream reply');
      expect(upstream.messages.find((m: any) => m.role === 'system').content).not.toContain('ASSISTANT PERSONA:');
      if (index === SEEDED_PERSONAS.length - 1) {
        if (page.viewportSize()!.width < 1024) await page.locator('#btn-toggle-drawer').click();
        await page.locator('#btn-open-workspace').click();
        await page.locator(`[data-assistant-id="${persona.id}"]`).getByTitle('Start New Dedicated Chat', { exact: true }).click();
        await expect(page.locator('.assistant-welcome')).toContainText(persona.name);
        await page.locator('#composer-input').fill('Use the new dedicated conversation.');
        await page.locator('#btn-send-message').click();
        await expect(page.locator('.assistant-message')).toHaveCount(1);
        await expect(page.locator('.assistant-message')).toContainText('Upstream reply');
        expect(upstream.messages.filter((m: any) => m.role === 'user')).toHaveLength(1);
        expect(upstream.messages.find((m: any) => m.role === 'system').content).toContain(persona.instructions);
        await page.reload();
        await expect(page.locator('.assistant-message')).toContainText('Upstream reply');
        await expect(page.getByTitle('Detach Assistant', { exact: true })).toBeVisible();
      }
    } finally { server.closeAllConnections(); await new Promise<void>(resolve => server.close(() => resolve())); }
  });
}
