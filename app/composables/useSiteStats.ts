import type { PageLikeRow, PageOnlineRow, PageVisitRow, SiteCounters } from '~/composables/useFroqApi'

function num() {
  return useState<number | null>
}

export function useSiteStats() {
  const uniqueVisitors = num()('stats-unique', () => null)
  const totalVisits = num()('stats-visits', () => null)
  const online = num()('stats-online', () => null)
  const viewing = num()('stats-viewing', () => null)
  const siteLikes = num()('stats-likes', () => null)
  const pages = useState<PageOnlineRow[]>('stats-pages', () => [])
  const pageVisits = useState<PageVisitRow[]>('stats-page-visits', () => [])
  const pageLikes = useState<PageLikeRow[]>('stats-page-likes', () => [])
  const loaded = useState('stats-loaded', () => false)
  const { getStats, configured } = useFroqApi()

  function apply(data: Partial<SiteCounters>) {
    if (typeof data.uniqueVisitors === 'number')
      uniqueVisitors.value = data.uniqueVisitors
    if (typeof data.totalVisits === 'number')
      totalVisits.value = data.totalVisits
    if (typeof data.online === 'number')
      online.value = data.online
    if (typeof data.viewing === 'number')
      viewing.value = data.viewing
    if (typeof data.siteLikes === 'number')
      siteLikes.value = data.siteLikes
    if (Array.isArray(data.pages))
      pages.value = data.pages
    if (Array.isArray(data.pageVisits))
      pageVisits.value = data.pageVisits
    if (Array.isArray(data.pageLikes))
      pageLikes.value = data.pageLikes
    loaded.value = true
  }

  async function refresh(pagePath?: string) {
    if (!configured.value)
      return
    const data = await getStats(pagePath)
    if (data)
      apply(data)
  }

  return {
    uniqueVisitors,
    totalVisits,
    online,
    viewing,
    siteLikes,
    pages,
    pageVisits,
    pageLikes,
    loaded,
    apply,
    refresh,
  }
}
