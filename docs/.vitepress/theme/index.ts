import type { Theme } from 'vitepress'
import TwoslashFloatingVue from '@shikijs/vitepress-twoslash/client'
import { GesturePlugin } from '@vueuse/gesture'
import { MotionPlugin } from '@vueuse/motion'
import { createPinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import { installKeyboardShortcuts } from './composables/useKeyboardShortcuts'
import { annotationMessages } from './i18n/annotation'
import { statsMessages } from './i18n/stats'
// https://vitepress.dev/guide/custom-theme
import Layout from './Layout.vue'
import '@unocss/reset/tailwind.css'
import './style.css'
import 'uno.css'
import '@shikijs/vitepress-twoslash/style.css'
import 'vitepress/dist/client/theme-default/styles/vars.css'
import '@fontsource/caveat/index.css'
import '@fontsource-variable/eb-garamond/wght-italic.css'
import '@fontsource-variable/eb-garamond/wght.css'
import '@fontsource-variable/instrument-sans/wdth-italic.css'
import '@fontsource-variable/instrument-sans/wdth.css'
import '@fontsource/eb-garamond/index.css'
import '@fontsource/ephesis/index.css'
import '@fontsource/source-serif-pro/index.css'
import '@fontsource/alegreya-sans/index.css'
import '@fontsource/monaspace-argon/index.css'
import '@fontsource-variable/noto-sans-sc/wght.css'

declare const __VUE_PROD_DEVTOOLS__: boolean

// Always start with zh on SSR + first client paint to avoid hydration mismatch.
// Persist preference is applied after mount in Layout.
const i18n = createI18n({
  legacy: false,
  locale: 'zh',
  fallbackLocale: 'en',
  globalInjection: true,
  messages: {
    en: {
      localeUrlSuffix: 'en/',
      localeUrl: '{url}@:localeUrlSuffix',
      localeName: 'English',
      ...annotationMessages.en,
      ...statsMessages.en,
    },
    zh: {
      localeUrlSuffix: '',
      localeUrl: '{url}@:localeUrlSuffix',
      localeName: '中文',
      ...annotationMessages.zh,
      ...statsMessages.zh,
    },
  },
  datetimeFormats: {
    en: {
      short: {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      },
      long: {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      },
      withoutYear: {
        month: 'short',
        day: 'numeric',
      },
    },
    zh: {
      short: {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      },
      long: {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      },
      withoutYear: {
        month: 'short',
        day: 'numeric',
      },
    },
  },
})

export { i18n }

export default {
  Layout,
  enhanceApp({ app }) {
    app
      .use(createPinia())
      .use(TwoslashFloatingVue)
      .use(GesturePlugin)
      .use(MotionPlugin)
      .use(i18n)

    // 全局快捷键系统（批注 / 打开弹窗等，后续导航/命令面板复用）
    installKeyboardShortcuts(app)
  },
} satisfies Theme
