import { test, expect, type Page } from '@playwright/test';
import { createServer } from 'node:http';
import { mkdir, readFile } from 'node:fs/promises';
import JSZip from 'jszip';
import { DEFAULT_SETTINGS, useAppStore } from '../lib/store/useAppStore';
import { AI_REACTION_SET } from '../lib/agent/orchestrator';
import { detectCreationTool, compileWebPreview } from '../lib/agent/preferences';
import { savedConversationData } from '../lib/store/persistence';
import { parseSlideDeckFromContent } from '../lib/slides/parser.ts';
import { readCompletion } from '../lib/agent/completion.ts';

const now = Date.now();
const model = { id: 'gemini/test-model', providerId: 'gemini', upstreamId: 'test-model', displayName: 'Test Model', displayId: 'test-model', apiFormat: 'OPENAI', visible: true, contextWindow: 32000, maxOutputTokens: 16000, visionCapable: true, reasoningCapable: true, streamingCapable: true, toolsCapable: false, builtIn: false, isCustom: true, isFree: true, promptPricePerM: 0, completionPricePerM: 0, lastTestStatus: 'OK', sortOrder: 0 };
const chat = { id: 'test-chat', title: 'New Conversation', modelIds: [model.id], toolMode: 'NONE', activeTools: [], createdAt: now, updatedAt: now };
const slides = [{ title: 'Solar energy', bullets: ['Photovoltaic cells convert light to electricity.'], speakerNotes: 'Introduce the photoelectric effect.' }, { title: 'Storage', bullets: ['Battery storage shifts supply toward evening demand.'], speakerNotes: 'Discuss cost and reliability.' }];
const site = '<file path="index.html"><!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="styles.css"></head><body><h1>Solar Studio</h1><button id="counter">0</button><script src="app.js"></script></body></html></file><file path="styles.css">body{background:#121222;color:white;font:18px system-ui;padding:40px}button{padding:12px}</file><file path="app.js">document.querySelector("#counter").onclick=function(){this.textContent=Number(this.textContent)+1}</file>';
const sse = (content: string) => `data: ${JSON.stringify({ choices: [{ delta: { content } }] })}\n\ndata: [DONE]\n\n`;
const chunkedSse = (content: string) => [content.slice(0, 20), content.slice(20, 55), content.slice(55)].map(part => `data: ${JSON.stringify({ choices: [{ delta: { content: part } }] })}\n\n`).join('') + 'data: [DONE]\n\n';
const project = { id: 'solar-project', name: 'Solar Lab', description: 'Solar design work', standingInstructions: '', emoji: '☀️', memoryScope: 'DEFAULT', createdAt: now, updatedAt: now };

async function seed(page: Page, overrides: Record<string, unknown> = {}) {
  const origin = 'http://localhost:3010';
  const request = page.context().request;
  const response = await request.get('/api/workspace?key=1');
  expect(response.ok()).toBeTruthy();
  for(const credential of (await (await request.get('/api/credentials')).json()).credentials)await request.delete('/api/credentials?id='+credential.id,{headers:{Origin:origin}});
  const data = { settings: { ...DEFAULT_SETTINGS, themeMode: 'LIGHT', aiReactions: false }, models: [model], selectedModelIds: [model.id], accounts: [], chats: [chat], messages: {}, ...overrides };
  await page.addInitScript(data => { localStorage.setItem('pimx_cookie_consent','rejected');if (!sessionStorage.getItem('fixture-seeded')) {localStorage.setItem('pimx_agent_v1_store', JSON.stringify(data));sessionStorage.setItem('fixture-seeded','1');} }, data);
  await page.route('**/api/chat/title', route => route.fulfill({ json: { title: 'Generated project' } }));
  await page.route('**/api/image?*', route => route.fulfill({ json: {} }));
  await page.route('**/api/search?*', route => route.fulfill({ json: { results: [{ title: 'Solar source', url: 'https://example.com/solar', snippet: 'Solar research evidence', source: 'Test source' }] } }));
  await page.route('**/api/fetch?*', route => route.fulfill({ body: 'Solar research evidence from a source page. Photovoltaic systems convert light into electricity and require inverter and storage design. Evidence should distinguish production from storage, account for operating conditions, and report assumptions transparently.' }));
  await page.route('https://fonts.googleapis.com/**', route => route.abort());
  await page.route('https://fonts.gstatic.com/**', route => route.abort());
  await page.goto('/chat');
  await expect(page.locator('#composer-input')).toBeVisible();
}

async function persisted(page:Page):Promise<any>{
  return page.evaluate(async()=>{const user=await (await fetch('/api/workspace?key=1')).json(),keyData=user.key;const raw=await new Promise<string>((resolve,reject)=>{const opening=indexedDB.open('pimx-private-workspace',1);opening.onerror=()=>reject(opening.error);opening.onsuccess=()=>{const db=opening.result,transaction=db.transaction('workspaces','readonly'),request=transaction.objectStore('workspaces').get(user.id);transaction.oncomplete=()=>{resolve(request.result);db.close();};};});const envelope=JSON.parse(raw);const decode=(value:string)=>Uint8Array.from(atob(value),char=>char.charCodeAt(0));const key=await crypto.subtle.importKey('raw',decode(keyData),'AES-GCM',false,['decrypt']);const plain=await crypto.subtle.decrypt({name:'AES-GCM',iv:decode(envelope.iv),additionalData:new TextEncoder().encode(user.id)},key,decode(envelope.data));return JSON.parse(new TextDecoder().decode(plain));});
}

test('creation intent, valid slides and all 100 unique reactions', () => {
  expect(detectCreationTool('یه سایت برای فروش قهوه بنویس')).toBe('WEB_DEV');
  expect(detectCreationTool('اسلاید بساز درباره انرژی خورشیدی')).toBe('SLIDES');
  expect(detectCreationTool('How does a website work?')).toBeNull();
  expect(detectCreationTool('Do not build a website')).toBeNull();
  expect(new Set(AI_REACTION_SET).size).toBe(100);
  expect(parseSlideDeckFromContent('```slides\n' + JSON.stringify({ title: 'Deck', slides }) + '\n```', 'id')?.slides[0].speakerNotes).toContain('photoelectric');
});

test('temporary data and orphan records are excluded from persistence', () => {
  const state = useAppStore.getState();
  const saved = savedConversationData({ ...state, chats: [{ ...chat, toolMode: 'NONE' }, { ...chat, id: 'temp', toolMode: 'NONE', temporary: true }], messages: { temp: [], 'test-chat': [] }, webFiles: { temp: [], 'test-chat': [] }, slideDecks: { temp: { id: 'temp', chatId: 'temp', title: 'private', theme: 'MODERN_DARK', slides: [], updatedAt: now } }, logs: [{ id: 'private', tag: 'PROMPT', level: 'INFO', message: 'private prompt', timestamp: now }] });
  expect(saved.messages).toEqual({ 'test-chat': [] });
  expect(saved.webFiles).toEqual({ 'test-chat': [] });
  expect(saved.slideDecks).toEqual({});
  expect(saved.logs).toEqual([]);
});

