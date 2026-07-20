import { defaultWindow, useEventListener, useMouse } from '@vueuse/core'
import {
  onBeforeUnmount,
  onMounted,
  onUpdated,
  reactive,
  ref,
  watch,
} from 'vue'

export interface UseSeparatorOpacityOptions {
  /**
   * Gaussian spread parameter (px).
   * Controls how quickly opacity fades with distance from the row center.
   * @default 56
   */
  sigma?: number
  /**
   * Minimum (base) opacity when pointer is far away.
   * @default 0.08
   */
  minOpacity?: number
  /**
   * Maximum opacity when pointer is directly over the row.
   * @default 0.72
   */
  maxOpacity?: number
  /**
   * Horizontal padding (px) for hit-testing.
   * Rows outside this margin from the pointer's X position are ignored.
   * @default 80
   */
  horizontalPadding?: number
  /**
   * Additional custom event names to listen for that trigger a refresh.
   * Useful for cross-component coordination (e.g., accordion expand/collapse).
   * @default []
   */
  refreshEvents?: string[]
}

/**
 * Composable for calculating separator opacity based on pointer distance.
 *
 * Supports two usage modes:
 * - **Single-row**: call `setRowRef(0, el)` once, read `opacity` ref.
 * - **Multi-row**: call `setRowRef(index, el)` for each row, read `opacities` array.
 */
export function useSeparatorOpacity(options: UseSeparatorOpacityOptions = {}) {
  const {
    sigma = 56,
    minOpacity = 0.08,
    maxOpacity = 0.72,
    horizontalPadding = 80,
    refreshEvents = [],
  } = options

  const { x: pointerX, y: pointerY } = useMouse({
    type: 'client',
    touch: false,
  })
  const pointerActive = ref(false)

  const rowMap = new Map<number, HTMLElement>()
  const opacities = reactive<Map<number, number>>(new Map())
  const opacity = ref(minOpacity) // convenience ref for single-row usage

  let refreshRafId: number | null = null

  function setRowRef(index: number, el: HTMLElement | null) {
    if (el) {
      rowMap.set(index, el)
    }
    else {
      rowMap.delete(index)
      opacities.delete(index)
    }
  }

  function getOpacity(index: number): number {
    return opacities.get(index) ?? minOpacity
  }

  function calculateInfluence(el: HTMLElement): number {
    if (!pointerActive.value)
      return minOpacity

    const rect = el.getBoundingClientRect()
    const withinX
      = pointerX.value >= rect.left - horizontalPadding
        && pointerX.value <= rect.right + horizontalPadding

    if (!withinX)
      return minOpacity

    const centerY = rect.top + rect.height / 2
    const dy = pointerY.value - centerY
    const influence = Math.exp(-(dy * dy) / (2 * sigma * sigma))
    return minOpacity + (maxOpacity - minOpacity) * influence
  }

  function updateOpacities() {
    // Single-row fast path
    if (rowMap.size === 1) {
      const el = rowMap.values().next().value
      if (el) {
        const val = calculateInfluence(el)
        opacity.value = val
        opacities.set(0, val)
      }
      return
    }

    // Multi-row
    for (const [index, el] of rowMap) {
      const val = calculateInfluence(el)
      opacities.set(index, val)
    }

    // Also update single-row convenience ref if row 0 exists
    if (rowMap.has(0)) {
      opacity.value = opacities.get(0) ?? minOpacity
    }
  }

  function scheduleRefresh() {
    if (!defaultWindow)
      return
    if (refreshRafId != null)
      defaultWindow.cancelAnimationFrame(refreshRafId)
    refreshRafId = defaultWindow.requestAnimationFrame(() => {
      refreshRafId = null
      updateOpacities()
    })
  }

  // Pointer tracking
  watch([pointerX, pointerY, pointerActive], () => {
    scheduleRefresh()
  })

  useEventListener(
    defaultWindow,
    'pointermove',
    () => {
      pointerActive.value = true
    },
    { passive: true },
  )

  useEventListener(
    defaultWindow,
    'pointerleave',
    () => {
      pointerActive.value = false
    },
    { passive: true },
  )

  useEventListener(
    defaultWindow,
    'scroll',
    () => {
      scheduleRefresh()
    },
    { passive: true, capture: true },
  )

  useEventListener(
    defaultWindow,
    'resize',
    () => {
      scheduleRefresh()
    },
    { passive: true },
  )

  // Custom refresh events
  for (const eventName of refreshEvents) {
    useEventListener(defaultWindow, eventName, () => {
      scheduleRefresh()
    })
  }

  onMounted(() => {
    scheduleRefresh()
  })

  onUpdated(() => {
    scheduleRefresh()
  })

  onBeforeUnmount(() => {
    if (refreshRafId != null && defaultWindow) {
      defaultWindow.cancelAnimationFrame(refreshRafId)
      refreshRafId = null
    }
    rowMap.clear()
    opacities.clear()
  })

  return {
    /** Register/unregister a row element at the given index. */
    setRowRef,
    /** Get the current opacity for a specific row index. */
    getOpacity,
    /** Reactive opacity for single-row usage (index 0). */
    opacity,
    /** Reactive map of opacities for multi-row usage. */
    opacities,
    /** Force an immediate refresh (debounced via RAF). */
    refresh: scheduleRefresh,
  }
}
