/**
 * Cloudflare Worker: proxy GitHub OAuth Device Flow for froq.me
 *
 * Why: `https://github.com/login/device/code` and `/oauth/access_token` do not
 * allow browser CORS. Locally Vite proxies `/__auth` → github.com/login.
 * On GitHub Pages we need the same path proxied at the edge.
 *
 * Setup (Cloudflare dashboard, DNS must be proxied orange-cloud on froq.me):
 * 1. Workers & Pages → Create Worker → paste this file as the module worker.
 * 2. Settings → Triggers → Add route:
 *      froq.me/__auth*
 *      www.froq.me/__auth*   (if used)
 * 3. Deploy. Browser calls same-origin `/__auth/device/code` — no CORS needed.
 *
 * Optional: deploy to *.workers.dev and set build secret
 *   VITE_GITHUB_AUTH_PROXY=https://your-worker.workers.dev
 * then AUTH_BASE becomes that absolute URL (see useGitHubAuth.ts).
 */

const GITHUB_LOGIN = 'https://github.com/login'

function corsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Accept',
    'Access-Control-Max-Age': '86400',
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
