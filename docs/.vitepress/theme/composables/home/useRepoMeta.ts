import { onMounted, readonly, ref } from 'vue'

export interface RepoMeta {
  description: string | null
  stars: number | null
  url: string
}

const TTL_MS = 5 * 60 * 1000

/** Fetch repo description + stargazers (anonymous, cached in localStorage). */
export function useRepoMeta(fullName: string) {
  const meta = ref<RepoMeta | null>(null)
  const loading = ref(true)

  const cacheKey = `gh-repo-meta:${fullName}`

  function readCache(): RepoMeta | null {
    try {
      const raw = localStorage.getItem(cacheKey)
      if (!raw)
        return null
      const parsed = JSON.parse(raw) as { data: RepoMeta, at: number }
      if (!parsed?.data || Date.now() - parsed.at > TTL_MS)
        return null
      return parsed.data
    }
    catch {
      return null
    }
  }

  function writeCache(data: RepoMeta) {
    try {
      localStorage.setItem(cacheKey, JSON.stringify({ data, at: Date.now() }))
    }
    catch { /* ignore */ }
  }

  async function load() {
    const cached = readCache()
    if (cached) {
      meta.value = cached
      loading.value = false
      return
    }
    try {
      const res = await fetch(`https://api.github.com/repos/${fullName}`, {
        headers: { Accept: 'application/vnd.github+json' },
      })
      if (!res.ok)
        return
      const j = await res.json() as {
        description: string | null
        stargazers_count?: number
        html_url: string
      }
      const data: RepoMeta = {
        description: j.description,
        stars: typeof j.stargazers_count === 'number' ? j.stargazers_count : null,
        url: j.html_url,
      }
      meta.value = data
      writeCache(data)
    }
    catch { /* network */ }
    finally {
      loading.value = false
    }
  }

  onMounted(() => {
    void load()
  })

  return { meta: readonly(meta), loading: readonly(loading) }
}
