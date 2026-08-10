const GITHUB_LOGIN = 'https://github.com/login/'

/**
 * Proxy GitHub OAuth Device Flow (no CORS on github.com/login/*).
 * Paths: `/__auth/device/code` or bare `/device/code` on workers.dev.
 */
export async function handleAuthProxy(request: Request): Promise<Response> {
  const url = new URL(request.url)

  let path = url.pathname
  if (path.startsWith('/__auth'))
    path = path.slice('/__auth'.length) || '/'
  // Relative path against https://github.com/login/ — leading "/" would break.
  path = path.replace(/^\/+/, '')

  const target = new URL(`${path}${url.search}`, GITHUB_LOGIN)

  const rawBody = request.method === 'GET' || request.method === 'HEAD'
    ? null
    : await request.text()

  const headers = new Headers({
    'Accept': request.headers.get('Accept') || 'application/json',
    'Content-Type': request.headers.get('Content-Type') || 'application/json',
    'User-Agent': 'froq-api-github-auth-proxy',
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

  return new Response(await upstream.text(), {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: outHeaders,
  })
}

export function isAuthProxyPath(pathname: string): boolean {
  if (pathname.startsWith('/__auth'))
    return true
  // Bare Device Flow paths when Worker is the AUTH_PROXY base.
  return pathname === '/device/code'
    || pathname.startsWith('/device/code/')
    || pathname === '/oauth/access_token'
    || pathname.startsWith('/oauth/access_token/')
}
