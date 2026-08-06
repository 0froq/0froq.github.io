import type { AnnotationAnchor } from '../types/annotation'

const PREFIX_LEN = 30
const SUFFIX_LEN = 30
const REGEX_SPECIAL_RE = /[.*+?^${}()|[\]\\]/g

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
  const last = textNodes.at(-1)
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
 *
 * 关键设计：selected/prefix/suffix 全部从 walkTextNodes 的 combined 精确切片，
 * 与 findAnchorInDOM 完全同源——只要 DOM 文本未变，匹配必然成功。
 * 不用 range.toString()（它在块级元素边界插入 \n，与 combined 拼接不一致）。
 * trim 只发生在 UI 显示层，存储层保持原始切片。
 *
 * @returns AnnotationAnchor 或 null（无有效选区）
 */
export function computeAnchor(selection: Selection): AnnotationAnchor | null {
  if (!selection.rangeCount || selection.isCollapsed)
    return null

  const range = selection.getRangeAt(0)

  const container = document.getElementById('content') || document.body
  const { textNodes, combined } = walkTextNodes(container)

  const startOffset = getAbsoluteOffset(textNodes, range.startContainer, range.startOffset)
  const endOffset = getAbsoluteOffset(textNodes, range.endContainer, range.endOffset)

  // 空选区保护
  if (endOffset <= startOffset)
    return null

  const selected = combined.slice(startOffset, endOffset)
  if (!selected.trim())
    return null

  const prefixStart = Math.max(0, startOffset - PREFIX_LEN)
  const suffixEnd = Math.min(combined.length, endOffset + SUFFIX_LEN)

  const prefix = combined.slice(prefixStart, startOffset)
  const suffix = combined.slice(endOffset, suffixEnd)

  // 计算 occurrence：在 combined 中匹配 prefix+selected+suffix 的第几次
  const searchStr = escapeRegex(prefix + selected + suffix)
  const regex = new RegExp(searchStr, 'gm')
  let occurrence = 0
  let match = regex.exec(combined)
  while (match !== null) {
    occurrence++
    if (match.index === prefixStart)
      break
    match = regex.exec(combined)
  }

  return { selected, prefix, suffix, occurrence }
}

/**
 * 锚定结果
 * - exact: 完整串匹配且 selected 内容验证一致
 * - approximate: 完整串失败，但 selected 可定位（按 occurrence），窗口相似度可接受——原文可能被改动，仍锚定
 * - ambiguous: selected 可定位但窗口相似度不足或 occurrence 超界——无法确认是哪一个，不锚定
 * - selected-missing: selected 本身找不到——核心文本已变
 */
export interface AnchorMatch {
  range: Range | null
  reason: 'exact' | 'approximate' | 'ambiguous' | 'selected-missing'
}

/** 窗口相似度阈值：字符重叠率 ≥ 此值视为「原文可能被小幅改动，仍可锚定」 */
const WINDOW_SIM_THRESHOLD = 0.6

/**
 * 计算两段文本的字符重叠率（对插入/删除免疫，比逐位对比鲁棒）
 * 例：'abcde' vs 'abxde' → 4/5 = 0.8
 */
function charOverlap(expected: string, actual: string): number {
  if (!expected || !actual)
    return 0
  const expectedChars = new Set(expected)
  let hit = 0
  for (const c of expectedChars) {
    if (actual.includes(c))
      hit++
  }
  return hit / expectedChars.size
}

/**
 * 在 DOM 中查找锚定位置
 * @returns AnchorMatch——range 非 null 时 reason 为 exact/approximate；null 时说明失败原因
 */
export function findAnchorInDOM(
  container: HTMLElement,
  anchor: AnnotationAnchor,
): AnchorMatch {
  const { textNodes, combined } = walkTextNodes(container)

  // 主路径：完整串匹配（保持 occurrence 语义）
  const fullStr = escapeRegex(anchor.prefix + anchor.selected + anchor.suffix)
  const fullRe = new RegExp(fullStr, 'gm')

  let count = 0
  let match = fullRe.exec(combined)
  while (match !== null) {
    count++
    if (count === anchor.occurrence) {
      const prefixEnd = match.index + anchor.prefix.length
      const selectedEnd = prefixEnd + anchor.selected.length
      const range = createRange(textNodes, prefixEnd, selectedEnd)
      // 用 combined 切片验证（与 computeAnchor 同源；range.toString() 在跨块级
      // 元素时会插入 \n，与 combined 拼接不一致，不能用它验证）
      const actualSelected = combined.slice(prefixEnd, selectedEnd)
      if (actualSelected === anchor.selected) {
        return { range, reason: 'exact' }
      }
      return { range: null, reason: 'selected-missing' }
    }
    match = fullRe.exec(combined)
  }

  // 降级路径：完整串失败 → 枚举 selected 的所有出现位置
  const selRe = new RegExp(escapeRegex(anchor.selected), 'gm')
  const candidates: number[] = []
  let sm = selRe.exec(combined)
  while (sm !== null) {
    candidates.push(sm.index)
    sm = selRe.exec(combined)
  }

  if (candidates.length === 0)
    return { range: null, reason: 'selected-missing' }

  // occurrence 超界 → 匹配集变了，无法确认是哪一个
  if (anchor.occurrence > candidates.length)
    return { range: null, reason: 'ambiguous' }

  // 按 occurrence 定位候选
  const pos = candidates[anchor.occurrence - 1]
  const actualPrefix = combined.slice(Math.max(0, pos - PREFIX_LEN), pos)
  const actualSuffix = combined.slice(
    pos + anchor.selected.length,
    pos + anchor.selected.length + SUFFIX_LEN,
  )
  const sim = (charOverlap(anchor.prefix, actualPrefix)
    + charOverlap(anchor.suffix, actualSuffix)) / 2

  // 窗口相似度可接受 → approximate 锚定；否则 ambiguous
  if (sim >= WINDOW_SIM_THRESHOLD) {
    const range = createRange(textNodes, pos, pos + anchor.selected.length)
    return { range, reason: 'approximate' }
  }
  return { range: null, reason: 'ambiguous' }
}

function escapeRegex(s: string): string {
  return s.replace(REGEX_SPECIAL_RE, '\\$&')
}
