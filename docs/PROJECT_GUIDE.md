# PIMX Agent

A responsive AI workspace built with Next.js, React and Zustand. Connect a provider in **Settings & Providers**, choose a model, then start a conversation. Gemini can also use `GEMINI_API_KEY` from `.env.local`.

## Run locally

Use Node.js 22.13 or newer. This workspace was validated with Node.js 24.18.1.

```sh
npm install
npm run dev
```

For a production build:

```sh
npm run build
npm start
```

## Workspaces

- **Web Dev:** natural requests such as “Build a website” activate file generation. HTML, CSS and JavaScript run in an isolated preview; the complete project downloads as ZIP. If the model emits no files, an optional repair request asks that same model for valid output.
- **Slides:** natural presentation requests create an editable deck with six layouts, four themes, a thumbnail rail and keyboard presentation mode. Edit titles, points and speaker notes; search ranked topic photos, upload an image or remove it. Photo source links stay with the deck. PowerPoint embeds images, editable text and speaker notes; PDF uses the same slide design. Invalid output triggers a repair request or a clear error.
- **Deep Research:** plans multiple searches, reads source pages when enabled, and supplies the collected evidence to the selected model for a cited report. Reports become downloadable document artifacts.
- **Sources:** text-based PDF, DOCX and text uploads are extracted and retrieved as chat-scoped source passages. Scanned PDFs require OCR text. Maximum upload size is 20 MB per file.
- **Learn:** model-generated roadmaps and recall cards persist with lesson completion progress.
- **Compare:** runs up to four selected models independently. **Council** requires at least two distinct models and synthesizes their answers. **Debate** runs two opposing models for one to four rounds, then a selected judge produces the verdict.

Live activity reflects the running request or tool phase. Reasoning panels display summaries supplied by the model. Token values marked `~` are estimates, not provider billing records.

Web evidence runs start with a real planning request to the selected model, then search, page reading and final synthesis. Think enables the configured native reasoning effort; new defaults use High and a 4096-token budget where supported. Auxiliary planning and optional contextual emoji reactions use additional model requests. A failed reaction request does not substitute a canned emoji.

Drag the workspace divider, use its arrow keys or use the size buttons to resize it. Expand fills the work area; minimize returns to chat. The last width saves on this device. Project deletion uses an app dialog; deleting a project keeps its chats in general history. Moving a conversation to an existing or newly created project opens that project and retains the conversation.

**Pip**, the PIMX companion, follows actual planning, browsing, response and completion states. Tap it for status or a new chat. Hide it from its small menu or **General & UI Display → PIMX companion**.

Default Vazirmatn and Inter typography is self-hosted and cached for offline use, including printed PDF exports. Font licenses are included in `public/fonts/core`.

## Privacy and PWA

Saved conversations, projects and generated files are encrypted in this browser's IndexedDB. They are not automatically backed up to the server. Temporary conversations, their generated files, decks, sources and prompt logs are excluded from persistence and disappear on reload. Messages still go to the selected AI provider to generate a response.

Use **Account → Export chat database** to create a passphrase-protected `.pimxdb` file. Sign in on another device and choose **Upload chat database** to restore it. Import replaces that device's workspace after confirmation. Provider secrets and session tokens are excluded. Keep an export before clearing browser storage.

English is the default interface language; the language control switches the public pages, workspace, settings and tools to Persian with RTL layout and self-hosted Vazirmatn.

The production app includes a manifest, app icons and an offline fallback. Install it from **General & UI Display → Install app**, or use Safari's **Share → Add to Home Screen**. Mobile installation requires HTTPS; localhost supports development on the same computer. Unlocking private history, AI responses and web searches require an internet connection. Private pages and API responses are never cached by the service worker.

## Cloudflare and account email

Production runs on Cloudflare Pages with OpenNext and a private D1 binding. GitHub pushes to `main` trigger Cloudflare builds using `npm run pages:build`. Account profiles, sign-in events and consented visitor statistics live in D1; private chats remain on the device. See [deployment and security](docs/security-launch.md) and [Gmail setup](docs/gmail-smtp.md).

## Validation

```sh
npm run check
npm run build
npx playwright install chromium
npm test
```

The browser tests exercise file generation, JavaScript preview execution, ZIP/PPTX contents, output repair, temporary-chat privacy, 100 single-choice reactions, PDF/DOCX extraction, learning data, independent model requests, responsive layouts and offline loading. Model output uses controlled fixtures; the API route uses a local upstream fixture. These tests do not spend credits or verify a paid provider account.

Screenshots from the validation run are written to `artifacts/qa/`.
