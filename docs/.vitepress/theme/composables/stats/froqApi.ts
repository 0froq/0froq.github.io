/**
 * froq-api base URL.
 * Prefer VITE_FROQ_API; fall back to VITE_GITHUB_AUTH_PROXY (same Worker).
 * Empty → silent degrade (no presence/stats calls).
 */

const TRAILING_SLASH_RE = /\/$/

export function getFroqApiBase(): string {
  const froq = (import.meta.env.VITE_FROQ_API as string | undefined)?.trim()
  const auth = (import.meta.env.VITE_GITHUB_AUTH_PROXY as string | undefined)?.trim()
  const base = (froq || auth || '').replace(TRAILING_SLASH_RE, '')
  return base
}

export function froqApiConfigured(): boolean {
  return getFroqApiBase().length > 0
}

export async function froqFetch(
  path: string,
  init: RequestInit = {},
): Promise<Response | null> {
  const base = getFroqApiBase()
  if (!base)
    return null
  try {
    return await fetch(`${base}${path}`, init)
  }
  catch {
    return null
  }
}

/** Build a WebSocket URL for froq-api (http→ws / https→wss). */
export function froqWsUrl(path: string, query: Record<string, string>): string | null {
  const base = getFroqApiBase()
  if (!base)
    return null
  const wsBase = base.replace(/^http/i, 'ws')
  const url = new URL(`${wsBase}${path.startsWith('/') ? path : `/${path}`}`)
  for (const [k, v] of Object.entries(query))
    url.searchParams.set(k, v)
  return url.toString()
}
