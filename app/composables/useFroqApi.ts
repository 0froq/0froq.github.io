import type { ScrapReactionState } from '~/utils/scraps'

const TRAILING_SLASH = /\/$/

export interface PageOnlineRow {
  pagePath: string
  viewing: number
}

export interface PageVisitRow {
  pagePath: string
  visits: number
}

export interface PageLikeRow {
  pagePath: string
  likes: number
}

export interface SiteCounters {
  uniqueVisitors: number
  totalVisits: number
  online: number
  pages: PageOnlineRow[]
  pageVisits: PageVisitRow[]
  pageLikes: PageLikeRow[]
  siteLikes: number
  viewing?: number
}

export interface LikeResult {
  ok: boolean
  likes: number
  siteLikes: number
  pagePath?: string
}

export function useFroqApi() {
  const config = useRuntimeConfig()
  const base = computed(() => {
    if (import.meta.dev && import.meta.client)
      return '/__froq'
    const raw = String(config.public.froqApi || '').replace(TRAILING_SLASH, '')
    return raw || 'https://api.froq.me'
  })

  const configured = computed(() => Boolean(base.value))

  async function request<T>(
    path: string,
    opts?: { method?: string, body?: unknown, keepalive?: boolean },
  ): Promise<T | null> {
    try {
      return await $fetch<T>(`${base.value}${path}`, opts)
    }
    catch {
      return null
    }
  }

  async function getScrapReactions(
    ids: string[],
    anonId?: string,
  ): Promise<Record<string, ScrapReactionState>> {
    if (!ids.length)
      return {}
    const params = new URLSearchParams({
      ids: ids.join(','),
    })
    if (anonId)
      params.set('anonId', anonId)
    try {
      const data = await $fetch<{ scraps: Record<string, ScrapReactionState> }>(
        `${base.value}/scraps/reactions?${params}`,
      )
      return data.scraps ?? {}
    }
    catch {
      return {}
    }
  }

  async function reactToScrap(
    scrapId: string,
    emoji: string,
    anonId: string,
  ): Promise<ScrapReactionState | null> {
    try {
      const data = await $fetch<{ ok: boolean, state: ScrapReactionState }>(
        `${base.value}/scraps/reactions`,
        {
          method: 'POST',
          body: { scrapId, emoji, anonId },
        },
      )
      return data.state ?? null
    }
    catch {
      return null
    }
  }

  function getStats(pagePath?: string) {
    const q = pagePath ? `?page=${encodeURIComponent(pagePath)}` : ''
    return request<SiteCounters>(`/stats${q}`)
  }

  function pingSession(body: {
    pagePath: string
    anonId: string
    countVisit?: boolean
  }) {
    return request<Partial<SiteCounters>>('/session/ping', {
      method: 'POST',
      body,
    })
  }

  function leaveSession(body: { pagePath: string, anonId: string }) {
    return request<Partial<SiteCounters>>('/session/leave', {
      method: 'POST',
      body,
      keepalive: true,
    })
  }

  function like(anonId: string, pagePath?: string) {
    return request<LikeResult>('/likes', {
      method: 'POST',
      body: { anonId, pagePath },
    })
  }

  return {
    base,
    configured,
    getScrapReactions,
    reactToScrap,
    getStats,
    pingSession,
    leaveSession,
    like,
  }
}
