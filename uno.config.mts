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

export default defineConfig({
  theme: {
    breakpoint: {
      sm: '600px',
      md: '760px',
      lg: '1440px',
    },
    colors: {
      paper: 'var(--paper)',
      paper2: 'var(--paper2)',
      muted: 'var(--muted)',
      line: 'var(--line)',
      mark: 'var(--mark)',
      float: 'var(--float)',
      shadow: 'var(--shadow)',
      cream: 'var(--cream)',
      logo: 'var(--logo)',
      ink: 'var(--ink)',
      colored: {
        ink: 'var(--colored-ink)',
      },
    },
  },
  rules: [
    ['font-mono', { 'font-family': 'var(--font-mono)' }],
    ['font-serif', { 'font-family': 'var(--font-serif)' }],
    ['font-sans', { 'font-family': 'var(--font-sans)' }],
  ],
  content: {
    pipeline: {
      include: [
        /\.(vue|svelte|[jt]sx|mdx?|astro|elm|php|phtml|html|css)($|\?)/,
      ],
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
        carbon: () => import('@iconify-json/carbon/icons.json', { with: { type: 'json' } }).then(i => i.default as any),
        ph: () => import('@iconify-json/ph/icons.json', { with: { type: 'json' } }).then(i => i.default as any),
        solar: () => import('@iconify-json/solar/icons.json', { with: { type: 'json' } }).then(i => i.default as any),
        duo: () => import('@iconify-json/duo-icons/icons.json', { with: { type: 'json' } }).then(i => i.default as any),
        simple: () => import('@iconify-json/simple-icons/icons.json', { with: { type: 'json' } }).then(i => i.default as any),
        skill: () => import('@iconify-json/skill-icons/icons.json', { with: { type: 'json' } }).then(i => i.default as any),
        twe: () => import('@iconify-json/twemoji/icons.json', { with: { type: 'json' } }).then(i => i.default as any),
        openmj: () => import('@iconify-json/openmoji/icons.json', { with: { type: 'json' } }).then(i => i.default as any),
        selfhst: () => import('@iconify-json/selfhst/icons.json', { with: { type: 'json' } }).then(i => i.default as any),
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
      cssExtend: {
        'a': {
          'color': 'var(--ink)',
          'text-decoration': 'none',
        },
        'p': {
          'margin': '0 0 1.15em',
          'text-wrap': 'pretty',
        },
        'p:last-child': {
          'margin-bottom': 0,
        },
        'li': {
          'margin': '0.28em 0',
          'text-wrap': 'pretty',
          'padding-inline-start': '0.15em',
        },
        'li p': {
          margin: '0.4em 0',
        },
        'ul, ol': {
          'margin': '0 0 1.15em',
          'padding-inline-start': '1.35em',
        },
        'ul ul, ol ol, ul ol, ol ul': {
          margin: '0.35em 0 0',
        },
        'ul': {
          'list-style-type': 'disc',
        },
        'ol': {
          'list-style-type': 'decimal',
        },
        'blockquote': {
          'margin': '1.4em 0',
          'padding': '0.15em 0 0.15em 1.1em',
          'border-left': '1.5px solid var(--line)',
          'color': 'var(--muted)',
          'font-style': 'italic',
        },
        'blockquote p:last-child': {
          'margin-bottom': 0,
        },
        'h1': {
          'margin': '1.4em 0 0.55em',
          'font-size': '1.85em',
          'font-weight': '600',
          'letter-spacing': '-0.04em',
          'line-height': '1.2',
          'text-wrap': 'balance',
        },
        'h2': {
          'margin': '1.8em 0 0.6em',
          'font-size': '1.4em',
          'font-weight': '600',
          'letter-spacing': '-0.04em',
          'line-height': '1.2',
          'text-wrap': 'balance',
        },
        'h3': {
          'margin': '1.6em 0 0.5em',
          'font-size': '1.15em',
          'font-weight': '600',
          'letter-spacing': '-0.03em',
          'line-height': '1.25',
        },
        'h4, h5, h6': {
          'margin': '1.4em 0 0.45em',
          'font-size': '1em',
          'font-weight': '600',
          'letter-spacing': '-0.02em',
        },
        'h1:first-child, h2:first-child, h3:first-child, h4:first-child': {
          'margin-top': 0,
        },
        'img': {
          'display': 'block',
          'max-width': '100%',
          'height': 'auto',
          'margin': '1.2em 0',
        },
        'figure': {
          margin: '1.5em 0',
        },
        'figcaption': {
          'margin-top': '0.5em',
          'font-family': 'var(--font-mono)',
          'font-size': '0.85em',
          'color': 'var(--muted)',
        },
        'hr': {
          'margin': '1.6em 0',
          'border': '0',
          'border-top': '1px solid var(--line)',
        },
        'pre': {
          'margin': '1.3em 0',
          'padding': '1em 1.1em',
          'overflow-x': 'auto',
          'font-size': '0.84em',
          'line-height': '1.55',
          'border': '1px solid var(--line)',
          'background': 'color-mix(in srgb, var(--ink) 4%, var(--paper))',
        },
        'pre code': {
          'font-size': 'inherit',
          'background': 'none',
          'padding': '0',
        },
        'code': {
          'font-family': 'var(--font-mono)',
          'font-size': '0.82em',
        },
        ':not(pre) > code': {
          padding: '0.12em 0.28em',
          background: 'color-mix(in srgb, var(--ink) 6%, var(--paper))',
        },
        'table': {
          'width': '100%',
          'margin': '1.3em 0',
          'border-collapse': 'collapse',
          'font-size': '0.92em',
          'line-height': '1.45',
        },
        'th': {
          'padding': '0.4em 0.7em 0.4em 0',
          'border-bottom': '1px solid var(--line)',
          'font-weight': '600',
          'text-align': 'left',
        },
        'td': {
          'padding': '0.4em 0.7em 0.4em 0',
          'border-bottom': '1px solid var(--line)',
          'vertical-align': 'top',
        },
        'strong': {
          'font-weight': '600',
        },
        'em': {
          'font-style': 'italic',
        },
        'kbd': {
          'padding': '0.1em 0.35em',
          'border': '1px solid var(--line)',
          'font-family': 'var(--font-mono)',
          'font-size': '0.78em',
        },
        'sup, sub': {
          'font-size': '0.75em',
        },
        'dl': {
          margin: '1.15em 0',
        },
        'dt': {
          'font-weight': '600',
          'margin-top': '0.6em',
        },
        'dd': {
          margin: '0.2em 0 0.6em 1.2em',
          color: 'var(--muted)',
        },
        'video, iframe': {
          'display': 'block',
          'max-width': '100%',
          'margin': '1.3em 0',
        },
        'mark, u': {
          'background-color': 'transparent',
          'color': 'var(--ink)',
          'text-decoration': 'none',
        },
        'ruby': {
          'ruby-align': 'center',
        },
        'rt': {
          'font-family': 'var(--font-mono)',
          'font-size': '0.55em',
          'color': 'var(--muted)',
        },
        '.footnotes': {
          'margin-top': '2.5em',
          'padding-top': '1em',
          'border-top': '1px solid var(--line)',
          'font-size': '0.88em',
          'color': 'var(--muted)',
        },
        '.footnote-ref, .footnote-backref': {
          'font-family': 'var(--font-mono)',
          'font-size': '0.75em',
          'color': 'var(--muted)',
        },
        '.warning, .tip': {
          'margin': '1.4em 0',
          'padding': '0.9em 0 0',
          'border-top': '1px solid var(--line)',
          'color': 'var(--muted)',
          'font-size': '0.95em',
        },
      },
    }),
  ],
  transformers: [
    transformerDirectives(),
    transformerVariantGroup(),
  ],
  extractors: [
    extractorMdc(),
  ],
  safelist: [
    // 'prose',
    'un-opacity-100',
    'i-openmj-thumbs-up?bg',
    'i-openmj-red-heart?bg',
    'i-openmj-face-with-open-mouth?bg',
    'i-openmj-sparkles?bg',
    'i-openmj-pushpin?bg',
  ],
})