test('reaction replacement and removal use the actual store', () => {
  const id = useAppStore.getState().createChat();
  const msg = useAppStore.getState().addMessage(id, { role: 'assistant', content: 'hello', state: 'DONE' });
  const react = useAppStore.getState().toggleReaction;
  react(id, msg.id, '🔥', 'user'); react(id, msg.id, '💙', 'user');
  expect(useAppStore.getState().messages[id][0].reactions?.map(r => r.emoji)).toEqual(['💙']);
  react(id, msg.id, '💙', 'user');
  expect(useAppStore.getState().messages[id][0].reactions).toEqual([]);
});

test('all referenced CSS and JavaScript files are compiled into the preview', () => {
  const html = compileWebPreview([{ path: 'pages/index.html', content: '<html><head><link rel="stylesheet" href="../a.css"><link rel="stylesheet" href="../b.css"></head><body><script src="../a.js"></script><script src="../b.js"></script></body></html>' }, { path: 'a.css', content: '.first{}' }, { path: 'b.css', content: '.second{}' }, { path: 'a.js', content: 'window.first=1' }, { path: 'b.js', content: 'window.second=2' }]);
  for (const expected of ['.first{}', '.second{}', 'window.first=1', 'window.second=2']) expect(html).toContain(expected);
  expect(html).not.toContain('src="../');
});

test('plain-language website request produces an interactive preview and downloadable files', async ({ page }) => {
  let body: Record<string, unknown> = {};
  await page.route('**/api/chat', async route => { body = route.request().postDataJSON(); await route.fulfill({ contentType: 'text/event-stream', body: sse(site) }); });
  await seed(page);
  await page.locator('#composer-input').fill('Build a website for a solar design studio');
  await page.locator('#btn-send-message').click();
  await expect(page.locator('#webdev-panel')).toBeVisible();
  expect(body.systemPrompt).toContain('PRINCIPAL FULL-STACK');
  await expect(page.frameLocator('iframe[title="Web Dev Sandbox"]').locator('h1')).toHaveText('Solar Studio');
  await page.frameLocator('iframe[title="Web Dev Sandbox"]').locator('#counter').click();
  await expect(page.frameLocator('iframe[title="Web Dev Sandbox"]').locator('#counter')).toHaveText('1');
  const stored = (await persisted(page)).webFiles['test-chat'];
  expect(stored).toHaveLength(3);
  const download = page.waitForEvent('download'); await page.getByTitle('Download Project as ZIP').click();
  const zip = await JSZip.loadAsync(await readFile((await (await download).path())!));
  expect(await zip.file('app.js')!.async('string')).toContain('onclick');
  await mkdir('artifacts/qa', { recursive: true });
  await page.screenshot({ path: 'artifacts/qa/website-desktop.png' });
});

test('slides become a saved deck and persist after a reload', async ({ page }) => {
  await page.route('**/api/chat', route => route.fulfill({ contentType: 'text/event-stream', body: sse('```slides\n' + JSON.stringify(slides) + '\n```') }));
  await seed(page, { settings: { ...DEFAULT_SETTINGS, themeMode: 'LIGHT', aiReactions: false, defaultSlideTheme: 'CLEAN_LIGHT' } });
  await page.locator('#composer-input').fill('اسلاید بساز درباره انرژی خورشیدی');
  await page.locator('#btn-send-message').click();
  await expect(page.locator('#slides-panel')).toBeVisible();
  const stored = (await persisted(page)).slideDecks['test-chat'];
  expect(stored.slides).toHaveLength(2);
  expect(stored.theme).toBe('CLEAN_LIGHT');
  await expect(page.getByTestId('slide-preview')).toHaveCSS('background-color', 'rgb(255, 255, 255)');
  expect(stored.slides[0].speakerNotes).toContain('photoelectric');
  await page.getByTitle('Export Presentation (PPTX, PDF, Markdown)').click();
  const downloading = page.waitForEvent('download'); await page.getByText('PowerPoint (.pptx)', { exact: true }).click();
  const zip = await JSZip.loadAsync(await readFile((await (await downloading).path())!));
  expect(await zip.file('ppt/slides/slide1.xml')!.async('string')).toContain('Solar energy');
  expect(await zip.file('ppt/slides/slide1.xml')!.async('string')).toContain('val="FFFFFF"');
  await page.reload();
  await expect(page.getByText('Presentation Slides: 2 Slides Ready')).toBeVisible();
});

test('React TSX and Tailwind run while the preview cannot read the parent or private APIs', async ({ page }) => {
  test.setTimeout(60000);
  const urls = ['https://unpkg.com/react@18.3.1/umd/react.production.min.js', 'https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js', 'https://unpkg.com/@babel/standalone@7.28.5/babel.min.js', 'https://cdn.tailwindcss.com'];
  // Fetch the actual pinned runtimes through Node to avoid machine-specific
  // browser proxy/certificate issues; no fake React/compiler implementation.
  const runtimes = await Promise.all(urls.map(async url => { const response = await fetch(url); expect(response.ok).toBe(true); return response.text(); }));
  for (let i = 0; i < urls.length; i++) await page.route(urls[i], route => route.fulfill({ contentType: 'application/javascript', body: runtimes[i] }));
  const code = `import React, { useState } from 'react';
export default function Counter() { const [count, setCount] = useState<number>(0); return <button className="bg-violet-600 p-4 font-bold" onClick={() => setCount(count + 1)}>Counter {count}</button>; }`;
  await page.route('**/api/chat', route => route.fulfill({ contentType: 'text/event-stream', body: sse('```react Interactive Counter\n' + code + '\n```') }));
  await seed(page, { chats: [{ ...chat, toolMode: 'ARTIFACTS', activeTools: ['ARTIFACTS'] }] });
  await page.locator('#composer-input').fill('Create an interactive React counter'); await page.locator('#btn-send-message').click();
  const frame = page.frameLocator('#artifacts-panel iframe'); const button = frame.getByRole('button', { name: 'Counter 0' });
  await expect(button).toBeVisible(); await expect(button).toHaveCSS('background-color', 'rgb(124, 58, 237)');
  await button.click(); await expect(frame.getByRole('button', { name: 'Counter 1' })).toBeVisible();
  const security = await frame.locator('body').evaluate(async () => {
    let parentBlocked = false, storageBlocked = false, apiBlocked = false;
    try { void parent.document.body; } catch { parentBlocked = true; }
    try { void localStorage.length; } catch { storageBlocked = true; }
    try { await fetch('/api/workspace'); } catch { apiBlocked = true; }
    return { parentBlocked, storageBlocked, apiBlocked, origin: window.origin };
  });
  expect(security).toEqual({ parentBlocked: true, storageBlocked: true, apiBlocked: true, origin: 'null' });
  await page.screenshot({ path: 'artifacts/qa/react-isolated-preview.png' });
});

