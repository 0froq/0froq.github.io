/** Production origin for canonical URLs, sitemap, and share cards. */
export const SITE_ORIGIN = 'https://froq.me'
export const SITE_NAME = 'froQ'
export const SITE_DESCRIPTION = 'Personal site of froQ. Code, design, and writing.'
export const OG_IMAGE_PATH = '/og.png'
export const OG_IMAGE_URL = `${SITE_ORIGIN}${OG_IMAGE_PATH}`
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
