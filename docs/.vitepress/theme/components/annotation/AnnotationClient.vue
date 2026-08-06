<script setup lang="ts">
import type { ShortcutContext } from '../../composables/useKeyboardShortcuts'
import type { AnnotationAnchor, ResolvedAnnotation } from '../../types/annotation'
import { useData, useRoute } from 'vitepress'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useAnnotationHighlight } from '../../composables/useAnnotationHighlight'
import { activeCommentId, annotations, setActiveCommentId, setAnnotations, setSubmitAnnotation } from '../../composables/useAnnotationStore'
import { useGitHubAuth } from '../../composables/useGitHubAuth'
import { useGitHubDiscussions } from '../../composables/useGitHubDiscussions'
import { useKeyboardShortcuts } from '../../composables/useKeyboardShortcuts'
import { computeAnchor } from '../../utils/annotationFingerprint'
import AnnotationPopover from './AnnotationPopover.vue'

const SLASHES_RE = /^\/+|\/+$/g

const route = useRoute()
const { page } = useData()
const { isAuthenticated, token, isAuthenticating } = useGitHubAuth()
const { findOrCreateDiscussion, getAnnotations, createAnnotation } = useGitHubDiscussions()
const {
  highlightAnnotations,
  clearAllHighlights,
  setHoverHighlight,
  highlightPendingRange,
  clearPendingHighlight,
  hitTestHighlight,
} = useAnnotationHighlight()
const { register, unregister } = useKeyboardShortcuts()

// ---- 状态（列表数据在共享 store，ContentArticle 的 AnnotationList 直接读取）----
const hoveredCommentId = ref<string | null>(null)
const hoverPosition = ref<{ x: number, y: number } | null>(null)
const selectionRect = ref<DOMRect | null>(null)
const showPopover = ref(false)
const submitting = ref(false)
const loading = ref(false)
const error = ref<string | null>(null)
// 选中文本后暂存的锚点（按 / 时打开 popover 用）
const pendingAnchor = ref<AnnotationAnchor | null>(null)
const pendingRange = ref<Range | null>(null)
const pendingText = ref<string>('')

// ---- 快捷键 handler（顶层声明，onBeforeUnmount 可引用）----
let openHandler: () => void | boolean
let escHandler: (e: KeyboardEvent, ctx: ShortcutContext) => void | boolean

// ---- 计算页面标识 ----
const pagePath = computed(() => {
  let p = route.path.replace(SLASHES_RE, '')
  if (!p)
    p = 'index'
  return p
})

const pageTitle = computed(() => {
  return page.value.title || document.title || route.path
})

/** hover 命中的批注集合（tooltip 内容）——同锚点文本多人批注聚合 */
const hoveredAnnotations = computed(() => {
  if (!hoveredCommentId.value)
    return []
  const hit = annotations.value.find(a => a.commentId === hoveredCommentId.value)
  if (!hit)
    return []
  // 聚合同一 selected 文本的所有批注（同一文本区块多人批注）
  const selected = hit.data.anchor?.selected
  if (!selected)
    return [hit]
  return annotations.value.filter(a => a.data.anchor?.selected === selected)
})

// 窄屏判断（<900px 显示 tooltip；宽屏 hover 由侧栏高亮响应）
const isNarrowScreen = ref(false)

function updateScreenWidth() {
  isNarrowScreen.value = window.innerWidth < 900
}

// ---- 加载批注 ----
async function loadAnnotations() {
  if (!isAuthenticated.value || !token.value) {
    setAnnotations([])
    return
  }

  loading.value = true
  error.value = null

  try {
    const discussion = await findOrCreateDiscussion(
      pagePath.value,
      `批注: ${pageTitle.value}`,
      token.value,
    )

    if (!discussion) {
      setAnnotations([])
      return
    }

    const result = await getAnnotations(discussion.number, token.value)

    // 先计算锚定状态（matchState/domRange），再发布——
    // 否则 List/Rail 渲染时拿到的是 stale 快照（matchState 不是响应式属性，
    // highlight 后修改不会触发重新渲染，导致「刷新显示原文已修改」）
    await nextTick()
    const content = document.getElementById('content') || document.body
    highlightAnnotations(result, content)

    // 发布（数组替换触发响应式渲染，此时 matchState 已是最终值）
    setAnnotations(result)
  }
  catch (e: any) {
    console.error('[annotation] 加载批注失败:', e)
    error.value = e.message || '加载批注失败'
    setAnnotations([])
  }
  finally {
    loading.value = false
  }
}

