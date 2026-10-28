/** Live 「正在…」 SVG for the GitHub profile README (Camo-friendly, unauthenticated).
 *
 * Visual source of truth: `app/components/SiteDoing.vue` — mono type, 8px status
 * dot, xs muted copy, 16px app icon. GitHub Camo cannot reshuffle phrases or
 * load arbitrary `<image href>` hosts, so the Worker inlines `iconUrl` as a
 * PNG data URI (text-only if that fetch fails).
 */

export const ACTIVITY_URL = 'https://pub-d05ff6ec0ecf448ca7cc6c2f0c0a5bcc.r2.dev/activity.json'

/** Same 5-minute stale window as froq.me `activityIsSleeping`. */
export const ACTIVITY_STALE_MS = 5 * 60 * 1000

export const ICON_MAX_BYTES = 64 * 1024

const SVG_WIDTH = 640
const SVG_HEIGHT = 24
const FONT_SIZE = 12
const DOT_SIZE = 8
const ICON_SIZE = 16
const SLEEP_SIZE = 12
const PAD_LEFT = 0
const PAD_RIGHT = 8
const GAP_DOT = 8
const GAP_INNER = 4
const ASCII_EM = 0.7
const WIDE_EM = 1.05
const FETCH_TIMEOUT_MS = 2500
const ICON_TIMEOUT_MS = 2000
const CACHE_TTL_S = 60

/** Site `--font-mono` fallback. LXGW is not available inside GitHub Camo. */
const MONO = "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace"

export type NowThemeName = 'light' | 'dark'

export interface NowTheme {
  ink: string
  accent: string
  muted: string
}

/** Same hex as `app/assets/css/tokens.css` (`--ink` / `--colored-ink` / `--muted`). */
export const NOW_THEMES: Record<NowThemeName, NowTheme> = {
  light: { ink: '#1d1d1a', accent: '#a83429', muted: '#5c5a54' },
  dark: { ink: '#ece7dc', accent: '#7ea3d9', muted: '#9c968c' },
}

export interface NowActivity {
  active: boolean
  timestamp?: string
  processName?: string
  iconUrl?: string
  mediaTitle?: string
  mediaArtist?: string
}

export type NowLine =
  | { kind: 'active'; app?: string; media?: string; iconUrl?: string }
  | { kind: 'sleeping'; app?: string; iconUrl?: string }

export interface NowCopy {
  prefix: string
  app: string
  suffix: string
}

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
  const iconUrl = process ? asString(process.iconUrl) : undefined
  const mediaTitle = media ? asString(media.title) : undefined
  const mediaArtist = media ? asString(media.artist) : undefined
  if (timestamp) activity.timestamp = timestamp
  if (processName) activity.processName = processName
  if (processName && iconUrl) activity.iconUrl = iconUrl
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
    return { kind: 'sleeping', app: activity?.processName, iconUrl: activity?.iconUrl }
  }
  let media: string | undefined
  if (activity.mediaTitle) {
    media = activity.mediaArtist
      ? `${activity.mediaTitle} – ${activity.mediaArtist}`
      : activity.mediaTitle
  }
  return { kind: 'active', app: activity.processName, media, iconUrl: activity.iconUrl }
}

export function xmlEscape(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
}

export function nowCopy(line: NowLine): NowCopy {
  switch (line.kind) {
    case 'active':
      return {
        prefix: line.app ? '正在 ' : '正在',
        app: line.app ?? '',
        suffix: line.media ? ` · ${line.media}` : '',
      }
    case 'sleeping':
      return line.app
        ? { prefix: '在 ', app: line.app, suffix: ' 中眠了' }
        : { prefix: '眠了', app: '', suffix: '' }
    default: {
      const _exhaustive: never = line
      return _exhaustive
    }
  }
}

function labelFor(line: NowLine): string {
  const copy = nowCopy(line)
  return `${copy.prefix}${copy.app}${copy.suffix}`
}

