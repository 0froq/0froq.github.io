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
import { breakpoints } from './app/utils/breakpoints'
import { tokenColors, tokenFonts } from './uno.tokens'

export default defineConfig({
  theme: {
    // Width RWD is only sm / md / lg (see app/utils/breakpoints.ts).
    // Do not add xl, 2xl, or extra pixel cuts. CSS: sm: md: lg: max-sm: max-md: max-lg:
    breakpoint: {
      sm: `${breakpoints.sm}px`,
      md: `${breakpoints.md}px`,
      lg: `${breakpoints.lg}px`,
    },
    // Color utilities and font stacks come from tokens.css — see uno.tokens.ts.
    // Wind4 reset always emits --font-mono from theme.font.mono, after tokens.css.
    colors: tokenColors(),
    font: tokenFonts(),
    ease: {
      paper: 'var(--ease-out)',
    },
  },
  shortcuts: {
    'chrome-blur': 'bg-[color-mix(in_srgb,var(--paper)_92%,transparent)] backdrop-blur-[10px]',
    'reach-hit':
      'focus-visible:outline focus-visible:outline-1 focus-visible:outline-colored-ink focus-visible:outline-offset-[3px] active:translate-y-px',
    'filter-hit':
      'focus-within:outline focus-within:outline-1 focus-within:outline-colored-ink focus-within:outline-offset-4',
  },
  rules: [
    ['font-mono', { 'font-family': 'var(--font-mono)' }],
    ['font-serif', { 'font-family': 'var(--font-serif)' }],
    ['font-sans', { 'font-family': 'var(--font-sans)' }],
    ['font-inherit', { font: 'inherit' }],
    ['ease-paper', { 'transition-timing-function': 'var(--ease-out)' }],
  ],
  content: {
    filesystem: ['app/assets/css/**/*.css'],
    pipeline: {
      include: [/\.(vue|svelte|[jt]sx|mdx?|astro|elm|php|phtml|html|css)($|\?)/],
    },
  },
  presets: [
    presetWind4(),
    presetIcons({
      scale: 1.2,
      extraProperties: {
        'display': 'inline-block',
        'vertical-align': '-0.125em',
      },
      collections: {
        carbon: () =>
          import('@iconify-json/carbon/icons.json', { with: { type: 'json' } }).then(
            i => i.default as any,
          ),
        ph: () =>
          import('@iconify-json/ph/icons.json', { with: { type: 'json' } }).then(
            i => i.default as any,
          ),
        solar: () =>
          import('@iconify-json/solar/icons.json', { with: { type: 'json' } }).then(
            i => i.default as any,
          ),
        duo: () =>
          import('@iconify-json/duo-icons/icons.json', { with: { type: 'json' } }).then(
            i => i.default as any,
          ),
        simple: () =>
          import('@iconify-json/simple-icons/icons.json', { with: { type: 'json' } }).then(
            i => i.default as any,
          ),
        skill: () =>
          import('@iconify-json/skill-icons/icons.json', { with: { type: 'json' } }).then(
            i => i.default as any,
          ),
        twe: () =>
          import('@iconify-json/twemoji/icons.json', { with: { type: 'json' } }).then(
            i => i.default as any,
          ),
        openmj: () =>
          import('@iconify-json/openmoji/icons.json', { with: { type: 'json' } }).then(
            i => i.default as any,
          ),
        selfhst: () =>
          import('@iconify-json/selfhst/icons.json', { with: { type: 'json' } }).then(
            i => i.default as any,
          ),
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
    presetTypography({
      colorScheme: {
        'body': ['var(--ink)', 'var(--ink)'],
        'headings': ['var(--ink)', 'var(--ink)'],
        'lead': ['var(--muted)', 'var(--muted)'],
        'links': ['var(--ink)', 'var(--ink)'],
        'bold': ['var(--ink)', 'var(--ink)'],
        'counters': ['var(--muted)', 'var(--muted)'],
        'bullets': ['var(--muted)', 'var(--muted)'],
        'hr': ['var(--line)', 'var(--line)'],
        'quotes': ['var(--ink)', 'var(--ink)'],
        'quote-borders': ['var(--line)', 'var(--line)'],
        'captions': ['var(--muted)', 'var(--muted)'],
        'kbd': ['var(--ink)', 'var(--ink)'],
        'kbd-shadows': ['var(--ink)', 'var(--ink)'],
        'code': ['var(--ink)', 'var(--ink)'],
        'pre-code': ['var(--ink)', 'var(--ink)'],
        'pre-bg': [
          'color-mix(in srgb, var(--ink) 6%, var(--paper))',
          'color-mix(in srgb, var(--ink) 6%, var(--paper))',
        ],
        'th-borders': ['var(--line)', 'var(--line)'],
        'td-borders': ['var(--line)', 'var(--line)'],
      },
    }),
  ],
  transformers: [transformerDirectives(), transformerVariantGroup()],
  extractors: [extractorMdc()],
  safelist: [
    // 'prose',
    'un-opacity-100',
    'h-17',
    'w-9',
    'h-9',
    'w-17',
    'h-6',
    'w-3.5',
    'h-3.5',
    'w-7',
    'h-10',
    'w-6',
    'w-12',
    'i-openmj-thumbs-up?bg',
    'i-openmj-red-heart?bg',
    'i-openmj-face-with-open-mouth?bg',
    'i-openmj-sparkles?bg',
    'i-openmj-pushpin?bg',
  ],
})