test('invalid website output invokes a real repair request', async ({ page }) => {
  let calls = 0;
  await page.route('**/api/chat', route => route.fulfill({ contentType: 'text/event-stream', body: sse(++calls === 1 ? 'I can build you a site with a polished homepage and interactive counter.' : site) }));
  await seed(page);
  await page.locator('#composer-input').fill('Build a website about solar energy'); await page.locator('#btn-send-message').click();
  await expect(page.locator('#webdev-panel')).toBeVisible(); expect(calls).toBe(2);
});

test('temporary chats leave no message, deck or prompt in persistent storage', async ({ page }) => {
  await page.route('**/api/chat', route => route.fulfill({ contentType: 'text/event-stream', body: sse('```slides\n' + JSON.stringify(slides) + '\n```') }));
  await seed(page);
  await page.locator('#btn-temporary-chat-toggle').click();
  await expect(page.getByText('A little space, just for now.')).toBeVisible();
  await page.locator('#composer-input').fill('Create slides about PRIVATE_TEMP_TOPIC'); await page.locator('#btn-send-message').click();
  await expect(page.locator('#slides-panel')).toBeVisible();
  const raw = JSON.stringify(await persisted(page));
  expect(raw).not.toContain('PRIVATE_TEMP_TOPIC'); expect(JSON.parse(raw).messages).toEqual({}); expect(JSON.parse(raw).slideDecks).toEqual({});
  await page.reload(); await expect(page.locator('#message-list')).toHaveCount(0);
});

test('100-reaction picker is outside the bubble and changing emoji leaves only one', async ({ page }) => {
  await page.route('**/api/chat', route => route.fulfill({ contentType: 'text/event-stream', body: sse('Hello, how can I help?') }));
  await seed(page); await page.locator('#composer-input').fill('Hello'); await page.locator('#btn-send-message').click();
  await page.getByRole('button', { name: 'React to message' }).click();
  await expect(page.locator('[data-emoji]')).toHaveCount(100);
  await page.getByRole('button', { name: 'React 🔥', exact: true }).click();
  await page.getByRole('button', { name: 'React to message' }).click(); await page.getByRole('button', { name: 'React 💙', exact: true }).click();
  await expect(page.locator('.reaction-pill.selected')).toHaveCount(1); await expect(page.locator('.reaction-pill.selected')).toHaveText('💙');
  expect(await page.locator('.message-reactions').evaluate(el => el.closest('.assistant-message') === null)).toBe(true);
});

