# froq-api

Cloudflare Worker for froq.me:

- GitHub OAuth Device Flow proxy (`/__auth/*`, `/device/code`, `/oauth/access_token`)
- Page presence + site visit counters (`/session/ping`, `/session/leave`, `/stats`)
- Logged-in reading progress sync (`GET|PUT /progress`)

**Production:** `https://froq-api.sayhola.workers.dev`

## Setup

```bash
cd workers/froq-api
pnpm install
pnpm exec wrangler login
pnpm deploy
```

Point GitHub Actions secrets (no trailing slash):

- `VITE_GITHUB_AUTH_PROXY` = `https://froq-api.sayhola.workers.dev` (auth + stats)
- `VITE_FROQ_API` = same URL (optional; falls back to AUTH_PROXY)

Then re-run the Pages deploy workflow so the client bundle picks up the env.

## Local

```bash
pnpm dev   # http://127.0.0.1:8787
```

In the site root `.env.local`:

```
VITE_FROQ_API=http://127.0.0.1:8787
VITE_GITHUB_AUTH_PROXY=http://127.0.0.1:8787
```

Or use the Vite `/__froq` proxy (see `docs/.vitepress/config.mts`).
