import { GHOST_IDLE_MS, GHOST_OWNER_GH } from './constants'
import { currentPresenceGhLogin } from './presenceIdentity'

type IdleCallback = () => void

let lastActivity = 0
let idleOffline = false
let checkTimer: ReturnType<typeof setInterval> | null = null
let listenersBound = false

const idleListeners = new Set<IdleCallback>()
const wakeListeners = new Set<IdleCallback>()

export function isOwnerGh(login?: string | null): boolean {
  return (login || '').trim().toLowerCase() === GHOST_OWNER_GH
}

export function isPresenceIdleOffline(): boolean {
  return idleOffline && !isOwnerGh(currentPresenceGhLogin())
}

function notifyIdle(): void {
  for (const cb of idleListeners) {
    try {
      cb()
    }
    catch {
      // ignore subscriber errors
    }
  }
}

function notifyWake(): void {
  for (const cb of wakeListeners) {
    try {
      cb()
    }
    catch {
      // ignore subscriber errors
    }
  }
}

export function bumpPresenceActivity(): void {
  lastActivity = Date.now()
  if (!idleOffline)
    return
  idleOffline = false
  notifyWake()
}

function checkIdle(): void {
  if (isOwnerGh(currentPresenceGhLogin())) {
    if (idleOffline) {
      idleOffline = false
      notifyWake()
    }
    return
  }
  if (!lastActivity)
    lastActivity = Date.now()
  if (Date.now() - lastActivity < GHOST_IDLE_MS)
    return
  if (idleOffline)
    return
  idleOffline = true
  notifyIdle()
}

function ensureListeners(): void {
  if (typeof window === 'undefined' || listenersBound)
    return
  listenersBound = true
  lastActivity = Date.now()
  const bump = () => bumpPresenceActivity()
  window.addEventListener('mousemove', bump, { passive: true })
  window.addEventListener('scroll', bump, { passive: true })
  window.addEventListener('keydown', bump, { passive: true })
  window.addEventListener('touchstart', bump, { passive: true })
  if (!checkTimer)
    checkTimer = setInterval(checkIdle, 30_000)
}

/**
 * Subscribe to shared presence idle/wake. Starts global activity listeners once.
 * Returns an unsubscribe function.
 */
export function subscribePresenceIdle(handlers: {
  onIdle?: IdleCallback
  onWake?: IdleCallback
}): () => void {
  ensureListeners()
  if (handlers.onIdle)
    idleListeners.add(handlers.onIdle)
  if (handlers.onWake)
    wakeListeners.add(handlers.onWake)
  return () => {
    if (handlers.onIdle)
      idleListeners.delete(handlers.onIdle)
    if (handlers.onWake)
      wakeListeners.delete(handlers.onWake)
  }
}

/** Read-only accessors for composables that need the flag without subscribing. */
export function usePresenceIdleState() {
  ensureListeners()
  return {
    isIdleOffline: isPresenceIdleOffline,
    bumpActivity: bumpPresenceActivity,
  }
}
