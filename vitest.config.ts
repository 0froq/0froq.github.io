import { resolve } from 'node:path'
import { defineConfig } from 'vite-plus'

export default defineConfig({
  test: {
    environment: 'happy-dom',
    globals: true,
    include: ['tests/**/*.{test,spec}.{js,ts}'],
    setupFiles: ['./tests/setup.ts'],
  },
  resolve: {
    alias: {
      '~': resolve(__dirname, 'docs/.vitepress/theme'),
      '@': resolve(__dirname, 'docs/.vitepress/theme/components'),
    },
  },
})
