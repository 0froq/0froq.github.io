/**
 * Resolve the DOM root used for text selection + highlight anchoring.
 * Articles keep `#content`; other pages use `[data-annotation-root]` on PageContent.
 */
const ROOT_ATTR = '[data-annotation-root]'

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
  return (
    document.getElementById('content')
    || document.querySelector<HTMLElement>(ROOT_ATTR)
    || null
  )
}

/** Whether a Selection node is inside an annotatable region. */
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
