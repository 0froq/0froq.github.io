/** Mirrors `theme.breakpoint` in `uno.config.mts`. */
export const breakpoints = {
  sm: 600,
  md: 760,
  lg: 1200,
} as const

export type Breakpoint = keyof typeof breakpoints

export function mqMin(bp: Breakpoint): string {
  return `(min-width: ${breakpoints[bp]}px)`
}

export function mqMax(bp: Breakpoint): string {
  return `(max-width: ${breakpoints[bp] - 1}px)`
}
