import type { Env, ProgressRecord } from './types'
import { handleAuthProxy, isAuthProxyPath } from './authProxy'
import { corsHeaders, emptyCors, isAllowedOrigin, jsonResponse } from './cors'
import { PagePresence } from './PagePresence'
import { SiteStats } from './SiteStats'
import {

  progressKey,

  resolveGitHubLogin,
  visitorKey,
} from './types'

export { PagePresence, SiteStats }

interface PingBody {
  pagePath?: string
  anonId?: string
  ghLogin?: string
  countVisit?: boolean
}

interface ProgressBody {
  pagePath?: string
  maxProgress?: number
  read?: boolean
}

function siteStub(env: Env) {
  return env.SITE_STATS.get(env.SITE_STATS.idFromName('site'))
}

function pageStub(env: Env, pagePath: string) {
  return env.PAGE_PRESENCE.get(env.PAGE_PRESENCE.idFromName(pagePath))
}

function bearerToken(request: Request): string | null {
  const h = request.headers.get('Authorization')
  if (!h)
    return null
  const m = /^Bearer\s+(.+)$/i.exec(h.trim())
  return m?.[1]?.trim() || null
}

async function handleSessionPing(
  request: Request,
  env: Env,
  origin: string | null,
): Promise<Response> {
  let body: PingBody
  try {
    body = await request.json() as PingBody
  }
  catch {
    return jsonResponse({ error: 'invalid_json' }, origin, { status: 400 })
  }

  const pagePath = typeof body.pagePath === 'string' ? body.pagePath.trim() : ''
  const anonId = typeof body.anonId === 'string' ? body.anonId.trim() : ''
  if (!pagePath || !anonId) {
    return jsonResponse(
      { error: 'pagePath_and_anonId_required' },
      origin,
      { status: 400 },
    )
  }

  const ghLogin = typeof body.ghLogin === 'string' ? body.ghLogin.trim() : ''
  // Opt-in only: visits count when reading progress crosses the client threshold.
  const countVisit = body.countVisit === true
  const key = visitorKey(anonId, ghLogin || null)

  const [viewing, siteOnline, stats] = await Promise.all([
    pageStub(env, pagePath).heartbeat(key),
    siteStub(env).heartbeat(key, pagePath),
    siteStub(env).visit(anonId, pagePath, countVisit),
  ])

  return jsonResponse({
    viewing,
    online: siteOnline.online,
    pages: siteOnline.pages,
    uniqueVisitors: stats.uniqueVisitors,
    totalVisits: stats.totalVisits,
    pageVisits: stats.pageVisits,
  }, origin)
}

async function handleSessionLeave(
  request: Request,
  env: Env,
  origin: string | null,
): Promise<Response> {
  let body: PingBody
  try {
    body = await request.json() as PingBody
  }
  catch {
    return jsonResponse({ error: 'invalid_json' }, origin, { status: 400 })
  }

  const pagePath = typeof body.pagePath === 'string' ? body.pagePath.trim() : ''
  const anonId = typeof body.anonId === 'string' ? body.anonId.trim() : ''
  if (!pagePath || !anonId) {
    return jsonResponse(
      { error: 'pagePath_and_anonId_required' },
      origin,
      { status: 400 },
    )
  }

  const ghLogin = typeof body.ghLogin === 'string' ? body.ghLogin.trim() : ''
  const key = visitorKey(anonId, ghLogin || null)
  const [viewing, siteOnline] = await Promise.all([
    pageStub(env, pagePath).leave(key),
    siteStub(env).leaveOnline(key),
  ])
  return jsonResponse({
    viewing,
    online: siteOnline.online,
    pages: siteOnline.pages,
  }, origin)
}

/** Proxy WebSocket upgrade to the per-page PagePresence DO. */
async function handleSessionWs(
  request: Request,
  env: Env,
  origin: string | null,
): Promise<Response> {
  if (request.headers.get('Upgrade') !== 'websocket') {
    return jsonResponse({ error: 'expected_websocket' }, origin, { status: 426 })
  }

  // Browser WS handshake sends Origin; reject unknown sites.
  if (origin && !isAllowedOrigin(origin)) {
    return jsonResponse({ error: 'origin_not_allowed' }, origin, { status: 403 })
  }

  const url = new URL(request.url)
  const pagePath = normalizePresencePath(url.searchParams.get('pagePath') || '')
  const anonId = url.searchParams.get('anonId')?.trim() || ''
  const tabId = url.searchParams.get('tabId')?.trim() || ''
  if (!pagePath || !anonId || !tabId) {
    return jsonResponse(
      { error: 'pagePath_anonId_tabId_required' },
      origin,
      { status: 400 },
    )
  }

  // Forward normalized pagePath to the DO.
  url.searchParams.set('pagePath', pagePath)
  return pageStub(env, pagePath).fetch(new Request(url.toString(), request))
}

