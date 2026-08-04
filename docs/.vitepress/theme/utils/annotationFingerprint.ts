import type { AnnotationAnchor } from '../types/annotation'

const PREFIX_LEN = 30
const SUFFIX_LEN = 30

/**
 * 收集容器内所有文本节点及其拼接文本
 */
function walkTextNodes(container: HTMLElement): {
  textNodes: Text[]
  combined: string
} {
  const textNodes: Text[] = []
  const parts: string[] = []
  const walker = document.createTreeWalker(
    container,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode(node) {
        // 跳过脚本和样式内容
        const parent = node.parentElement
        if (parent && ['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(parent.tagName)) {
          return NodeFilter.FILTER_REJECT
        }
        return NodeFilter.FILTER_ACCEPT
      },
    },
  )
  while (walker.nextNode()) {
    const node = walker.currentNode as Text
    textNodes.push(node)
    parts.push(node.textContent ?? '')
  }
  return { textNodes, combined: parts.join('') }
}

/**
 * 将 DOM Node + offset 转为在 combined 文本中的绝对 offset
 */
function getAbsoluteOffset(
  textNodes: Text[],
  node: Node,
  offset: number,
): number {
  let pos = 0
  for (const tn of textNodes) {
    if (tn === node) {
      return pos + offset
    }
    pos += (tn.textContent ?? '').length
  }
  // 降级：如果没找到精确的 node，返回 offset 近似
  return offset
}

/**
 * 将 combined 文本中的偏移映射回 Text Node + offset
 */
function resolveOffset(
  textNodes: Text[],
  targetOffset: number,
): { node: Text, offset: number } {
  let pos = 0
  for (const tn of textNodes) {
    const len = (tn.textContent ?? '').length
    if (pos + len >= targetOffset) {
      return { node: tn, offset: targetOffset - pos }
    }
    pos += len
  }
  // 降级：返回最后一个节点末尾
  const last = textNodes[textNodes.length - 1]
  return { node: last, offset: (last.textContent ?? '').length }
}

/**
 * 根据偏移创建 Range
 */
function createRange(
  textNodes: Text[],
  startOffset: number,
  endOffset: number,
): Range {
  const start = resolveOffset(textNodes, startOffset)
  const end = resolveOffset(textNodes, endOffset)
  const range = document.createRange()
  range.setStart(start.node, start.offset)
  range.setEnd(end.node, end.offset)
  return range
}

/**
 * 从 Selection 对象计算锚定指纹
 * @returns AnnotationAnchor 或 null（无有效选区）
 */
export function computeAnchor(selection: Selection): AnnotationAnchor | null {
  if (!selection.rangeCount || selection.isCollapsed) return null

  const range = selection.getRangeAt(0)
  const selected = range.toString().trim()
  if (!selected) return null

  const container = document.getElementById('content') || document.body
  const { textNodes, combined } = walkTextNodes(container)

  const startOffset = getAbsoluteOffset(textNodes, range.startContainer, range.startOffset)
  const endOffset = getAbsoluteOffset(textNodes, range.endContainer, range.endOffset)

  const prefixStart = Math.max(0, startOffset - PREFIX_LEN)
  const suffixEnd = Math.min(combined.length, endOffset + SUFFIX_LEN)

  const prefix = combined.slice(prefixStart, startOffset)
  const suffix = combined.slice(endOffset, suffixEnd)

  // 计算 occurrence：在 combined 中匹配 prefix+selected+suffix 的第几次
  const searchStr = escapeRegex(prefix + selected + suffix)
  const regex = new RegExp(searchStr, 'gm')
  let occurrence = 0
  let match: RegExpExecArray | null
  while ((match = regex.exec(combined)) !== null) {
    occurrence++
    if (match.index === prefixStart) break
  }

  return { selected, prefix, suffix, occurrence }
}

/**
 * 在 DOM 中查找锚定位置
 * @returns Range 或 null（stale——原文已变更无法锚定）
 */
export function findAnchorInDOM(
  container: HTMLElement,
  anchor: AnnotationAnchor,
): Range | null {
  const { textNodes, combined } = walkTextNodes(container)

  // 构建搜索串
  const searchStr = escapeRegex(anchor.prefix + anchor.selected + anchor.suffix)
  const regex = new RegExp(searchStr, 'gm')

  let match: RegExpExecArray | null
  let count = 0
  while ((match = regex.exec(combined)) !== null) {
    count++
    if (count === anchor.occurrence) {
      const prefixEnd = match.index + anchor.prefix.length
      const selectedEnd = prefixEnd + anchor.selected.length
      return createRange(textNodes, prefixEnd, selectedEnd)
    }
  }

  return null
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
