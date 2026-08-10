export interface Env {
  PAGE_PRESENCE: DurableObjectNamespace<import('./PagePresence').PagePresence>
  SITE_STATS: DurableObjectNamespace<import('./SiteStats').SiteStats>
  PROGRESS: KVNamespace
}

export interface ProgressRecord {
  maxProgress: number
  read: boolean
  updatedAt: string
}

export function visitorKey(anonId: string, ghLogin?: string | null): string {
  if (ghLogin && ghLogin.trim())
    return `gh:${ghLogin.trim().toLowerCase()}`
  return `anon:${anonId}`
}

export function progressKey(ghLogin: string, pagePath: string): string {
  return `progress:${ghLogin.toLowerCase()}:${pagePath}`
}

/** Resolve GitHub login from a Bearer token (short Cache API memo). */
export async function resolveGitHubLogin(token: string): Promise<string | null> {
  const cache = caches.default
  const cacheKey = new Request(
    `https://froq-api.internal/github-user/${token.slice(0, 16)}`,
  )
  const cached = await cache.match(cacheKey)
  if (cached) {
    const body = await cached.json() as { login?: string }
    return body.login ?? null
  }

  const res = await fetch('https://api.github.com/user', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github+json',
      'User-Agent': 'froq-api',
    },
  })
  if (!res.ok)
    return null

  const data = await res.json() as { login?: string }
  if (!data.login)
    return null

  await cache.put(
    cacheKey,
    new Response(JSON.stringify({ login: data.login }), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'max-age=300',
      },
    }),
  )
  return data.login
}
