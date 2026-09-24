import type { ComputedRef, InjectionKey, ShallowRef } from 'vue'
import type { LayerEntry } from '~/utils/issueList'
import { navigateTo } from '#app'

export type PeekActivate = 'pass' | 'pin' | 'open'

export interface PublicationPeek {
  active: ShallowRef<LayerEntry | null>
  pinned: ShallowRef<LayerEntry | null>
  shown: ComputedRef<LayerEntry | null>
  hover: (entry: LayerEntry) => void
  leave: () => void
  pin: (entry: LayerEntry) => void
  dismiss: () => void
  isPinned: (entry: LayerEntry) => boolean
  isShown: (entry: LayerEntry) => boolean
  activate: (entry: LayerEntry, event: MouseEvent) => PeekActivate
}

export const publicationPeekKey: InjectionKey<PublicationPeek> = Symbol.for('froq.publicationPeek')

export function createPublicationPeek(): PublicationPeek {
  const active = shallowRef<LayerEntry | null>(null)
  const pinned = shallowRef<LayerEntry | null>(null)
  const shown = computed(() => pinned.value ?? active.value)
  const route = useRoute()
  const { remember } = useIssueArticleReturn()
  const hoverShowMs = 180
  let hoverTimer = 0
  let pending: LayerEntry | null = null

  function clearHoverTimer() {
    if (hoverTimer) {
      window.clearTimeout(hoverTimer)
      hoverTimer = 0
    }
    pending = null
  }

  function hover(entry: LayerEntry) {
    if (active.value?.path === entry.path) {
      if (pending)
        clearHoverTimer()
      return
    }
    if (pending?.path === entry.path)
      return
    pending = entry
    if (hoverTimer)
      window.clearTimeout(hoverTimer)
    hoverTimer = window.setTimeout(() => {
      hoverTimer = 0
      const next = pending
      pending = null
      if (next)
        active.value = next
    }, hoverShowMs)
  }

  function leave() {
    clearHoverTimer()
    active.value = null
  }

  function pin(entry: LayerEntry) {
    clearHoverTimer()
    pinned.value = entry
  }

  function dismiss() {
    clearHoverTimer()
    pinned.value = null
    active.value = null
  }

  function isPinned(entry: LayerEntry) {
    return pinned.value?.path === entry.path
  }

  function isShown(entry: LayerEntry) {
    return shown.value?.path === entry.path
  }

  function activate(entry: LayerEntry, event: MouseEvent): PeekActivate {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0)
      return 'pass'
    if (isPinned(entry)) {
      remember(route.fullPath)
      event.preventDefault()
      event.stopImmediatePropagation()
      void navigateTo(entry.path)
      return 'open'
    }
    event.preventDefault()
    event.stopImmediatePropagation()
    pin(entry)
    return 'pin'
  }

  function onKey(event: KeyboardEvent) {
    if (event.key === 'Escape')
      dismiss()
  }

  onMounted(() => {
    window.addEventListener('keydown', onKey)
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', onKey)
    dismiss()
  })

  return {
    active,
    pinned,
    shown,
    hover,
    leave,
    pin,
    dismiss,
    isPinned,
    isShown,
    activate,
  }
}

export function providePublicationPeek() {
  const peek = createPublicationPeek()
  provide(publicationPeekKey, peek)
  return peek
}

export function usePublicationPeek() {
  const peek = inject(publicationPeekKey)
  if (!peek)
    throw new Error('usePublicationPeek() needs PublicationHubShell')
  return peek
}
