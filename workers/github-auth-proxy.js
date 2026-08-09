/**
 * Cloudflare Worker: proxy GitHub OAuth Device Flow
 *
 * Why: browser cannot call github.com/login/* (no CORS). Locally Vite proxies
 * `/__auth`. GitHub Pages cannot proxy POST → 405. Use this Worker instead.
 *
 * === Recommended when domain is on NameSilo (or any non-CF DNS) ===
 * 1. Create a free Cloudflare account (no need to move froq.me DNS).
 * 2. Workers & Pages → Create → paste this file → Deploy.
 * 3. Copy the workers.dev URL, e.g. https://github-auth-proxy.YOUR_SUBDOMAIN.workers.dev
 * 4. GitHub repo → Settings → Secrets → Actions:
 *      VITE_GITHUB_AUTH_PROXY = https://github-auth-proxy.YOUR_SUBDOMAIN.workers.dev
 *    (no trailing slash)
 * 5. Re-run the Pages deploy workflow (or push) so the secret is baked into the build.
 *
 * === Optional: custom domain on Cloudflare (orange-cloud DNS) ===
 * Add route `froq.me/__auth*` to this Worker and leave VITE_GITHUB_AUTH_PROXY empty
 * so the site uses same-origin `/__auth`.
 */

const GITHUB_LOGIN = 'https://github.com/login'
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

    // /__auth/device/code → https://github.com/login/device/code
    // Also supports bare /device/code when worker is on its own hostname.
    let path = url.pathname
    if (path.startsWith('/__auth'))
      path = path.slice('/__auth'.length) || '/'
    if (!path.startsWith('/'))
      path = `/${path}`

    const target = new URL(`${path}${url.search}`, GITHUB_LOGIN)

    const headers = new Headers()
    const contentType = request.headers.get('Content-Type')
    const accept = request.headers.get('Accept')
    if (contentType)
      headers.set('Content-Type', contentType)
    if (accept)
      headers.set('Accept', accept)

    const init = {
      method: request.method,
      headers,
      redirect: 'follow',
    }
    if (request.method !== 'GET' && request.method !== 'HEAD')
      init.body = request.body

    const upstream = await fetch(target, init)
    const outHeaders = new Headers(upstream.headers)
    const cors = corsHeaders(origin)
    for (const [k, v] of Object.entries(cors))
      outHeaders.set(k, v)

    return new Response(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: outHeaders,
    })
  },
}
