/**
 * Width cuts for layout. Same names as Uno `theme.breakpoint`.
 *
 * Vue/CSS: `sm:` `md:` `lg:` / `max-sm:` `max-md:` `max-lg:` on attributify
 * or `--uno`. Never raw pixel `@media` / `@screen`.
 * JS: `mqMin('lg')` / `mqMax('md')`, or `useMin` / `useMax` from
 * `composables/useViewport.ts`.
 *
 * Behavior (what must remain readable):
 * - sm (<600): one column. Gutters shrink. No sidenote rail, no side peek,
 *   no TOC. Footnotes stay in the article. Hub peek sits under the list.
 * - md (760–1199): still one column for reading. Type can step up. Hub
 *   chrome may tighten; peek still under the list. Do not split prose/notes.
 * - lg (≥1200): two-column reading is allowed only with a *fixed* note rail
 *   (`--read-rail`). Prose may grow up to `--read-prose` (800px). The pair
 *   (prose + gap + rail) never exceeds `--read-stage` (1000px). Hub list and
 *   peek sit side by side. TOC may appear. If the stage is narrower than
 *   prose+rail, prose shrinks; the rail does not collapse below `--read-rail`.
 */
export const breakpoints = {
  sm: 600,
  md: 760,
  lg: 1200,
} as const

export type Breakpoint = keyof typeof breakpoints

/** Reading measure, px. Keep in sync with `--read-*` in tokens.css. */
export const reading = {
  prose: 800,
  rail: 180,
  gap: 20,
  stage: 1000,
} as const

export function mqMin(bp: Breakpoint): string {
  return `(min-width: ${breakpoints[bp]}px)`
}

export function mqMax(bp: Breakpoint): string {
  return `(max-width: ${breakpoints[bp] - 1}px)`
}
