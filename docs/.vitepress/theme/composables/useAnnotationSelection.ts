import type { Ref } from 'vue'
import type { AnnotationAnchor } from '../types/annotation'
import type { ShortcutContext } from './useKeyboardShortcuts'
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useAnnotationStore } from '../stores/annotation'
import { computeAnchor } from '../utils/annotationFingerprint'
import { useAnnotationHighlight } from './useAnnotationHighlight'
import { useGitHubAuth } from './useGitHubAuth'
import { useKeyboardShortcuts } from './useKeyboardShortcuts'

/**
 * Text selection → pending anchor; `/` opens popover.
 */
export function useAnnotationSelection(options: {
  pendingAnchor: Ref<AnnotationAnchor | null>
  onOpenPopover: () => void
  onClearPopover: () => void
}) {
  const store = useAnnotationStore()
  const { isAuthenticating } = useGitHubAuth()
  const {
    hitTestHighlight,
    highlightPendingRange,
    clearPendingHighlight,
  } = useAnnotationHighlight()
  const { register, unregister } = useKeyboardShortcuts()

  const selectionRect = ref<DOMRect | null>(null)
  const showPopover = ref(false)
  const pendingRange = ref<Range | null>(null)
  const pendingText = ref<string>('')

  let openHandler: () => void | boolean
  let escHandler: (e: KeyboardEvent, ctx: ShortcutContext) => void | boolean

  function clearSelectionState() {
    if (!isAuthenticating.value) {
      showPopover.value = false
      selectionRect.value = null
      options.pendingAnchor.value = null
      pendingRange.value = null
      pendingText.value = ''
      clearPendingHighlight()
      options.onClearPopover()
    }
  }

  function openPopover() {
    if (!options.pendingAnchor.value || !pendingRange.value || !selectionRect.value)
      return
    clearPendingHighlight()
    showPopover.value = true
    options.onOpenPopover()
  }

  function handleMouseUp(e: MouseEvent) {
    const target = e.target as HTMLElement
    if (target.closest('.annotation-popover'))
      return
    if (isAuthenticating.value)
      return
    if (store.annotations.length && hitTestHighlight(e.clientX, e.clientY))
      return

    setTimeout(() => {
      const sel = window.getSelection()
      if (!sel || sel.isCollapsed) {
        clearSelectionState()
        return
      }

      const content = document.getElementById('content')
      if (!content)
        return
      const anchorInContent = sel.anchorNode && content.contains(sel.anchorNode)
      const focusInContent = sel.focusNode && content.contains(sel.focusNode)
      if (!anchorInContent || !focusInContent) {
        clearSelectionState()
        return
      }

      const selected = sel.toString().trim()
      if (!selected) {
        clearSelectionState()
        return
      }

      const range = sel.getRangeAt(0)
      const rect = range.getBoundingClientRect()
      if (rect.width > 0 && rect.height > 0) {
        options.pendingAnchor.value = computeAnchor(sel)
        pendingRange.value = range.cloneRange()
        pendingText.value = selected
        selectionRect.value = rect
        highlightPendingRange(range)
      }
    }, 10)
  }

  /** Click existing highlight → re-select text and open annotate popover. */
  function prepareFromRange(range: Range) {
    const sel = window.getSelection()
    if (sel) {
      sel.removeAllRanges()
      sel.addRange(range)
    }
    options.pendingAnchor.value = computeAnchor(sel as Selection)
    pendingRange.value = range
    pendingText.value = range.toString()
    selectionRect.value = range.getBoundingClientRect()
    clearPendingHighlight()
    showPopover.value = true
  }

  function closePopoverUi() {
    showPopover.value = false
    selectionRect.value = null
    options.pendingAnchor.value = null
    pendingRange.value = null
    pendingText.value = ''
    clearPendingHighlight()
  }

  function bindSelectionLifecycle() {
    onMounted(() => {
      document.addEventListener('mouseup', handleMouseUp)

      openHandler = () => {
        openPopover()
        return true
      }
      register('slash', openHandler)

      escHandler = (_e, ctx) => {
        if (ctx.isAnnotationPopover)
          return false
        clearSelectionState()
        return true
      }
      register('escape', escHandler)
    })

    onBeforeUnmount(() => {
      document.removeEventListener('mouseup', handleMouseUp)
      if (openHandler)
        unregister('slash', openHandler)
      if (escHandler)
        unregister('escape', escHandler)
      clearPendingHighlight()
    })
  }

  return {
    selectionRect,
    showPopover,
    pendingRange,
    pendingText,
    clearSelectionState,
    openPopover,
    prepareFromRange,
    closePopoverUi,
    bindSelectionLifecycle,
    clearPendingHighlight,
  }
}
