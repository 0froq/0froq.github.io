import type { VisitorNote, VisitorNoteColor } from '../types/visitorNote'
import { useDebounceFn } from '@vueuse/core'
import { useRoute } from 'vitepress'
import { computed, ref, shallowRef, watch } from 'vue'
import {
  VISITOR_NOTE_DEFAULT_HEIGHT,
  VISITOR_NOTE_DEFAULT_WIDTH,
  VISITOR_NOTE_MIN_HEIGHT,
  VISITOR_NOTE_MIN_WIDTH,
  VISITOR_NOTES_MAX_PER_PATH,
  VISITOR_NOTES_STORAGE_PREFIX,
  normalizeNoteColor,
  randomNoteColor,
} from '../types/visitorNote'

const SLASHES_RE = /^\/+|\/+$/g

export function normalizeVisitorNotesPath(path: string): string {
  let p = path.replace(SLASHES_RE, '')
  if (!p)
    p = 'index'
  return p
}

function storageKey(pagePath: string): string {
  return `${VISITOR_NOTES_STORAGE_PREFIX}${pagePath}`
}

function canUseStorage(): boolean {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined'
}

function clamp01(n: number): number {
  return Math.min(1, Math.max(0, n))
}

/** Pixel → fraction of the movable range (so right-edge notes stay on the right). */
export function pxToRatio(
  x: number,
  y: number,
  noteW: number,
  noteH: number,
  shellW: number,
  shellH: number,
): { xr: number, yr: number } {
  const availW = Math.max(1, shellW - noteW)
  const availH = Math.max(1, shellH - noteH)
  return {
    xr: clamp01(x / availW),
    yr: clamp01(y / availH),
  }
}

/** Fraction of movable range → clamped pixels for the current shell. */
export function ratioToPx(
  xr: number,
  yr: number,
  noteW: number,
  noteH: number,
  shellW: number,
  shellH: number,
): { x: number, y: number } {
  const availW = Math.max(0, shellW - noteW)
  const availH = Math.max(0, shellH - noteH)
  return {
    x: clamp01(xr) * availW,
    y: clamp01(yr) * availH,
  }
}

export function measureShell(shell: HTMLElement): { w: number, h: number } {
  const rect = shell.getBoundingClientRect()
  return {
    w: rect.width,
    h: Math.max(rect.height, shell.scrollHeight),
  }
}

function parseNotes(raw: string | null): VisitorNote[] {
  if (!raw)
    return []
  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed))
      return []
    return parsed.map(normalizeNote).filter((n): n is VisitorNote => n !== null)
  }
  catch {
    return []
  }
}

/** Tolerate older payloads (missing h/color/xr/yr) when hydrating. */
function normalizeNote(value: unknown): VisitorNote | null {
  if (!value || typeof value !== 'object')
    return null
  const n = value as Record<string, unknown>
  if (typeof n.id !== 'string'
    || typeof n.x !== 'number'
    || typeof n.y !== 'number'
    || typeof n.text !== 'string')
    return null
  const w = typeof n.w === 'number' ? n.w : VISITOR_NOTE_DEFAULT_WIDTH
  const h = typeof n.h === 'number' ? n.h : VISITOR_NOTE_DEFAULT_HEIGHT
  // Legacy notes only have pixels — ratios filled in on first shell layout.
  const xr = typeof n.xr === 'number' ? clamp01(n.xr) : -1
  const yr = typeof n.yr === 'number' ? clamp01(n.yr) : -1
  return {
    id: n.id,
    x: n.x,
    y: n.y,
    xr,
    yr,
    w,
    h,
    text: n.text,
    color: normalizeNoteColor(n.color),
    z: typeof n.z === 'number' ? n.z : 0,
    updatedAt: typeof n.updatedAt === 'string' ? n.updatedAt : new Date().toISOString(),
  }
}

function loadNotes(pagePath: string): VisitorNote[] {
  if (!canUseStorage())
    return []
  return parseNotes(localStorage.getItem(storageKey(pagePath)))
}

function writeNotes(pagePath: string, notes: VisitorNote[]): void {
  if (!canUseStorage())
    return
  localStorage.setItem(storageKey(pagePath), JSON.stringify(notes))
}

