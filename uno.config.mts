import extractorMdc from '@unocss/extractor-mdc'

import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetMini,
  presetTagify,
  presetTypography,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'
import contacts from './docs/.vitepress/theme/src/contacts.json' with { type: 'json' }
import safeIcon from './docs/.vitepress/theme/src/safeIcon.json' with { type: 'json' }

const safeIcons = [
  ...contacts.map(c => c.iconUno),
  ...safeIcon.appIcons,
]
const safeColors = contacts.map(c => c.colorUno)
export default defineConfig({
  theme: {
    breakpoints: {
      sm: '600px',
      md: '900px',
    },
  },
  rules: [
    ['font-sans', { 'font-family': 'LXGW Neo ZhiSong Plus' }],
    ['font-serif', { 'font-family': 'YshiPen-ShutiTC' }],
    ['font-mono', { 'font-family': 'LXGW Bright Code TC' }],
    ['font-stylish', { 'font-family': 'Caveat' }],
    ['font-script', { 'font-family': 'Ephesis' }],
  ],
  safelist: [
    ...safeIcons,
    ...safeColors.map(c => `border-${c}-500`),
    ...safeColors.map(c => `text-${c}-500`),
    ...safeColors.map(c => `hover:text-${c}-500`),
  ],
  content: {
    pipeline: {
      include: [
        /\.(vue|svelte|[jt]sx|mdx?|astro|elm|php|phtml|html|css)($|\?)/,
      ],
    },
  },
  shortcuts: {
    'page-content': 'mx-auto max-w-[800px] block px-10 min-w-0',
  },
  presets: [
    presetMini(),
    presetIcons({
      collections: {
        carbon: () => import('@iconify-json/carbon/icons.json', { with: { type: 'json' } }).then(i => i.default as any),
        ph: () => import('@iconify-json/ph/icons.json', { with: { type: 'json' } }).then(i => i.default as any),
        solar: () => import('@iconify-json/solar/icons.json', { with: { type: 'json' } }).then(i => i.default as any),
        duo: () => import('@iconify-json/duo-icons/icons.json', { with: { type: 'json' } }).then(i => i.default as any),
        simple: () => import('@iconify-json/simple-icons/icons.json', { with: { type: 'json' } }).then(i => i.default as any),
        skill: () => import('@iconify-json/skill-icons/icons.json', { with: { type: 'json' } }).then(i => i.default as any),
      },
    }),
    presetAttributify({
      strict: true,
      prefixedOnly: true,
      prefix: 'un-',
    }),
    presetTagify({
      prefix: 'un-',
    }),
    presetTypography(),
  ],
  transformers: [
    transformerDirectives(),
    transformerVariantGroup(),
  ],
  extractors: [
    extractorMdc(),
  ],
  layers: {
    default: 0,
    components: 1,
    utilities: 2,
  },
})
