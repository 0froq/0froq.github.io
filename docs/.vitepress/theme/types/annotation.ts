/** 锚定指纹——用于在 DOM 中定位被批注的文本 */
export interface AnnotationAnchor {
  /** 选中的原文 */
  selected: string
  /** 选中文本前 N 个字符，用于消歧 */
  prefix: string
  /** 选中文本后 N 个字符，用于消歧 */
  suffix: string
  /** 在该页面中，匹配到相同 prefix+selected+suffix 时的第几个（从 1 开始） */
  occurrence: number
}

/** GitHub Discussion Comment 中存储的批注数据 */
export interface AnnotationData {
  version: 1
  /** 页面标识——如 'rune-activity/2026-08-03-carve' */
  pagePath: string
  /** 锚定指纹 */
  anchor: AnnotationAnchor
  /** 批注文本 */
  text: string
  /** 批注状态 */
  status: 'active' | 'resolved' | 'outdated'
  /** 创建时间 (ISO 8601) */
  createdAt: string
}

/** 从 GitHub API 返回的 Comment 解析出的批注 */
export interface ResolvedAnnotation {
  /** Discussion Comment ID */
  commentId: number
  /** Discussion Comment URL */
  commentUrl: string
  /** 批注作者 */
  author: {
    login: string
    avatarUrl: string
  }
  /** 批注数据 */
  data: AnnotationData
  /** 渲染后匹配到的 DOM Range（加载时填充，stale 时为 null） */
  domRange: Range | null
}
