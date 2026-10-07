<div align="center">

<img src="assets/readme/hero.gif" width="1200" alt="PIMX AGENT — rotating 3D geometry" />

**[English](README.md) · [فارسی](README.fa.md)**

<img src="assets/readme/identity.svg" width="1200" alt="ai / English and Persian documentation" />

</div>

# PIMX AGENT

A Next.js AI workspace with provider configuration, conversations, attachments, project/library organization, research tools and document/presentation workflows.

[GitHub](https://github.com/MOHAMMADREZAABEDINPOOR/PIMX_AGENT) · [PIMX / Profile](https://github.com/MOHAMMADREZAABEDINPOOR) · [Static artwork](assets/readme/hero.png)

## Features

- Provider selection, comparison and configurable credentials
- Chat, attachments, source Q&A and retrieval helpers
- Canvas, research, slides and export tools
- Account/workspace controls and Cloudflare adapters

## Stack

| Tool | Version / source |
|---|---|
| React | `^19.2.1` |
| Next.js | `^16.3.4` |
| TypeScript | `5.9.3` |
| Three.js | `^0.186.1` |
| Motion | `^12.23.24` |
| Tailwind CSS | `4.1.11` |

## Getting started

Node.js 22.12+ and the package manager declared in package.json. Install dependencies from the checked-in lockfile where available.

```bash
git clone https://github.com/MOHAMMADREZAABEDINPOOR/PIMX_AGENT.git
cd PIMX_AGENT

npm ci
npm run dev
```

## Configuration

These names are found in the example configuration or source; not all are required. Check their defaults/usage in those files and supply secrets only in your local or hosting environment.

| Name | Role |
|---|---|
| `ALLOW_LOCAL_PROVIDERS` | Application setting; inspect its definition |
| `ALLOW_SHARED_PROVIDER_KEYS` | Credential/connection setting; keep private |
| `APP_DATA_DIR` | Application setting; inspect its definition |
| `APP_DATA_ENCRYPTION_KEY` | Credential/connection setting; keep private |
| `APP_PROXY_SECRET` | Credential/connection setting; keep private |
| `APP_RUNTIME` | Application setting; inspect its definition |
| `APP_SURFACE` | Application setting; inspect its definition |
| `APP_URL` | Application setting; inspect its definition |
| `GEMINI_API_KEY` | Credential/connection setting; keep private |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Public browser configuration; never put secrets here |
| `TEST_BASE_URL` | Application setting; inspect its definition |
| `TRUST_PROXY` | Application setting; inspect its definition |
| `TURNSTILE_SECRET_KEY` | Credential/connection setting; keep private |

Hosting bindings: `ASSETS`, `DB`.

## Usage

Configure `.env` from `.env.example`, start the application and choose an AI provider in settings. Add credentials for that provider, then open a chat, attach a document or create a project.

## Project structure

| Path | Role |
|---|---|
| [`app/`](app/) | Application routes / PHP application |
| [`assets/`](assets/) | Brand/media/README assets |
| [`components/`](components/) | Reusable interface components |
| [`docs/`](docs/) | Supporting documentation |
| [`lib/`](lib/) | Shared application modules |
| [`migrations/`](migrations/) | Database migrations |
| [`public/`](public/) | Public web assets |
| [`scripts/`](scripts/) | Development and maintenance utilities |
| [`tests/`](tests/) | Existing automated checks |
| [`metadata.json`](metadata.json) | Project entry/configuration file |
| [`package.json`](package.json) | Project entry/configuration file |
| [`tsconfig.json`](tsconfig.json) | Project entry/configuration file |

## Commands and checks

```bash
npm run dev
npm run build
npm run start
npm run build:cloudflare
npm run pages:build
npm run lint
npm run test
npm run check
npm run security:secrets
```

These commands are declared in package.json; the list is not a test execution report. Test commands may need a browser, service or prepared database.

## Deployment

Use build/start for Node hosting, or the Cloudflare-specific package.json scripts with your own bindings. Configure databases/secrets separately and consult the repository’s supporting guides.

## Detailed project guide

[Extended project guide](docs/PROJECT_GUIDE.md)

## Limitations

Provider availability, pricing and limits vary. Database and Cloudflare bindings must match the chosen deployment. Model names in the catalog are configuration entries, not a guarantee of provider availability.

## Troubleshooting

- Missing packages: install dependencies using the project’s package manager.
- API/network failure: check the configured origin, provider and hosting bindings.
- Old assets: rebuild when a build script exists, then clear the browser cache.

## Contributing

Create a focused branch, verify the affected behavior and explain the change clearly. Keep private data, build outputs and local databases out of commits.

## License

No repository-level license file is included in this snapshot. Public visibility alone does not grant reuse rights; contact the repository owner for terms.

---

Part of **PIMX** · Documentation in English and Persian.
