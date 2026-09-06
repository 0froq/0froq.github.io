export interface UseSeparatorOpacityOptions {
  sigma?: number
  minOpacity?: number
  maxOpacity?: number
  horizontalPadding?: number
}

/** Gaussian opacity on list separators from pointer distance to the row. */
export function useSeparatorOpacity(options: UseSeparatorOpacityOptions = {}) {
  const sigma = options.sigma ?? 56
  const minOpacity = options.minOpacity ?? 0.22
  const maxOpacity = options.maxOpacity ?? 0.82
  const horizontalPadding = options.horizontalPadding ?? 80

  const pointerX = ref(0)
  const pointerY = ref(0)
  const pointerActive = ref(false)
  const rowMap = new Map<number, HTMLElement>()
  const opacities = reactive(new Map<number, number>())
  let raf = 0

  function setRowRef(index: number, el: HTMLElement | null) {
    if (el) {
      rowMap.set(index, el)
    }
    else {
      rowMap.delete(index)
      opacities.delete(index)
    }
  }

  function getOpacity(index: number) {
    return opacities.get(index) ?? minOpacity
  }

  function influence(el: HTMLElement) {
    if (!pointerActive.value)
      return minOpacity
    const rect = el.getBoundingClientRect()
    const withinX
      = pointerX.value >= rect.left - horizontalPadding
        && pointerX.value <= rect.right + horizontalPadding
    if (!withinX)
      return minOpacity
    const dy = pointerY.value - (rect.top + rect.height / 2)
    const g = Math.exp(-(dy * dy) / (2 * sigma * sigma))
    return minOpacity + (maxOpacity - minOpacity) * g
  }

  function update() {
    for (const [index, el] of rowMap)
      opacities.set(index, influence(el))
  }

  function refresh() {
    if (import.meta.server)
      return
    if (raf)
      cancelAnimationFrame(raf)
    raf = requestAnimationFrame(() => {
      raf = 0
      update()
    })
  }

  function onMove(event: PointerEvent) {
    pointerActive.value = true
    pointerX.value = event.clientX
    pointerY.value = event.clientY
  }

  function onLeave() {
    pointerActive.value = false
    refresh()
  }

  watch([pointerX, pointerY, pointerActive], refresh)

  onMounted(() => {
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerleave', onLeave, { passive: true })
    window.addEventListener('scroll', refresh, { passive: true, capture: true })
    window.addEventListener('resize', refresh, { passive: true })
    refresh()
  })

  onUpdated(refresh)

  onBeforeUnmount(() => {
    window.removeEventListener('pointermove', onMove)
    window.removeEventListener('pointerleave', onLeave)
    window.removeEventListener('scroll', refresh, { capture: true })
    window.removeEventListener('resize', refresh)
    if (raf)
      cancelAnimationFrame(raf)
    rowMap.clear()
    opacities.clear()
  })

  return { setRowRef, getOpacity, refresh }
}
