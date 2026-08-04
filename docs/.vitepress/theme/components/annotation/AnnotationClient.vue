<script setup lang="ts">
import { computed, nextTick, onMounted, onBeforeUnmount, ref, watch } from 'vue'
import { useRoute } from 'vitepress'
import type { ResolvedAnnotation } from '../../types/annotation'
import { useGitHubAuth } from '../../composables/useGitHubAuth'
import { useGitHubDiscussions } from '../../composables/useGitHubDiscussions'
import { useAnnotationHighlight } from '../../composables/useAnnotationHighlight'
import { computeAnchor } from '../../utils/annotationFingerprint'
import AnnotationPopover from './AnnotationPopover.vue'
import AnnotationSidebar from './AnnotationSidebar.vue'

const route = useRoute()
const { isAuthenticated, token, user, isAuthenticating } = useGitHubAuth()
const { findOrCreateDiscussion, getAnnotations, createAnnotation } = useGitHubDiscussions()
const { highlightAnnotations, clearAllHighlights, scrollToAnnotation } = useAnnotationHighlight()

// ---- 状态 ----
const annotations = ref<ResolvedAnnotation[]>([])
const showSidebar = ref(false)
const activeCommentId = ref<number | null>(null)
const selectionRect = ref<DOMRect | null>(null)
const showPopover = ref(false) // 独立于 selectionRect，认证期间保持打开
const submitting = ref(false)
const loading = ref(false)
const error = ref<string | null>(null)

// ---- 计算页面标识 ----
const pagePath = computed(() => {
  // 去掉前导 / 和尾部 /
  let p = route.path.replace(/^\/+|\/+$/g, '')
  if (!p) p = 'index'
  return p
})

const pageTitle = computed(() => {
  return document.title || route.path
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
    const discussionNumber = await findOrCreateDiscussion(
      pagePath.value,
      `批注: ${pageTitle.value}`,
      token.value,
    )

    // 如果没有 Discussion（可能 find 失败但 create 也没触发），跳过
    if (!discussionNumber) {
      annotations.value = []
      return
    }

    // 获取批注
    const result = await getAnnotations(discussionNumber, token.value)
    annotations.value = result

    // 渲染高亮
    await nextTick()
    const content = document.getElementById('content') || document.body
    highlightAnnotations(annotations.value, content)
  }
  catch (e: any) {
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
  if (target.closest('.annotation-popover')) return

  // 认证进行中时不关闭 popover
  if (isAuthenticating.value) return

  setTimeout(() => {
    const sel = window.getSelection()
    if (!sel || sel.isCollapsed) {
      if (!isAuthenticating.value) {
        showPopover.value = false
        selectionRect.value = null
      }
      return
    }

    const selected = sel.toString().trim()
    if (!selected) {
      showPopover.value = false
      selectionRect.value = null
      return
    }

    const range = sel.getRangeAt(0)
    const rect = range.getBoundingClientRect()
    if (rect.width > 0 && rect.height > 0) {
      selectionRect.value = rect
      showPopover.value = true
    }
  }, 10)
}

// ---- 提交批注 ----
async function handleSubmit(text: string) {
  if (!token.value) return

  submitting.value = true
  showPopover.value = false
  selectionRect.value = null

  try {
    const sel = window.getSelection()
    if (!sel) return

    const anchor = computeAnchor(sel)
    if (!anchor) return

    const discussionNumber = await findOrCreateDiscussion(
      pagePath.value,
      `批注: ${pageTitle.value}`,
      token.value,
    )

    await createAnnotation(discussionNumber, {
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

    // 清除选区
    sel.removeAllRanges()
  }
  catch (e: any) {
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
  }
}
</script>

<template>
  <!-- 侧边栏切换按钮 -->
  <button
    v-if="isAuthenticated && annotations.length > 0"
    class="annotation-toggle-btn"
    fixed right-4 bottom-20 z-50
    w-10 h-10
    rounded-full
    bg="white dark:stone-800"
    border="~ stone-300 dark:stone-600"
    shadow-lg
    flex items-center justify-center
    text-lg
    cursor-pointer
    :title="showSidebar ? '收起批注' : '查看批注'"
    @click="toggleSidebar"
  >
    💬
    <span
      v-if="annotations.length > 0"
      absolute -top-1 -right-1
      w-5 h-5
      rounded-full
      bg="blue-500"
      text="white xs"
      flex items-center justify-center
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
    fixed top-4 right-4 z-50
    text-xs text="stone-400 dark:stone-500"
    bg="white/80 dark:stone-800/80"
    rounded px-3 py-1
  >
    加载批注中…
  </div>

  <!-- 错误 -->
  <div
    v-if="error"
    fixed top-4 right-4 z-50
    text-xs text="red-500"
    bg="white dark:stone-800"
    rounded px-3 py-1
    border="~ red-300 dark:red-700"
  >
    {{ error }}
    <button ml-2 underline @click="error = null">×</button>
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
