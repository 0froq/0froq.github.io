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
    // 打开评论框时才把选区标成 pending（绿色）高亮；此前仅显示系统选区
    highlightPendingRange(pendingRange.value)
    showPopover.value = true
    options.onOpenPopover()
  }

  function syncFromSelection() {
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
      // 不再立即 highlightPendingRange：选中时只显示系统选区 + 工具条，
      // 绿色 pending 高亮只在打开评论框时出现
    }
  }

  /** 鼠标是否按下（选区进行中）。进行中不更新工具条位置，避免跟随闪烁。 */
  const isMouseDown = ref(false)

  function handleMouseDown(e: MouseEvent) {
    const target = e.target as HTMLElement
    if (target.closest('.annotation-popover'))
      return
    isMouseDown.value = true
  }

  /**
   * 选区变化（拖动选择过程中持续触发）→ 实时更新工具条位置/内容。
   *  工具栏在选区进行中带 user-select:none + pointer-events:none，
   *  不会被选区延伸或鼠标命中，因此可以安全地实时跟随。
   */
  function handleSelectionChange() {
    if (isAuthenticating.value || showPopover.value)
      return
    syncFromSelection()
  }

  /**
   * 滚动/缩放时选区的 viewport 坐标变化，需用 pendingRange 重算 rect，
   *  否则 fixed 定位的工具条会固定在屏幕上不跟随内容滚动。
   */
  function refreshRectFromRange() {
    if (!pendingRange.value)
      return
    try {
      selectionRect.value = pendingRange.value.getBoundingClientRect()
    }
    catch { /* range 失效 */ }
  }

  function handleMouseUp(e: MouseEvent) {
    isMouseDown.value = false
    const target = e.target as HTMLElement
    if (target.closest('.annotation-popover'))
      return
    if (isAuthenticating.value)
      return
    if (store.annotations.length && hitTestHighlight(e.clientX, e.clientY))
      return

    setTimeout(syncFromSelection, 10)
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
      document.addEventListener('mousedown', handleMouseDown)
      document.addEventListener('mouseup', handleMouseUp)
      document.addEventListener('selectionchange', handleSelectionChange)
      window.addEventListener('scroll', refreshRectFromRange, true)
      window.addEventListener('resize', refreshRectFromRange)

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
      document.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('selectionchange', handleSelectionChange)
      window.removeEventListener('scroll', refreshRectFromRange, true)
      window.removeEventListener('resize', refreshRectFromRange)
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
