import { useMediaQuery } from '@vueuse/core'
import type { Breakpoint } from '~/utils/breakpoints'
import { mqMax, mqMin } from '~/utils/breakpoints'

export function useMin(bp: Breakpoint) {
  return useMediaQuery(mqMin(bp))
}

export function useMax(bp: Breakpoint) {
  return useMediaQuery(mqMax(bp))
}
