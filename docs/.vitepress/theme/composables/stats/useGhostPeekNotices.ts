import { ref } from 'vue'

export type GhostPeekKind = 'peek' | 'poke' | 'disturb' | 'annoy'

export interface GhostPeekNotice {
  id: number
  kind: GhostPeekKind
  /** Peer identity (poker for peek/disturb; pokee for poke/annoy). */
  fromAnonId: string
  fromGhLogin?: string
  label: string
  emoji: string
  colorHex: string
  avatarUrl?: string
  /** Epoch ms — auto-expire. */
  at: number
}

export interface GhostPeekNoticeInput {
  kind?: GhostPeekKind
  fromAnonId: string
  fromGhLogin?: string
  label: string
  emoji: string
  colorHex: string
  avatarUrl?: string
}

const notices = ref<GhostPeekNotice[]>([])
let seq = 0
const TTL_MS = 4200
const DISTURB_TTL_MS = 5600

/** Same identity poked this many times within the window → disturb / annoy. */
export const PEEK_BURST_COUNT = 5
export const PEEK_BURST_WINDOW_MS = 20_000
const peekBurstAt = new Map<string, number[]>()
/** Poker-side burst clock keyed by target identity. */
const pokeBurstAt = new Map<string, number[]>()

const SHAKE_MS = 620
let shakeTimer: ReturnType<typeof setTimeout> | null = null

export function triggerGhostShake(): void {
  if (typeof document === 'undefined')
    return
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches)
    return
  const root = document.documentElement
  root.classList.remove('ghost-peek-shake')
  // Force restart when already shaking.
  void root.offsetWidth
  root.classList.add('ghost-peek-shake')
  if (shakeTimer)
    clearTimeout(shakeTimer)
  shakeTimer = setTimeout(() => {
    root.classList.remove('ghost-peek-shake')
    shakeTimer = null
  }, SHAKE_MS)
}

function burstKey(input: Pick<GhostPeekNoticeInput, 'fromAnonId' | 'fromGhLogin'>): string {
  const gh = input.fromGhLogin?.trim().toLowerCase()
  return gh ? `gh:${gh}` : `anon:${input.fromAnonId}`
}

function pushNotice(kind: GhostPeekKind, input: GhostPeekNoticeInput, at: number): void {
  const id = ++seq
  notices.value = [...notices.value, { ...input, kind, id, at }]
}

/** Called when a peer taps our ghost mark, or when we poke someone. */
export function pushGhostPeekNotice(input: GhostPeekNoticeInput): void {
  const kind = input.kind ?? 'peek'
  const now = Date.now()

  if (kind === 'peek') {
    const key = burstKey(input)
    const times = (peekBurstAt.get(key) ?? []).filter(t => now - t < PEEK_BURST_WINDOW_MS)
    times.push(now)
    peekBurstAt.set(key, times)
    if (times.length >= PEEK_BURST_COUNT) {
      peekBurstAt.set(key, [])
      pushNotice('disturb', input, now)
      triggerGhostShake()
      return
    }
  }

  if (kind === 'poke') {
    const key = burstKey(input)
    const times = (pokeBurstAt.get(key) ?? []).filter(t => now - t < PEEK_BURST_WINDOW_MS)
    times.push(now)
    pokeBurstAt.set(key, times)
    pushNotice('poke', input, now)
    if (times.length >= PEEK_BURST_COUNT) {
      pokeBurstAt.set(key, [])
      pushNotice('annoy', input, now)
    }
    return
  }

  pushNotice(kind, input, now)
}

export function dismissGhostPeekNotice(id: number): void {
  notices.value = notices.value.filter(n => n.id !== id)
}

export function noticeTtlMs(n: Pick<GhostPeekNotice, 'kind'>): number {
  return n.kind === 'disturb' || n.kind === 'annoy' ? DISTURB_TTL_MS : TTL_MS
}

export function useGhostPeekNotices() {
  return {
    notices,
    push: pushGhostPeekNotice,
    dismiss: dismissGhostPeekNotice,
    ttlMs: TTL_MS,
    noticeTtlMs,
  }
}
