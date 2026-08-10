import { ANON_ID_KEY } from './constants'

function randomId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function')
    return crypto.randomUUID()
  return `anon-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

/** Stable anonymous visitor id for this browser (localStorage). */
export function getAnonId(): string {
  if (typeof localStorage === 'undefined')
    return randomId()
  let id = localStorage.getItem(ANON_ID_KEY)
  if (!id) {
    id = randomId()
    localStorage.setItem(ANON_ID_KEY, id)
  }
  return id
}