function nextId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function')
    return crypto.randomUUID()
  return `note-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

/**
 * Page-scoped visitor sticky notes (localStorage).
 * Mount once under ClientOnly; watches route.path for hydrate.
 * Position source of truth is xr/yr (ratios of movable range).
 */
export function useVisitorNotes() {
  const route = useRoute()
  const notes = shallowRef<VisitorNote[]>([])
  const limitReached = ref(false)
  let zCounter = 0

  const pagePath = computed(() => normalizeVisitorNotesPath(route.path))

  function persist(): void {
    writeNotes(pagePath.value, notes.value)
  }

  const persistDebounced = useDebounceFn(() => {
    persist()
  }, 300)

  function hydrate(): void {
    const list = loadNotes(pagePath.value)
    zCounter = list.reduce((max, n) => Math.max(max, n.z), 0)
    notes.value = list
    limitReached.value = false
  }

  function patchNote(id: string, patch: Partial<VisitorNote>, options?: { debounce?: boolean }): void {
    const idx = notes.value.findIndex(n => n.id === id)
    if (idx === -1)
      return
    const next = notes.value.slice()
    next[idx] = {
      ...next[idx]!,
      ...patch,
      updatedAt: new Date().toISOString(),
    }
    notes.value = next
    if (options?.debounce)
      persistDebounced()
    else
      persist()
  }

  function createNote(x: number, y: number, shellW: number, shellH: number): VisitorNote | null {
    if (notes.value.length >= VISITOR_NOTES_MAX_PER_PATH) {
      limitReached.value = true
      return null
    }
    limitReached.value = false
    zCounter += 1
    const w = VISITOR_NOTE_DEFAULT_WIDTH
    const h = VISITOR_NOTE_DEFAULT_HEIGHT
    const { xr, yr } = pxToRatio(x, y, w, h, shellW, shellH)
    const px = ratioToPx(xr, yr, w, h, shellW, shellH)
    const note: VisitorNote = {
      id: nextId(),
      x: px.x,
      y: px.y,
      xr,
      yr,
      w,
      h,
      text: '',
      color: randomNoteColor(),
      z: zCounter,
      updatedAt: new Date().toISOString(),
    }
    notes.value = [...notes.value, note]
    persist()
    return note
  }

  function updateText(id: string, text: string): void {
    patchNote(id, { text }, { debounce: true })
  }

  /** Persist a drag end: pixels + ratios for the current shell. */
  function updatePosition(id: string, x: number, y: number, shellW: number, shellH: number): void {
    const note = notes.value.find(n => n.id === id)
    if (!note)
      return
    const { xr, yr } = pxToRatio(x, y, note.w, note.h, shellW, shellH)
    const px = ratioToPx(xr, yr, note.w, note.h, shellW, shellH)
    patchNote(id, { x: px.x, y: px.y, xr, yr })
  }

  function updateSize(id: string, w: number, h: number, shellW: number, shellH: number): void {
    const note = notes.value.find(n => n.id === id)
    if (!note)
      return
    const nextW = Math.max(VISITOR_NOTE_MIN_WIDTH, Math.round(w))
    const nextH = Math.max(VISITOR_NOTE_MIN_HEIGHT, Math.round(h))
    // Keep the same ratio anchors; re-derive pixels so the note stays in bounds.
    const xr = note.xr >= 0 ? note.xr : pxToRatio(note.x, note.y, note.w, note.h, shellW, shellH).xr
    const yr = note.yr >= 0 ? note.yr : pxToRatio(note.x, note.y, note.w, note.h, shellW, shellH).yr
    const px = ratioToPx(xr, yr, nextW, nextH, shellW, shellH)
    patchNote(id, { w: nextW, h: nextH, x: px.x, y: px.y, xr, yr })
  }

  function updateColor(id: string, color: VisitorNoteColor): void {
    patchNote(id, { color })
  }

  function bringToFront(id: string): void {
    zCounter += 1
    patchNote(id, { z: zCounter })
  }

  function removeNote(id: string): void {
    notes.value = notes.value.filter(n => n.id !== id)
    limitReached.value = false
    persist()
  }

  function clearAllNotes(): void {
    notes.value = []
    limitReached.value = false
    persist()
  }

  function clearLimitHint(): void {
    limitReached.value = false
  }

  /**
   * Recompute pixel x/y from xr/yr for the current shell.
   * Migrates legacy notes (xr/yr === -1) from their stored pixels once.
   */
  function relayoutToShell(shellW: number, shellH: number): void {
    let changed = false
    const next = notes.value.map((n) => {
      let { xr, yr } = n
      if (xr < 0 || yr < 0) {
        const r = pxToRatio(n.x, n.y, n.w, n.h, shellW, shellH)
        xr = r.xr
        yr = r.yr
        changed = true
      }
      const px = ratioToPx(xr, yr, n.w, n.h, shellW, shellH)
      if (px.x !== n.x || px.y !== n.y || xr !== n.xr || yr !== n.yr) {
        changed = true
        return { ...n, x: px.x, y: px.y, xr, yr }
      }
      return n
    })
    if (!changed)
      return
    notes.value = next
    persist()
  }

  watch(() => route.path, () => {
    hydrate()
  }, { immediate: true })

  return {
    notes,
    pagePath,
    limitReached,
    maxPerPath: VISITOR_NOTES_MAX_PER_PATH,
    createNote,
    updateText,
    updatePosition,
    updateSize,
    updateColor,
    bringToFront,
    removeNote,
    clearAllNotes,
    clearLimitHint,
    relayoutToShell,
    hydrate,
  }
}

/** Map viewport center into `.site-shell` local coordinates. */
export function viewportCenterInShell(shell: HTMLElement, noteW = VISITOR_NOTE_DEFAULT_WIDTH): { x: number, y: number } {
  const rect = shell.getBoundingClientRect()
  const shellLeft = rect.left + window.scrollX
  const shellTop = rect.top + window.scrollY
  return {
    x: window.scrollX + window.innerWidth / 2 - shellLeft - noteW / 2,
    y: window.scrollY + window.innerHeight / 2 - shellTop - 72,
  }
}

/** Clamp note top-left so the card stays inside the shell box. */
export function clampNotePosition(
  x: number,
  y: number,
  noteW: number,
  noteH: number,
  shellW: number,
  shellH: number,
): { x: number, y: number } {
  const maxX = Math.max(0, shellW - noteW)
  const maxY = Math.max(0, shellH - noteH)
  return {
    x: Math.min(Math.max(0, x), maxX),
    y: Math.min(Math.max(0, y), maxY),
  }
}