for (const width of [300, 390, 768, 1440]) test(`temporary screen fits ${width}px without horizontal overflow`, async ({ page }) => {
  await page.setViewportSize({ width, height: 900 }); await seed(page); await page.locator('#btn-temporary-chat-toggle').click();
  await expect(page.getByText('A little space, just for now.')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  const send = await page.locator('#btn-send-message').boundingBox();
  expect(send!.x + send!.width).toBeLessThanOrEqual(width);
  await mkdir('artifacts/qa', { recursive: true }); await page.screenshot({ path: `artifacts/qa/temporary-${width}.png` });
});

test('responsive settings persist prompt, reading and execution preferences', async ({ page }) => {
  await seed(page, { settings: { ...DEFAULT_SETTINGS, themeMode: 'LIGHT', aiReactions: false, fontSizeLevel: 'lg', searchDepth: 'deep', bubbleStyle: 'card' } }); await page.getByText('Settings & Providers', { exact: true }).click();
  await page.getByRole('button', { name: 'Prompt & Model Defaults', exact: true }).click();
  await page.getByRole('textbox', { name: 'About you', exact: true }).fill('Solar researcher');
  await page.getByRole('textbox', { name: 'Response preferences', exact: true }).fill('Use concrete examples');
  await page.getByRole('button', { name: 'General & UI Display', exact: true }).click();
  await page.getByRole('switch', { name: 'Message timestamps', exact: true }).check();
  await page.getByRole('button', { name: 'Reasoning & Agent Mode', exact: true }).click();
  await page.getByRole('switch', { name: 'Open completed workspaces', exact: true }).uncheck();
  await page.setViewportSize({ width: 390, height: 900 });
  await expect(page.getByRole('switch', { name: 'Automatically detect creation requests', exact: true })).toBeVisible();
  await page.screenshot({ path: 'artifacts/qa/settings-mobile.png' });
  const settings = (await persisted(page)).settings;
  expect(settings.userProfileBio).toBe('Solar researcher'); expect(settings.showTimestamps).toBe(true); expect(settings.autoOpenWorkspace).toBe(false);
  expect(settings.fontSizeLevel).toBe('LARGE'); expect(settings.searchDepth).toBe('DEEP'); expect(settings.bubbleStyle).toBe('CARD');
});

test('capabilities have distinct live animations and readable Persian reasoning', async ({ browser }) => {
  for (const toolMode of ['THINK', 'WEB_SEARCH', 'WEB_DEV', 'SLIDES', 'DEEP_RESEARCH', 'SOURCE_QA', 'LEARN', 'DEBATE', 'COMPARE', 'COUNCIL']) {
    const context = await browser.newContext({ viewport: { width: 1100, height: 850 } }); const page = await context.newPage();
    await seed(page, { settings: { ...DEFAULT_SETTINGS, themeMode: 'DARK', expandThinking: true, aiReactions: false }, chats: [{ ...chat, toolMode, activeTools: [toolMode] }], messages: { 'test-chat': [{ id: 'user', chatId: 'test-chat', role: 'user', content: 'انرژی خورشیدی را بررسی کن', state: 'DONE', createdAt: now }, { id: 'assistant', chatId: 'test-chat', parentId: 'user', role: 'assistant', content: '', reasoning: '### بررسی شواهد\nاین خلاصهٔ روشن و خوانای روش بررسی منابع است.', state: 'STREAMING', modelId: model.id, createdAt: Date.now() }] } });
    await expect(page.locator('.tool-activity')).toHaveAttribute('data-mode', toolMode);
    const reasoning = page.locator('.reasoning-text'); await expect(reasoning).toBeVisible();
    const style = await reasoning.evaluate(el => ({ filter: getComputedStyle(el).filter, transform: getComputedStyle(el).transform, font: getComputedStyle(el).fontFamily, size: getComputedStyle(el).fontSize }));
    expect(style.filter).toBe('none'); expect(style.transform).toBe('none'); expect(style.size).toBe('14px'); expect(style.font.toLowerCase()).toContain('vazirmatn');
    await page.screenshot({ path: `artifacts/qa/activity-${toolMode.toLowerCase()}.png` }); await context.close();
  }
});

test('learning roadmap and revealable flashcards come from model output', async ({ page }) => {
  await page.route('**/api/chat', route => route.fulfill({ contentType: 'text/event-stream', body: sse('```learning-roadmap\n[{"title":"Solar cell physics"},{"title":"Grid storage"}]\n```\n```flashcards\n[{"question":"What converts sunlight into current?","answer":"A photovoltaic semiconductor cell."}]\n```') }));
  await seed(page, { chats: [{ ...chat, toolMode: 'LEARN', activeTools: ['LEARN'] }] });
  await page.locator('#composer-input').fill('Create a learning roadmap and flashcards about solar energy'); await page.locator('#btn-send-message').click();
  await expect(page.locator('#learn-panel').getByText('1. Solar cell physics')).toBeVisible();
  await page.locator('#learn-panel').getByText('Recall Cards', { exact: true }).click();
  await page.getByRole('button', { name: /What converts sunlight/ }).click(); await expect(page.getByText('A photovoltaic semiconductor cell.', { exact: true })).toBeVisible();
  const session = (await persisted(page)).learningSessions['test-chat'];
  expect(session.completedLessons).toBe(0); expect(session.lessons).toHaveLength(2); expect(session.flashcards).toHaveLength(1);
});

test('deep research searches, reads evidence and saves a grounded document', async ({ page }) => {
  let searches = 0, reads = 0, prompt = '';
  page.on('request', request => { if (request.url().includes('/api/search?')) searches++; if (request.url().includes('/api/fetch?')) reads++; });
  await page.route('**/api/chat', route => { prompt = route.request().postDataJSON().systemPrompt; return route.fulfill({ contentType: 'text/event-stream', body: sse('# Solar research report\n\nSolar panels convert light into electricity. [1]\n\n## Sources\n[1] Solar source — https://example.com/solar') }); });
  await seed(page, { chats: [{ ...chat, toolMode: 'DEEP_RESEARCH', activeTools: ['DEEP_RESEARCH'] }] });
  await page.locator('#composer-input').fill('Research photovoltaic energy storage and inverter efficiency'); await page.locator('#btn-send-message').click();
  await expect(page.getByRole('button', { name: 'React to message' })).toBeVisible();
  expect(searches).toBeGreaterThanOrEqual(2); expect(reads).toBeGreaterThan(0); expect(prompt).toContain('LIVE WEB EVIDENCE'); expect(prompt).toContain('operating conditions');
  await expect.poll(async()=> (await persisted(page)).artifacts.some((a: { kind: string; content: string }) => a.kind === 'DOCUMENT' && a.content.includes('Solar research report'))).toBe(true);
});

test('uploaded PDF and DOCX text is extracted and sent as grounded source context', async ({ page }) => {
  const objects = ['<< /Type /Catalog /Pages 2 0 R >>', '<< /Type /Pages /Kids [3 0 R] /Count 1 >>', '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 600 800] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>', '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>'];
  const stream = 'BT /F1 12 Tf 50 700 Td (Solar battery lifetime is seven years.) Tj ET'; objects.push(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);
  let pdf = '%PDF-1.4\n'; const offsets = [0]; for (let i = 0; i < objects.length; i++) { offsets.push(Buffer.byteLength(pdf)); pdf += `${i + 1} 0 obj\n${objects[i]}\nendobj\n`; }
  const xref = Buffer.byteLength(pdf); pdf += `xref\n0 6\n0000000000 65535 f \n${offsets.slice(1).map(n => String(n).padStart(10, '0') + ' 00000 n ').join('\n')}\ntrailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  const doc = new JSZip(); doc.file('[Content_Types].xml', '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="xml" ContentType="application/xml"/><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>'); doc.file('_rels/.rels', '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>'); doc.file('word/document.xml', '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>Solar battery maintenance happens twice a year.</w:t></w:r></w:p></w:body></w:document>');
  let prompt = ''; await page.route('**/api/chat', route => { prompt = route.request().postDataJSON().systemPrompt; return route.fulfill({ contentType: 'text/event-stream', body: sse('Battery lifetime is seven years. [S1:C1]') }); });
  await seed(page, { chats: [{ ...chat, toolMode: 'SOURCE_QA', activeTools: ['SOURCE_QA'] }] });
  await page.locator('input[type="file"]').first().setInputFiles([{ name: 'solar.pdf', mimeType: 'application/pdf', buffer: Buffer.from(pdf) }, { name: 'maintenance.docx', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', buffer: await doc.generateAsync({ type: 'nodebuffer' }) }]);
  await expect(page.getByText('Reading documents…', { exact: true })).toHaveCount(0);
  await page.locator('#composer-input').fill('What is the solar battery lifetime and maintenance schedule?'); await page.locator('#btn-send-message').click();
  await expect(page.getByRole('button', { name: 'React to message' })).toBeVisible();
  expect(prompt).toContain('seven years'); expect(prompt).toContain('twice a year');
});

for (const toolMode of ['COMPARE', 'COUNCIL', 'DEBATE']) test(`${toolMode} dispatches actual model requests with independent results`, async ({ page }) => {
  const second = { ...model, id: 'gemini/test-second', upstreamId: 'test-second', displayName: 'Second model' }; const requests: string[] = [];
  await page.route('**/api/chat', route => { const body = route.request().postDataJSON(); requests.push(body.model); return route.fulfill({ contentType: 'text/event-stream', body: chunkedSse(`A detailed answer from ${body.model}: evidence supports assessing solar efficiency and grid storage.`) }); });
  await seed(page, { models: [model, second], selectedModelIds: [model.id, second.id], chats: [{ ...chat, modelIds: [model.id, second.id], toolMode, activeTools: [toolMode], toolState: { debateModelIds: [model.id, second.id], debateJudgeModelId: second.id, debateRounds: 2 } }] });
  await page.locator('#composer-input').fill('Compare solar energy and grid storage'); await page.locator('#btn-send-message').click();
  await expect.poll(() => requests.length).toBe(toolMode === 'COMPARE' ? 2 : toolMode === 'COUNCIL' ? 4 : 6);
  await expect(page.locator('#btn-stop-generation')).toHaveCount(0);
  expect(requests).toContain(model.id); expect(requests).toContain(second.id); expect(requests.length).toBe(toolMode === 'COMPARE' ? 2 : toolMode === 'COUNCIL' ? 4 : 6);
  await expect.poll(async () => {
    const messages = (await persisted(page)).messages['test-chat'];
    const grouped = messages.filter((m: { groupId?: string }) => m.groupId);
    return grouped.length === 2 && grouped.every((message: {content:string}) => message.content.split('A detailed answer').length - 1 === (toolMode === 'DEBATE' ? 2 : 1));
  }).toBe(true);
});

for (const mode of ['WEB_DEV', 'SLIDES']) test(`${mode} workspace fits a narrow phone`, async ({ page }) => {
  await page.setViewportSize({ width: 300, height: 900 });
  await page.route('**/api/chat', route => route.fulfill({ contentType: 'text/event-stream', body: sse(mode === 'WEB_DEV' ? site : '```slides\n' + JSON.stringify(slides) + '\n```') }));
  await seed(page); await page.locator('#composer-input').fill(mode === 'WEB_DEV' ? 'Build a website about solar energy' : 'Create slides about solar energy'); await page.locator('#btn-send-message').click();
  const panel = page.locator(mode === 'WEB_DEV' ? '#webdev-panel' : '#slides-panel'); await expect(panel).toBeVisible();
  await page.locator('#workspace-side-panel').evaluate(async el => {
    await Promise.all(el.getAnimations({ subtree: true }).filter(animation => animation.effect?.getTiming().iterations !== Infinity).map(animation => animation.finished.catch(() => {})));
  });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const close = await panel.getByTitle('Minimize Panel').boundingBox(); expect(close!.x + close!.width).toBeLessThanOrEqual(300);
  await expect(page.locator('#btn-toggle-drawer')).toBeHidden();
  if (mode === 'WEB_DEV') expect((await page.locator('iframe[title="Web Dev Sandbox"]').boundingBox())!.width).toBeGreaterThan(260);
  else {
    const card = await page.getByTestId('slide-preview').boundingBox();
    const heading = await panel.getByRole('heading', { name: 'Solar energy', exact: true }).boundingBox();
    const bullet = await page.getByTestId('slide-preview').getByText('Photovoltaic cells convert light to electricity.', { exact: true }).boundingBox();
    expect(heading!.y + heading!.height).toBeLessThan(card!.y + card!.height);
    expect(bullet!.y + bullet!.height).toBeLessThan(card!.y + card!.height);
  }
  await page.screenshot({ path: `artifacts/qa/workspace-${mode.toLowerCase()}-mobile.png` });
});

test('manifest and production service worker support installation and offline navigation', async ({ page, request, context }) => {
  await seed(page); const manifest = await (await request.get('/manifest.webmanifest')).json();
  expect(manifest.display).toBe('standalone'); expect(manifest.icons).toHaveLength(3);
  for (const icon of manifest.icons) expect((await request.get(icon.src)).ok()).toBe(true);
  await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  await page.reload(); await expect(page.locator('#composer-input')).toBeVisible();
  await page.evaluate(() => document.fonts.load('600 16px "Vazirmatn Local"', 'فارسی'));
  await context.setOffline(true); await page.reload(); await expect(page.getByRole('heading', {name:/offline|connection|internet|offline/i})).toBeVisible();
  await context.setOffline(false);
});

test('chat API forwards nested model IDs and honors parameters with streaming off', async ({ request, page }) => {
  let upstream: Record<string, unknown> = {};
  const server = createServer(async (req, res) => {
    let raw = ''; for await (const chunk of req) raw += chunk; upstream = JSON.parse(raw);
    res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify({ choices: [{ message: { content: 'Real route response' } }] }));
  });
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
  const address = server.address() as { port: number };
  try {
    await seed(page);
    const api=page.context().request;
    const credential=await (await api.post('/api/credentials',{headers:{Origin:'http://localhost:3010'},data:{providerId:'custom-upstream',label:'Fixture',apiKey:'fixture-key',baseUrl:`http://127.0.0.1:${address.port}`}})).json();
    const response = await api.post('/api/chat', {headers:{Origin:'http://localhost:3010'}, data: { messages: [{ role: 'user', content: 'Hello' }], model: 'custom-upstream/vendor/nested-model', providerId: 'custom-upstream', credentialId:credential.credential.id, baseUrl: `http://127.0.0.1:${address.port}`, stream: false, frequencyPenalty: 0.4, presencePenalty: 0.2 } });
    expect(response.ok()).toBe(true); expect(await response.text()).toContain('Real route response'); expect(upstream.model).toBe('vendor/nested-model'); expect(upstream.stream).toBe(false); expect(upstream.frequency_penalty).toBe(0.4);
  } finally { await new Promise<void>(resolve => server.close(() => resolve())); }
});