function isWideChar(ch: string): boolean {
  const cp = ch.codePointAt(0) ?? 0
  if (cp <= 0xff) return false
  return (
    (cp >= 0x1100 && cp <= 0x11ff) ||
    (cp >= 0x2e80 && cp <= 0xa4cf) ||
    (cp >= 0xac00 && cp <= 0xd7af) ||
    (cp >= 0xf900 && cp <= 0xfaff) ||
    (cp >= 0xfe10 && cp <= 0xfe19) ||
    (cp >= 0xfe30 && cp <= 0xfe6f) ||
    (cp >= 0xff00 && cp <= 0xff60) ||
    (cp >= 0xffe0 && cp <= 0xffe6) ||
    cp >= 0x1f000
  )
}

function charWidth(ch: string): number {
  return (isWideChar(ch) ? WIDE_EM : ASCII_EM) * FONT_SIZE
}

export function measureNowText(text: string): number {
  let width = 0
  for (const ch of text) width += charWidth(ch)
  return width
}

export function truncateNowText(text: string, maxWidth: number): string {
  if (maxWidth <= 0) return ''
  if (measureNowText(text) <= maxWidth) return text
  const ellipsis = '…'
  const ellipsisW = measureNowText(ellipsis)
  if (maxWidth < ellipsisW) return ''
  let out = ''
  let width = 0
  for (const ch of text) {
    const next = charWidth(ch)
    if (width + next + ellipsisW > maxWidth) break
    out += ch
    width += next
  }
  return out ? `${out}${ellipsis}` : ellipsis
}

function rowExtras(hasIcon: boolean, sleeping: boolean): number {
  const iconW = hasIcon ? GAP_INNER + ICON_SIZE : 0
  const sleepW = sleeping ? GAP_INNER + SLEEP_SIZE : 0
  return PAD_LEFT + DOT_SIZE + GAP_DOT + iconW + sleepW + PAD_RIGHT
}

export function fitNowRow(copy: NowCopy, opts: { hasIcon: boolean; sleeping: boolean }): NowCopy {
  const extras = rowExtras(opts.hasIcon, opts.sleeping)
  let app = copy.app
  let suffix = copy.suffix

  const total = (shownApp: string, shownSuffix: string) =>
    extras + measureNowText(copy.prefix) + measureNowText(shownApp) + measureNowText(shownSuffix)

  if (total(app, suffix) <= SVG_WIDTH) return { prefix: copy.prefix, app, suffix }

  if (suffix.startsWith(' · ')) {
    const budget = measureNowText(suffix) - (total(app, suffix) - SVG_WIDTH)
    suffix = budget < measureNowText(' · …') ? '' : truncateNowText(suffix, budget)
  }

  if (total(app, suffix) <= SVG_WIDTH) return { prefix: copy.prefix, app, suffix }

  const appBudget = Math.max(0, measureNowText(app) - (total(app, suffix) - SVG_WIDTH))
  app = truncateNowText(app, appBudget)
  return { prefix: copy.prefix, app, suffix }
}

function safeIconHref(value: string | undefined): string | undefined {
  if (!value || !value.startsWith('data:image/') || value.startsWith('data:image/svg')) {
    return undefined
  }
  return value
}

function px(n: number): string {
  return (Math.round(n * 10) / 10).toString()
}

function textEl(x: number, y: number, value: string, family: string, fill: string): string {
  return `<text x="${px(x)}" y="${px(y)}" dominant-baseline="central" font-family="${family}" font-size="${FONT_SIZE}" fill="${fill}" xml:space="preserve">${xmlEscape(value)}</text>`
}

function sleepMoon(x: number, cy: number, fill: string): string {
  const y = cy - SLEEP_SIZE / 2
  return `<path id="now-sleep" fill="${fill}" transform="translate(${px(x)} ${px(y)}) scale(${SLEEP_SIZE / 24})" d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>`
}

