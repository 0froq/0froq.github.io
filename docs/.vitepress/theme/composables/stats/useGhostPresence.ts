import type { Ref } from 'vue'
import { useEventListener, useMediaQuery, useThrottleFn } from '@vueuse/core'
import { computed, onUnmounted, readonly, ref, watch } from 'vue'
import { personaFromAnonId } from './anonPersona'
import {
  GHOST_ENABLED_KEY,
  GHOST_POINTER_THROTTLE_MS,
  GHOST_VIEWPORT_MISMATCH,
} from './constants'
import { froqApiConfigured, froqWsUrl } from './froqApi'
import { githubAvatarUrl } from './presenceIdentity'
import { anonIdRef, getAnonId } from './useAnonId'
import { usePresenceAsAnon } from './useAnonPersona'
import { pushGhostPeekNotice } from './useGhostPeekNotices'
import { measureArticleProgress } from './useReadingProgress'
import { useGitHubAuth } from '~/composables/useGitHubAuth'

/** Mobile / touch-primary: no cursor → progress marks only. */
function useGhostProgressOnlyDevice() {
  return useMediaQuery('(hover: none), (pointer: coarse)')
}

export interface GhostPeer {
  /** Per-tab socket id. */
  id: string
  anonId: string
  /** Presenting as GitHub login, if any. */
  ghLogin?: string | null
  /** Reading progress 0–1. */
  p: number
  /**
   * Pointer in #content space (0–1), not viewport.
   * x: across content width; y: along full content height (scroll-aware).
   * -1 = unknown / outside content.
   */
  x: number
  y: number
  /** Peer CSS viewport size (px). */
  vw: number
  vh: number
  colorHex: string
  emoji: string
  label: string
  /** GitHub avatar URL when presenting as GH. */
  avatarUrl?: string
}

export interface GhostPointerProjection {
  id: string
  anonId: string
  label: string
  colorHex: string
  emoji: string
  avatarUrl?: string
  /** CSS px, position:fixed */
  left: number
  top: number
  /** True when the real position is outside the viewport — render as edge arrow. */
  edge: boolean
  /** CSS rotate deg; 0 = pointing right. */
  angle: number
}

const GHOST_TAB_KEY = 'froq_ghost_tab_id'

const peers = ref<GhostPeer[]>([])
const connected = ref(false)
const ghostEnabled = ref(true)
const selfViewport = ref({ w: 0, h: 0 })
/** Bumps on scroll/resize so pointer projections recompute. */
const layoutTick = ref(0)

let hydrated = false
let prefWatchBound = false
let socket: WebSocket | null = null
let activePath = ''
let reconnectTimer: ReturnType<typeof setTimeout> | null = null
let skipReconnect = false
let lastSentP = -1
let lastSentX = -1
let lastSentY = -1
let lastSentVw = -1
let lastSentVh = -1
let selfTabId = ''
/** Last known content-space pointer (0–1), or -1. */
let localX = -1
let localY = -1
/** Last raw viewport mouse px — used to resync content coords while scrolling. */
let lastClientX = -1
let lastClientY = -1
let scrollSendRaf = 0

/** Collapse trailing slash so `/a` and `/a/` share one presence room. */
export function normalizePresencePath(raw: string): string {
  let p = raw.trim().split('?')[0]?.split('#')[0] || ''
  if (!p)
    return ''
  if (!p.startsWith('/'))
    p = `/${p}`
  if (p.length > 1 && p.endsWith('/'))
    p = p.slice(0, -1)
  return p
}

/**
 * Home + article pages only (ghost ink + fixed-header toggle).
 * Excludes section indexes, layer lists, dashboard, tags.
 */
