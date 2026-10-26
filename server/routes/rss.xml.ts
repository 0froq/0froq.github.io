import { fileURLToPath } from 'node:url'
import { buildRss } from '../utils/rssFeed'

const docsRoot = fileURLToPath(new URL('../../docs', import.meta.url))

export default defineEventHandler(event => {
  setHeader(event, 'content-type', 'application/rss+xml; charset=utf-8')
  return buildRss(docsRoot)
})
