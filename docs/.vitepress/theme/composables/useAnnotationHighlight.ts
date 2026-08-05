import type { ResolvedAnnotation } from '../types/annotation'
import { onBeforeUnmount } from 'vue'
import { findAnchorInDOM } from '../utils/annotationFingerprint'

interface HighlightState {
  annotation: ResolvedAnnotation
  mark: HTMLElement
  range: Range
}

const activeHighlights: HighlightState[] = []
let container: HTMLElement | null = null

/**
 * 为一批批注渲染高亮
 */
export function highlightAnnotations(
  annotations: ResolvedAnnotation[],
  contentEl?: HTMLElement | null,
): void {
  clearAllHighlights()
  container = contentEl || document.getElementById('content') || document.body

  for (const ann of annotations) {
    const result = findAnchorInDOM(container, ann.data.anchor)
    ann.domRange = result.range

    if (!result.range) {
      ann.data.status = 'outdated'
      // 阶段 A：失败原因落日志，区分「核心文本没了」与「窗口被改动」
      // 阶段 B 将把 context-mismatch 升级为 approximate（近似锚定）状态
      console.warn(`[annotation] 锚定失败 (${result.reason}):`, ann.data.anchor.selected.slice(0, 50))
      continue
    }

    ann.data.status = 'active'

    try {
      const mark = document.createElement('mark')
      mark.className = 'annotation-highlight'
      mark.dataset.commentId = String(ann.commentId)
      mark.title = `${ann.author.login}: ${ann.data.text.slice(0, 60)}…`
      mark.style.backgroundColor = ann.data.status === 'outdated'
        ? 'var(--annotation-stale-bg, rgba(148, 163, 184, 0.3))'
        : 'var(--annotation-active-bg, rgba(250, 204, 21, 0.35))'
      mark.style.cursor = 'pointer'
      mark.style.borderRadius = '2px'
      mark.style.transition = 'background-color 0.15s'

      // 用 mark 包裹选中的文本
      range.surroundContents(mark)

      activeHighlights.push({ annotation: ann, mark, range })
    }
    catch {
      // surroundContents 在某些跨节点情况下会失败，降级为不渲染高亮
      ann.domRange = null
      ann.data.status = 'outdated'
    }
  }
}

/**
 * 清除所有高亮
 */
export function clearAllHighlights(): void {
  for (const h of activeHighlights) {
    try {
      const parent = h.mark.parentNode
      if (parent) {
        // 将 mark 内的文本还原
        while (h.mark.firstChild) {
          parent.insertBefore(h.mark.firstChild, h.mark)
        }
        parent.removeChild(h.mark)
      }
    }
    catch { /* 元素可能已被移除 */ }
  }
  activeHighlights.length = 0
}

/**
 * 滚动到指定批注
 */
export function scrollToAnnotation(commentId: string): void {
  const highlight = activeHighlights.find(h => h.annotation.commentId === commentId)
  if (highlight) {
    highlight.mark.scrollIntoView({ behavior: 'smooth', block: 'center' })

    // 闪烁效果
    highlight.mark.style.backgroundColor = 'var(--annotation-flash-bg, rgba(250, 204, 21, 0.8))'
    setTimeout(() => {
      highlight.mark.style.backgroundColor = 'var(--annotation-active-bg, rgba(250, 204, 21, 0.35))'
    }, 1000)
  }
}

/**
 * 查找指定 commentId 的高亮是否仍然活跃
 */
export function isHighlightActive(commentId: string): boolean {
  return activeHighlights.some(h => h.annotation.commentId === commentId && h.mark.isConnected)
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
    isHighlightActive,
  }
}
