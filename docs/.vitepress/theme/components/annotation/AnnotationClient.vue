<script setup lang="ts">
import type { AnnotationAnchor, ResolvedAnnotation } from '../../types/annotation'
import { useData, useRoute } from 'vitepress'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useAnnotationHighlight } from '../../composables/useAnnotationHighlight'
import { useGitHubAuth } from '../../composables/useGitHubAuth'
import { useGitHubDiscussions } from '../../composables/useGitHubDiscussions'
import { computeAnchor } from '../../utils/annotationFingerprint'
import AnnotationPopover from './AnnotationPopover.vue'
import AnnotationSidebar from './AnnotationSidebar.vue'

const SLASHES_RE = /^\/+|\/+$/g

const route = useRoute()
const { page } = useData()
const { isAuthenticated, token, isAuthenticating } = useGitHubAuth()
const { findOrCreateDiscussion, getAnnotations, createAnnotation } = useGitHubDiscussions()
const { highlightAnnotations, clearAllHighlights, scrollToAnnotation } = useAnnotationHighlight()

// ---- 状态 ----
const annotations = ref<ResolvedAnnotation[]>([])
const showSidebar = ref(false)
const activeCommentId = ref<string | null>(null)
const selectionRect = ref<DOMRect | null>(null)
const showPopover = ref(false) // 独立于 selectionRect，认证期间保持打开
const submitting = ref(false)
const loading = ref(false)
const error = ref<string | null>(null)
// 弹出 popover 时保存的选区锚点（用户点击 textarea 会清除文档选区，必须提前计算）
const pendingAnchor = ref<AnnotationAnchor | null>(null)
const pendingRange = ref<Range | null>(null)

// ---- 计算页面标识 ----
const pagePath = computed(() => {
  // 去掉前导 / 和尾部 /
  let p = route.path.replace(SLASHES_RE, '')
  if (!p)
    p = 'index'
  return p
})

const pageTitle = computed(() => {
  // 优先用 VitePress 当前页 frontmatter title（SPA 切换时 document.title 会滞后）
  return page.value.title || document.title || route.path
})

// ---- 加载批注 ----
async function loadAnnotations() {
  if (!isAuthenticated.value || !token.value) {
    annotations.value = []
    return
  }

  loading.value = true
  error.value = null

  try {
    // 查找 Discussion
    const discussion = await findOrCreateDiscussion(
      pagePath.value,
      `批注: ${pageTitle.value}`,
      token.value,
    )

    // 如果没有 Discussion（可能 find 失败但 create 也没触发），跳过
    if (!discussion) {
      annotations.value = []
      return
    }

    // 获取批注
    const result = await getAnnotations(discussion.number, token.value)
    annotations.value = result

    // 渲染高亮
    await nextTick()
    const content = document.getElementById('content') || document.body
    highlightAnnotations(annotations.value, content)
  }
  catch (e: any) {
    console.error('[annotation] 加载批注失败:', e)
    error.value = e.message || '加载批注失败'
    annotations.value = []
  }
  finally {
    loading.value = false
  }
}

// ---- 文本选择处理 ----
function handleMouseUp(e: MouseEvent) {
  // 点在了批注 popover 内部 → 不关闭
  const target = e.target as HTMLElement
  if (target.closest('.annotation-popover'))
    return

  // 认证进行中时不关闭 popover
  if (isAuthenticating.value)
    return

  setTimeout(() => {
    const sel = window.getSelection()
    if (!sel || sel.isCollapsed) {
      if (!isAuthenticating.value) {
        showPopover.value = false
        selectionRect.value = null
        pendingAnchor.value = null
        pendingRange.value = null
      }
      return
    }

    const selected = sel.toString().trim()
    if (!selected) {
      showPopover.value = false
      selectionRect.value = null
      pendingAnchor.value = null
      pendingRange.value = null
      return
    }

    // 选区仍有效：立即计算锚点并保存（用户点进 textarea 后选区会丢失）
    const range = sel.getRangeAt(0)
    const rect = range.getBoundingClientRect()
    if (rect.width > 0 && rect.height > 0) {
      pendingAnchor.value = computeAnchor(sel)
      pendingRange.value = range.cloneRange()
      selectionRect.value = rect
      showPopover.value = true
    }
  }, 10)
}

