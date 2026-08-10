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
