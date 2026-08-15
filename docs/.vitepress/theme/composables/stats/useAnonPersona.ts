import type { AnonPersona } from './anonPersona'
import { computed, ref, watch } from 'vue'
import { personaFromAnonId } from './anonPersona'
import { PRESENCE_AS_ANON_KEY } from './constants'
import { anonIdRef, getAnonId, rerollAnonId } from './useAnonId'

const presenceAsAnon = ref(true)
let hydrated = false
let preferenceWatchBound = false

function readStoredPreference(): boolean {
  if (typeof localStorage === 'undefined')
    return true
  const raw = localStorage.getItem(PRESENCE_AS_ANON_KEY)
  if (raw === null)
    return true
  return raw !== '0' && raw !== 'false'
}

function hydrate() {
  if (hydrated || typeof window === 'undefined')
    return
  hydrated = true
  getAnonId()
  presenceAsAnon.value = readStoredPreference()
  if (!preferenceWatchBound) {
    preferenceWatchBound = true
    watch(presenceAsAnon, (v) => {
      localStorage.setItem(PRESENCE_AS_ANON_KEY, v ? '1' : '0')
    })
  }
}

/** Whether presence heartbeats omit ghLogin (appear as anonymous persona). Default on. */
export function usePresenceAsAnon() {
  hydrate()

  function setPresenceAsAnon(next: boolean) {
    presenceAsAnon.value = next
  }

  function togglePresenceAsAnon() {
    presenceAsAnon.value = !presenceAsAnon.value
  }

  return {
    presenceAsAnon,
    setPresenceAsAnon,
    togglePresenceAsAnon,
  }
}

/** Persona for this browser's anonId; can be reshuffled. */
export function useAnonPersona() {
  hydrate()

  const persona = computed<AnonPersona>(() => personaFromAnonId(anonIdRef.value || 'ssr'))

  function reshufflePersona() {
    rerollAnonId()
  }

  return {
    anonId: anonIdRef,
    persona,
    reshufflePersona,
    ...usePresenceAsAnon(),
  }
}
