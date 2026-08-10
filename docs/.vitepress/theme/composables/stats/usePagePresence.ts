import type { Ref } from 'vue'
import { useEventListener } from '@vueuse/core'
import { onUnmounted, readonly, ref, watch } from 'vue'
import { useGitHubAuth } from '~/composables/useGitHubAuth'
import { HEARTBEAT_MS } from './constants'
import { froqApiConfigured, froqFetch } from './froqApi'
import { getAnonId } from './useAnonId'

export interface SessionStats {
  viewing: number | null
  uniqueVisitors: number | null
  totalVisits: number | null
}

const viewing = ref<number | null>(null)
const uniqueVisitors = ref<number | null>(null)
const totalVisits = ref<number | null>(null)

let timer: ReturnType<typeof setInterval> | null = null
let activePath = ''

function applyStats(data: Partial<SessionStats>) {
  if (typeof data.viewing === 'number')
    viewing.value = data.viewing
  if (typeof data.uniqueVisitors === 'number')
    uniqueVisitors.value = data.uniqueVisitors
  if (typeof data.totalVisits === 'number')
    totalVisits.value = data.totalVisits
}

async function ping(countVisit: boolean, ghLogin?: string): Promise<void> {
  if (!froqApiConfigured() || typeof document === 'undefined')
    return
  if (document.visibilityState === 'hidden')
    return

  const path = activePath
  if (!path)
    return

  const res = await froqFetch('/session/ping', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({
      pagePath: path,
      anonId: getAnonId(),
      ghLogin: ghLogin || undefined,
      countVisit,
    }),
  })
  if (!res || !res.ok)
    return
  try {
    applyStats(await res.json())
  }
  catch {
    // ignore
  }
}

async function leave(path = activePath, ghLogin?: string): Promise<void> {
  if (!froqApiConfigured() || !path)
    return
  await froqFetch('/session/leave', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({
      pagePath: path,
      anonId: getAnonId(),
      ghLogin: ghLogin || undefined,
    }),
    keepalive: true,
  })
}

function stopTimer() {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

function startTimer(getGhLogin: () => string | undefined) {
  stopTimer()
  timer = setInterval(() => {
    void ping(false, getGhLogin())
  }, HEARTBEAT_MS)
}

async function enterPath(path: string, getGhLogin: () => string | undefined) {
  if (activePath && activePath !== path)
    await leave(activePath, getGhLogin())
  activePath = path
  await ping(true, getGhLogin())
  startTimer(getGhLogin)
}

/** Read-only shared presence stats (no lifecycle). */
export function usePagePresenceState() {
  return {
    viewing: readonly(viewing),
    uniqueVisitors: readonly(uniqueVisitors),
    totalVisits: readonly(totalVisits),
  }
}

/**
 * Bind heartbeat lifecycle once (call from StatsSessionClient only).
 */
export function usePagePresenceSession(pagePath: Ref<string>) {
  const { user } = useGitHubAuth()
  const getGhLogin = () => user.value?.login || undefined

  if (typeof window === 'undefined') {
    return usePagePresenceState()
  }

  watch(
    pagePath,
    (path, prev) => {
      if (!path || path === prev)
        return
      void enterPath(path, getGhLogin)
    },
    { immediate: true },
  )

  watch(
    () => user.value?.login,
    (login, prev) => {
      if (login === prev || !activePath)
        return
      void enterPath(activePath, getGhLogin)
    },
  )

  useEventListener(document, 'visibilitychange', () => {
    if (document.visibilityState === 'visible')
      void ping(false, getGhLogin())
    else
      void leave(activePath, getGhLogin())
  })

  useEventListener(window, 'pagehide', () => {
    void leave(activePath, getGhLogin())
  })

  onUnmounted(() => {
    stopTimer()
    void leave(activePath, getGhLogin())
    activePath = ''
  })

  return usePagePresenceState()
}
