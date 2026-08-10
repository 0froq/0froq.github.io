import { corsHeaders, emptyCors, jsonResponse } from './cors'
import { handleAuthProxy, isAuthProxyPath } from './authProxy'
import { PagePresence } from './PagePresence'
import { SiteStats } from './SiteStats'
import {
  progressKey,
  resolveGitHubLogin,
  visitorKey,
  type Env,
  type ProgressRecord,
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
  const countVisit = body.countVisit !== false
  const key = visitorKey(anonId, ghLogin || null)

  const [viewing, stats] = await Promise.all([
    pageStub(env, pagePath).heartbeat(key),
    siteStub(env).visit(anonId, pagePath, countVisit),
  ])

  return jsonResponse({
    viewing,
    uniqueVisitors: stats.uniqueVisitors,
    totalVisits: stats.totalVisits,
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
  const viewing = await pageStub(env, pagePath).leave(
    visitorKey(anonId, ghLogin || null),
  )
  return jsonResponse({ viewing }, origin)
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

    if (pathname === '/stats' && request.method === 'GET')
      return handleStatsGet(request, env, origin)

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