export function renderNowSvg(line: NowLine, theme: NowTheme, iconDataUri?: string): string {
  const label = xmlEscape(labelFor(line))
  const family = xmlEscape(MONO)
  const copy = nowCopy(line)
  const iconHref = copy.app ? safeIconHref(iconDataUri) : undefined
  const fitted = fitNowRow(copy, { hasIcon: Boolean(iconHref), sleeping: line.kind === 'sleeping' })
  const cy = SVG_HEIGHT / 2

  let x = PAD_LEFT
  const dotCx = x + DOT_SIZE / 2
  const dot =
    line.kind === 'sleeping'
      ? `<circle cx="${px(dotCx)}" cy="${px(cy)}" r="${(DOT_SIZE - 1) / 2}" fill="none" stroke="${theme.muted}" stroke-width="1"/>`
      : `<circle cx="${px(dotCx)}" cy="${px(cy)}" r="${DOT_SIZE / 2}" fill="${theme.ink}"/>`
  x += DOT_SIZE + GAP_DOT

  const parts: string[] = [dot]
  if (fitted.prefix) {
    parts.push(textEl(x, cy, fitted.prefix, family, theme.muted))
    x += measureNowText(fitted.prefix)
  }
  if (fitted.app) {
    parts.push(textEl(x, cy, fitted.app, family, theme.muted))
    x += measureNowText(fitted.app)
  }
  if (iconHref) {
    x += GAP_INNER
    const iconY = cy - ICON_SIZE / 2
    parts.push(
      `<image href="${xmlEscape(iconHref)}" x="${px(x)}" y="${px(iconY)}" width="${ICON_SIZE}" height="${ICON_SIZE}" preserveAspectRatio="xMidYMid meet"/>`,
    )
    x += ICON_SIZE
  }
  if (fitted.suffix) {
    parts.push(textEl(x, cy, fitted.suffix, family, theme.muted))
    x += measureNowText(fitted.suffix)
  }
  if (line.kind === 'sleeping') {
    x += GAP_INNER
    parts.push(sleepMoon(x, cy, theme.muted))
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${SVG_WIDTH}" height="${SVG_HEIGHT}" viewBox="0 0 ${SVG_WIDTH} ${SVG_HEIGHT}" overflow="hidden" role="img" aria-label="${label}">
  <title>${label}</title>
  ${parts.join('\n  ')}
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

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' || url.protocol === 'http:'
  } catch {
    return false
  }
}

function iconMime(contentType: string | null, bytes: Uint8Array): string | undefined {
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  ) {
    return 'image/png'
  }
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return 'image/jpeg'
  }
  if (bytes.length >= 6 && bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) {
    return 'image/gif'
  }
  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return 'image/webp'
  }
  if (bytes.length >= 4 && bytes[0] === 0 && bytes[1] === 0 && bytes[2] === 1 && bytes[3] === 0) {
    return 'image/x-icon'
  }
  const mime = (contentType ?? '').split(';')[0]?.trim().toLowerCase()
  switch (mime) {
    case 'image/png':
    case 'image/jpeg':
    case 'image/webp':
    case 'image/gif':
    case 'image/x-icon':
      return mime
    case 'image/vnd.microsoft.icon':
      return 'image/x-icon'
    default:
      return undefined
  }
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary)
}

/** Fetch `process.iconUrl` and return a raster `data:` URI. Fail soft. */
export async function fetchNowIcon(
  url: string,
  fetcher: FetchLike = fetch,
): Promise<string | undefined> {
  if (!isHttpUrl(url)) return undefined
  try {
    const res = await fetcher(url, {
      headers: {
        'Accept': 'image/png,image/*;q=0.8',
        'User-Agent': 'froq-api-now',
      },
      signal: AbortSignal.timeout(ICON_TIMEOUT_MS),
    })
    if (!res.ok) return undefined
    const declared = Number(res.headers.get('content-length') || '0')
    if (declared > ICON_MAX_BYTES) return undefined
    const buf = await res.arrayBuffer()
    if (buf.byteLength === 0 || buf.byteLength > ICON_MAX_BYTES) return undefined
    const bytes = new Uint8Array(buf)
    const mime = iconMime(res.headers.get('content-type'), bytes)
    if (!mime) return undefined
    return `data:${mime};base64,${bytesToBase64(bytes)}`
  } catch {
    return undefined
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
  const line = nowLine(activity)
  const iconDataUri = line.iconUrl ? await fetchNowIcon(line.iconUrl, fetcher) : undefined
  const svg = renderNowSvg(line, NOW_THEMES[theme], iconDataUri)
  return new Response(svg, { status: 200, headers })
}