test('regression: Persian responses and search activity use the available chat width', async ({ page }) => {
  await seed(page, { chats: [{ ...chat, toolMode: 'WEB_SEARCH', activeTools: ['THINK', 'WEB_SEARCH'] }], messages: { 'test-chat': [{ id: 'u', chatId: 'test-chat', role: 'user', content: 'در وب تحقیق کن', state: 'DONE', createdAt: now }, { id: 'a', chatId: 'test-chat', parentId: 'u', role: 'assistant', content: 'پاسخ کوتاه با منبع معتبر.', state: 'DONE', createdAt: now, modelId: model.id, toolSteps: [{ id: 'search', toolName: 'web_search', input: { query: 'solar' }, output: JSON.stringify({ count: 1, sources: [{ title: 'Solar', url: 'https://example.com', source: 'Test' }] }), status: 'DONE', timestamp: now }] }] } });
  const stream = await page.locator('#message-list').boundingBox(); const bubble = await page.locator('.assistant-message').boundingBox();
  expect(bubble!.width).toBeGreaterThan(stream!.width - 80);
});

test('regression: display settings use pill switches', async ({ page }) => {
  await seed(page); await page.getByText('Settings & Providers', { exact: true }).click(); await page.getByRole('button', { name: 'General & UI Display', exact: true }).click();
  const toggle = page.getByRole('switch', { name: 'Message timestamps', exact: true });
  expect((await toggle.boundingBox())!.width).toBeGreaterThanOrEqual(36);
  await toggle.click(); await expect(toggle).toHaveAttribute('aria-checked', 'true');
});

test('regression: deleting a project uses an app modal', async ({ page }) => {
  const native: string[] = []; page.on('dialog', dialog => { native.push(dialog.message()); return dialog.dismiss(); });
  await seed(page, { projects: [project] }); await page.locator('#btn-nav-projects-drawer').click(); await page.getByTitle('Delete Project', { exact: true }).click();
  expect(native).toEqual([]);
  await expect(page.getByRole('alertdialog', { name: 'Delete project' })).toBeVisible();
});

test('regression: moving a chat enters its project', async ({ page }) => {
  await seed(page, { projects: [project], messages: { 'test-chat': [{ id: 'u', chatId: 'test-chat', role: 'user', content: 'Hello', state: 'DONE', createdAt: now }] } }); await page.getByTitle('More conversation options').click(); await page.getByRole('button', { name: 'Move to project', exact: true }).hover(); await page.locator('#project-sub-menu').getByRole('button', { name: /Solar Lab/ }).click();
  await expect(page.getByRole('heading', { name: 'Solar Lab', exact: true })).toBeVisible();
});

