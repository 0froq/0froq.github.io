import type { ResolvedAnnotation } from '../types/annotation'
import { onBeforeUnmount } from 'vue'
import { findAnchorInDOM } from '../utils/annotationFingerprint'

/**
 * 高亮管理——基于 CSS Custom Highlight API（CSS.highlights）
 *
 * 为什么不直接用 range.surroundContents(mark)：
 *   #content 是 Vue 渲染的区域，插入/移除 DOM 节点会破坏 vnode 与 DOM 的对应，
 *   之后任何 Vue patch 都会崩溃（Cannot set properties of null (setting '__vnode')）。
 *   CSS Custom Highlight 只注册 Range，不改 DOM，Vue 完全无感知。
 *
 * 注册策略：按状态分组——所有 exact 批注的 Range 进同一个 Highlight 对象
 * （名为 annotation-exact），approximate 同理。CSS 用 ::highlight(annotation-exact)
 * 匹配。每个对象包含多个 Range，独立注册名，clear 时整体删除重建。
 *
 * 兼容性：Chrome 105+ / Safari 17.2+ / Firefox 141+。
 * 不支持的环境静默降级（不渲染高亮，批注功能不受影响）。
 */

// 按状态分组的 Range 收集器
const exactRanges: Range[] = []
const approxRanges: Range[] = []
const activeAnnotations: ResolvedAnnotation[] = []

let container: HTMLElement | null = null

const highlightsSupported = typeof window !== 'undefined'
  && 'highlights' in CSS
  && typeof (CSS as any).highlights?.set === 'function'

const HIGHLIGHT_EXACT = 'annotation-exact'
const HIGHLIGHT_APPROX = 'annotation-approximate'
const HIGHLIGHT_PENDING = 'annotation-pending'
const HIGHLIGHT_FLASH = 'annotation-flash'
const HIGHLIGHT_HOVER = 'annotation-hover'

function registerHighlight(name: string, ranges: Range[], priority = 0): void {
  if (!highlightsSupported || ranges.length === 0)
    return
  try {
    const h = new Highlight(...ranges)
    h.priority = priority
    ;(CSS as any).highlights.set(name, h)
  }
  catch {
    // Range 可能已失效
  }
}

function unregisterHighlight(name: string): void {
  if (highlightsSupported) {
    ;(CSS as any).highlights.delete(name)
  }
}

/**
 * 为一批批注渲染高亮
 */
export function highlightAnnotations(
  annotations: ResolvedAnnotation[],
  contentEl?: HTMLElement | null,
): void {
  clearAllHighlights()
  container = contentEl || document.getElementById('content') || document.body

  exactRanges.length = 0
  approxRanges.length = 0

  for (const ann of annotations) {
    // 文章级评论（anchor 为 null）：不锚定，直接标 article
    if (!ann.data.anchor) {
      ann.matchState = 'article'
      ann.domRange = null
      continue
    }

    const result = findAnchorInDOM(container, ann.data.anchor)
    ann.domRange = result.range

    if (!result.range) {
      // ambiguous / selected-missing → 不渲染高亮，仅侧栏/列表显示
      ann.matchState = result.reason === 'ambiguous' ? 'ambiguous' : 'stale'
      console.warn(`[annotation] 锚定失败 (${result.reason}):`, ann.data.anchor.selected.slice(0, 50))
      continue
    }

    ann.matchState = result.reason === 'exact' ? 'exact' : 'approximate'
    ann.data.status = 'active'

    // 按状态分组收集 Range
    if (ann.matchState === 'exact') {
      exactRanges.push(result.range)
    }
    else {
      approxRanges.push(result.range)
    }
    activeAnnotations.push(ann)
  }

  // 分组注册（同名 Highlight 含多个 Range）
  registerHighlight(HIGHLIGHT_EXACT, exactRanges)
  registerHighlight(HIGHLIGHT_APPROX, approxRanges)
}

/**
 * 清除所有高亮
 */
export function clearAllHighlights(): void {
  unregisterHighlight(HIGHLIGHT_EXACT)
  unregisterHighlight(HIGHLIGHT_APPROX)
  unregisterHighlight(HIGHLIGHT_FLASH)
  unregisterHighlight(HIGHLIGHT_HOVER)
  unregisterHighlight(HIGHLIGHT_PENDING)
  exactRanges.length = 0
  approxRanges.length = 0
  activeAnnotations.length = 0
}

// ---- 暂存高亮（选中文本后、提交前）----

/**
 * 为选中的文本添加暂存高亮（淡黄——「已选中，按 / 批注」的提示）
 */
export function highlightPendingRange(range: Range): void {
  clearPendingHighlight()
  registerHighlight(HIGHLIGHT_PENDING, [range], 10)
}

/** 清除暂存高亮 */
export function clearPendingHighlight(): void {
  unregisterHighlight(HIGHLIGHT_PENDING)
}

/**
 * 滚动到指定批注（用 Range 的容器元素定位）
 */
export function scrollToAnnotation(commentId: string): void {
  const ann = activeAnnotations.find(x => x.commentId === commentId)
  if (!ann || !ann.domRange)
    return
  const el = ann.domRange.startContainer.parentElement || container
  el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

/**
 * 突出显示指定批注（点击卡片时闪烁原文高亮）
 * 用临时高优先级 Highlight，1 秒后移除
 */
export function flashAnnotation(commentId: string): void {
  const ann = activeAnnotations.find(x => x.commentId === commentId)
  if (!ann || !ann.domRange)
    return
  registerHighlight(HIGHLIGHT_FLASH, [ann.domRange], 100)
  setTimeout(() => {
    unregisterHighlight(HIGHLIGHT_FLASH)
  }, 1000)
}

/**
 * 设置 hover 增强高亮（宽屏 hover 正文时该段加深）
 */
export function setHoverHighlight(commentId: string | null): void {
  unregisterHighlight(HIGHLIGHT_HOVER)
  if (!commentId)
    return
  const ann = activeAnnotations.find(x => x.commentId === commentId)
  if (!ann || !ann.domRange)
    return
  registerHighlight(HIGHLIGHT_HOVER, [ann.domRange], 50)
}

/**
 * 查找指定 commentId 的高亮是否仍然活跃
 */
export function isHighlightActive(commentId: string): boolean {
  return activeAnnotations.some(h => h.commentId === commentId)
}

/**
 * 获取指定 commentId 的 DOM Range（hover/点击命中检测用）
 */
export function getHighlightRange(commentId: string): Range | null {
  const ann = activeAnnotations.find(x => x.commentId === commentId)
  return ann?.domRange ?? null
}

/**
 * 根据视口坐标检测命中的批注（mousemove 用）
 * @returns 命中的批注 commentId，或 null
 */
export function hitTestHighlight(x: number, y: number): string | null {
  for (const ann of activeAnnotations) {
    if (!ann.domRange)
      continue
    try {
      const rects = ann.domRange.getClientRects()
      for (const r of rects) {
        if (r.width > 0 && x >= r.left && x <= r.right && y >= r.top && y <= r.bottom)
          return ann.commentId
      }
    }
    catch { /* Range 可能已失效 */ }
  }
  return null
}

// Vue composable wrapper
export function useAnnotationHighlight() {
  onBeforeUnmount(() => {
    clearAllHighlights()
  })

  return {
    highlightAnnotations,
    clearAllHighlights,
    scrollToAnnotation,
    flashAnnotation,
    setHoverHighlight,
    isHighlightActive,
    highlightPendingRange,
    clearPendingHighlight,
    hitTestHighlight,
    getHighlightRange,
  }
}
