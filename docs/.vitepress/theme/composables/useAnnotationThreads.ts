import type { ResolvedAnnotation } from '../types/annotation'

/** Replies under a parent comment, oldest first. */
export function repliesOf(
  annotations: ResolvedAnnotation[],
  parentCommentId: string,
): ResolvedAnnotation[] {
  return annotations
    .filter(a => a.parentCommentId === parentCommentId)
    .sort((a, b) =>
      new Date(a.data.createdAt).getTime() - new Date(b.data.createdAt).getTime(),
    )
}

/** Top-level annotations (no parent), newest first. */
export function topLevelNewestFirst(
  annotations: ResolvedAnnotation[],
): ResolvedAnnotation[] {
  return [...annotations.filter(a => !a.parentCommentId)].sort((a, b) =>
    new Date(b.data.createdAt).getTime() - new Date(a.data.createdAt).getTime(),
  )
}

/** Replies whose parent is any comment in the group. */
export function groupReplies(
  annotations: ResolvedAnnotation[],
  parentIds: Iterable<string>,
): ResolvedAnnotation[] {
  const ids = new Set(parentIds)
  return annotations
    .filter(a => a.parentCommentId && ids.has(a.parentCommentId))
    .sort((a, b) =>
      new Date(a.data.createdAt).getTime() - new Date(b.data.createdAt).getTime(),
    )
}
