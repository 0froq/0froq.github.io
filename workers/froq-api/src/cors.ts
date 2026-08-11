export const ALLOWED_ORIGINS = new Set([
  'https://froq.me',
  'https://www.froq.me',
  'https://froq.pages.dev',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
])

/** Preview deployments: https://<hash>.froq.pages.dev */
const PAGES_PREVIEW_RE = /^https:\/\/[a-z0-9-]+\.froq\.pages\.dev$/i

export function isAllowedOrigin(origin: string | null): boolean {
  if (!origin)
    return false
  if (ALLOWED_ORIGINS.has(origin))
    return true
  return PAGES_PREVIEW_RE.test(origin)
}

export function corsHeaders(origin: string | null): Record<string, string> {
  const allow = origin && isAllowedOrigin(origin) ? origin : 'https://froq.me'
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Accept, Authorization',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  }
}

export function jsonResponse(
  data: unknown,
  origin: string | null,
  init: ResponseInit = {},
): Response {
  const headers = new Headers(init.headers)
  headers.set('Content-Type', 'application/json')
  for (const [k, v] of Object.entries(corsHeaders(origin)))
    headers.set(k, v)
  return new Response(JSON.stringify(data), { ...init, headers })
}

export function emptyCors(origin: string | null, status = 204): Response {
  return new Response(null, { status, headers: corsHeaders(origin) })
}