// ---- 文本选择处理：只暂存，不弹窗 ----
function handleMouseUp(e: MouseEvent) {
  // 点在了批注 popover 内部 → 不处理
  const target = e.target as HTMLElement
  if (target.closest('.annotation-popover'))
    return
  // 认证进行中不处理
  if (isAuthenticating.value)
    return
  // 点击在已有高亮上 → 交给 handleContentClick（创建新批注），不暂存
  if (annotations.value.length && hitTestHighlight(e.clientX, e.clientY)) {
    return
  }

  setTimeout(() => {
    const sel = window.getSelection()
    if (!sel || sel.isCollapsed) {
      clearSelectionState()
      return
    }

    // 只处理正文（#content）内的选区——nav/侧栏/UI 元素的选区不触发批注
    const content = document.getElementById('content')
    if (!content)
      return
    const anchorInContent = sel.anchorNode && content.contains(sel.anchorNode)
    const focusInContent = sel.focusNode && content.contains(sel.focusNode)
    if (!anchorInContent || !focusInContent) {
      clearSelectionState()
      return
    }

    const selected = sel.toString().trim()
    if (!selected) {
      clearSelectionState()
      return
    }

    // 选区有效：计算锚点并做暂存高亮（不弹窗——等用户按 /）
    const range = sel.getRangeAt(0)
    const rect = range.getBoundingClientRect()
    if (rect.width > 0 && rect.height > 0) {
      pendingAnchor.value = computeAnchor(sel)
      pendingRange.value = range.cloneRange()
      pendingText.value = selected
      selectionRect.value = rect
      highlightPendingRange(range)
    }
  }, 10)
}

function clearSelectionState() {
  if (!isAuthenticating.value) {
    showPopover.value = false
    selectionRect.value = null
    pendingAnchor.value = null
    pendingRange.value = null
    pendingText.value = ''
    clearPendingHighlight()
  }
}

/** 打开批注弹窗（由 / 快捷键触发） */
function openPopover() {
  if (!pendingAnchor.value || !pendingRange.value || !selectionRect.value)
    return
  // 弹窗出现前清除暂存高亮（提交后高亮由 loadAnnotations 重新渲染）
  clearPendingHighlight()
  showPopover.value = true
}

// ---- 提交批注（文本批注与文章评论共用）----
// anchorOverride 语义：
//   - undefined：文本批注，取暂存 pendingAnchor
//   - null：文章级评论（允许无锚点）
//   - 真实 anchor：回复已有批注时复用其锚点
async function handleSubmit(
  text: string,
  anchorOverride?: AnnotationAnchor | null,
  replyToId?: string,
) {
  if (!token.value) {
    console.error('[annotation] 未登录，无法提交批注')
    error.value = '未登录，请先使用 GitHub 登录'
    return
  }

  submitting.value = true
  showPopover.value = false
  selectionRect.value = null

  try {
    // undefined → 取暂存；显式传值（null 或 anchor）→ 用传入值
    const anchor = anchorOverride === undefined ? pendingAnchor.value : anchorOverride
    // 仅文本批注需要锚点（undefined 且暂存为空时报错）；文章评论传 null 合法
    if (anchor === undefined && !pendingAnchor.value) {
      console.error('[annotation] 无可用锚点（选区已丢失）')
      error.value = '请重新选择文本后再批注'
      return
    }

    const discussion = await findOrCreateDiscussion(
      pagePath.value,
      `批注: ${pageTitle.value}`,
      token.value,
    )

    await createAnnotation(discussion.id, {
      version: 1,
      pagePath: pagePath.value,
      anchor,
      text,
      status: 'active',
      createdAt: new Date().toISOString(),
    }, token.value, replyToId)

    // 重新加载
    clearAllHighlights()
    await loadAnnotations()

    // 清除文档选区与暂存
    const sel = window.getSelection()
    if (sel)
      sel.removeAllRanges()
    pendingAnchor.value = null
    pendingRange.value = null
    pendingText.value = ''
  }
  catch (e: any) {
    console.error('[annotation] 提交批注失败:', e)
    error.value = e.message || '提交批注失败'
  }
  finally {
    submitting.value = false
  }
}

// ---- 高亮 hover / 点击交互（CSS Highlight API 的 Range 不可绑定事件，用命中检测）----
function handleMouseMove(e: MouseEvent) {
  if (!annotations.value.length)
    return
  // 鼠标在侧栏内 → 完全交给 Rail 的 hover 事件驱动（mouseenter/mouseleave），
  // 这里不做任何清除（否则 mousemove 会覆盖 handleRailHover 刚设置的高亮）
  const target = e.target as HTMLElement
  if (target.closest('.annotation-rail'))
    return
  const hit = hitTestHighlight(e.clientX, e.clientY)
  hoveredCommentId.value = hit
  hoverPosition.value = hit && isNarrowScreen.value ? { x: e.clientX, y: e.clientY } : null
  // 宽屏：hover 增强正文高亮 + 侧栏对应卡片高亮（activeCommentId 驱动 Rail）
  if (!isNarrowScreen.value) {
    setHoverHighlight(hit)
    // hover 中：临时高亮 hover 项；移出：清除（点击不持久选中）
    setActiveCommentId(hit)
  }
  // 窄屏：移出高亮时清除浮动窗口
  if (!hit && isNarrowScreen.value) {
    setHoverHighlight(null)
  }
}

