import { readdirSync } from 'node:fs'
import { join, relative } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { OG_IMAGE_URL, SITE_DESCRIPTION, SITE_NAME, TWITTER_HANDLE } from './app/utils/siteConstants'
import { publicationPaths } from './server/utils/siteRoutes'

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
    'katex/dist/katex.min.css',
  ],

  runtimeConfig: {
    public: {
      froqApi: process.env.NUXT_PUBLIC_FROQ_API || 'https://api.froq.me',
    },
  },

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
      routes: [...publicationPaths(docsRoot), '/sitemap.xml'],
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
