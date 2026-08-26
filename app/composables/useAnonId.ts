import { ANON_ID_KEYS } from '~/utils/siteConstants'

function createId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID)
    return crypto.randomUUID()
  return `anon-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

function readStoredId() {
  for (const key of ANON_ID_KEYS) {
    const value = localStorage.getItem(key)
    if (value) {
      localStorage.setItem(ANON_ID_KEYS[0], value)
      return value
    }
  }
  return ''
}

/** Stable anonymous visitor id for Cloudflare scrap reactions (no GitHub). */
export function useAnonId() {
  const anonId = useState('froq-anon-id', () => '')

  if (import.meta.client && !anonId.value) {
    let existing = readStoredId()
    if (!existing) {
      existing = createId()
      localStorage.setItem(ANON_ID_KEYS[0], existing)
    }
    anonId.value = existing
  }

  onMounted(() => {
    if (anonId.value)
      return
    let existing = readStoredId()
    if (!existing) {
      existing = createId()
      localStorage.setItem(ANON_ID_KEYS[0], existing)
    }
    anonId.value = existing
  })

  return anonId
}
