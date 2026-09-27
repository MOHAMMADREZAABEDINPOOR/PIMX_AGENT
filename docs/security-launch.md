# PIMX Agent deployment and security

Public URL: **https://pimxagent.pages.dev**. Source: **https://github.com/MOHAMMADREZAABEDINPOOR/PIMX_AGENT**. Contact: **pimxagent@gmail.com**.

## Runtime and deployment

Next.js 16 runs through OpenNext in Cloudflare Pages advanced mode. The build command is `npm run pages:build`, with `.pages-output` as the output directory and Node 24. `wrangler.jsonc` defines the private `DB` binding for `pimx-agent-db`; `wrangler.worker.jsonc` is the OpenNext build configuration. No separate Node backend or PostgreSQL service is required.

A Cloudflare Pages Git integration watches `main` in the requested repository. Every push triggers a new production build. The runtime adapter overwrites proxy/forwarded/location headers and passes Cloudflare's verified approximate location and private D1 binding into the app.

Required production secrets: `APP_DATA_ENCRYPTION_KEY` (32 random bytes encoded as base64), `APP_PROXY_SECRET` (at least 32 characters), and `TURNSTILE_SECRET_KEY`. The Turnstile site key is public and must be set as `NEXT_PUBLIC_TURNSTILE_SITE_KEY` before building. Keep the encryption key backed up privately; losing or replacing it prevents decryption of account profiles, saved provider credentials and browser workspace keys.

Public configuration: `APP_URL=https://pimxagent.pages.dev`, `APP_RUNTIME=cloudflare`, `TRUST_PROXY=true`, Node 24. Gmail settings are documented in [gmail-smtp.md](gmail-smtp.md); `SMTP_PASS` must be an encrypted variable.

Use `npm run db:migrate` to apply the D1 migrations. After the real owner registers, use `npm run admin:promote -- USER_ID` to promote that existing D1 account. The id comes from the owner's authenticated `/api/auth/session` response. Only administrators can read the user directory, visit/device/location reports and contact inbox. Use `--local` for a local Next SQLite account.

## Data boundaries and protection

| Area | Behavior |
| --- | --- |
| Accounts | Username, birth year and encrypted email in D1; keyed HMAC email lookup. Server-issued roles; strict schema validation. |
| Passwords | Salted scrypt N=65536, r=8, p=2, with a server-only pepper. This uses 64 MiB and two passes to fit the Workers memory budget. Password reset tokens are hashed, expire after 30 minutes and are consumed once. Changes revoke other sessions. |
| Sessions | Opaque tokens stored only as hashes; `__Host-`, Secure, HttpOnly, SameSite=Lax cookies. Seven-day absolute and one-day idle expiry. Server authentication and same-origin write checks. |
| Provider keys | AES-256-GCM server vault with random nonces and owner/record-bound authenticated data. Subsequent calls carry credential ids; responses do not return the stored secrets. |
| Private chats | AES-GCM encrypted IndexedDB on the device. No automatic server backup. Transfer exports use PBKDF2-SHA256 with 600000 iterations and AES-GCM; provider secrets and session tokens are excluded. Import confirms replacement. Temporary chats are excluded from saved history and exports. |
| D1 isolation | Parameterized SQL and explicit session-derived owner conditions. D1 has no native RLS and no public database key is exposed. Application owner checks are tested with two users. |
| Visits | Optional consented analytics stores page, device/browser, hashed visitor id and Cloudflare approximate country/city. It does not request GPS or include conversation content. Visit data expires after 90 days. Sign-in security events are recorded separately. |
| Abuse | Account/IP limits, signup/reset limits, honeypots and server-verified Turnstile hostname/action. Production fails closed if form protection is missing. |
| Inputs and content | Bounded request streams, strict schemas, React/Markdown escaping, image magic-byte checks and size limits, PDF/DOCX extraction limits. |
| Generated previews | Authenticated sandboxed responses with an opaque origin, no private API access and compiler permissions scoped to the preview frame. |
| Networking | HTTPS public providers, private-IP/DNS/rebinding checks, capped downloads and redirects, trimmed upstream errors. |
| Shares | Explicit encrypted seven-day snapshots, unguessable capabilities, owner revocation; system prompts, attachments and provider keys omitted. |
| PWA | Install manifest and static offline fallback; personalized HTML, APIs and shares are never cached. Unlocking private history requires online authentication. |
| Deletion | Account removal deletes server personal data and this device's IndexedDB. Export files and copies on other devices remain controlled by the user. |

CSP, HSTS, no-sniff, restrictive referrer/permissions policy and frame protection are configured. Inline script/styles remain allowed for Next.js; this is not a nonce-only CSP. The main production application does not permit eval. Generated React/Tailwind previews use external CDN compiler runtimes inside the isolated frame.

## Verification

Run `npm run check`, `npm run build`, `npm test`, `npm run security:secrets` and `npm run security:audit`. Browser tests cover owner isolation, encrypted local/server records, record tampering, input/CSRF controls, registration/deletion, local SMTP password recovery, device-to-device database transfer, real artifact exports, bilingual layouts and offline fallback. Model requests use controlled fixtures, without paid provider credits.

Verify the built Cloudflare runtime and live HTTPS site separately: page/API status, D1 binding, metadata, asset loading, Turnstile, Secure cookie attributes and mobile install. Local SMTP does not prove Gmail delivery, and browser emulation does not prove installation on a physical phone.

The secret scanner inspects tracked files and available Git history without printing matched values. It is pattern based. Runtime secrets, local `.data`, `.dev.vars`, build output and screenshots are ignored by Git.

References: [Cloudflare Pages Git integration](https://developers.cloudflare.com/pages/configuration/git-integration/), [Pages advanced mode](https://developers.cloudflare.com/pages/functions/advanced-mode/), [Turnstile verification](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/), [Gmail App Passwords](https://support.google.com/accounts/answer/185833).