export function isGhostPresencePath(raw: string): boolean {
  const p = normalizePresencePath(raw) || '/'
  if (p === '/' || p === '/en')
    return true
  // Section / layer indexes — no ghosts
  if (
    p === '/posts'
    || p === '/en/posts'
    || p === '/corpus'
    || p === '/en/corpus'
    || p === '/dashboard'
    || p === '/en/dashboard'
    || p === '/tags'
    || p === '/en/tags'
  ) {
    return false
  }
  if (/^\/(en\/)?posts\/\d{3}-[^/]+$/.test(p))
    return false
  if (/^\/(en\/)?corpus\/\d{3}-[^/]+$/.test(p))
    return false
  if (/^\/(en\/)?dashboard(\/|$)/.test(p))
    return false
  if (/^\/(en\/)?tags(\/|$)/.test(p))
    return false
  // Individual posts / corpus entries / other article-like pages
  if (/^\/(en\/)?(posts|corpus)\//.test(p))
    return true
  // Root-level markdown articles (e.g. rune-activity) via ContentArticle
  return p !== '/' && p !== '/en'
}

function getTabId(): string {
  if (typeof sessionStorage === 'undefined')
    return `tab-${Math.random().toString(36).slice(2, 10)}`
  let id = sessionStorage.getItem(GHOST_TAB_KEY)
  if (!id) {
    id = (typeof crypto !== 'undefined' && crypto.randomUUID)
      ? crypto.randomUUID()
      : `tab-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
    sessionStorage.setItem(GHOST_TAB_KEY, id)
  }
  return id
}

function hydrateGhostPref() {
  if (hydrated || typeof window === 'undefined')
    return
  hydrated = true
  const rawEn = localStorage.getItem(GHOST_ENABLED_KEY)
  ghostEnabled.value = rawEn === null ? true : rawEn !== '0' && rawEn !== 'false'
  syncSelfViewport()
  if (!prefWatchBound) {
    prefWatchBound = true
    watch(ghostEnabled, (v) => {
      localStorage.setItem(GHOST_ENABLED_KEY, v ? '1' : '0')
    })
  }
}

function syncSelfViewport() {
  if (typeof window === 'undefined')
    return
  selfViewport.value = {
    w: Math.round(window.innerWidth || 0),
    h: Math.round(window.innerHeight || 0),
  }
}

function clearReconnect() {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer)
    reconnectTimer = null
  }
}

function teardownSocket() {
  clearReconnect()
  if (socket) {
    skipReconnect = true
    try {
      socket.close(1000, 'leave')
    }
    catch {
      // ignore
    }
    socket = null
  }
  connected.value = false
  peers.value = []
  lastSentP = -1
  lastSentX = -1
  lastSentY = -1
  lastSentVw = -1
  lastSentVh = -1
}

/** Grace window: keep last pointer coords when a peer transiently reports -1. */
const POINTER_STALE_MS = 2_500
/** tabId → last time that tab sent valid x/y. */
const lastPointerAt = new Map<string, number>()

function mapPeers(
  raw: {
    id: string
    anonId?: string
    ghLogin?: string | null
    p: number
    x?: number
    y?: number
    vw?: number
    vh?: number
  }[],
  myTabId: string,
  locale: string,
): GhostPeer[] {
  const prevById = new Map(peers.value.map(p => [p.id, p]))
  const now = Date.now()
  return raw
    .filter(r => r.id && r.id !== myTabId)
    .map((r) => {
      const anonId = r.anonId || r.id
      const persona = personaFromAnonId(anonId)
      const prev = prevById.get(r.id)
      let x = typeof r.x === 'number' ? r.x : -1
      let y = typeof r.y === 'number' ? r.y : -1
      if (x >= 0 && y >= 0) {
        lastPointerAt.set(r.id, now)
      }
      else if (
        prev
        && prev.x >= 0
        && prev.y >= 0
        && now - (lastPointerAt.get(r.id) ?? 0) < POINTER_STALE_MS
      ) {
        // Transient clear (e.g. scroll resync rounding) — avoid pointer↔progress flicker.
        x = prev.x
        y = prev.y
      }
      const ghLogin = typeof r.ghLogin === 'string' && r.ghLogin.trim()
        ? r.ghLogin.trim()
        : null
      return {
        id: r.id,
        anonId,
        ghLogin,
        p: clamp01(Number(r.p) || 0),
        x,
        y,
        vw: typeof r.vw === 'number' ? r.vw : 0,
        vh: typeof r.vh === 'number' ? r.vh : 0,
        colorHex: persona.colorHex,
        emoji: persona.emoji,
        label: ghLogin || persona.label(locale),
        avatarUrl: ghLogin ? githubAvatarUrl(ghLogin) : undefined,
      }
    })
}

function clamp01(v: number): number {
  if (!Number.isFinite(v))
    return 0
  return Math.min(1, Math.max(0, v))
}

/** Quantize to `steps` buckets in [0, 1]. Pointer needs finer steps than progress. */
function quantize(v: number, steps = 100): number {
  return Math.round(clamp01(v) * steps) / steps
}

const POINTER_QUANTIZE_STEPS = 1000

/** True when peer viewport is within GHOST_VIEWPORT_MISMATCH of ours. */
export function isViewportCompatible(
  peer: Pick<GhostPeer, 'vw' | 'vh'>,
  self = selfViewport.value,
): boolean {
  if (!peer.vw || !peer.vh || !self.w || !self.h)
    return false
  const dw = Math.abs(peer.vw - self.w) / Math.max(peer.vw, self.w)
  const dh = Math.abs(peer.vh - self.h) / Math.max(peer.vh, self.h)
  return dw <= GHOST_VIEWPORT_MISMATCH && dh <= GHOST_VIEWPORT_MISMATCH
}

/** Hysteresis: extra slack to stay in pointer mode once entered. */
const POINTER_COMPAT_EXIT_SLACK = 0.08

function viewportGap(
  peer: Pick<GhostPeer, 'vw' | 'vh'>,
  self = selfViewport.value,
): number {
  if (!peer.vw || !peer.vh || !self.w || !self.h)
    return Number.POSITIVE_INFINITY
  const dw = Math.abs(peer.vw - self.w) / Math.max(peer.vw, self.w)
  const dh = Math.abs(peer.vh - self.h) / Math.max(peer.vh, self.h)
  return Math.max(dw, dh)
}

/**
 * Pointer coordinate root: full article column (title → nav), not just
 * `#content` markdown. Falls back to `#content` on pages without the root.
 */
function getGhostPointerEl(): HTMLElement | null {
  if (typeof document === 'undefined')
    return null
  return (
    document.getElementById('ghost-pointer-root')
    ?? document.getElementById('content')
  )
}

/**
 * Mouse → ghost-root normalized coords (scroll-aware).
 * Uses getBoundingClientRect (not offsetTop) so nested positioned ancestors
 * don’t shift the box.
 * Returns null when pointer is outside the root box.
 */
export function pointerInContent(clientX: number, clientY: number): { x: number, y: number } | null {
  if (typeof window === 'undefined')
    return null
  const el = getGhostPointerEl()
  if (!el)
    return null
  const rect = el.getBoundingClientRect()
  if (rect.width <= 0 || rect.height <= 0)
    return null
  const x = (clientX - rect.left) / rect.width
  const y = (clientY - rect.top) / rect.height
  // Allow a small margin; otherwise treat as outside.
  if (x < -0.02 || x > 1.02 || y < -0.02 || y > 1.02)
    return null
  return { x: clamp01(x), y: clamp01(y) }
}

/**
 * Ghost-root pointer → local viewport fixed px.
 * Off-screen peers are clamped to the viewport edge with an outward angle.
 */
export function projectContentPointer(
  peer: Pick<GhostPeer, 'x' | 'y'>,
): { left: number, top: number, edge: boolean, angle: number } | null {
  if (typeof window === 'undefined')
    return null
  if (peer.x < 0 || peer.y < 0)
    return null
  const el = getGhostPointerEl()
  if (!el)
    return null
  const rect = el.getBoundingClientRect()
  if (rect.width <= 0 || rect.height <= 0)
    return null

  const rawLeft = rect.left + peer.x * rect.width
  const rawTop = rect.top + peer.y * rect.height
  const vw = window.innerWidth
  const vh = window.innerHeight
  const margin = 16

  const edge = rawLeft < 0 || rawLeft > vw || rawTop < 0 || rawTop > vh
  if (!edge) {
    return { left: rawLeft, top: rawTop, edge: false, angle: 0 }
  }

  const left = Math.min(vw - margin, Math.max(margin, rawLeft))
  const top = Math.min(vh - margin, Math.max(margin, rawTop))
  // Point from the edge marker toward the true (off-screen) position.
  const angle = Math.atan2(rawTop - top, rawLeft - left) * (180 / Math.PI)
  return { left, top, edge: true, angle }
}

function bumpLayout() {
  layoutTick.value++
}

/** Recompute content-space pointer from the last viewport mouse position. */
function resyncPointerFromClient(): void {
  if (lastClientX < 0 || lastClientY < 0)
    return
  const pos = pointerInContent(lastClientX, lastClientY)
  if (!pos) {
    if (localX >= 0 || localY >= 0) {
      localX = -1
      localY = -1
    }
    return
  }
  localX = pos.x
  localY = pos.y
}

/** Scroll-driven presence: at most once per animation frame. */
function scheduleScrollPresenceSend() {
  if (typeof window === 'undefined')
    return
  if (scrollSendRaf)
    return
  scrollSendRaf = window.requestAnimationFrame(() => {
    scrollSendRaf = 0
    sendPresence(false)
  })
}

function connect(pagePath: string, locale: string, ghLogin?: string) {
  if (!froqApiConfigured() || typeof window === 'undefined')
    return
  if (!ghostEnabled.value)
    return

  const path = normalizePresencePath(pagePath)
  if (!path)
    return

  teardownSocket()
  skipReconnect = false
  activePath = path
  selfTabId = getTabId()
  syncSelfViewport()

  const anonId = getAnonId()
  const query: Record<string, string> = {
    pagePath: path,
    anonId,
    tabId: selfTabId,
  }
  if (ghLogin)
    query.ghLogin = ghLogin
  const url = froqWsUrl('/session/ws', query)
  if (!url)
    return

  let ws: WebSocket
  try {
    ws = new WebSocket(url)
  }
  catch {
    return
  }
  socket = ws

  ws.addEventListener('open', () => {
    connected.value = true
    lastSentP = -1
    lastSentX = -1
    lastSentY = -1
    lastSentVw = -1
    lastSentVh = -1
    sendPresence(true)
  })

  ws.addEventListener('message', (ev) => {
    if (typeof ev.data !== 'string')
      return
    try {
      const data = JSON.parse(ev.data) as {
        type?: string
        peers?: {
          id: string
          anonId?: string
          ghLogin?: string | null
          p: number
          x?: number
          y?: number
          vw?: number
          vh?: number
        }[]
        fromAnonId?: string
        fromGhLogin?: string
      }
      if (data.type === 'peers' && Array.isArray(data.peers)) {
        peers.value = mapPeers(data.peers, selfTabId, locale)
      }
      else if (data.type === 'peek' && typeof data.fromAnonId === 'string' && data.fromAnonId) {
        const from = data.fromAnonId
        const fromGh = typeof data.fromGhLogin === 'string' && data.fromGhLogin.trim()
          ? data.fromGhLogin.trim()
          : null
        const persona = personaFromAnonId(from)
        pushGhostPeekNotice({
          fromAnonId: from,
          fromGhLogin: fromGh || undefined,
          label: fromGh || persona.label(locale),
          emoji: persona.emoji,
          colorHex: persona.colorHex,
          avatarUrl: fromGh ? githubAvatarUrl(fromGh) : undefined,
        })
      }
    }
    catch {
      // ignore
    }
  })

  ws.addEventListener('close', () => {
    connected.value = false
    if (socket === ws)
      socket = null
    if (skipReconnect || !ghostEnabled.value || activePath !== path)
      return
    clearReconnect()
    reconnectTimer = setTimeout(() => {
      if (activePath === path && ghostEnabled.value)
        connect(path, locale, ghLogin)
    }, 2_000)
  })
}

/** Send a "peek" nudge to another tab (ghost mark click). */
export function sendGhostPeek(targetTabId: string): boolean {
  if (!socket || socket.readyState !== WebSocket.OPEN)
    return false
  if (!targetTabId || targetTabId === selfTabId)
    return false
  try {
    socket.send(JSON.stringify({ type: 'peek', target: targetTabId }))
    return true
  }
  catch {
    return false
  }
}

function sendPresence(force = false) {
  if (!socket || socket.readyState !== WebSocket.OPEN)
    return
  syncSelfViewport()
  const p = quantize(measureArticleProgress())
  const x = localX < 0 ? -1 : quantize(localX, POINTER_QUANTIZE_STEPS)
  const y = localY < 0 ? -1 : quantize(localY, POINTER_QUANTIZE_STEPS)
  const vw = selfViewport.value.w
  const vh = selfViewport.value.h
  if (
    !force
    && p === lastSentP
    && x === lastSentX
    && y === lastSentY
    && vw === lastSentVw
    && vh === lastSentVh
  ) {
    return
  }
  lastSentP = p
  lastSentX = x
  lastSentY = y
  lastSentVw = vw
  lastSentVh = vh
  try {
    const payload: {
      type: 'presence'
      p: number
      vw: number
      vh: number
      x?: number
      y?: number
    } = { type: 'presence', p, vw, vh }
    if (x >= 0 && y >= 0) {
      payload.x = x
      payload.y = y
    }
    socket.send(JSON.stringify(payload))
  }
  catch {
    // ignore
  }
}

export function useGhostPresenceState() {
  hydrateGhostPref()
  const progressOnlyDevice = useGhostProgressOnlyDevice()

  // Auto mode: viewport-compatible peers → pointer (or edge arrow);
  // mismatched / unknown coords → progress marks on the header bar.
  // Touch / no-hover devices never project pointers — progress bar only.
  // Hysteresis on compatibility so borderline viewports don't flicker.
  const pointerCompat = new Map<string, boolean>()
  const pointerProjections = computed((): GhostPointerProjection[] => {
    void layoutTick.value
    if (progressOnlyDevice.value)
      return []
    const out: GhostPointerProjection[] = []
    for (const p of peers.value) {
      if (p.x < 0 || p.y < 0) {
        pointerCompat.delete(p.id)
        continue
      }
      const gap = viewportGap(p)
      const was = pointerCompat.get(p.id) ?? false
      const compatible = Number.isFinite(gap)
        && (was
          ? gap <= GHOST_VIEWPORT_MISMATCH + POINTER_COMPAT_EXIT_SLACK
          : gap <= GHOST_VIEWPORT_MISMATCH)
      pointerCompat.set(p.id, compatible)
      if (!compatible)
        continue
      const pos = projectContentPointer(p)
      if (!pos)
        continue
      out.push({
        id: p.id,
        anonId: p.anonId,
        label: p.label,
        colorHex: p.colorHex,
        emoji: p.emoji,
        avatarUrl: p.avatarUrl,
        left: pos.left,
        top: pos.top,
        edge: pos.edge,
        angle: pos.angle,
      })
    }
    return out
  })

  const pointerPeerIds = computed(() => new Set(pointerProjections.value.map(p => p.id)))

  const progressPeers = computed(() => {
    const shown = pointerPeerIds.value
    return peers.value.filter(p => !shown.has(p.id))
  })

  return {
    peers: readonly(peers),
    pointerProjections,
    progressPeers,
    connected: readonly(connected),
    ghostEnabled,
    selfViewport: readonly(selfViewport),
    otherCount: computed(() => peers.value.length),
    sendPeek: sendGhostPeek,
    setGhostEnabled(next: boolean) {
      ghostEnabled.value = next
    },
    toggleGhostEnabled() {
      ghostEnabled.value = !ghostEnabled.value
    },
  }
}

/**
 * Bind ghost WebSocket for the current article path.
 * Call once from GhostPresenceRail (ClientOnly).
 */
export function useGhostPresenceSession(pagePath: Ref<string>, locale: Ref<string>) {
  hydrateGhostPref()

  if (typeof window === 'undefined') {
    return useGhostPresenceState()
  }

  const { user } = useGitHubAuth()
  const { presenceAsAnon } = usePresenceAsAnon()
  const progressOnlyDevice = useGhostProgressOnlyDevice()
  const throttledPointer = useThrottleFn(() => sendPresence(false), GHOST_POINTER_THROTTLE_MS)

  const ghLogin = computed(() => {
    if (presenceAsAnon.value)
      return undefined
    return user.value?.login?.trim() || undefined
  })

  function reconnect() {
    if (!ghostEnabled.value || !pagePath.value)
      return
    connect(pagePath.value, locale.value, ghLogin.value)
  }

  function clearLocalPointer() {
    if (localX < 0 && localY < 0)
      return
    localX = -1
    localY = -1
    lastClientX = -1
    lastClientY = -1
    throttledPointer()
  }

  watch(progressOnlyDevice, (only) => {
    if (only)
      clearLocalPointer()
  }, { immediate: true })

  watch(
    [pagePath, ghostEnabled],
    ([path, enabled]) => {
      if (!path || !enabled) {
        teardownSocket()
        activePath = ''
        return
      }
      connect(path, locale.value, ghLogin.value)
    },
    { immediate: true },
  )

  // Persona reshuffle / GitHub↔anon switch — reconnect so peers see new identity.
  watch(anonIdRef, () => reconnect())
  watch(ghLogin, (next, prev) => {
    if (next === prev)
      return
    reconnect()
  })

  watch(locale, (loc) => {
    peers.value = peers.value.map((p) => {
      if (p.ghLogin)
        return { ...p, label: p.ghLogin }
      const persona = personaFromAnonId(p.anonId)
      return { ...p, label: persona.label(loc), colorHex: persona.colorHex, emoji: persona.emoji }
    })
  })

  useEventListener(window, 'scroll', () => {
    // Local projections update immediately; also resync + broadcast our
    // content-space pointer so peers track while we scroll (mouse still).
    bumpLayout()
    if (!progressOnlyDevice.value)
      resyncPointerFromClient()
    scheduleScrollPresenceSend()
  }, { passive: true })

  useEventListener(window, 'resize', () => {
    syncSelfViewport()
    bumpLayout()
    if (!progressOnlyDevice.value)
      resyncPointerFromClient()
    scheduleScrollPresenceSend()
  }, { passive: true })

  useEventListener(window, 'mousemove', (ev: MouseEvent) => {
    // Touch-primary devices have no cursor — never publish pointer coords.
    if (progressOnlyDevice.value)
      return
    lastClientX = ev.clientX
    lastClientY = ev.clientY
    const pos = pointerInContent(ev.clientX, ev.clientY)
    if (!pos) {
      // Outside article: clear pointer coords so peers don't see a stuck ghost.
      if (localX >= 0 || localY >= 0) {
        localX = -1
        localY = -1
        throttledPointer()
      }
      return
    }
    localX = pos.x
    localY = pos.y
    throttledPointer()
  }, { passive: true })

  useEventListener(document, 'visibilitychange', () => {
    if (document.visibilityState === 'visible' && activePath && ghostEnabled.value) {
      if (!socket || socket.readyState !== WebSocket.OPEN)
        connect(pagePath.value, locale.value)
      else
        sendPresence(true)
    }
  })

  onUnmounted(() => {
    if (scrollSendRaf && typeof window !== 'undefined') {
      window.cancelAnimationFrame(scrollSendRaf)
      scrollSendRaf = 0
    }
    teardownSocket()
    activePath = ''
  })

  return useGhostPresenceState()
}
