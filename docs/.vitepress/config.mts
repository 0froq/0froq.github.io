/// <reference path="./markdown-it-shims.d.ts" />

import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite'
import { transformerColorizedBrackets } from '@shikijs/colorized-brackets'
import { transformerMetaWordHighlight, transformerNotationWordHighlight } from '@shikijs/transformers'
import { transformerTwoslash } from '@shikijs/vitepress-twoslash'
import { createFileSystemTypesCache } from '@shikijs/vitepress-twoslash/cache-fs'
import anchor from 'markdown-it-anchor'
import markdownItFootnote from 'markdown-it-footnote'
import markdownItHashtag from 'markdown-it-hashtag'
import markdownItFigures from 'markdown-it-implicit-figures'
import markdownItMark from 'markdown-it-mark'
import markdownItMdc from 'markdown-it-mdc'
import markdownItRuby from 'markdown-it-ruby'
import UnoCSS from 'unocss/vite'
import { defineConfig } from 'vitepress'
// https://vitepress.dev/reference/site-config
export default defineConfig({
  ignoreDeadLinks: true,
  head: [
    ['link', { rel: 'icon', href: '/logo.svg', type: 'image/svg+xml' }],
  ],
  cleanUrls: true,
  title: 'froQ',
  description: '于此。',
  vite: {
    plugins: [
      UnoCSS(),
      VueI18nPlugin({
        ssr: true,
      }),
    ],
    define: {
      __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'true',
    },
    resolve: {
      alias: {
        '~/': '/.vitepress/theme/',
        '@/': '/.vitepress/theme/components/',
      },
    },
  },
  vue: {
    template: {
      compilerOptions: {
        isCustomElement: tag => tag.startsWith('un-')
          || ['rb'].includes(tag),
      },
    },
  },
  // locales: {
  //   root: {
  //     label: '中文',
  //     lang: 'zh',
  //   },
  //   en: {
  //     label: 'English',
  //     lang: 'en',
  //     link: '/en/',
  //   },
  // },
  markdown: {
    codeTransformers: [
      transformerTwoslash({
        typesCache: createFileSystemTypesCache(),
      }),
      transformerMetaWordHighlight(),
      transformerNotationWordHighlight(),
      transformerColorizedBrackets(),
    ],
    theme: {
      light: 'vitesse-light',
      dark: 'vitesse-black',
    },
    toc: {
      level: [2, 3, 4],
    },
    anchor: {
      permalink: anchor.permalink.headerLink(),
    },
    math: true,
    config: (md) => {
      md
        .use(markdownItFootnote)
        .use(markdownItMark)
        .use(markdownItHashtag, {
          hashtagRegExp: '\\w+(\\/\\w+)*',
        })
        .use(markdownItFigures, {
          figcaption: true,
        })
        .use(markdownItRuby)
        // .use(markdownItAttrs)
        .use(markdownItMdc)

      md.renderer.rules.hashtag_text = function (tokens, idx) {
        return `${tokens[idx].content}`
      }

      md.renderer.rules.hashtag_open = function (tokens, idx) {
        const tagName = tokens[idx].content.toLowerCase()
        return `<a href="../../tags/${tagName}"><span class="tag">`
      }

      md.renderer.rules.hashtag_close = function () {
        return `</span></a>`
      }
    },
  },
})