function handleContentClick(e: MouseEvent) {
  if (!annotations.value.length)
    return
  const hit = hitTestHighlight(e.clientX, e.clientY)
  if (!hit)
    return
  const ann = annotations.value.find(a => a.commentId === hit)
  if (!ann || !ann.domRange)
    return
  // 点击高亮 → 选中该文本并打开批注窗（直接基于当前选择创建新批注）
  const range = ann.domRange.cloneRange()
  const sel = window.getSelection()
  if (sel) {
    sel.removeAllRanges()
    sel.addRange(range)
  }
  pendingAnchor.value = computeAnchor(sel as Selection)
  pendingRange.value = range
  pendingText.value = range.toString()
  selectionRect.value = range.getBoundingClientRect()
  clearPendingHighlight()
  showPopover.value = true
}

// ---- 路由变化时重新加载 ----
watch(() => route.path, () => {
  clearAllHighlights()
  clearPendingHighlight()
  setAnnotations([])
  setActiveCommentId(null)
  showPopover.value = false
  selectionRect.value = null
  pendingAnchor.value = null
  pendingRange.value = null
  pendingText.value = ''
  nextTick(() => {
    if (isAuthenticated.value) {
      loadAnnotations()
    }
  })
})

// 认证状态变化时重新加载
watch(isAuthenticated, (val) => {
  if (val) {
    loadAnnotations()
  }
  else {
    setAnnotations([])
    clearAllHighlights()
  }
})

// ---- 生命周期 ----
onMounted(() => {
  document.addEventListener('mouseup', handleMouseUp)
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('click', handleContentClick)
  window.addEventListener('resize', updateScreenWidth)
  updateScreenWidth()

  // 注入提交器（List 的回复框 / 文章评论框通过 store 调用）
  setSubmitAnnotation((text, anchor, replyToId) => handleSubmit(text, anchor, replyToId))

  // / 打开批注弹窗（默认；输入框内不触发，由快捷键系统保证）
  openHandler = () => {
    openPopover()
    return true
  }
  register('slash', openHandler)

  // Escape 取消
  escHandler = (e: KeyboardEvent, ctx: ShortcutContext) => {
    if (ctx.isAnnotationPopover)
      return false // popover 内部自己处理
    clearSelectionState()
    return true
  }
  register('escape', escHandler)

  if (isAuthenticated.value) {
    loadAnnotations()
  }
})

onBeforeUnmount(() => {
  document.removeEventListener('mouseup', handleMouseUp)
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('click', handleContentClick)
  window.removeEventListener('resize', updateScreenWidth)
  setSubmitAnnotation(null)
  if (openHandler) {
    unregister('slash', openHandler)
  }
  if (escHandler) {
    unregister('escape', escHandler)
  }
  clearAllHighlights()
  clearPendingHighlight()
})
</script>

<template>
  <!-- 批注弹窗 -->
  <AnnotationPopover
    v-if="showPopover"
    :rect="selectionRect"
    :submitting="submitting"
    :selected-preview="pendingText"
    @submit="handleSubmit"
    @close="showPopover = false; selectionRect = null; pendingAnchor = null; pendingRange = null; pendingText = ''; clearPendingHighlight()"
  />

  <!-- Hover 批注 tooltip（窄屏 <900px；宽屏 hover 由侧栏高亮响应） -->
  <div
    v-if="hoveredCommentId && hoverPosition && isNarrowScreen"
    class="annotation-hover-tip"
    :style="{
      left: `${hoverPosition.x + 12}px`,
      top: `${hoverPosition.y + 12}px`,
    }"
    un-fixed
    un-z-50
    un-max-w-xs
    un-bg="white dark:stone-800"
    un-border="~ stone-300 dark:stone-600"
    un-rounded
    un-shadow-lg
    un-p-3
    un-text-sm
    un-text="stone-700 dark:stone-300"
    un-leading-relaxed
    un-pointer-events-none
  >
    <div
      v-for="ann in hoveredAnnotations"
      :key="ann.commentId"
      class="un-mb-2 last:un-mb-0"
      un-flex
      un-items-start
      un-gap-2
    >
      <img
        v-if="ann.author.avatarUrl"
        :src="ann.author.avatarUrl"
        un-w-5
        un-h-5
        un-rounded-full
        un-shrink-0
      >
      <div>
        <div
          un-text="xs stone-400 dark:stone-500"
          un-mb-0.5
        >
          {{ ann.author.login }}
        </div>
        <div un-whitespace-pre-wrap>
          {{ ann.data.text }}
        </div>
      </div>
    </div>
  </div>

  <!-- 加载状态 -->
  <div
    v-if="loading"
    un-fixed
    un-top-4
    un-right-4
    un-z-50
    un-text-xs
    un-text="stone-400 dark:stone-500"
    un-bg="white/80 dark:stone-800/80"
    un-rounded
    un-px-3
    un-py-1
  >
    加载批注中…
  </div>

  <!-- 错误 -->
  <div
    v-if="error"
    un-fixed
    un-top-4
    un-right-4
    un-z-50
    un-text-xs
    un-text="red-500"
    un-bg="white dark:stone-800"
    un-rounded
    un-px-3
    un-py-1
    un-border="~ red-300 dark:red-700"
  >
    {{ error }}
    <button
      un-ml-2
      un-underline
      @click="error = null"
    >
      ×
    </button>
  </div>
</template>
