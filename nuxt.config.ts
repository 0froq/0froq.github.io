import { readdirSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const docsPublic = fileURLToPath(new URL('./docs/public', import.meta.url))
const docsPosts = fileURLToPath(new URL('./docs/posts', import.meta.url))
const docsCorpus = fileURLToPath(new URL('./docs/corpus', import.meta.url))

const IMAGE_RE = /\.(png|jpe?g|gif|webp|svg|ico|avif)$/i

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

    const name = dir.split(/[/\\]/).pop() || ''
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
  compatibilityDate: '2026-08-21',

  future: {
    compatibilityVersion: 4,
  },

  modules: [
    '@nuxt/content',
    '@unocss/nuxt',
  ],

  experimental: {
    viewTransition: true,
  },

  css: [
    '~/assets/css/tokens.css',
    '~/assets/css/main.css',
    '~/assets/css/rough-ink.css',
  ],

  runtimeConfig: {
    public: {
      froqApi: process.env.NUXT_PUBLIC_FROQ_API || 'https://api.froq.me',
    },
  },

  app: {
    head: {
      title: 'froQ',
      htmlAttrs: {
        lang: 'en',
      },
      script: [
        {
          src: '/color-scheme.js',
          tagPosition: 'head',
        },
      ],
      link: [
        {
          rel: 'icon',
          href: '/logo.svg',
          type: 'image/svg+xml',
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
          href: 'https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=EB+Garamond:ital,wght@0,400..800;1,400..800&display=swap',
        },
      ],
    },
  },

  nitro: {
    publicAssets: [
      {
        dir: docsPublic,
        baseURL: '/',
      },
      ...contentImageAssets(docsPosts, '/_files/posts'),
      ...contentImageAssets(docsCorpus, '/_files/corpus'),
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
    renderer: {
      alias: {
        warning: 'ProseWarning',
        note: 'ProseNote',
        tip: 'ProseTip',
      },
    },
  },
})
