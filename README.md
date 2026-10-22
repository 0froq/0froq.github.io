# froQ

Personal site at [froq.me](https://froq.me).

```bash
pnpm i
pnpm dev
```

部署在 Cloudflare Workers（Worker 名 `froq`）。`pnpm generate` 产出 `dist/`。Worker 配置在 `cloudflare.config.ts`，静态资源目录在 `wrangler.config.ts`。本地一次发布用 `pnpm deploy`。

Workers Builds（GitHub 连接，仓库不放 API token）：`NODE_VERSION=24.21.0`，构建 `pnpm generate`，生产 `pnpm exec cf deploy`，预览 `pnpm exec cf previews deploy`。部署为 **Cloudflare Workers + 静态 assets**（非 Pages）。
