# Open workspace deployment

PIMX Agent has no registration, login, password reset or account administration. The main Cloudflare Pages branch serves the public homepage at https://pimxagent.pages.dev. The chat branch serves the workspace at https://chat.pimxagent.pages.dev through APP_SURFACE=chat and its own APP_URL.

## Private browser workspace

The first workspace request creates an anonymous owner and a random HttpOnly, SameSite=Lax cookie. Production cookies use the __Host- prefix and Secure. Only the token hash is stored in D1. The workspace encryption key and provider credentials are encrypted with APP_DATA_ENCRYPTION_KEY. APIs derive ownership from the cookie, never a client-selected owner. Different browsers have isolated credentials and public-share controls.

Private chats, projects, files and artifacts are encrypted in IndexedDB on the device, with no server backup. Export before clearing cookies or browser data. Transfers use a separate passphrase and exclude provider keys. Import works in a new browser without an account.

## Deployment

Run npm run db:migrate before the first open-workspace release. Migrations 002 and 003 create anonymous browser workspace tables, separate from legacy account storage; historical account tables are retained to avoid deleting existing records. No account endpoint remains active.

Production and preview require encrypted APP_DATA_ENCRYPTION_KEY and APP_PROXY_SECRET. Contact forms additionally require TURNSTILE_SECRET_KEY; the public site key is configured in wrangler.jsonc. Keep the encryption key backed up privately. Never expose these secrets in NEXT_PUBLIC variables.

The Pages project uses native Git deployment, main for production and chat for its branch alias. A GitHub workflow mirrors main to chat. Preview includes only chat. Public runtime variables and the D1 binding are defined for both environments in wrangler.jsonc. SMTP is no longer required.

Run npm run security:secrets, npm run check, npm run build, npm test and npm run pages:build. Confirm homepage CTA, anonymous chat, isolated credentials, previews, browser backup transfer and offline fallback on both live domains. No provider subscription or API key is supplied by this site; charges and usage limits belong to the selected provider.
