import type { Ref } from 'vue'
import { useEventListener } from '@vueuse/core'
import { onUnmounted, readonly, ref, watch } from 'vue'
import { useGitHubAuth } from '~/composables/useGitHubAuth'
import { HEARTBEAT_MS } from './constants'
import { froqApiConfigured, froqFetch } from './froqApi'
import { getAnonId } from './useAnonId'
import { usePresenceAsAnon } from './useAnonPersona'

export interface PageOnlineRow {
  pagePath: string
  viewing: number
}

export interface PageVisitRow {
  pagePath: string
  visits: number
}

export interface SessionStats {
  viewing: number | null
  online: number | null
  uniqueVisitors: number | null
  totalVisits: number | null
  pages: PageOnlineRow[]
  pageVisits: PageVisitRow[]
}

const viewing = ref<number | null>(null)
const online = ref<number | null>(null)
const uniqueVisitors = ref<number | null>(null)
const totalVisits = ref<number | null>(null)
const pages = ref<PageOnlineRow[]>([])
const pageVisits = ref<PageVisitRow[]>([])

/** Paths already sent countVisit=true this session (server debounce is backup). */
const visitRecorded = new Set<string>()

let timer: ReturnType<typeof setInterval> | null = null
let activePath = ''

function applyStats(data: Partial<SessionStats> & {
  pages?: PageOnlineRow[]
  pageVisits?: PageVisitRow[]
}) {
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
  if (Array.isArray(data.pageVisits))
    pageVisits.value = data.pageVisits
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
  // Presence only — visits count when reading progress crosses VISIT_THRESHOLD.
  await ping(false, getGhLogin())
  startTimer(getGhLogin)
}

/**
 * Count one visit for the active (or given) page after progress ≥ VISIT_THRESHOLD.
 * Idempotent per path for this browser session.
 */
export async function recordVisit(pagePath?: string): Promise<void> {
  const path = pagePath || activePath
  if (!path || visitRecorded.has(path))
    return
  // Avoid attributing a visit to a path the session is not on.
  if (activePath && path !== activePath)
    return
  if (!activePath)
    activePath = path
  visitRecorded.add(path)
  await ping(true)
}

/** Read-only shared presence stats (no lifecycle). */
export function usePagePresenceState() {
  return {
    viewing: readonly(viewing),
    online: readonly(online),
    uniqueVisitors: readonly(uniqueVisitors),
    totalVisits: readonly(totalVisits),
    pages: readonly(pages),
    pageVisits: readonly(pageVisits),
  }
}

/**
 * Bind heartbeat lifecycle once (call from StatsSessionClient only).
 * When presenceAsAnon is on (default), omit ghLogin so the visitor key is anon:{id}.
 */
export function usePagePresenceSession(pagePath: Ref<string>) {
  const { user } = useGitHubAuth()
  const { presenceAsAnon } = usePresenceAsAnon()

  const getGhLogin = () => {
    if (presenceAsAnon.value)
      return undefined
    return user.value?.login || undefined
  }

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

  // Switching anon/identified presence: leave old visitorKey, enter as new.
  watch(presenceAsAnon, async (asAnon, wasAnon) => {
    if (asAnon === wasAnon || !activePath)
      return
    const prevLogin = wasAnon ? undefined : (user.value?.login || undefined)
    const nextLogin = asAnon ? undefined : (user.value?.login || undefined)
    await leave(activePath, prevLogin)
    await ping(false, nextLogin)
    startTimer(getGhLogin)
  })

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
