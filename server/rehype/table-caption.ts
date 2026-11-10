/**
 * GFM tables have no caption syntax, and an MDC block cannot wrap a table
 * (the table escapes the block body). Convention instead: a paragraph directly
 * above a table whose text starts with `题注：` or `caption:` becomes that
 * table's caption, since table captions belong above the table. The caption is
 * attached to the table element as an attribute, which MDC hands to
 * `ProseTable` as its `caption` prop, so the existing figure/figcaption markup
 * renders it.
 *
 * The caption is plain text: ProseTable interpolates it, so inline markdown
 * inside a caption is not parsed.
 */

interface HastNode {
  type: string
  tagName?: string
  value?: string
  properties?: Record<string, unknown>
  children?: HastNode[]
}

const MARKER = /^(?:题注|caption)\s*[:：]\s*/i

function textOf(node: HastNode): string {
  if (node.type === 'text') return node.value ?? ''
  return (node.children ?? []).map(textOf).join('')
}

/** `remark-rehype` leaves newline-only text nodes between block siblings. */
function isBlank(node: HastNode | undefined): boolean {
  return !node || (node.type === 'text' && !(node.value ?? '').trim())
}

export default function tableCaption() {
  return (tree: HastNode) => {
    const walk = (node: HastNode) => {
      const children = node.children
      if (!children) return
      for (let i = 0; i < children.length; i++) {
        const table = children[i]
        if (!table) continue
        if (table.type !== 'element' || table.tagName !== 'table' || table.properties?.caption) {
          walk(table)
          continue
        }
        let j = i - 1
        while (j >= 0 && isBlank(children[j])) j--
        const previous = j >= 0 ? children[j] : undefined
        if (previous?.type !== 'element' || previous.tagName !== 'p') {
          walk(table)
          continue
        }
        const text = textOf(previous).trim()
        const marker = text.match(MARKER)
        if (!marker) {
          walk(table)
          continue
        }
        table.properties = { ...table.properties, caption: text.slice(marker[0].length) }
        children.splice(j, 1)
      }
    }
    walk(tree)
  }
}