test('regression: native provider emoji responses are used instead of a fixed fallback', async ({ page }) => {
  await page.route('**/api/chat', route => route.fulfill({ contentType: 'text/event-stream', body: route.request().postDataJSON().systemPrompt.includes('ONE emoji') ? 'data: {"type":"content_block_delta","delta":{"type":"text_delta","text":"🎉"}}\n\ndata: [DONE]\n\n' : sse('سلام، خوش آمدی!') }));
  await seed(page, { settings: { ...DEFAULT_SETTINGS, themeMode: 'LIGHT', aiReactions: true } }); await page.locator('#composer-input').fill('یه سلام گرم بفرست'); await page.locator('#btn-send-message').click();
  await expect(page.locator('[title="AI reaction"]')).toHaveText('🎉');
});

test('regression: Think precedes web search with both tools enabled', async ({ page }) => {
  const calls: string[] = [];
  page.on('request', req => { if (req.url().includes('/api/search?')) calls.push('search'); });
  await page.route('**/api/chat', route => { const isPlan = route.request().postDataJSON().systemPrompt.includes('[AGENT_PLANNING]'); calls.push(isPlan ? 'plan' : 'answer'); return route.fulfill({ contentType: 'text/event-stream', body: sse(isPlan ? JSON.stringify({ summary: 'بررسی شواهد خورشیدی', queries: ['solar energy evidence'] }) : 'پاسخ مستند درباره انرژی خورشیدی. [1]') }); });
  await seed(page, { chats: [{ ...chat, toolMode: 'WEB_SEARCH', activeTools: ['THINK', 'WEB_SEARCH'] }] }); await page.locator('#composer-input').fill('درباره انرژی خورشیدی تحقیق کن'); await page.locator('#btn-send-message').click(); await expect(page.getByRole('button', { name: 'React to message' })).toBeVisible();
  expect(calls[0]).toBe('plan'); expect(calls.indexOf('search')).toBeGreaterThan(calls.indexOf('plan')); expect(calls.at(-1)).toBe('answer');
});

test('auxiliary completions assemble native and split emoji streams', async () => {
  const stream = 'data: ' + JSON.stringify({ type: 'content_block_delta', delta: { type: 'text_delta', text: '❤️' } }) + '\n\ndata: ' + JSON.stringify({ type: 'content_block_delta', delta: { type: 'text_delta', text: '\u200d🔥' } });
  expect(await readCompletion(new Response(stream, { headers: { 'content-type': 'text/event-stream' } }))).toBe('❤️‍🔥');
  await expect(readCompletion(new Response('Unavailable', { status: 503 }))).rejects.toThrow('503');
});

test('workspace drag, keyboard sizing, expansion and persistence', async ({ page }) => {
  await page.route('**/api/chat', route => route.fulfill({ contentType: 'text/event-stream', body: sse(site) }));
  await seed(page); await page.locator('#composer-input').fill('Build a website'); await page.locator('#btn-send-message').click();
  const panel = page.locator('#workspace-side-panel'); await expect(panel).toBeVisible();
  await panel.evaluate(async el => { await Promise.all(el.getAnimations().map(a => a.finished.catch(() => {}))); });
  const original = (await panel.boundingBox())!.width; const handle = page.getByRole('separator', { name: 'Resize workspace' }); const box = (await handle.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + 160); await page.mouse.down(); await page.mouse.move(box.x - 130, box.y + 160, { steps: 12 }); await page.mouse.up();
  expect((await panel.boundingBox())!.width).toBeGreaterThan(original + 100);
  await handle.focus(); await page.keyboard.press('ArrowRight');
  const saved = (await persisted(page)).settings.workspaceWidth;
  expect(saved).toBeGreaterThan(original + 50);
  await page.getByRole('button', { name: 'Expand workspace', exact: true }).click(); await expect(panel).toHaveAttribute('data-expanded', 'true'); expect((await panel.boundingBox())!.width).toBeGreaterThan(1000);
  await page.getByRole('button', { name: 'Restore workspace size' }).click(); expect((await panel.boundingBox())!.width).toBeCloseTo(saved, 0);
  await page.getByRole('button', { name: 'Minimize workspace', exact: true }).click(); await expect(panel).toBeHidden(); await page.locator('#btn-floating-workspace-restore').click(); await expect(panel).toBeVisible();
  expect((await panel.boundingBox())!.width).toBeCloseTo(saved, 0);
  await page.screenshot({ path: 'artifacts/qa/workspace-resized.png', animations: 'disabled' });
});

test('new project from a conversation keeps and enters that conversation', async ({ page }) => {
  await seed(page, { messages: { 'test-chat': [{ id: 'u', chatId: 'test-chat', role: 'user', content: 'Project notes', state: 'DONE', createdAt: now }] } });
  await page.getByTitle('More conversation options').click(); await page.getByRole('button', { name: 'Move to project', exact: true }).click(); await page.locator('#project-sub-menu').getByRole('button', { name: 'New project' }).click();
  await page.locator('#project-modal input').first().fill('Aurora Studio'); await page.locator('#btn-save-project').click();
  await expect(page.getByRole('heading', { name: 'Aurora Studio', exact: true })).toBeVisible();
  const saved = (await persisted(page));
  expect(saved.chats.find((c: { id: string }) => c.id === 'test-chat').projectId).toBe(saved.projects[0].id); expect(saved.chats).toHaveLength(1);
});

test('project deletion can be cancelled and retains linked chats when confirmed', async ({ page }) => {
  await seed(page, { projects: [project], chats: [{ ...chat, projectId: project.id }] }); await page.locator('#btn-nav-projects-drawer').click(); await page.getByTitle('Delete Project', { exact: true }).click();
  const dialog = page.getByRole('alertdialog', { name: 'Delete project' }); await expect(dialog.getByRole('button', { name: 'Cancel' })).toBeFocused(); await page.keyboard.press('Escape'); await expect(dialog).toHaveCount(0);
  await page.getByTitle('Delete Project', { exact: true }).click(); await dialog.getByRole('button', { name: 'Delete project', exact: true }).click();
  const saved = (await persisted(page)); expect(saved.projects).toHaveLength(0); expect(saved.chats).toHaveLength(1); expect(saved.chats[0].projectId).toBeUndefined();
  await page.screenshot({ path: 'artifacts/qa/projects-after-delete.png' });
});

test('Pip reacts to live thinking and can be disabled', async ({ page }) => {
  let release!: () => void; const gate = new Promise<void>(resolve => { release = resolve; });
  await page.route('**/api/chat', async route => { await gate; await route.fulfill({ contentType: 'text/event-stream', body: sse('Your answer is ready.') }); });
  await seed(page); await page.getByRole('button', { name: 'PIMX companion Pip' }).click(); await expect(page.getByText('Pip · PIMX companion')).toBeVisible();
  await page.locator('#composer-input').fill('Hello Pip'); await page.locator('#btn-send-message').click(); await expect(page.locator('.pimx-pet')).toHaveAttribute('data-mood', 'work'); await page.screenshot({ path: 'artifacts/qa/pip-working.png' });
  release(); await expect(page.locator('.pimx-pet')).toHaveAttribute('data-mood', 'happy'); await page.getByRole('button', { name: 'Hide pet', exact: true }).click(); await expect(page.locator('.pimx-pet')).toHaveCount(0);
  expect((await persisted(page)).settings.petEnabled).toBe(false);
});

