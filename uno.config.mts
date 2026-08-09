import extractorMdc from '@unocss/extractor-mdc'
import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetTagify,
  presetTypography,
  presetWind4,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'

import safeIcon from './docs/.vitepress/theme/src/safeIcon.json' with { type: 'json' }

const safeIcons = [
  ...safeIcon.appIcons,
]
export default defineConfig({
  theme: {
    breakpoint: {
      sm: '600px',
      md: '900px',
      lg: '1440px',
    },
  },
  rules: [
    ['font-mono', { 'font-family': 'LXGW Bright Code TC, Monaspace Argon' }],
    ['font-serif', { 'font-family': 'EB Garamond Variable, YshiPen-ShutiTC' }],
    ['font-script', { 'font-family': 'Ephesis' }],
    ['font-stylish', { 'font-family': 'Caveat' }],
    ['font-sans', { 'font-family': 'Instrument Sans Variable' }],
  ],
  safelist: [
    ...safeIcons,
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
    presetWind4(),
    presetIcons({
      scale: 1.2,
      collections: {
        carbon: () => import('@iconify-json/carbon/icons.json', { with: { type: 'json' } }).then(i => i.default as any),
        ph: () => import('@iconify-json/ph/icons.json', { with: { type: 'json' } }).then(i => i.default as any),
        solar: () => import('@iconify-json/solar/icons.json', { with: { type: 'json' } }).then(i => i.default as any),
        duo: () => import('@iconify-json/duo-icons/icons.json', { with: { type: 'json' } }).then(i => i.default as any),
        simple: () => import('@iconify-json/simple-icons/icons.json', { with: { type: 'json' } }).then(i => i.default as any),
        skill: () => import('@iconify-json/skill-icons/icons.json', { with: { type: 'json' } }).then(i => i.default as any),
        twe: () => import('@iconify-json/twemoji/icons.json', { with: { type: 'json' } }).then(i => i.default as any),
        openmj: () => import('@iconify-json/openmoji/icons.json', { with: { type: 'json' } }).then(i => i.default as any),
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
    // presetWebFonts({
    //   provider: 'fontsource',
    //   fonts: {
    //     sans: ['Alegreya Sans'],
    //     serif: ['Source Serif 4'],
    //     italicSerif: ['EB Garamond:400'],
    //     stylish: 'Caveat',
    //     script: 'Ephesis',
    //   },
    // }),
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
