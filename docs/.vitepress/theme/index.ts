import type { Theme } from 'vitepress'
import TwoslashFloatingVue from '@shikijs/vitepress-twoslash/client'
import { GesturePlugin } from '@vueuse/gesture'
import { MotionPlugin } from '@vueuse/motion'
import { createI18n } from 'vue-i18n'
// https://vitepress.dev/guide/custom-theme
import Layout from './Layout.vue'
import '@unocss/reset/tailwind.css'
import './style.css'
import 'uno.css'
import '@shikijs/vitepress-twoslash/style.css'
import 'vitepress/dist/client/theme-default/styles/vars.css'

const __VUE_PROD_DEVTOOLS__ = false

const savedLocale = typeof localStorage !== 'undefined'
  ? localStorage.getItem('locale') ?? 'zh'
  : 'zh' // SSR 环境中 localStorage 不存在，必须提供 fallback

const i18n = createI18n({
  legacy: false,
  // locale: 'zh',
  locale: savedLocale,
  fallbackLocale: 'en',
  globalInjection: true,
  messages: {
    en: {
      localeName: 'English',
    },
    zh: {
      localeName: '中文',
    },
  },
  datetimeFormats: {
    'en': {
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
    'zh': {
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
  }
})

export default {
  Layout,
  enhanceApp({ app }) {
    // ...
    app
      .use(TwoslashFloatingVue)
      .use(GesturePlugin)
      .use(MotionPlugin)
      .use(i18n)
  },
} satisfies Theme
