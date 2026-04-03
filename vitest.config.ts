import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'node:path'

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
