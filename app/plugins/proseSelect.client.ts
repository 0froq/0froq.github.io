import { hostOf, SELECTABLE, SELECTABLE_SKIP } from '~/utils/selectable'

function confineSelection() {
  const sel = window.getSelection()
  if (!sel || sel.rangeCount === 0 || sel.isCollapsed)
    return
  const anchor = hostOf(sel.anchorNode)
  if (anchor?.closest(SELECTABLE_SKIP))
    return
  const anchorProse = anchor?.closest(SELECTABLE)
  const focusProse = hostOf(sel.focusNode)?.closest(SELECTABLE)
  if (anchorProse && anchorProse === focusProse)
    return
  if (!anchorProse && !focusProse) {
    sel.removeAllRanges()
    return
  }
  const root = (anchorProse ?? focusProse)!
  const range = sel.getRangeAt(0)
  const allowed = document.createRange()
  allowed.selectNodeContents(root)
  try {
    if (range.compareBoundaryPoints(Range.START_TO_START, allowed) < 0)
      range.setStart(allowed.startContainer, allowed.startOffset)
    if (range.compareBoundaryPoints(Range.END_TO_END, allowed) > 0)
      range.setEnd(allowed.endContainer, allowed.endOffset)
  }
  catch {
    sel.removeAllRanges()
  }
}

export default defineNuxtPlugin(() => {
  if (!import.meta.client)
    return
  document.addEventListener('selectionchange', confineSelection)
})
