# froq-api

Cloudflare Worker for froq.me:

- GitHub OAuth Device Flow proxy (`/__auth/*`, `/device/code`, `/oauth/access_token`)
- Page presence + site visit counters (`/session/ping`, `/session/leave`, `/stats`)
- Logged-in reading progress sync (`GET|PUT /progress`)
- Scrapboard emoji reactions (`GET|POST /scraps/reactions`) — anonId only, no GitHub

**Production:** `https://api.froq.me`
(fallback workers.dev URL still works: `https://froq-api.sayhola.workers.dev`)

## Scrap reactions

```http
GET /scraps/reactions?ids=a,b&anonId=<uuid>
POST /scraps/reactions
{ "scrapId": "a", "emoji": "👍", "anonId": "<uuid>" }
```

Allowed emoji: 👍 ❤️ 😮 ✨ 📌. One vote per scrap per anon (toggle / switch).

Site runtime config: `NUXT_PUBLIC_FROQ_API` (default `https://api.froq.me`).

## Setup

```bash
cd workers/froq-api
pnpm install
pnpm exec wrangler login
pnpm deploy
```

## Site hosting (Cloudflare Pages)

Static VitePress site deploys via GitHub Actions → Cloudflare Pages project
`froq` (`https://froq.pages.dev`, custom domain `froq.me`).

GitHub secrets for `.github/workflows/deploy.yml`:

| Secret                   | Purpose                                       |
| ------------------------ | --------------------------------------------- |
| `CLOUDFLARE_API_TOKEN`   | Pages Edit (+ Account Read)                   |
| `CLOUDFLARE_ACCOUNT_ID`  | from `wrangler whoami`                        |
| `VITE_GITHUB_CLIENT_ID`  | OAuth Device Flow                             |
| `VITE_GITHUB_READ_TOKEN` | Guest annotation reads                        |
| `VITE_GITHUB_AUTH_PROXY` | `https://api.froq.me`                         |
| `VITE_FROQ_API`          | same URL (optional; falls back to AUTH_PROXY) |

Create an API token at
https://developers.cloudflare.com/fundamentals/api/get-started/create-token/
(template **Edit Cloudflare Workers** is fine; ensure **Account → Cloudflare Pages → Edit**).

Custom domain: Dashboard → Workers & Pages → **froq** → Custom domains → add
`froq.me` / `www.froq.me` (DNS must be on Cloudflare for that zone).

After CORS changes, redeploy this Worker (`pnpm deploy`).

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
