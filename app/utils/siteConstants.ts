/** Production origin for canonical URLs, sitemap, and RSS. */
export const SITE_ORIGIN = 'https://froq.me'

/**
 * Share-image origin. X refuses to fetch froq.me, so `og:image` and
 * `twitter:image` use the Worker URL.
 */
export const IMAGE_ORIGIN = 'https://froq.sayhola.workers.dev'

export const SITE_NAME = 'froQ'
export const SITE_DESCRIPTION = 'Personal site of froQ. Code, design, and writing.'
export const OG_IMAGE_PATH = '/og.png'
export const OG_IMAGE_WIDTH = 1200
export const OG_IMAGE_HEIGHT = 630

/** Absolute https URL for a share image. Already-absolute https URLs pass through. */
export function absoluteImageUrl(src: string): string {
  if (/^https:\/\//i.test(src)) return src
  const path = src.startsWith('/') ? src : `/${src}`
  return `${IMAGE_ORIGIN}${path}`
}

export const OG_IMAGE_URL = absoluteImageUrl(OG_IMAGE_PATH)
export const TWITTER_HANDLE = '@0froQ'

const TRAILING_SLASHES = /\/+$/

export function canonicalUrl(path: string) {
  const clean = path.replace(TRAILING_SLASHES, '')
  return clean ? `${SITE_ORIGIN}${clean}` : `${SITE_ORIGIN}/`
}

/** Fallback if site-meta is unavailable. */
export const SITE_LAUNCH_AT = '2024-01-01T00:00:00.000Z'

export const HEARTBEAT_MS = 25_000
export const VISIT_THRESHOLD = 0.3

export const ANON_ID_KEYS = ['froq-anon-id', 'froq_anon_id'] as const

export const CHROME_MAX = '72rem'