function normalizePresencePath(raw: string): string {
  let p = raw.trim().split('?')[0]?.split('#')[0] || ''
  if (!p)
    return ''
  if (!p.startsWith('/'))
    p = `/${p}`
  if (p.length > 1 && p.endsWith('/'))
    p = p.slice(0, -1)
  return p
}

async function handleStatsGet(
  request: Request,
  env: Env,
  origin: string | null,
): Promise<Response> {
  const url = new URL(request.url)
  const pagePath = url.searchParams.get('page')?.trim() || ''
  const stats = await siteStub(env).get()

  if (!pagePath) {
    return jsonResponse(stats, origin)
  }

  const viewing = await pageStub(env, pagePath).viewing()
  return jsonResponse({ ...stats, viewing }, origin)
}

async function handleSiteLike(
  request: Request,
  env: Env,
  origin: string | null,
): Promise<Response> {
  let body: { anonId?: string, pagePath?: string }
  try {
    body = await request.json() as { anonId?: string, pagePath?: string }
  }
  catch {
    return jsonResponse({ error: 'invalid_json' }, origin, { status: 400 })
  }

  const anonId = typeof body.anonId === 'string' ? body.anonId.trim() : ''
  if (!anonId) {
    return jsonResponse({ error: 'anonId_required' }, origin, { status: 400 })
  }
  const pagePath = typeof body.pagePath === 'string' ? body.pagePath.trim() : ''

  try {
    const result = await siteStub(env).like(anonId, pagePath || undefined)
    return jsonResponse(result, origin, {
      status: result.ok ? 200 : 429,
    })
  }
  catch (e) {
    console.error('[froq-api] like failed:', e)
    return jsonResponse({ error: 'like_failed' }, origin, { status: 500 })
  }
}

