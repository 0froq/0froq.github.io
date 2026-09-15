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
  kind: z.string().optional(),
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
    publication: defineCollection({
      type: 'page',
      source: {
        cwd: docs,
        include: '**/*.md',
        exclude: [
          'archive/**',
          'dashboard/**',
          'design/**',
          'cairn-activity/**',
          'public/**',
          'index.md',
        ],
        prefix: '/',
      },
      schema: pageMeta,
    }),
  },
})
