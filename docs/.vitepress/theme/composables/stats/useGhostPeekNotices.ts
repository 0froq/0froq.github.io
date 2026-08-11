import { ref } from 'vue'

export interface GhostPeekNotice {
  id: number
  fromAnonId: string
  fromGhLogin?: string
  label: string
  emoji: string
  colorHex: string
  avatarUrl?: string
  /** Epoch ms — auto-expire. */
  at: number
}

const notices = ref<GhostPeekNotice[]>([])
let seq = 0
const TTL_MS = 4200

/** Called when a peer taps our ghost mark. */
export function pushGhostPeekNotice(input: Omit<GhostPeekNotice, 'id' | 'at'>): void {
  const id = ++seq
  notices.value = [...notices.value, { ...input, id, at: Date.now() }]
}

export function dismissGhostPeekNotice(id: number): void {
  notices.value = notices.value.filter(n => n.id !== id)
}

export function useGhostPeekNotices() {
  return {
    notices,
    push: pushGhostPeekNotice,
    dismiss: dismissGhostPeekNotice,
    ttlMs: TTL_MS,
  }
}
