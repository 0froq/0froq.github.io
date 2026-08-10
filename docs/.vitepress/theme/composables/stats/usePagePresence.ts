import type { Ref } from 'vue'
import { useEventListener } from '@vueuse/core'
import { onUnmounted, readonly, ref, watch } from 'vue'
import { useGitHubAuth } from '~/composables/useGitHubAuth'
import { HEARTBEAT_MS } from './constants'
import { froqApiConfigured, froqFetch } from './froqApi'
import { getAnonId } from './useAnonId'

export interface PageOnlineRow {
  pagePath: string
  viewing: number
}

export interface SessionStats {
  viewing: number | null
  online: number | null
  uniqueVisitors: number | null
  totalVisits: number | null
  pages: PageOnlineRow[]
}

const viewing = ref<number | null>(null)
const online = ref<number | null>(null)
const uniqueVisitors = ref<number | null>(null)
const totalVisits = ref<number | null>(null)
const pages = ref<PageOnlineRow[]>([])

let timer: ReturnType<typeof setInterval> | null = null
let activePath = ''

function applyStats(data: Partial<SessionStats> & { pages?: PageOnlineRow[] }) {
  if (typeof data.viewing === 'number')
    viewing.value = data.viewing
  if (typeof data.online === 'number')
    online.value = data.online
  if (typeof data.uniqueVisitors === 'number')
    uniqueVisitors.value = data.uniqueVisitors
  if (typeof data.totalVisits === 'number')
    totalVisits.value = data.totalVisits
  if (Array.isArray(data.pages))
    pages.value = data.pages
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
  const res = await froqFetch('/session/leave', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({
      pagePath: path,
      anonId: getAnonId(),
      ghLogin: ghLogin || undefined,
    }),
    keepalive: true,
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
    online: readonly(online),
    uniqueVisitors: readonly(uniqueVisitors),
    totalVisits: readonly(totalVisits),
    pages: readonly(pages),
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
