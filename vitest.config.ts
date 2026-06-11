import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [vue()],
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