// ---- 提交批注 ----
async function handleSubmit(text: string) {
  if (!token.value) {
    console.error('[annotation] 未登录，无法提交批注')
    error.value = '未登录，请先使用 GitHub 登录'
    return
  }

  submitting.value = true
  showPopover.value = false
  selectionRect.value = null

  try {
    const anchor = pendingAnchor.value
    if (!anchor) {
      console.error('[annotation] 无可用锚点（选区在弹出批注框时已丢失）')
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
    }, token.value)

    // 重新加载
    clearAllHighlights()
    await loadAnnotations()

    // 清除文档选区与暂存（anchor 已持久化到 GitHub，不再需要）
    const sel = window.getSelection()
    if (sel)
      sel.removeAllRanges()
    pendingAnchor.value = null
    pendingRange.value = null
  }
  catch (e: any) {
    console.error('[annotation] 提交批注失败:', e)
    error.value = e.message || '提交批注失败'
  }
  finally {
    submitting.value = false
  }
}

// ---- 侧边栏交互 ----
function handleSelectAnnotation(ann: ResolvedAnnotation) {
  activeCommentId.value = ann.commentId
  if (ann.domRange) {
    scrollToAnnotation(ann.commentId)
  }
}

function toggleSidebar() {
  showSidebar.value = !showSidebar.value
}

// ---- 路由变化时重新加载 ----
watch(() => route.path, () => {
  clearAllHighlights()
  annotations.value = []
  showSidebar.value = false
  activeCommentId.value = null
  showPopover.value = false
  selectionRect.value = null
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
    annotations.value = []
    clearAllHighlights()
  }
})

// ---- 生命周期 ----
onMounted(() => {
  document.addEventListener('mouseup', handleMouseUp)
  document.addEventListener('keydown', handleKeyDown)

  if (isAuthenticated.value) {
    loadAnnotations()
  }
})

onBeforeUnmount(() => {
  document.removeEventListener('mouseup', handleMouseUp)
  document.removeEventListener('keydown', handleKeyDown)
  clearAllHighlights()
})

function handleKeyDown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    showPopover.value = false
    selectionRect.value = null
    pendingAnchor.value = null
    pendingRange.value = null
  }
}
</script>

<template>
  <!-- 侧边栏切换按钮 -->
  <button
    v-if="isAuthenticated && annotations.length > 0"
    class="annotation-toggle-btn"
    un-fixed
    un-right-4
    un-bottom-20
    un-z-50
    un-w-10
    un-h-10
    un-rounded-full
    un-bg="white dark:stone-800"
    un-border="~ stone-300 dark:stone-600"
    un-shadow-lg
    un-flex
    un-items-center
    un-justify-center
    un-text-lg
    un-cursor-pointer
    :title="showSidebar ? '收起批注' : '查看批注'"
    @click="toggleSidebar"
  >
    💬
    <span
      v-if="annotations.length > 0"
      un-absolute
      un--top-1
      un--right-1
      un-w-5
      un-h-5
      un-rounded-full
      un-bg="blue-500"
      un-text="white xs"
      un-flex
      un-items-center
      un-justify-center
    >
      {{ annotations.length }}
    </span>
  </button>

  <!-- 侧边栏 -->
  <AnnotationSidebar
    v-if="showSidebar"
    :annotations="annotations"
    :active-comment-id="activeCommentId"
    @select="handleSelectAnnotation"
    @close="showSidebar = false"
  />

  <!-- 批注弹窗 -->
  <AnnotationPopover
    v-if="showPopover"
    :rect="selectionRect"
    :submitting="submitting"
    @submit="handleSubmit"
    @close="showPopover = false; selectionRect = null"
  />

  <!-- 加载状态 -->
  <div
    v-if="loading"
    un-fixed
    un-top-4
    un-right-4
    un-z-50
    un-text-xs
    text="stone-400 dark:stone-500"
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
    text="red-500"
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

<style scoped>
.annotation-toggle-btn {
  transition: transform 0.2s;
}
.annotation-toggle-btn:hover {
  transform: scale(1.1);
}
</style>
