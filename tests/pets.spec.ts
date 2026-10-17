import { test, expect, type Page } from '@playwright/test';
import { petMood, pawPosition } from '../lib/companion/behavior';
import { DEFAULT_SETTINGS } from '../lib/store/useAppStore';
import type { MessageEntity } from '../lib/types';

const message = { id: 'reply', chatId: 'pet-chat', role: 'assistant', state: 'STREAMING', content: '', createdAt: 1 } as MessageEntity;
test('Pip reports actual tool phases and never celebrates an error', () => {
  const step = (toolName: string) => ({ id: 'step', toolName, input: {}, status: 'CALLING' as const, timestamp: 1 });
  expect(petMood(true, { ...message, toolSteps: [step('agent_plan')] }, false, false)).toBe('think');
  for (const tool of ['web_search', 'agent_read']) expect(petMood(true, { ...message, toolSteps: [step(tool)] }, false, false)).toBe('search');
  expect(petMood(true, message, false, false)).toBe('work');
  expect(petMood(true, { ...message, reasoning: 'Completed plan', toolSteps: [{ ...step('agent_plan'), status: 'DONE' }] }, false, false)).toBe('work');
  expect(petMood(false, { ...message, state: 'ERROR' }, true, false)).toBe('error');
  expect(petMood(false, { ...message, state: 'DONE' }, true, false)).toBe('happy');
});

test('stance paws remain planted while the return stroke lifts off the floor', () => {
  const a = pawPosition(0.1), b = pawPosition(0.4);
  const travelled = (0.4 - 0.1) * 18 / 0.62;
  expect(a.lift).toBe(0); expect(b.lift).toBe(0);
  expect(b.x + travelled).toBeCloseTo(a.x, 6);
  expect(pawPosition(0.8).lift).toBeGreaterThan(8);
  expect(pawPosition(0.999).x).toBeCloseTo(pawPosition(0).x, 0);
});

async function seed(page: Page, tools: string[] = []) {
  await page.addInitScript(({ settings, tools }) => {
    localStorage.setItem('pimx_cookie_consent', 'rejected');
    localStorage.setItem('pimx_agent_v1_store', JSON.stringify({
      settings: { ...settings, aiReactions: false, themeMode: 'DARK' },
      models: [{ id: 'gemini/test', providerId: 'gemini', upstreamId: 'test', displayName: 'Pet test', visible: true, apiFormat: 'OPENAI', maxOutputTokens: 16000 }],
      selectedModelIds: ['gemini/test'], chats: [{ id: 'pet-chat', title: 'Pet test', modelIds: ['gemini/test'], toolMode: 'NONE', activeTools: tools, thinkingEnabled: tools.includes('THINK'), webSearchEnabled: tools.includes('WEB_SEARCH'), createdAt: 1, updatedAt: 1 }],
      activeChatId: 'pet-chat', messages: {},
    }));
  }, { settings: DEFAULT_SETTINGS, tools });
  await page.route('**/api/chat/title', route => route.fulfill({ json: { title: 'Pet test' } }));
  await page.goto('/chat');
  await expect(page.locator('#composer-input')).toBeVisible();
}

test('articulated walk moves continuously, pauses on hover, and respects keyboard and reduced motion', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 850 });
  await seed(page);
  const pet = page.locator('.pimx-pet'), leg = pet.locator('[data-leg] path').last();
  await page.mouse.move(370, 40);
  await expect(pet).toHaveAttribute('data-motion', 'walking', { timeout: 7000 });
  const first = await leg.getAttribute('d'), start = await pet.boundingBox();
  await expect.poll(() => leg.getAttribute('d')).not.toBe(first);
  await expect.poll(async () => (await pet.boundingBox())!.x - start!.x).toBeGreaterThan(15);
  const box = await pet.boundingBox();
  await page.mouse.move(box!.x + 40, box!.y + 40);
  await expect(pet).toHaveAttribute('data-motion', 'resting');
  const stopped = await pet.boundingBox();
  await page.waitForTimeout(400);
  expect((await pet.boundingBox())!.x).toBeCloseTo(stopped!.x, 1);
  await pet.locator('.pet-body').focus();
  await page.keyboard.press('ArrowUp');
  expect((await pet.boundingBox())!.y).toBeCloseTo(stopped!.y - 24, 0);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.mouse.move(370, 40);
  await expect(pet).toHaveAttribute('data-paused', 'true');
  const paused = await pet.boundingBox();
  await page.waitForTimeout(1800);
  expect((await pet.boundingBox())!.x).toBeCloseTo(paused!.x, 1);
  await page.screenshot({ path: 'artifacts/qa/pip-robot-fox-mobile.png' });
});

