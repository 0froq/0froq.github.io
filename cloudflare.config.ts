import { defineConfig } from 'cf/config'

export default defineConfig({
  worker: {
    name: 'froq',
    compatibilityDate: '2026-10-12',
    observability: {
      enabled: true,
      traces: {
        enabled: true,
      },
    },
    assets: {
      htmlHandling: 'drop-trailing-slash',
      notFoundHandling: '404-page',
    },
  },
})