test('multiple tools animate the actual planning, search and slide stages', async ({ page }) => {
  let planRelease!: () => void, searchRelease!: () => void, answerRelease!: () => void;
  const planning = new Promise<void>(r => { planRelease = r; }), searching = new Promise<void>(r => { searchRelease = r; }), answering = new Promise<void>(r => { answerRelease = r; });
  await page.route('**/api/chat', async route => { const plan = route.request().postDataJSON().systemPrompt.includes('[AGENT_PLANNING]'); await (plan ? planning : answering); await route.fulfill({ contentType: 'text/event-stream', body: sse(plan ? JSON.stringify({ summary: 'هدف ارائه درباره انرژی خورشیدی است. منابع معتبر و هزینه‌ها بررسی می‌شوند. اطلاعات را تطبیق می‌دهیم و برای هر اسلاید شواهد انتخاب می‌کنیم.', queries: ['solar energy primary sources'] }) : '```slides\n' + JSON.stringify(slides) + '\n```') }); });
  await seed(page, { chats: [{ ...chat, toolMode: 'SLIDES', activeTools: ['THINK', 'WEB_SEARCH', 'SLIDES'] }] });
  await page.route('**/api/search?*', async route => { await searching; await route.fulfill({ json: { results: [] } }); });
  await page.locator('#composer-input').fill('اسلاید بساز درباره انرژی خورشیدی'); await page.locator('#btn-send-message').click();
  await expect(page.locator('.tool-activity')).toHaveAttribute('data-mode', 'THINK'); await expect(page.locator('[data-tool="SLIDES"]')).toHaveAttribute('data-status', 'queued'); await page.screenshot({ path: 'artifacts/qa/multi-tools-think.png' });
  planRelease(); await expect(page.locator('.tool-activity')).toHaveAttribute('data-mode', 'WEB_SEARCH'); await expect(page.locator('[data-tool="THINK"]')).toHaveAttribute('data-status', 'done'); await page.screenshot({ path: 'artifacts/qa/multi-tools-search.png' });
  searchRelease(); await expect(page.locator('.tool-activity')).toHaveAttribute('data-mode', 'SLIDES'); await expect(page.locator('[data-tool="WEB_SEARCH"]')).toHaveAttribute('data-status', 'done'); await page.screenshot({ path: 'artifacts/qa/multi-tools-slides.png' });
  answerRelease(); await expect(page.locator('#slides-panel')).toBeVisible();
});