test('research poses follow actual planning, searching and answer phases', async ({ page }) => {
  let plan!: () => void, search!: () => void, answer!: () => void;
  const planning = new Promise<void>(r => { plan = r; });
  const searching = new Promise<void>(r => { search = r; });
  const answering = new Promise<void>(r => { answer = r; });
  await page.route('**/api/chat', async route => {
    const isPlan = route.request().postDataJSON().systemPrompt.includes('[AGENT_PLANNING]');
    await (isPlan ? planning : answering);
    const content = isPlan ? JSON.stringify({ summary: 'Plan a focused search and verify sources.', queries: ['solar research'] }) : 'Research completed.';
    await route.fulfill({ contentType: 'text/event-stream', body: `data: ${JSON.stringify({ choices: [{ delta: { content } }] })}\n\ndata: [DONE]\n\n` });
  });
  await page.route('**/api/search?*', async route => { await searching; await route.fulfill({ json: { results: [] } }); });
  await seed(page, ['THINK', 'WEB_SEARCH']);
  const pet = page.locator('.pimx-pet');
  await page.locator('#composer-input').fill('Research solar energy.');
  await page.locator('#btn-send-message').click();
  await expect(pet).toHaveAttribute('data-mood', 'think');
  plan();
  await expect(pet).toHaveAttribute('data-mood', 'search');
  await expect(pet.locator('.pip-lens')).toHaveCSS('opacity', '1');
  search();
  await expect(pet).toHaveAttribute('data-mood', 'work');
  answer();
  await expect(pet).toHaveAttribute('data-mood', 'happy');
});

test('idle rest and wake work with motion disabled', async ({ page }) => {
  await page.clock.install();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await seed(page);
  await page.clock.fastForward(48000);
  await expect(page.locator('.pimx-pet')).toHaveAttribute('data-mood', 'sleep');
  await page.keyboard.press('Shift');
  await expect(page.locator('.pimx-pet')).toHaveAttribute('data-mood', 'idle');
});

test('pending request uses a work pose, failure uses an error pose, and retry can celebrate', async ({ page }) => {
  let finish!: () => void;
  let failed = true;
  const gate = new Promise<void>(resolve => { finish = resolve; });
  await page.route('**/api/chat', async route => {
    await gate;
    if (failed) await route.fulfill({ status: 502, json: { error: { message: 'Controlled provider failure' } } });
    else await route.fulfill({ contentType: 'text/event-stream', body: 'data: {"choices":[{"delta":{"content":"Ready."}}]}\n\ndata: [DONE]\n\n' });
  });
  await seed(page);
  const pet = page.locator('.pimx-pet');
  await page.locator('#composer-input').fill('A short answer, please.');
  await page.locator('#btn-send-message').click();
  await expect(pet).toHaveAttribute('data-mood', 'work');
  await expect(pet.locator('.pip-console')).toHaveCSS('opacity', '1');
  await page.screenshot({ path: 'artifacts/qa/pip-robot-fox-working.png' });
  finish();
  await expect(pet).toHaveAttribute('data-mood', 'error');
  failed = false;
  await page.locator('#composer-input').fill('Try a short answer again.');
  await page.locator('#btn-send-message').click();
  await expect(pet).toHaveAttribute('data-mood', 'happy');
  await pet.locator('.pet-body').click();
  await expect(page.getByRole('dialog', { name: 'Pip companion' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('.pet-dialog')).toHaveCount(0);
});
