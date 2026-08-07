import type { AnnotationAnchor, ResolvedAnnotation } from '../types/annotation'
import { acceptHMRUpdate, defineStore } from 'pinia'
import { ref, shallowRef } from 'vue'

export type SubmitAnnotationFn = (
  text: string,
  anchor: AnnotationAnchor | null,
  replyToId?: string,
  replyToSnapshot?: { commentId: string, author: string, text: string },
) => Promise<void>

export interface ReplyTarget {
  ann: ResolvedAnnotation
  el: HTMLElement | null
}

export const useAnnotationStore = defineStore('annotation', () => {
  const annotations = shallowRef<ResolvedAnnotation[]>([])
  const activeCommentId = ref<string | null>(null)
  const replyTarget = ref<ReplyTarget | null>(null)

  const submitHandler = shallowRef<SubmitAnnotationFn | null>(null)

  function setAnnotations(list: ResolvedAnnotation[]): void {
    annotations.value = list
  }

  function setActiveCommentId(id: string | null): void {
    activeCommentId.value = id
  }

  function setSubmitHandler(fn: SubmitAnnotationFn | null): void {
    submitHandler.value = fn
  }

  function openReplyFloat(ann: ResolvedAnnotation, el?: HTMLElement | null): void {
    replyTarget.value = { ann, el: el ?? null }
  }

  function closeReplyFloat(): void {
    replyTarget.value = null
  }

  function submitAnnotation(
    text: string,
    anchor: AnnotationAnchor | null,
    replyToId?: string,
    replyToSnapshot?: { commentId: string, author: string, text: string },
  ): Promise<void> {
    if (!submitHandler.value)
      return Promise.reject(new Error('error.submitterNotReady'))
    return submitHandler.value(text, anchor, replyToId, replyToSnapshot)
  }

  return {
    annotations,
    activeCommentId,
    replyTarget,
    setAnnotations,
    setActiveCommentId,
    setSubmitHandler,
    openReplyFloat,
    closeReplyFloat,
    submitAnnotation,
  }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useAnnotationStore, import.meta.hot))
