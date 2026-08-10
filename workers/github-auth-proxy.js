/**
 * @deprecated Prefer the Wrangler project at `workers/froq-api/`.
 *
 * This file is kept as a historical paste-deploy reference for the GitHub
 * OAuth Device Flow proxy only. New deploys should use froq-api (auth +
 * presence + stats + reading progress).
 *
 * See workers/froq-api/wrangler.toml and its header comments.
 */

const GITHUB_LOGIN = 'https://github.com/login/'
const ALLOWED_ORIGINS = new Set([
  'https://froq.me',
  'https://www.froq.me',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
])

function corsHeaders(origin) {
  const allow = origin && ALLOWED_ORIGINS.has(origin) ? origin : 'https://froq.me'
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Accept',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  }
}

export default {
  async fetch(request) {
    const url = new URL(request.url)
    const origin = request.headers.get('Origin')

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(origin) })
    }

    let path = url.pathname
    if (path.startsWith('/__auth'))
      path = path.slice('/__auth'.length) || '/'
    path = path.replace(/^\/+/, '')

    const target = new URL(`${path}${url.search}`, GITHUB_LOGIN)

    const rawBody = request.method === 'GET' || request.method === 'HEAD'
      ? null
      : await request.text()

    const headers = new Headers({
      'Accept': request.headers.get('Accept') || 'application/json',
      'Content-Type': request.headers.get('Content-Type') || 'application/json',
      'User-Agent': 'froq-github-auth-proxy',
    })

    const upstream = await fetch(target.toString(), {
      method: request.method,
      headers,
      body: rawBody,
      redirect: 'manual',
    })

    const outHeaders = new Headers()
    upstream.headers.forEach((value, key) => {
      const k = key.toLowerCase()
      if (k === 'set-cookie' || k === 'set-cookie2')
        return
      outHeaders.set(key, value)
    })
    const cors = corsHeaders(origin)
    for (const [k, v] of Object.entries(cors))
      outHeaders.set(k, v)

    return new Response(await upstream.text(), {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: outHeaders,
    })
  },
}
