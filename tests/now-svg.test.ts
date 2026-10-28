import { describe, expect, it } from 'vitest'
import {
  ACTIVITY_STALE_MS,
  ACTIVITY_URL,
  ICON_MAX_BYTES,
  NOW_THEMES,
  fetchNowActivity,
  fetchNowIcon,
  fitNowRow,
  handleNowSvg,
  nowCopy,
  nowIsSleeping,
  nowLine,
  nowSvgHeaders,
  nowThemeFromPath,
  parseNowActivity,
  renderNowSvg,
  truncateNowText,
  xmlEscape,
} from '../workers/froq-api/src/nowSvg'

const FRESH = '2026-10-28T10:00:00.000Z'
const NOW = Date.parse(FRESH)
const PNG_1X1_B64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='
const PNG_1X1 = Uint8Array.from(atob(PNG_1X1_B64), c => c.charCodeAt(0))
const PNG_DATA_URI = `data:image/png;base64,${PNG_1X1_B64}`

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

  it('keeps process.iconUrl only when the process has a name', () => {
    expect(
      parseNowActivity({
        active: true,
        timestamp: FRESH,
        process: {
          name: 'Zed',
          iconUrl: 'https://example.com/zed.png',
        },
      }),
    ).toMatchObject({
      processName: 'Zed',
      iconUrl: 'https://example.com/zed.png',
    })
    expect(
      parseNowActivity({
        active: true,
        process: { iconUrl: 'https://example.com/orphan.png' },
      }),
    ).not.toHaveProperty('iconUrl')
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

  it('passes iconUrl through on both active and sleeping lines', () => {
    const iconUrl = 'https://example.com/zed.png'
    expect(
      nowLine({ active: true, timestamp: FRESH, processName: 'Zed', iconUrl }, NOW),
    ).toMatchObject({ kind: 'active', app: 'Zed', iconUrl })
    expect(nowLine({ active: false, processName: 'Zed', iconUrl }, NOW)).toMatchObject({
      kind: 'sleeping',
      app: 'Zed',
      iconUrl,
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

describe('nowCopy', () => {
  it('keeps the existing Chinese lines', () => {
    expect(nowCopy({ kind: 'active', app: 'Zed' })).toEqual({
      prefix: '正在 ',
      app: 'Zed',
      suffix: '',
    })
    expect(
      nowCopy({ kind: 'active', app: 'Vivaldi', media: 'Helplessness Blues – Fleet Foxes' }),
    ).toEqual({
      prefix: '正在 ',
      app: 'Vivaldi',
      suffix: ' · Helplessness Blues – Fleet Foxes',
    })
    expect(nowCopy({ kind: 'sleeping', app: 'Cursor' })).toEqual({
      prefix: '在 ',
      app: 'Cursor',
      suffix: ' 中眠了',
    })
    expect(nowCopy({ kind: 'sleeping' })).toEqual({
      prefix: '眠了',
      app: '',
      suffix: '',
    })
  })
})

describe('fitNowRow', () => {
  it('truncates media before the app name', () => {
    const media = ` · ${'Helplessness Blues – Fleet Foxes '.repeat(12)}`
    const fitted = fitNowRow(
      { prefix: '正在 ', app: 'Vivaldi', suffix: media },
      { hasIcon: true, sleeping: false },
    )
    expect(fitted.app).toBe('Vivaldi')
    expect(fitted.suffix).toContain('…')
    expect(fitted.suffix.length).toBeLessThan(media.length)
  })

  it('truncates a long app when that is the only overflow', () => {
    const app = 'W'.repeat(120)
    const fitted = fitNowRow(
      { prefix: '正在 ', app, suffix: '' },
      { hasIcon: false, sleeping: false },
    )
    expect(fitted.app).toContain('…')
    expect(fitted.app.length).toBeLessThan(app.length)
  })
})

describe('truncateNowText', () => {
  it('returns the original string when it already fits', () => {
    expect(truncateNowText('Zed', 400)).toBe('Zed')
  })
})

describe('renderNowSvg', () => {
  it('draws a SiteDoing-like working row: ink dot, mono, muted 正在', () => {
    const svg = renderNowSvg({ kind: 'active', app: 'Zed' }, NOW_THEMES.light)
    expect(svg).toContain('fill="#1d1d1a"')
    expect(svg).toContain('fill="#5c5a54"')
    expect(svg).toContain('正在 ')
    expect(svg).toContain('Zed')
    expect(svg).toContain('ui-monospace')
    expect(svg).not.toContain('Georgia')
    expect(svg).not.toContain('serif')
    expect(svg).toContain('width="640"')
    expect(svg).toContain('height="24"')
    expect(svg).toMatch(/<circle[^>]*fill="#1d1d1a"/)
    expect(svg).not.toContain('font-style="italic"')
  })

  it('sleeping line is hollow muted dot + 眠了, not italic serif', () => {
    const withApp = renderNowSvg({ kind: 'sleeping', app: 'Cursor' }, NOW_THEMES.dark)
    expect(withApp).not.toContain('font-style="italic"')
    expect(withApp).toContain('fill="none"')
    expect(withApp).toContain('stroke="#9c968c"')
    expect(withApp).toContain('在 ')
    expect(withApp).toContain('Cursor')
    expect(withApp).toContain(' 中眠了')
    expect(withApp).toContain('id="now-sleep"')
    expect(withApp).toContain('ui-monospace')
    expect(renderNowSvg({ kind: 'sleeping' }, NOW_THEMES.dark)).toContain('眠了')
  })

  it('embeds a PNG data URI beside the app and rejects remote hrefs', () => {
    const withIcon = renderNowSvg({ kind: 'active', app: 'Zed' }, NOW_THEMES.light, PNG_DATA_URI)
    expect(withIcon).toContain(`href="${PNG_DATA_URI}"`)
    expect(withIcon).toContain('width="16"')
    expect(withIcon).toContain('height="16"')
    const remote = renderNowSvg(
      { kind: 'active', app: 'Zed' },
      NOW_THEMES.light,
      'https://evil.example/zed.png',
    )
    expect(remote).not.toContain('evil.example')
    expect(remote).not.toContain('<image')
  })

  it('ellipsizes long media so the row stays inside 640px', () => {
    const media = 'Helplessness Blues – Fleet Foxes '.repeat(20)
    const svg = renderNowSvg({ kind: 'active', app: 'Vivaldi', media }, NOW_THEMES.light)
    expect(svg).toContain('…')
    expect(svg).not.toContain(media)
    expect(svg).toContain('Vivaldi')
    expect(svg).toContain('width="640"')
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
    expect(body).toContain('ui-monospace')
  })

  it('inlines a fetched PNG icon as a data URI', async () => {
    const iconUrl = 'https://icons.example/zed.png'
    const payload = {
      active: true,
      timestamp: new Date().toISOString(),
      process: { name: 'Zed', iconUrl },
    }
    const res = await handleNowSvg(
      new Request('https://api.froq.me/now-light.svg'),
      'light',
      async input => {
        if (input === ACTIVITY_URL) {
          return new Response(JSON.stringify(payload), { status: 200 })
        }
        if (input === iconUrl) {
          return new Response(PNG_1X1, { headers: { 'Content-Type': 'image/png' }, status: 200 })
        }
        throw new Error(`unexpected fetch ${input}`)
      },
    )
    const body = await res.text()
    expect(body).toContain(`href="${PNG_DATA_URI}"`)
    expect(body).not.toContain(iconUrl)
  })

  it('stays text-only when the icon fetch fails', async () => {
    const iconUrl = 'https://icons.example/zed.png'
    const payload = {
      active: true,
      timestamp: new Date().toISOString(),
      process: { name: 'Zed', iconUrl },
    }
    const res = await handleNowSvg(
      new Request('https://api.froq.me/now-light.svg'),
      'light',
      async input => {
        if (input === ACTIVITY_URL) {
          return new Response(JSON.stringify(payload), { status: 200 })
        }
        return new Response('nope', { status: 500 })
      },
    )
    const body = await res.text()
    expect(body).toContain('Zed')
    expect(body).toContain('正在')
    expect(body).not.toContain('<image')
    expect(body).not.toContain(iconUrl)
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

describe('fetchNowIcon', () => {
  it('returns a png data URI for a PNG body', async () => {
    await expect(
      fetchNowIcon('https://icons.example/a.png', async () => {
        return new Response(PNG_1X1, { headers: { 'Content-Type': 'image/png' }, status: 200 })
      }),
    ).resolves.toBe(PNG_DATA_URI)
  })

  it('rejects svg, oversize, and non-http URLs', async () => {
    await expect(
      fetchNowIcon('https://icons.example/a.svg', async () => {
        return new Response('<svg xmlns="http://www.w3.org/2000/svg"></svg>', {
          headers: { 'Content-Type': 'image/svg+xml' },
          status: 200,
        })
      }),
    ).resolves.toBeUndefined()

    const huge = new Uint8Array(ICON_MAX_BYTES + 1)
    huge[0] = 0x89
    huge[1] = 0x50
    huge[2] = 0x4e
    huge[3] = 0x47
    await expect(
      fetchNowIcon('https://icons.example/huge.png', async () => {
        return new Response(huge, { headers: { 'Content-Type': 'image/png' }, status: 200 })
      }),
    ).resolves.toBeUndefined()

    await expect(fetchNowIcon('data:image/png;base64,aaaa')).resolves.toBeUndefined()
    await expect(fetchNowIcon('/relative.png')).resolves.toBeUndefined()
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
