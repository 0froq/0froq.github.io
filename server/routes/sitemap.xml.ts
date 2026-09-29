import { fileURLToPath } from 'node:url'
import { sitemapPaths } from '../utils/siteRoutes'

const docsRoot = fileURLToPath(new URL('../../docs', import.meta.url))
const ORIGIN = 'https://froq.me'

export default defineEventHandler((event) => {
  const urls = sitemapPaths(docsRoot).map((path) => {
    const loc = path === '/' ? `${ORIGIN}/` : `${ORIGIN}${path}`
    return `  <url><loc>${loc}</loc></url>`
  })
  setHeader(event, 'content-type', 'application/xml; charset=utf-8')
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls,
    '</urlset>',
    '',
  ].join('\n')
})
