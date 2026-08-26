import { clearSelectionInk, paintSelectionInk } from '~/utils/roughInk'

const SKIP = 'input, textarea, select, [contenteditable]:not([contenteditable="false"])'

export default defineNuxtPlugin((nuxtApp) => {
  let frame = 0

  function paint(): void {
    frame = 0
    const sel = window.getSelection()
    if (!sel || sel.isCollapsed || sel.rangeCount === 0) {
      clearSelectionInk()
      return
    }

    const node = sel.anchorNode
    const host = node?.nodeType === Node.ELEMENT_NODE
      ? node as Element
      : node?.parentElement
    if (host?.closest(SKIP)) {
      clearSelectionInk()
      return
    }

    const range = sel.getRangeAt(0)
    if (!(range.toString() || '').trim() || !paintSelectionInk(range))
      clearSelectionInk()
  }

  function schedule(): void {
    if (frame)
      return
    frame = requestAnimationFrame(paint)
  }

  nuxtApp.hook('app:mounted', () => {
    document.addEventListener('selectionchange', schedule)
    window.addEventListener('resize', schedule, { passive: true })
    window.visualViewport?.addEventListener('resize', schedule)
  })

  nuxtApp.hook('page:finish', schedule)
})
