/** Prose the site lets the reader select. I-beam uses the same hosts. */
export const SELECTABLE = '[data-md-content]'
export const SELECTABLE_FIELD = 'input, textarea, [contenteditable="true"]'
export const SELECTABLE_SKIP = 'input, textarea, select, [contenteditable]:not([contenteditable="false"])'

export function hostOf(node: Node | null): Element | null {
  if (!node)
    return null
  return node.nodeType === Node.ELEMENT_NODE
    ? node as Element
    : node.parentElement
}

export function isTextCursor(el: Element): boolean {
  return !!el.closest(`${SELECTABLE}, ${SELECTABLE_FIELD}`)
}
