/** Live 「正在…」 SVG for the GitHub profile README (Camo-friendly, unauthenticated). */

export const ACTIVITY_URL = 'https://pub-d05ff6ec0ecf448ca7cc6c2f0c0a5bcc.r2.dev/activity.json'

/** Same 5-minute stale window as froq.me `activityIsSleeping`. */
export const ACTIVITY_STALE_MS = 5 * 60 * 1000

const SVG_WIDTH = 640
const SVG_HEIGHT = 28
const FETCH_TIMEOUT_MS = 2500
const CACHE_TTL_S = 60

/** Match profile `scripts/stats.mjs` / now.mjs. */
const SERIF = "Georgia, 'Iowan Old Style', Palatino, 'Palatino Linotype', 'Times New Roman', serif"

export type NowThemeName = 'light' | 'dark'

export interface NowTheme {
  ink: string
  accent: string
  muted: string
}

export const NOW_THEMES: Record<NowThemeName, NowTheme> = {
  light: { ink: '#1d1d1a', accent: '#a83429', muted: '#5c5a54' },
  dark: { ink: '#ece7dc', accent: '#7ea3d9', muted: '#9c968c' },
}

export interface NowActivity {
  active: boolean
  timestamp?: string
  processName?: string
  mediaTitle?: string
  mediaArtist?: string
}

export type NowLine =
  | { kind: 'active'; app?: string; media?: string }
  | { kind: 'sleeping'; app?: string }

export function nowThemeFromPath(pathname: string): NowThemeName | null {
  switch (pathname) {
    case '/now.svg':
    case '/now-light.svg':
      return 'light'
    case '/now-dark.svg':
      return 'dark'
    default:
      return null
  }
}

function asString(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed ? trimmed : undefined
}

export type FetchLike = (input: string, init?: RequestInit) => Promise<Response>

export function parseNowActivity(raw: unknown): NowActivity {
  if (!raw || typeof raw !== 'object') return { active: false }
  const row = raw as Record<string, unknown>
  const process =
    row.process && typeof row.process === 'object' ? (row.process as Record<string, unknown>) : null
  const media =
    row.media && typeof row.media === 'object' ? (row.media as Record<string, unknown>) : null
  const activity: NowActivity = { active: row.active === true }
  const timestamp = asString(row.timestamp)
  const processName = process ? asString(process.name) : undefined
  const mediaTitle = media ? asString(media.title) : undefined
  const mediaArtist = media ? asString(media.artist) : undefined
  if (timestamp) activity.timestamp = timestamp
  if (processName) activity.processName = processName
  if (mediaTitle) activity.mediaTitle = mediaTitle
  if (mediaArtist) activity.mediaArtist = mediaArtist
  return activity
}

/**
 * Sleeping when the stamp is missing/invalid/older than 5 minutes (regardless
 * of `active`), or when `active` is not true. Callers treat fetch failure as
 * sleeping with no app — never a fake live process.
 */
export function nowIsSleeping(activity: NowActivity, now = Date.now()): boolean {
  if (activity.active !== true) return true
  if (!activity.timestamp) return true
  const stamp = new Date(activity.timestamp).getTime()
  if (Number.isNaN(stamp)) return true
  return now - stamp > ACTIVITY_STALE_MS
}

export function nowLine(activity: NowActivity | null, now = Date.now()): NowLine {
  if (!activity || nowIsSleeping(activity, now)) {
    return { kind: 'sleeping', app: activity?.processName }
  }
  let media: string | undefined
  if (activity.mediaTitle) {
    media = activity.mediaArtist
      ? `${activity.mediaTitle} – ${activity.mediaArtist}`
      : activity.mediaTitle
  }
  return { kind: 'active', app: activity.processName, media }
}

export function xmlEscape(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
}

function labelFor(line: NowLine): string {
  switch (line.kind) {
    case 'active': {
      const app = line.app ? ` ${line.app}` : ''
      const media = line.media ? ` · ${line.media}` : ''
      return `正在${app}${media}`
    }
    case 'sleeping':
      return line.app ? `在 ${line.app} 中眠了` : '眠了'
    default: {
      const _exhaustive: never = line
      return _exhaustive
    }
  }
}

export function renderNowSvg(line: NowLine, theme: NowTheme): string {
  const label = xmlEscape(labelFor(line))
  const family = xmlEscape(SERIF)

  let body: string
  switch (line.kind) {
    case 'active': {
      const app = line.app ? `<tspan> ${xmlEscape(line.app)}</tspan>` : ''
      const media = line.media
        ? `<tspan fill="${theme.muted}"> · ${xmlEscape(line.media)}</tspan>`
        : ''
      body = `<text x="0" y="18" font-family="${family}" font-size="13" fill="${theme.ink}"><tspan fill="${theme.accent}">正在</tspan>${app}${media}</text>`
      break
    }
    case 'sleeping': {
      body = `<text x="0" y="18" font-family="${family}" font-size="13" font-style="italic" fill="${theme.muted}">${label}</text>`
      break
    }
    default: {
      const _exhaustive: never = line
      return _exhaustive
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${SVG_WIDTH}" height="${SVG_HEIGHT}" viewBox="0 0 ${SVG_WIDTH} ${SVG_HEIGHT}" overflow="hidden" role="img" aria-label="${label}">
  <title>${label}</title>
  ${body}
</svg>
`
}

export function nowSvgHeaders(now = Date.now()): Record<string, string> {
  const expires = new Date(now + CACHE_TTL_S * 1000).toUTCString()
  return {
    'Content-Type': 'image/svg+xml; charset=utf-8',
    'Cache-Control': `public, max-age=${CACHE_TTL_S}, s-maxage=${CACHE_TTL_S}`,
    'Expires': expires,
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
    'Cross-Origin-Resource-Policy': 'cross-origin',
    'X-Content-Type-Options': 'nosniff',
  }
}

export function nowSvgOptions(): Response {
  return new Response(null, {
    status: 204,
    headers: {
      ...nowSvgHeaders(),
      'Access-Control-Max-Age': '86400',
    },
  })
}

export async function fetchNowActivity(fetcher: FetchLike = fetch): Promise<NowActivity | null> {
  try {
    const res = await fetcher(ACTIVITY_URL, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'froq-api-now',
      },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    })
    if (!res.ok) return null
    return parseNowActivity(await res.json())
  } catch {
    return null
  }
}

export async function handleNowSvg(
  request: Request,
  theme: NowThemeName,
  fetcher: FetchLike = fetch,
): Promise<Response> {
  const headers = nowSvgHeaders()
  if (request.method === 'HEAD') {
    return new Response(null, { status: 200, headers })
  }

  const activity = await fetchNowActivity(fetcher)
  const svg = renderNowSvg(nowLine(activity), NOW_THEMES[theme])
  return new Response(svg, { status: 200, headers })
}
