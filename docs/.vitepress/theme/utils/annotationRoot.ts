/**
 * Annotation selection / highlight root is always `#content`.
 * Index / layer pages must put `id="content"` on their main markdown Content.
 */

const EXCLUDE_CLOSEST = [
  '.annotation-popover',
  '.annotation-rail',
  '.annotation-list',
  '.annotation-float-reply',
  '.annotation-hover-tip',
  '.selection-toolbar',
  'button',
  'input',
  'textarea',
  'select',
  '[contenteditable="true"]',
].join(',')

export function getAnnotationContentRoot(): HTMLElement | null {
  if (typeof document === 'undefined')
    return null
  return document.getElementById('content')
}

/** Whether a Selection node is inside `#content` (and not annotation chrome). */
export function isAnnotatableNode(node: Node | null): boolean {
  if (!node)
    return false
  const el = (
    node.nodeType === Node.ELEMENT_NODE
      ? node
      : node.parentElement
  ) as Element | null
  if (!el)
    return false
  const root = getAnnotationContentRoot()
  if (!root || !root.contains(el))
    return false
  if (el.closest(EXCLUDE_CLOSEST))
    return false
  return true
}