async function handleScrapReactionsGet(
  request: Request,
  env: Env,
  origin: string | null,
): Promise<Response> {
  const url = new URL(request.url)
  const ids = (url.searchParams.get('ids') || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
    .slice(0, 80)
  const anonId = url.searchParams.get('anonId')?.trim() || undefined
  if (!ids.length) {
    return jsonResponse({ scraps: {} }, origin)
  }
  try {
    const scraps = await siteStub(env).scrapReactions(ids, anonId)
    return jsonResponse({ scraps }, origin)
  }
  catch (e) {
    console.error('[froq-api] scrap reactions get failed:', e)
    return jsonResponse({ error: 'scrap_reactions_failed' }, origin, { status: 500 })
  }
}

async function handleScrapReact(
  request: Request,
  env: Env,
  origin: string | null,
): Promise<Response> {
  let body: { scrapId?: string, emoji?: string, anonId?: string }
  try {
    body = await request.json() as { scrapId?: string, emoji?: string, anonId?: string }
  }
  catch {
    return jsonResponse({ error: 'invalid_json' }, origin, { status: 400 })
  }

  const scrapId = typeof body.scrapId === 'string' ? body.scrapId.trim() : ''
  const emoji = typeof body.emoji === 'string' ? body.emoji.trim() : ''
  const anonId = typeof body.anonId === 'string' ? body.anonId.trim() : ''
  if (!scrapId || !emoji || !anonId) {
    return jsonResponse(
      { error: 'scrapId_emoji_anonId_required' },
      origin,
      { status: 400 },
    )
  }

  try {
    const result = await siteStub(env).scrapReact(scrapId, emoji, anonId)
    return jsonResponse(result, origin, {
      status: result.ok ? 200 : 400,
    })
  }
  catch (e) {
    console.error('[froq-api] scrap react failed:', e)
    return jsonResponse({ error: 'scrap_react_failed' }, origin, { status: 500 })
  }
}

async function handleProgressGet(
  request: Request,
  env: Env,
  origin: string | null,
): Promise<Response> {
  const token = bearerToken(request)
  if (!token) {
    return jsonResponse({ error: 'unauthorized' }, origin, { status: 401 })
  }

  const login = await resolveGitHubLogin(token)
  if (!login) {
    return jsonResponse({ error: 'invalid_token' }, origin, { status: 401 })
  }

  const pagePath = new URL(request.url).searchParams.get('pagePath')?.trim() || ''
  if (!pagePath) {
    return jsonResponse({ error: 'pagePath_required' }, origin, { status: 400 })
  }

  const raw = await env.PROGRESS.get(progressKey(login, pagePath))
  if (!raw) {
    return jsonResponse({ maxProgress: 0, read: false, updatedAt: null }, origin)
  }

  try {
    const parsed = JSON.parse(raw) as ProgressRecord
    return jsonResponse(parsed, origin)
  }
  catch {
    return jsonResponse({ maxProgress: 0, read: false, updatedAt: null }, origin)
  }
}

async function handleProgressPut(
  request: Request,
  env: Env,
  origin: string | null,
): Promise<Response> {
  const token = bearerToken(request)
  if (!token) {
    return jsonResponse({ error: 'unauthorized' }, origin, { status: 401 })
  }

  const login = await resolveGitHubLogin(token)
  if (!login) {
    return jsonResponse({ error: 'invalid_token' }, origin, { status: 401 })
  }

  let body: ProgressBody
  try {
    body = await request.json() as ProgressBody
  }
  catch {
    return jsonResponse({ error: 'invalid_json' }, origin, { status: 400 })
  }

  const pagePath = typeof body.pagePath === 'string' ? body.pagePath.trim() : ''
  if (!pagePath) {
    return jsonResponse({ error: 'pagePath_required' }, origin, { status: 400 })
  }

  const incoming = Math.min(1, Math.max(0, Number(body.maxProgress) || 0))
  const key = progressKey(login, pagePath)
  const existingRaw = await env.PROGRESS.get(key)
  let existing: ProgressRecord | null = null
  if (existingRaw) {
    try {
      existing = JSON.parse(existingRaw) as ProgressRecord
    }
    catch {
      existing = null
    }
  }

  const maxProgress = Math.max(existing?.maxProgress ?? 0, incoming)
  const read = Boolean(body.read) || maxProgress >= 0.9 || Boolean(existing?.read)
  const record: ProgressRecord = {
    maxProgress,
    read,
    updatedAt: new Date().toISOString(),
  }

  await env.PROGRESS.put(key, JSON.stringify(record))
  return jsonResponse(record, origin)
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)
    const origin = request.headers.get('Origin')
    const { pathname } = url

    if (request.method === 'OPTIONS')
      return emptyCors(origin)

    // Auth proxy (existing Device Flow)
    if (isAuthProxyPath(pathname)) {
      const upstream = await handleAuthProxy(request)
      const headers = new Headers(upstream.headers)
      for (const [k, v] of Object.entries(corsHeaders(origin)))
        headers.set(k, v)
      return new Response(upstream.body, {
        status: upstream.status,
        statusText: upstream.statusText,
        headers,
      })
    }

    if (pathname === '/session/ping' && request.method === 'POST')
      return handleSessionPing(request, env, origin)

    if (pathname === '/session/leave' && request.method === 'POST')
      return handleSessionLeave(request, env, origin)

    if (pathname === '/session/ws')
      return handleSessionWs(request, env, origin)

    if (pathname === '/stats' && request.method === 'GET')
      return handleStatsGet(request, env, origin)

    if (pathname === '/likes' && request.method === 'POST')
      return handleSiteLike(request, env, origin)

    if (pathname === '/scraps/reactions' && request.method === 'GET')
      return handleScrapReactionsGet(request, env, origin)

    if (pathname === '/scraps/reactions' && request.method === 'POST')
      return handleScrapReact(request, env, origin)

    if (pathname === '/progress' && request.method === 'GET')
      return handleProgressGet(request, env, origin)

    if (pathname === '/progress' && request.method === 'PUT')
      return handleProgressPut(request, env, origin)

    if (pathname === '/' || pathname === '/health') {
      return jsonResponse({ ok: true, service: 'froq-api' }, origin)
    }

    return jsonResponse({ error: 'not_found' }, origin, { status: 404 })
  },
} satisfies ExportedHandler<Env>
