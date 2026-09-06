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

export type StickyCursorAim = 'idle' | 'hot' | 'native'

export function stickyCursorAim(target: EventTarget | null): StickyCursorAim {
  if (!(target instanceof Element))
    return 'idle'
  if (target.closest(STICKY_CURSOR_NATIVE_SEL))
    return 'native'
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
