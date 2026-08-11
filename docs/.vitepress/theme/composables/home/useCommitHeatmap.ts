import { onMounted, readonly, ref } from 'vue'

export interface CommitDay {
  date: string // YYYY-MM-DD
  count: number
}

const GRAPHQL_URL = 'https://api.github.com/graphql'
const CACHE_TTL_MS = 60 * 60 * 1000 // 1h

/**
 * Profile contribution heatmap (same data as github.com/{login}).
 * Uses GraphQL contributionCalendar via VITE_GITHUB_READ_TOKEN.
 */
export function useCommitHeatmap(login: string) {
  const days = ref<CommitDay[]>([])
  const total = ref(0)
  const loading = ref(true)

  const cacheKey = `gh-contrib-calendar:v2:${login}`

  function readCache(): { days: CommitDay[], total: number, fetchedAt: number } | null {
    try {
      const raw = localStorage.getItem(cacheKey)
      if (!raw)
        return null
      const parsed = JSON.parse(raw) as {
        days: CommitDay[]
        total: number
        fetchedAt: number
      }
      if (!Array.isArray(parsed.days) || Date.now() - parsed.fetchedAt > CACHE_TTL_MS)
        return null
      return parsed
    }
    catch {
      return null
    }
  }

  function writeCache(payload: { days: CommitDay[], total: number, fetchedAt: number }) {
    try {
      localStorage.setItem(cacheKey, JSON.stringify(payload))
    }
    catch { /* quota */ }
  }

  async function fetchCalendar(): Promise<{ days: CommitDay[], total: number } | null> {
    const token = (import.meta.env.VITE_GITHUB_READ_TOKEN as string | undefined)?.trim()
    if (!token)
      return null

    const query = `query($login: String!) {
      user(login: $login) {
        contributionsCollection {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                date
                contributionCount
              }
            }
          }
        }
      }
    }`

    const res = await fetch(GRAPHQL_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, variables: { login } }),
    })
    if (!res.ok)
      return null

    const json = await res.json() as {
      data?: {
        user?: {
          contributionsCollection: {
            contributionCalendar: {
              totalContributions: number
              weeks: Array<{
                contributionDays: Array<{ date: string, contributionCount: number }>
              }>
            }
          }
        }
      }
      errors?: Array<{ message: string }>
    }
    const cal = json.data?.user?.contributionsCollection?.contributionCalendar
    if (!cal)
      return null

    const out: CommitDay[] = []
    for (const week of cal.weeks) {
      for (const day of week.contributionDays)
        out.push({ date: day.date, count: day.contributionCount })
    }
    return { days: out, total: cal.totalContributions }
  }

  async function refresh() {
    const cached = readCache()
    if (cached) {
      days.value = cached.days
      total.value = cached.total
      loading.value = false
    }

    try {
      const fresh = await fetchCalendar()
      if (fresh) {
        days.value = fresh.days
        total.value = fresh.total
        writeCache({ ...fresh, fetchedAt: Date.now() })
      }
    }
    finally {
      loading.value = false
    }
  }

  onMounted(() => {
    void refresh()
  })

  return {
    days: readonly(days),
    total: readonly(total),
    loading: readonly(loading),
  }
}
