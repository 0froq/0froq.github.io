import { readdirSync } from 'node:fs'
import { join, relative } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { countCardWords } from '@froq/og-covers-layer/card-words'
import {
  IMAGE_ORIGIN,
  OG_IMAGE_URL,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_ORIGIN,
  TWITTER_HANDLE,
} from './app/utils/siteConstants'
import { publicationPaths } from './server/utils/siteRoutes'
import { listPublicShareImages } from './shared/public-files'

const docsRoot = fileURLToPath(new URL('./docs', import.meta.url))

const docsPublic = fileURLToPath(new URL('./docs/public', import.meta.url))
const docsEssays = fileURLToPath(new URL('./docs/essays', import.meta.url))
const docsJournal = fileURLToPath(new URL('./docs/journal', import.meta.url))
const docsCabinet = fileURLToPath(new URL('./docs/cabinet', import.meta.url))

const IMAGE_RE = /\.(?:png|jpe?g|gif|webp|svg|ico|avif)$/i
const PATH_SEP_RE = /[/\\]/

function contentImageAssets(root: string, urlBase: string) {
  const mounts: { dir: string, baseURL: string }[] = []

  function walk(dir: string) {
    let entries
    try {
      entries = readdirSync(dir, { withFileTypes: true })
    }
    catch {
      return
    }

    const name = dir.split(PATH_SEP_RE).pop() || ''
    const hasImage = entries.some(entry => entry.isFile() && IMAGE_RE.test(entry.name))
    const hasMarkdown = entries.some(entry => entry.isFile() && entry.name.endsWith('.md'))
    if (name.endsWith('-assets') || (hasImage && !hasMarkdown)) {
      const rel = relative(root, dir).replaceAll('\\', '/')
      mounts.push({
        dir,
        baseURL: rel ? `${urlBase}/${rel}` : urlBase,
      })
      return
    }

    for (const entry of entries) {
      if (entry.isDirectory() && !entry.name.startsWith('.') && !entry.name.startsWith('_'))
        walk(join(dir, entry.name))
    }
  }

  walk(root)
  return mounts
}

export default defineNuxtConfig({
  extends: [
    // `install: false` — giget’s nested pnpm install hits ERR_PNPM_IGNORED_BUILDS under pnpm 12;
    // `@froq/og-covers-layer` in package.json supplies the same layer.
    ['github:0froq/og-layer#v0.2.0', { install: false }],
  ],

  compatibilityDate: '2026-08-21',

  future: {
    compatibilityVersion: 4,
  },

  hooks: {
    'content:file:afterParse': ({ file, content }) => {
      if (typeof file.body === 'string')
        (content as { words?: number }).words = countCardWords(file.body)
    },
  },

  runtimeConfig: {
    public: {
      froqApi: process.env.NUXT_PUBLIC_FROQ_API || 'https://api.froq.me',
      publicFiles: listPublicShareImages(),
    },
  },

  modules: [
    '@nuxt/content',
    '@unocss/nuxt',
  ],

  // DevTools hosts the OG Image tab (template hot reload).
  devtools: {
    enabled: true,
    timeline: {
      enabled: true,
    },
  },

  // `og:image` is absolute on the Worker origin. `og:url` stays on froq.me via useShareCard.
  site: {
    url: IMAGE_ORIGIN,
    name: SITE_NAME,
  },

  experimental: {
    viewTransition: true,
  },

  css: [
    '~/assets/css/tokens.css',
    '~/assets/css/main.css',
    '~/assets/css/rough-ink.css',
    'katex/dist/katex.min.css',
  ],

  app: {
    head: {
      title: SITE_NAME,
      htmlAttrs: {
        lang: 'en',
      },
      meta: [
        { name: 'description', content: SITE_DESCRIPTION },
        { property: 'og:title', content: SITE_NAME },
        { property: 'og:description', content: SITE_DESCRIPTION },
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: SITE_NAME },
        { property: 'og:image', content: OG_IMAGE_URL },
        { property: 'og:image:secure_url', content: OG_IMAGE_URL },
        { property: 'og:image:type', content: 'image/png' },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { property: 'og:image:alt', content: SITE_NAME },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: SITE_NAME },
        { name: 'twitter:description', content: SITE_DESCRIPTION },
        { name: 'twitter:image', content: OG_IMAGE_URL },
        { name: 'twitter:image:alt', content: SITE_NAME },
        { name: 'twitter:site', content: TWITTER_HANDLE },
      ],
      script: [
        {
          src: '/color-scheme.js',
          tagPosition: 'head',
        },
      ],
      link: [
        {
          rel: 'alternate',
          type: 'application/rss+xml',
          title: SITE_NAME,
          href: `${SITE_ORIGIN}/rss.xml`,
        },
        {
          rel: 'icon',
          href: '/favicon.png?v=2',
          type: 'image/png',
          sizes: '64x64',
        },
        {
          rel: 'icon',
          href: '/favicon.ico?v=2',
          sizes: '48x48',
        },
        {
          rel: 'preconnect',
          href: 'https://fonts.googleapis.com',
        },
        {
          rel: 'preconnect',
          href: 'https://fonts.gstatic.com',
          crossorigin: '',
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=EB+Garamond:ital,wght@0,400..800;1,400..800&family=Instrument+Sans:wght@400..700&display=swap',
        },
      ],
    },
  },

  nitro: {
    // Workers Builds sets CI env vars that make Nitro pick cloudflare-pages-static,
    // which omits key flat HTML paths and adds Pages-style _redirects/_headers fallbacks.
    preset: 'static',
    output: {
      publicDir: 'dist',
    },
    prerender: {
      autoSubfolderIndex: false,
      failOnError: false,
      routes: [...publicationPaths(docsRoot), '/sitemap.xml', '/rss.xml'],
    },
    serverAssets: [
      {
        baseName: 'dashboard',
        dir: fileURLToPath(new URL('./docs/dashboard', import.meta.url)),
      },
    ],
    publicAssets: [
      {
        dir: docsPublic,
        baseURL: '/',
      },
      ...contentImageAssets(docsEssays, '/_files/essays'),
      ...contentImageAssets(docsJournal, '/_files/journal'),
      ...contentImageAssets(docsCabinet, '/_files/cabinet'),
    ],
  },

  typescript: {
    strict: true,
  },

  devtools: {
    timeline: {
      enabled: true,
    },
  },
  components: {
    dirs: [
      {
        path: '~/components/ink',
        pathPrefix: false,
      },
      {
        path: '~/components',
        ignore: ['**/ink/**', '**/content/**'],
      },
    ],
  },

  content: {
    build: {
      markdown: {
        remarkPlugins: {
          'remark-math': {},
        },
        rehypePlugins: {
          'rehype-katex': {
            options: {
              output: 'html',
            },
          },
        },
      },
    },
    renderer: {
      alias: {
        warning: 'ProseWarning',
        note: 'ProseNote',
        tip: 'ProseTip',
      },
    },
  },
})
