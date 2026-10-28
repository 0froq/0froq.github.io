import { describe, expect, it } from 'vitest'
import {
  ACTIVITY_STALE_MS,
  NOW_THEMES,
  fetchNowActivity,
  handleNowSvg,
  nowIsSleeping,
  nowLine,
  nowSvgHeaders,
  nowThemeFromPath,
  parseNowActivity,
  renderNowSvg,
  xmlEscape,
} from '../workers/froq-api/src/nowSvg'

const FRESH = '2026-10-28T10:00:00.000Z'
const NOW = Date.parse(FRESH)

describe('nowThemeFromPath', () => {
  it('maps light and dark paths', () => {
    expect(nowThemeFromPath('/now.svg')).toBe('light')
    expect(nowThemeFromPath('/now-light.svg')).toBe('light')
    expect(nowThemeFromPath('/now-dark.svg')).toBe('dark')
    expect(nowThemeFromPath('/now.png')).toBeNull()
    expect(nowThemeFromPath('/stats')).toBeNull()
  })
})

describe('parseNowActivity', () => {
  it('reads process and media strings, ignoring null media', () => {
    expect(
      parseNowActivity({
        active: true,
        timestamp: FRESH,
        process: { name: 'Zed', windowTitle: 'osdash', iconUrl: '' },
        media: {
          coverImg: null,
          title: null,
          artist: null,
        },
      }),
    ).toEqual({
      active: true,
      timestamp: FRESH,
      processName: 'Zed',
    })
  })

  it('keeps media title without a cover image', () => {
    expect(
      parseNowActivity({
        active: true,
        timestamp: FRESH,
        process: { name: 'Vivaldi' },
        media: { title: 'Helplessness Blues', artist: 'Fleet Foxes' },
      }),
    ).toMatchObject({
      processName: 'Vivaldi',
      mediaTitle: 'Helplessness Blues',
      mediaArtist: 'Fleet Foxes',
    })
  })

  it('treats junk payloads as inactive', () => {
    expect(parseNowActivity(null)).toEqual({ active: false })
    expect(parseNowActivity('nope')).toEqual({ active: false })
  })
})

describe('nowIsSleeping', () => {
  it('sleeps when timestamp is missing, invalid, or stale', () => {
    expect(nowIsSleeping({ active: true }, NOW)).toBe(true)
    expect(nowIsSleeping({ active: true, timestamp: 'not-a-date' }, NOW)).toBe(true)
    expect(
      nowIsSleeping(
        { active: true, timestamp: new Date(NOW - ACTIVITY_STALE_MS - 1).toISOString() },
        NOW,
      ),
    ).toBe(true)
    expect(
      nowIsSleeping(
        { active: true, timestamp: new Date(NOW - ACTIVITY_STALE_MS + 1).toISOString() },
        NOW,
      ),
    ).toBe(false)
  })

  it('sleeps when active is false even with a fresh stamp', () => {
    expect(nowIsSleeping({ active: false, timestamp: FRESH }, NOW)).toBe(true)
  })
})

describe('nowLine', () => {
  it('active copy with optional media', () => {
    expect(nowLine({ active: true, timestamp: FRESH, processName: 'Zed' }, NOW)).toEqual({
      kind: 'active',
      app: 'Zed',
    })
    expect(
      nowLine(
        {
          active: true,
          timestamp: FRESH,
          processName: 'Vivaldi',
          mediaTitle: 'Helplessness Blues',
          mediaArtist: 'Fleet Foxes',
        },
        NOW,
      ),
    ).toEqual({
      kind: 'active',
      app: 'Vivaldi',
      media: 'Helplessness Blues – Fleet Foxes',
    })
  })

  it('sleeping copy uses the last app, or 眠了 when unknown', () => {
    expect(nowLine(null, NOW)).toEqual({ kind: 'sleeping' })
    expect(nowLine({ active: false, timestamp: FRESH, processName: 'Cursor' }, NOW)).toEqual({
      kind: 'sleeping',
      app: 'Cursor',
    })
  })
})

describe('renderNowSvg', () => {
  it('accents 正在 on the light theme', () => {
    const svg = renderNowSvg({ kind: 'active', app: 'Zed' }, NOW_THEMES.light)
    expect(svg).toContain('fill="#a83429">正在</tspan>')
    expect(svg).toContain('<tspan> Zed</tspan>')
    expect(svg).toContain('font-family="Georgia,')
    expect(svg).toContain('width="640"')
    expect(svg).toContain('height="28"')
  })

  it('sleeping line is italic muted, including 眠了', () => {
    const withApp = renderNowSvg({ kind: 'sleeping', app: 'Cursor' }, NOW_THEMES.dark)
    expect(withApp).toContain('font-style="italic"')
    expect(withApp).toContain('fill="#9c968c"')
    expect(withApp).toContain('在 Cursor 中眠了')
    expect(renderNowSvg({ kind: 'sleeping' }, NOW_THEMES.dark)).toContain('眠了')
  })

  it('escapes XML in labels', () => {
    const svg = renderNowSvg({ kind: 'active', app: 'A&B <script>' }, NOW_THEMES.light)
    expect(svg).toContain('A&amp;B &lt;script&gt;')
    expect(svg).not.toContain('<script>')
    expect(xmlEscape(`"'`)).toBe('&quot;&apos;')
  })
})

describe('handleNowSvg', () => {
  it('returns public cache headers and SVG for GET', async () => {
    const payload = {
      active: true,
      timestamp: new Date().toISOString(),
      process: { name: 'Zed' },
    }
    const res = await handleNowSvg(
      new Request('https://api.froq.me/now-light.svg'),
      'light',
      async () => new Response(JSON.stringify(payload), { status: 200 }),
    )
    expect(res.status).toBe(200)
    expect(res.headers.get('Content-Type')).toBe('image/svg+xml; charset=utf-8')
    expect(res.headers.get('Cache-Control')).toBe('public, max-age=60, s-maxage=60')
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('*')
    expect(res.headers.get('Cross-Origin-Resource-Policy')).toBe('cross-origin')
    const body = await res.text()
    expect(body).toContain('正在')
    expect(body).toContain('Zed')
  })

  it('fetch failure renders 眠了, never a live app', async () => {
    const res = await handleNowSvg(
      new Request('https://api.froq.me/now-dark.svg'),
      'dark',
      async () => new Response('nope', { status: 500 }),
    )
    const body = await res.text()
    expect(body).toContain('眠了')
    expect(body).not.toContain('正在')
  })

  it('HEAD is empty with the same cache headers', async () => {
    const res = await handleNowSvg(
      new Request('https://api.froq.me/now.svg', { method: 'HEAD' }),
      'light',
      async () => {
        throw new Error('should not fetch on HEAD')
      },
    )
    expect(res.status).toBe(200)
    expect(await res.text()).toBe('')
    expect(res.headers.get('Cache-Control')).toContain('max-age=60')
  })
})

describe('fetchNowActivity', () => {
  it('returns null when the upstream is down', async () => {
    expect(
      await fetchNowActivity(async () => {
        throw new Error('network')
      }),
    ).toBeNull()
  })
})

describe('nowSvgHeaders', () => {
  it('Expires matches the 60s TTL', () => {
    const headers = nowSvgHeaders(NOW)
    expect(headers.Expires).toBe(new Date(NOW + 60_000).toUTCString())
  })
})
