import type { Theme } from 'vitepress'
import TwoslashFloatingVue from '@shikijs/vitepress-twoslash/client'
import { GesturePlugin } from '@vueuse/gesture'
import { MotionPlugin } from '@vueuse/motion'
import { createPinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import { installKeyboardShortcuts } from './composables/useKeyboardShortcuts'
import { annotationMessages } from './i18n/annotation'
// https://vitepress.dev/guide/custom-theme
import Layout from './Layout.vue'
import '@unocss/reset/tailwind.css'
import './style.css'
import 'uno.css'
import '@shikijs/vitepress-twoslash/style.css'
import 'vitepress/dist/client/theme-default/styles/vars.css'
import '@fontsource/caveat'
import '@fontsource-variable/eb-garamond/wght-italic.css'
import '@fontsource/eb-garamond'
import '@fontsource/ephesis'
import '@fontsource/source-serif-pro'
import '@fontsource/alegreya-sans'
import '@fontsource/monaspace-argon'

declare const __VUE_PROD_DEVTOOLS__: boolean

const savedLocale = typeof localStorage !== 'undefined'
  ? localStorage.getItem('locale') ?? 'zh'
  : 'zh'

const i18n = createI18n({
  legacy: false,
  locale: savedLocale,
  fallbackLocale: 'en',
  globalInjection: true,
  messages: {
    en: {
      localeUrlSuffix: 'en/',
      localeUrl: '{url}@:localeUrlSuffix',
      localeName: 'English',
      ...annotationMessages.en,
    },
    zh: {
      localeUrlSuffix: '',
      localeUrl: '{url}@:localeUrlSuffix',
      localeName: '中文',
      ...annotationMessages.zh,
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
