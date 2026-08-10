import type { PageOnlineRow } from './usePagePresence'
import { onMounted, readonly, ref } from 'vue'
import { froqApiConfigured, froqFetch } from './froqApi'

/**
 * Site-wide cumulative stats (+ online snapshot via GET /stats).
 * Live updates also flow through usePagePresenceSession pings.
 */
export function useSiteStats() {
  const uniqueVisitors = ref<number | null>(null)
  const totalVisits = ref<number | null>(null)
  const online = ref<number | null>(null)
  const pages = ref<PageOnlineRow[]>([])
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
      }
      if (typeof data.uniqueVisitors === 'number')
        uniqueVisitors.value = data.uniqueVisitors
      if (typeof data.totalVisits === 'number')
        totalVisits.value = data.totalVisits
      if (typeof data.online === 'number')
        online.value = data.online
      if (Array.isArray(data.pages))
        pages.value = data.pages
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
    loaded: readonly(loaded),
    refresh,
  }
}