test('slide photo selection, editing, notes and images survive PowerPoint export', async ({ page }) => {
  await page.context().addInitScript(() => { window.print = () => {}; });
  const photo = 'data:image/jpeg;base64,' + (await readFile('tests/fixtures/solar-panels.jpg')).toString('base64');
  await page.route('**/api/chat', route => route.fulfill({ contentType: 'text/event-stream', body: sse('```slides\n' + JSON.stringify(slides) + '\n```') })); await seed(page);
  await page.locator('#composer-input').fill('Make a presentation about solar energy'); await page.locator('#btn-send-message').click(); await expect(page.locator('#slides-panel')).toBeVisible();
  await page.route('**/api/image?*', route => route.fulfill({ json: { candidates: [{ imageUrl: photo, title: 'Photovoltaic field', imageSourceUrl: 'https://commons.wikimedia.org/wiki/File:Dji_fly_20230602_13826_PM_27_1719032149374_photo_optimized.jpg' }] } }));
  await page.getByRole('button', { name: 'Edit slide', exact: true }).click(); await page.getByRole('textbox', { name: 'Slide title', exact: true }).fill('انرژی خورشیدی؛ از ایده تا اجرا'); await page.getByRole('textbox', { name: 'Speaker notes' }).fill('یادداشت سخنران: شواهد و شرایط بهره‌برداری را توضیح دهید.');
  await page.getByRole('textbox', { name: 'Search slide photos' }).fill('photovoltaic solar panels'); await page.getByRole('button', { name: 'Search photos', exact: true }).click(); await page.getByRole('button', { name: 'Use photo: Photovoltaic field' }).click(); await expect(page.getByTestId('slide-preview').locator('img')).toHaveAttribute('src', photo);
  await page.getByRole('button', { name: 'Edit slide', exact: true }).click(); await page.getByRole('button', { name: 'Make workspace larger' }).click(); await page.screenshot({ path: 'artifacts/qa/slides-photo-desktop.png' });
  await page.getByTitle('Export Presentation (PPTX, PDF, Markdown)').click(); const download = page.waitForEvent('download'); await page.getByText('PowerPoint (.pptx)', { exact: true }).click(); const file = await download; await file.saveAs('artifacts/qa/solar-design.pptx');
  const zip = await JSZip.loadAsync(await readFile((await file.path())!)); expect(Object.keys(zip.files).some(path => path.startsWith('ppt/media/image') && path.endsWith('.png'))).toBe(true); expect(await zip.file('ppt/slides/slide1.xml')!.async('string')).toContain('<p:pic>'); expect(await zip.file('ppt/notesSlides/notesSlide1.xml')!.async('string')).toContain('یادداشت سخنران');
  await page.getByTitle('Export Presentation (PPTX, PDF, Markdown)').click(); await page.getByText('Print / Save PDF (.pdf)', { exact: true }).click(); const paper = page; await paper.evaluate(() => document.fonts.ready); await expect(paper.locator('#pimx-slide-print-view .slide-canvas')).toHaveCount(2); await expect(paper.locator('#pimx-slide-print-view .slide-canvas').first().locator('img')).toHaveJSProperty('complete', true); const pdf = await paper.pdf({ path: 'artifacts/qa/solar-design.pdf', preferCSSPageSize: true, printBackground: true });
  await expect(paper.locator('#pimx-slide-print-view .slide-canvas').first().locator('h2')).toHaveCSS('font-family', /Vazirmatn/);
  expect(pdf.toString('latin1').includes('Vazirmatn'), 'PDF embeds the Persian font').toBe(true);
  await paper.route('**/qa-pdf.mjs',route=>route.fulfill({contentType:'text/javascript',path:'node_modules/pdfjs-dist/build/pdf.mjs'}));
  const pdfResult = await paper.evaluate(async ({ module, pdf }) => {
    const pdfjs = await import(/* webpackIgnore: true */ new URL('/qa-pdf.mjs',document.baseURI).href); pdfjs.GlobalWorkerOptions.workerSrc = new URL('/pdf.worker.min.mjs', document.baseURI).href;
    const documentPdf = await pdfjs.getDocument({ data: Uint8Array.from(atob(pdf), char => char.charCodeAt(0)) }).promise; const first = await documentPdf.getPage(1); const canvas = document.createElement('canvas'); const viewport = first.getViewport({ scale: 1.2 }); canvas.width = viewport.width; canvas.height = viewport.height; await first.render({ canvas, viewport }).promise; canvas.id = 'qa-pdf-canvas'; canvas.style.cssText = 'position:fixed;top:0;left:0;z-index:9999'; document.body.appendChild(canvas); return { pages: documentPdf.numPages, text: (await first.getTextContent()).items.map((item: { str?: string }) => item.str || '').join(' ') };
  }, { module: await readFile('node_modules/pdfjs-dist/build/pdf.mjs', 'utf8'), pdf: pdf.toString('base64') });
  expect(pdfResult.pages).toBe(2); expect(pdfResult.text).toContain('Photovoltaic cells'); expect(pdfResult.text.normalize('NFKC')).toMatch(/[آ-ی]/); await paper.locator('#qa-pdf-canvas').screenshot({ path: 'artifacts/qa/solar-design-pdf-render.png' }); await paper.locator('#qa-pdf-canvas').evaluate(el => el.remove());
  await page.getByTitle('Present Fullscreen').click(); await expect(page.getByRole('dialog', { name: 'Presentation mode' })).toBeVisible(); await page.keyboard.press('ArrowRight'); await expect(page.getByTestId('slide-preview').getByRole('heading')).toHaveText('Storage'); await page.keyboard.press('Escape'); await expect(page.getByRole('dialog', { name: 'Presentation mode' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Go to slide 1' }).click(); await page.getByRole('button', { name: 'Edit slide', exact: true }).click(); await page.getByRole('button', { name: 'Remove photo' }).click(); await page.reload(); expect((await persisted(page)).slideDecks['test-chat'].slides[0].imageUrl).toBeUndefined(); await page.getByRole('button', { name: 'Open in Workspace', exact: true }).click(); await expect(page.getByTestId('slide-preview').getByRole('heading')).toHaveText('انرژی خورشیدی؛ از ایده تا اجرا'); await expect(page.getByTestId('slide-preview').locator('img')).toHaveCount(0);
});

for (const width of [300, 390, 1440]) for (const themeMode of ['LIGHT', 'DARK']) test(`slide studio visual layouts at ${width}px in ${themeMode}`, async ({ page }) => {
  await page.setViewportSize({ width, height: 1000 });
  const photo = 'data:image/jpeg;base64,' + (await readFile('tests/fixtures/solar-panels.jpg')).toString('base64');
  const content = [
    { title: 'آینده، با نور آغاز می‌شود', subtitle: 'انرژی خورشیدی؛ از انتخاب تا اجرا', layout: 'cover', bullets: ['یک مسیر روشن برای تبدیل نور به برق و مدیریت مصرف.'], imageUrl: photo, imageCaption: 'Photovoltaic solar panels' },
    { title: 'چطور نور به برق تبدیل می‌شود؟', subtitle: 'سه بخش یک سامانهٔ خورشیدی', layout: 'split', bullets: ['پنل‌ها انرژی نور را به برق مستقیم تبدیل می‌کنند.', 'اینورتر برق را برای مصرف در ساختمان آماده می‌کند.', 'پایش عملکرد، افت تولید و نیاز به نگهداری را آشکار می‌کند.'], imageUrl: photo },
    { title: 'پیش از اجرا، این چهار پرسش را بپرسید', layout: 'cards', bullets: ['سایه و جهت نصب چه اثری بر تولید دارند؟', 'مصرف ساختمان در چه ساعت‌هایی بیشتر است؟', 'فضای نصب و ظرفیت اتصال چقدر است؟', 'تعمیر و نگهداری چگونه برنامه‌ریزی می‌شود؟'] },
    { title: 'طراحی خوب از اندازه‌گیری شروع می‌شود', subtitle: 'شواهد را پیش از تصمیم جمع کنید.', layout: 'statement', bullets: ['الگوی مصرف، تابش محلی و محدودیت‌های نصب، مبنای انتخاب ظرفیت هستند.'] },
    { title: 'از امکان‌سنجی تا بهره‌برداری', layout: 'content', bullets: ['داده‌های مصرف و شرایط محل را ثبت کنید.', 'گزینه‌های نصب و هزینه‌های واقعی را مقایسه کنید.', 'طرح نهایی را با متخصص اجرا و سپس پایش کنید.'] },
    { title: 'قدم بعدی شما چیست؟', subtitle: 'یک تصمیم کوچک، یک مسیر روشن', layout: 'closing', bullets: ['با بررسی مصرف و موقعیت ساختمان شروع کنید.'] },
  ];
  await page.route('**/api/chat', route => route.fulfill({ contentType: 'text/event-stream', body: sse('```slides\n' + JSON.stringify({ title: 'انرژی خورشیدی', slides: content }) + '\n```') }));
  await seed(page, { settings: { ...DEFAULT_SETTINGS, themeMode, aiReactions: false } }); await page.locator('#composer-input').fill('ارائه بساز درباره انرژی خورشیدی'); await page.locator('#btn-send-message').click(); await expect(page.locator('#slides-panel')).toBeVisible();
  if (width === 1440) await page.getByRole('button', { name: 'Expand workspace', exact: true }).click();
  await page.locator('#workspace-side-panel').evaluate(async el => { await Promise.all(el.getAnimations({ subtree: true }).filter(a => a.effect?.getTiming().iterations !== Infinity).map(a => a.finished.catch(() => {}))); });
  for (let i = 0; i < content.length; i++) {
    await page.getByRole('button', { name: `Go to slide ${i + 1}`, exact: true }).click(); const preview = page.getByTestId('slide-preview'); await expect(preview).toHaveAttribute('data-layout', content[i].layout);
    const box = (await preview.boundingBox())!; expect(box.x).toBeGreaterThanOrEqual(0); expect(box.x + box.width).toBeLessThanOrEqual(width + 1);
    const heading = preview.getByRole('heading'); await expect(heading).toHaveCSS('font-family', /Vazirmatn/); const headingBox = (await heading.boundingBox())!; expect(headingBox.y + headingBox.height).toBeLessThan(box.y + box.height);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    if (width === 1440 || i === 0) await page.screenshot({ path: `artifacts/qa/studio-${content[i].layout}-${width}-${themeMode.toLowerCase()}.png` });
  }
  if (width === 390 && themeMode === 'DARK') { await page.getByRole('button', { name: 'Edit slide', exact: true }).click(); await expect(page.getByRole('textbox', { name: 'Speaker notes' })).toBeVisible(); await page.screenshot({ path: 'artifacts/qa/studio-editor-mobile.png' }); }
});
