import { paintRoughInk } from '~/utils/roughInk'

export const STICKY_CURSOR_FIELD_SEL
  = 'input, textarea, select, [contenteditable]:not([contenteditable="false"])'

export const STICKY_CURSOR_HOT_SEL = [
  'a[href]',
  'button:not([disabled])',
  '[role="button"]',
  'summary',
  'label[for]',
  '[un-cursor-pointer]',
].join(', ')

export const STICKY_CURSOR_NATIVE_SEL
  = `${STICKY_CURSOR_FIELD_SEL}, [un-cursor*="grab"], iframe`

export const STICKY_CURSOR_MQ
  = '(pointer: fine) and (hover: hover)'

export const STICKY_CURSOR_STYLE_ID = 'sticky-cursor-css'

const STICKY_CURSOR_CSS = `
html[data-sticky-cursor],
html[data-sticky-cursor] * {
  cursor: none !important;
}
html[data-sticky-cursor] :is(
  input,
  textarea,
  select,
  [contenteditable]:not([contenteditable='false'])
) {
  cursor: text !important;
}
html[data-sticky-cursor] [un-cursor*='grab'] {
  cursor: grab !important;
}
html[data-sticky-cursor] [un-cursor*='grab']:active {
  cursor: grabbing !important;
}
`

export function paintStickyCursorCss(on: boolean) {
  if (typeof document === 'undefined')
    return
  const existing = document.getElementById(STICKY_CURSOR_STYLE_ID)
  if (!on) {
    existing?.remove()
    return
  }
  if (existing)
    return
  const style = document.createElement('style')
  style.id = STICKY_CURSOR_STYLE_ID
  style.textContent = STICKY_CURSOR_CSS
  document.head.appendChild(style)
}

export type StickyCursorAim = 'idle' | 'hot' | 'native' | 'ink'
export type StickyRailInkKind = 'underline' | 'mark' | 'circle'

const STICKY_CURSOR_CHROME
  = '.sticky-cursor-dot, .sticky-cursor-nib, .sticky-cursor-arrow'

export function stickyCursorHit(x: number, y: number, fallback: EventTarget | null): Element | null {
  if (typeof document !== 'undefined') {
    const stack = document.elementsFromPoint(x, y)
    for (const el of stack) {
      if (!(el instanceof Element))
        continue
      if (el.closest(STICKY_CURSOR_CHROME))
        continue
      return el
    }
  }
  return fallback instanceof Element ? fallback : null
}

export function stickyCursorRailHost(target: EventTarget | null): HTMLElement | null {
  if (!(target instanceof Element))
    return null
  return target.closest('[data-rail-ink]')
}

export function stickyCursorRailInkKind(host: HTMLElement): StickyRailInkKind | undefined {
  const label = host.querySelector<HTMLElement>('[data-hover-ink], [data-ink]')
  const value = label?.dataset.hoverInk || label?.dataset.ink
  if (value === 'underline' || value === 'mark' || value === 'circle')
    return value
}

export function stickyRailInkAmount(
  kind: StickyRailInkKind,
  box: Pick<DOMRectReadOnly, 'left' | 'top' | 'width' | 'height'>,
  x: number,
  y: number,
  travel: number,
): number {
  switch (kind) {
    case 'underline':
    case 'mark': {
      const t = (x - box.left) / Math.max(box.width, 1)
      return Math.min(1, Math.max(0, t))
    }
    case 'circle': {
      const cx = box.left + box.width / 2
      const cy = box.top + box.height / 2
      let ang = Math.atan2(x - cx, -(y - cy))
      if (ang < 0)
        ang += Math.PI * 2
      const peri = Math.PI * Math.max(box.width + box.height, 1)
      const byTravel = travel / peri
      return Math.min(1, Math.max(ang / (Math.PI * 2), byTravel))
    }
    default: {
      const _exhaustive: never = kind
      return _exhaustive
    }
  }
}

function railInkLabel(host: HTMLElement): HTMLElement | null {
  return host.querySelector<HTMLElement>('[data-hover-ink], [data-ink]')
}

function railInkSvg(host: HTMLElement): SVGSVGElement | null {
  const label = railInkLabel(host)
  if (!label)
    return null
  if (!label.querySelector(':scope > .rough-ink'))
    paintRoughInk(label)
  return label.querySelector<SVGSVGElement>(':scope > .rough-ink[data-reveal="hover"]')
    ?? label.querySelector<SVGSVGElement>(':scope > .rough-ink')
}

function railInkBox(host: HTMLElement): DOMRect {
  const label = host.querySelector<HTMLElement>('[data-hover-ink], [data-ink]')
  return (label ?? host).getBoundingClientRect()
}

export function scrubStickyRailInk(host: HTMLElement, x: number, y: number, travel: number): StickyRailInkKind | undefined {
  const kind = stickyCursorRailInkKind(host)
  const svg = railInkSvg(host)
  const path = svg?.querySelector<SVGPathElement>('.ink-reveal') ?? null
  if (!kind || !svg || !path)
    return kind
  host.dataset.inkDraw = ''
  svg.style.setProperty('visibility', 'visible', 'important')
  svg.style.transition = 'none'
  const len = Number.parseFloat(path.style.getPropertyValue('--ink-len')) || path.getTotalLength()
  const amount = stickyRailInkAmount(kind, railInkBox(host), x, y, travel)
  path.style.transition = 'none'
  path.style.strokeDasharray = `${len}`
  path.style.setProperty('stroke-dashoffset', `${len * (1 - amount)}`)
  return kind
}

export function releaseStickyRailInk(host: HTMLElement): void {
  const svg = railInkSvg(host)
  const path = svg?.querySelector<SVGPathElement>('.ink-reveal') ?? null
  delete host.dataset.inkDraw
  if (svg) {
    svg.style.removeProperty('visibility')
    svg.style.removeProperty('transition')
  }
  if (!path)
    return
  const len = Number.parseFloat(path.style.getPropertyValue('--ink-len')) || path.getTotalLength()
  path.style.transition = 'stroke-dashoffset 0.55s var(--ease-out, ease)'
  path.style.strokeDashoffset = `${len}`
}

export function stickyCursorAim(target: EventTarget | null): StickyCursorAim {
  if (!(target instanceof Element))
    return 'idle'
  if (target.closest(STICKY_CURSOR_NATIVE_SEL))
    return 'native'
  if (target.closest('[data-rail-ink]'))
    return 'ink'
  if (target.closest(STICKY_CURSOR_HOT_SEL))
    return 'hot'
  return 'idle'
}

export function stickyCursorLag(): boolean {
  if (typeof window === 'undefined')
    return false
  return !window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function stickyCursorCapable(pointerType?: string): boolean {
  if (typeof window === 'undefined')
    return false
  if (pointerType === 'mouse' || pointerType === 'pen')
    return true
  return window.matchMedia(STICKY_CURSOR_MQ).matches
}
