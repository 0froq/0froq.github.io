import { useMediaQuery } from '@vueuse/core'
import { computed } from 'vue'

/**
 * Primary input can hover (mouse / trackpad).
 * False on typical phones & tablets — prefer tap / always-visible chrome.
 */
export function useCanHover() {
  const canHover = useMediaQuery('(hover: hover) and (pointer: fine)')
  /** No cursor / coarse pointer — progress-only ghosts, no hover-gated UI. */
  const touchLike = computed(() => !canHover.value)
  return { canHover, touchLike }
}
