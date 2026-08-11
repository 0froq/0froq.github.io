import { ref } from 'vue'
import { ANON_ID_KEY } from './constants'

function randomId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function')
    return crypto.randomUUID()
  return `anon-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

/** Reactive browser anon id (shared across persona + ghost presence). */
export const anonIdRef = ref(
  typeof localStorage !== 'undefined' ? (localStorage.getItem(ANON_ID_KEY) || '') : '',
)

function ensureAnonId(): string {
  if (anonIdRef.value)
    return anonIdRef.value
  const id = randomId()
  anonIdRef.value = id
  if (typeof localStorage !== 'undefined')
    localStorage.setItem(ANON_ID_KEY, id)
  return id
}

/** Stable anonymous visitor id for this browser (localStorage). */
export function getAnonId(): string {
  if (typeof localStorage === 'undefined') {
    if (!anonIdRef.value)
      anonIdRef.value = randomId()
    return anonIdRef.value
  }
  return ensureAnonId()
}

/** Replace the browser anon id (new persona). Returns the new id. */
export function rerollAnonId(): string {
  const id = randomId()
  anonIdRef.value = id
  if (typeof localStorage !== 'undefined')
    localStorage.setItem(ANON_ID_KEY, id)
  return id
}
