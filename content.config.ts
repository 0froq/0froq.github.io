import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineCollection, defineContentConfig, z } from '@nuxt/content'

const root = dirname(fileURLToPath(import.meta.url))
const docs = resolve(root, 'docs')

const pageMeta = z.object({
  title: z.string().optional(),
  created: z.string().optional(),
  status: z.string().optional(),
  last_modified: z.string().optional(),
  locale: z.string().optional(),
  index: z.boolean().optional(),
  aigc: z.boolean().optional(),
  description: z.string().optional(),
})

export default defineContentConfig({
  collections: {
    home: defineCollection({
      type: 'page',
      source: {
        cwd: docs,
        include: 'index.md',
      },
      schema: pageMeta,
    }),
    posts: defineCollection({
      type: 'page',
      source: {
        cwd: resolve(docs, 'posts'),
        include: '**/*.md',
        exclude: [
          '_template/**',
          '_config/**',
          '.obsidian/**',
        ],
        prefix: '/posts',
      },
      schema: pageMeta,
    }),
    corpus: defineCollection({
      type: 'page',
      source: {
        cwd: resolve(docs, 'corpus'),
        include: '**/*.md',
        exclude: [
          '_template/**',
          '_lib/**',
          '_scripts/**',
        ],
        prefix: '/corpus',
      },
      schema: pageMeta,
    }),
  },
})
