import { onMounted, readonly, ref } from 'vue'
import { froqApiConfigured, froqFetch } from './froqApi'

/**
 * Site-wide cumulative stats (unique visitors / total visits).
 * Presence viewing is handled per-page by usePagePresence.
 */
export function useSiteStats() {
  const uniqueVisitors = ref<number | null>(null)
  const totalVisits = ref<number | null>(null)
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
      }
      if (typeof data.uniqueVisitors === 'number')
        uniqueVisitors.value = data.uniqueVisitors
      if (typeof data.totalVisits === 'number')
        totalVisits.value = data.totalVisits
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
    loaded: readonly(loaded),
    refresh,
  }
}
