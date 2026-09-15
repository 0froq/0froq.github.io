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

  function hover(entry: LayerEntry) {
    active.value = entry
  }

  function leave() {
    active.value = null
  }

  function pin(entry: LayerEntry) {
    pinned.value = entry
  }

  function dismiss() {
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
