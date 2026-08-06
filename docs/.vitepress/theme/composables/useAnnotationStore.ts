import type { AnnotationAnchor, ResolvedAnnotation } from '../types/annotation'
import { ref, shallowRef } from 'vue'

/**
 * 批注共享状态（module-level singleton）
 *
 * 为什么不用 Teleport / JS 挂载点：
 *   - Teleport 到 Vue 渲染树内的节点，patch 时目标被重建 → vnode 失效崩溃
 *   - insertAdjacentElement 往 Vue 渲染的 DOM 中间插节点 → nextSibling 为 null 崩溃
 *   正确做法：AnnotationClient 持有数据，ContentArticle 直接渲染 AnnotationList
 *   （普通 Vue 子组件，完全受 Vue 管理）。
 */

/** 批注列表（AnnotationClient 更新，ContentArticle 的 AnnotationList 读取） */
export const annotations = shallowRef<ResolvedAnnotation[]>([])

/** 当前高亮的批注 id */
export const activeCommentId = ref<string | null>(null)

/** 提交回调（AnnotationClient 注入；List 的回复框 / 文章评论框调用） */
export type SubmitAnnotationFn = (
  text: string,
  anchor: AnnotationAnchor | null,
  replyToId?: string,
) => Promise<void>

let submitFn: SubmitAnnotationFn | null = null

export function setSubmitAnnotation(fn: SubmitAnnotationFn | null): void {
  submitFn = fn
}

export function submitAnnotation(
  text: string,
  anchor: AnnotationAnchor | null,
  replyToId?: string,
): Promise<void> {
  if (!submitFn) {
    return Promise.reject(new Error('批注提交器未就绪'))
  }
  return submitFn(text, anchor, replyToId)
}

export function setAnnotations(list: ResolvedAnnotation[]): void {
  annotations.value = list
}

export function setActiveCommentId(id: string | null): void {
  activeCommentId.value = id
}
