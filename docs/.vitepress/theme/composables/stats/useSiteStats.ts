import type { PageOnlineRow, PageVisitRow } from './usePagePresence'
import { onMounted, readonly, ref } from 'vue'
import { froqApiConfigured, froqFetch } from './froqApi'

export interface PageLikeRow {
  pagePath: string
  likes: number
}

/**
 * Site-wide cumulative stats (+ online snapshot via GET /stats).
 * Live updates also flow through usePagePresenceSession pings.
 */
export function useSiteStats() {
  const uniqueVisitors = ref<number | null>(null)
  const totalVisits = ref<number | null>(null)
  const online = ref<number | null>(null)
  const pages = ref<PageOnlineRow[]>([])
  const pageVisits = ref<PageVisitRow[]>([])
  const pageLikes = ref<PageLikeRow[]>([])
  const siteLikes = ref<number | null>(null)
  const loaded = ref(false)

  async function refresh() {
    if (!froqApiConfigured())
      return
    const res = await froqFetch('/stats', {
      headers: { Accept: 'application/json' },
    })
    if (!res || !res.ok)
      return
    try {
      const data = await res.json() as {
        uniqueVisitors?: number
        totalVisits?: number
        online?: number
        pages?: PageOnlineRow[]
        pageVisits?: PageVisitRow[]
        pageLikes?: PageLikeRow[]
        siteLikes?: number
      }
      if (typeof data.uniqueVisitors === 'number')
        uniqueVisitors.value = data.uniqueVisitors
      if (typeof data.totalVisits === 'number')
        totalVisits.value = data.totalVisits
      if (typeof data.online === 'number')
        online.value = data.online
      if (Array.isArray(data.pages))
        pages.value = data.pages
      if (Array.isArray(data.pageVisits))
        pageVisits.value = data.pageVisits
      if (Array.isArray(data.pageLikes))
        pageLikes.value = data.pageLikes
      if (typeof data.siteLikes === 'number')
        siteLikes.value = data.siteLikes
      loaded.value = true
    }
    catch {
      // ignore
    }
  }

  onMounted(() => {
    void refresh()
  })

  return {
    uniqueVisitors: readonly(uniqueVisitors),
    totalVisits: readonly(totalVisits),
    online: readonly(online),
    pages: readonly(pages),
    pageVisits: readonly(pageVisits),
    pageLikes: readonly(pageLikes),
    siteLikes: readonly(siteLikes),
    loaded: readonly(loaded),
    refresh,
  }
}
