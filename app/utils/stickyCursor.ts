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

export function stickyCursorCapable(): boolean {
  if (typeof window === 'undefined')
    return false
  return window.matchMedia(STICKY_CURSOR_MQ).matches
    && !window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
