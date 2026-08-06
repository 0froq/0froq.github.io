<script setup lang="ts">
import type { ResolvedAnnotation } from '../../types/annotation'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { setHoverHighlight } from '~/composables/useAnnotationHighlight'
import { activeCommentId, annotations, setActiveCommentId, submitAnnotation } from '~/composables/useAnnotationStore'
import { renderMdBlock } from '~/utils/renderMdBlock'

// 自包含：数据从共享 store 读取（AnnotationClient 更新，ContentArticle 渲染本组件）

// 展开状态（「更多」行内展开）
const expanded = ref<Set<string>>(new Set())
// 卡片 DOM 引用（测量高度用）
const cardEls = ref<Record<string, HTMLElement | null>>({})
// Rail 根元素（onMounted 取其父作为定位容器）
const railEl = ref<HTMLElement | null>(null)
// 定位容器（un-relative 包裹 content；onMounted 时取 aside 的父元素）
const railContainer = ref<HTMLElement | null>(null)
// 首次测量完成前抑制 top 过渡（避免加载时卡片从错误位置滑动）
const animReady = ref(false)
// 卡片高度缓存
const cardHeights = ref<Record<string, number>>({})
// 回复浮层状态（点击卡片弹出，卡片高度不变）
const floatReply = ref<ResolvedAnnotation | null>(null)
const floatText = ref('')
const floatSubmitting = ref(false)
const floatError = ref<string | null>(null)
// hover 的回复条目（粒度视觉反馈；全局正文高亮由卡片容器 mouseenter/mouseleave 管理，
// 避免卡片内部移动（缝隙）时闪烁）
const hoveredReplyId = ref<string | null>(null)

function hoverReply(reply: ResolvedAnnotation) {
  hoveredReplyId.value = reply.commentId
}

function clearReplyHover() {
  hoveredReplyId.value = null
}

function openReply(ann: ResolvedAnnotation) {
  floatReply.value = ann
  floatText.value = ''
  floatError.value = null
}

function closeReply() {
  floatReply.value = null
  floatText.value = ''
  floatError.value = null
}

/** 浮层位置：卡片右侧 + 间距（fixed 相对视口；空间不足放左侧） */
const floatStyle = computed(() => {
  if (!floatReply.value)
    return {}
  // 回复浮层定位在目标卡片旁：优先自身卡片（顶层批注），回复则用父卡片位置
  const targetId = floatReply.value.parentCommentId ?? floatReply.value.commentId
  const el = cardEls.value[targetId]
  if (!el)
    return { right: '1.5rem', top: '6rem' }
  const rect = el.getBoundingClientRect()
  const left = rect.right + 12 > window.innerWidth - 288
    ? Math.max(8, rect.left - 288 - 12)
    : rect.right + 12
  return { left: `${left}px`, top: `${Math.max(8, rect.top)}px` }
})

/** 回复输入：Enter 发送，Esc 关闭 */
function handleReplyKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') {
    e.preventDefault()
    submitFloatReply()
  }
  else if (e.key === 'Escape') {
    closeReply()
  }
}

async function submitFloatReply() {
  const text = floatText.value.trim()
  if (!text) {
    floatError.value = '请输入内容'
    return
  }
  if (!floatReply.value)
    return
  floatSubmitting.value = true
  floatError.value = null
  try {
    const target = floatReply.value
    // GitHub Discussions 只支持一层嵌套：replyToId 必须指向顶层批注。
    // 回复批注 → 直接追加；回复回复 → 追加到线程，内容带 @作者 + 引用其内容
    const replyToId = target.parentCommentId ?? target.commentId
    const body = target.parentCommentId
      ? `> ${target.data.text}\n\n@${target.author.login} ${text}`
      : text
    await submitAnnotation(body, null, replyToId)
    closeReply()
  }
  catch (e: any) {
    floatError.value = e.message || '回复失败'
  }
  finally {
    floatSubmitting.value = false
  }
}

function toggleExpand(commentId: string) {
  const next = new Set(expanded.value)
  if (next.has(commentId)) {
    next.delete(commentId)
  }
  else {
    next.add(commentId)
  }
  expanded.value = next
  nextTick(measureHeights)
}

function isExpanded(commentId: string): boolean {
  return expanded.value.has(commentId)
}

/** 指定父批注的回复（按时间正序：旧→新） */
function repliesOf(parentCommentId: string): ResolvedAnnotation[] {
  return annotations.value
    .filter(a => a.parentCommentId === parentCommentId)
    .sort((a, b) =>
      new Date(a.data.createdAt).getTime() - new Date(b.data.createdAt).getTime(),
    )
}

/** 渲染回复正文：markdown-it 块级渲染（`> 引用` → blockquote + @mention → GitHub 链接） */
function renderReplyBody(text: string): string {
  return renderMdBlock(text)
}

// ResizeObserver：卡片尺寸变化（回复条滑入/滑出动画期间逐帧）→ rAF 节流重测，
// 后续卡片位置实时避让，与动画同步进行（而非先动画后避让）
let cardObserver: ResizeObserver | null = null
let rafId = 0

function onCardResize() {
  cancelAnimationFrame(rafId)
  rafId = requestAnimationFrame(measureHeights)
}

function setCardEl(commentId: string) {
  return (el: unknown) => {
    if (el instanceof HTMLElement) {
      cardEls.value[commentId] = el
      cardObserver?.observe(el)
    }
    else {
      // 卸载：解除观察（cardEls 里还存着旧引用）
      const prev = cardEls.value[commentId]
      if (prev)
        cardObserver?.unobserve(prev)
      delete cardEls.value[commentId]
    }
  }
}

/** 测量所有卡片高度 */
function measureHeights() {
  const next: Record<string, number> = {}
  for (const [id, el] of Object.entries(cardEls.value)) {
    if (el)
      next[id] = el.offsetHeight
  }
  cardHeights.value = next
}

// 分组：有锚定（exact/approximate）/ 无法定位（ambiguous/stale）
const anchored = computed(() => annotations.value.filter(a => a.matchState === 'exact' || a.matchState === 'approximate'))
const unanchored = computed(() => annotations.value.filter(a => a.matchState === 'ambiguous' || a.matchState === 'stale'))

const CARD_GAP = 12

/**
 * 计算卡片位置（Word 审阅模式）：
 * 每张卡片 top = 锚点 Range 的文档坐标（rect.top + scrollY），
 * 碰撞时下移避让（保持锚点顺序）。
 */
const cardPositions = computed<Record<string, { top: number }>>(() => {
  const positions: Record<string, { top: number }> = {}
  const sorted = [...anchored.value].sort((a, b) => {
    const at = anchorTop(a)
    const bt = anchorTop(b)
    return at - bt
  })

  let cursor = 0
  for (const ann of sorted) {
    const docTop = anchorTop(ann)
    const height = cardHeights.value[ann.commentId] ?? 80 // 未测量时估算
    const top = Math.max(docTop, cursor)
    positions[ann.commentId] = { top }
    cursor = top + height + CARD_GAP
  }
  return positions
})

/** 锚点 Range 的文档坐标（相对本组件容器的偏移；无锚点用固定兜底） */
function anchorTop(ann: ResolvedAnnotation): number {
  if (!ann.domRange)
    return 0
  try {
    const rect = ann.domRange.getBoundingClientRect()
    // 相对容器（un-relative 包裹 content）：视口坐标差即文档偏移差
    const containerTop = railContainer.value?.getBoundingClientRect().top ?? 0
    return rect.top - containerTop
  }
  catch {
    return 0
  }
}

// 文章级评论不在此列（放列表）；无法定位的沉底显示

/** 无法定位分组的起始位置：最后一个锚定卡片底部 + 间距 */
const unanchoredTop = computed(() => {
  if (anchored.value.length === 0)
    return 0
  const last = anchored.value.at(-1)
  const pos = cardPositions.value[last?.commentId ?? '']
  const height = cardHeights.value[last?.commentId ?? ''] ?? 80
  if (!pos)
    return 0
  return pos.top + height + 24
})

function formatTime(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1)
    return '刚刚'
  if (minutes < 60)
    return `${minutes} 分钟前`
  const hours = Math.floor(minutes / 60)
  if (hours < 24)
    return `${hours} 小时前`
  const days = Math.floor(hours / 24)
  if (days < 30)
    return `${days} 天前`
  return d.toLocaleDateString('zh-CN')
}

function needsTruncate(ann: ResolvedAnnotation): boolean {
  return ann.data.text.length > 60
}

function bodyPreview(ann: ResolvedAnnotation): string {
  return ann.data.text.slice(0, 60)
}

const statusLabel: Record<string, string> = {
  exact: '',
  approximate: '原文可能已修改',
  ambiguous: '位置不确定',
  stale: '原文已修改',
}

// 批注数据变化（异步加载完成）后测量卡片高度
watch(() => annotations.value, () => {
  nextTick(measureHeights)
})

onMounted(() => {
  // 容器 = aside 的父（un-relative 包裹 content）
  railContainer.value = railEl.value?.parentElement ?? null
  // 观察卡片尺寸变化（回复条动画期间实时避让）
  cardObserver = new ResizeObserver(onCardResize)
  measureHeights()
  window.addEventListener('resize', measureHeights)
  // 内容可能异步渲染，延迟再测一次；测量稳定后再启用 top 过渡
  setTimeout(() => {
    measureHeights()
    nextTick(() => {
      animReady.value = true
    })
  }, 300)
  // 点击别处 → 收起回复框
  document.addEventListener('mousedown', handleOutsideClick)
})

function handleOutsideClick(e: MouseEvent) {
  if (!floatReply.value)
    return
  const target = e.target as HTMLElement
  // 点击在浮层或卡片内 → 保留；点击别处 → 关闭
  if (target.closest('.annotation-float-reply') || target.closest('.annotation-card')) {
    return
  }
  closeReply()
}

onBeforeUnmount(() => {
  window.removeEventListener('resize', measureHeights)
  document.removeEventListener('mousedown', handleOutsideClick)
  cardObserver?.disconnect()
  cancelAnimationFrame(rafId)
})
</script>

<template>
  <aside
    ref="railEl"
    class="annotation-rail"
    :style="{ left: 'calc(100% + 12px)' }"
    un-absolute
    un-top-0
    un-w-64
    un-z-40
    un-hidden
    un-lg:block
  >
    <div
      v-if="anchored.length > 0"
      un-text="xs stone-400 dark:stone-500"
      un-font-semibold
      un-uppercase
      un-tracking-wider
      un-mb-2
      un-pl-3
    >
      批注 ({{ anchored.length }})
    </div>

    <!-- 有锚定批注卡片（Word 审阅：垂直对齐锚点位置） -->
    <div
      v-for="ann in anchored"
      :key="ann.commentId"
      :ref="setCardEl(ann.commentId)"
      class="annotation-card"
      :class="{
        'no-anim': !animReady,
        'annotation-card-active': activeCommentId === ann.commentId,
        'border-orange-400 dark:border-orange-500': ann.matchState === 'approximate',
      }"
      :style="{ position: 'absolute', right: '0', top: `${cardPositions[ann.commentId]?.top ?? 0}px` }"
      un-w-full
      un-border="~ stone-200 dark:stone-700"
      un-rounded-sm
      un-p-3
      un-cursor-pointer
      @mouseenter="setHoverHighlight(ann.commentId); setActiveCommentId(ann.commentId)"
      @mouseleave="setHoverHighlight(null); setActiveCommentId(null)"
      @click="openReply(ann)"
    >
      <!-- 头部：头像 + 作者 + 时间 -->
      <div
        un-flex
        un-items-center
        un-gap-2
        un-mb-1
      >
        <img
          v-if="ann.author.avatarUrl"
          :src="ann.author.avatarUrl"
          un-w-6
          un-h-6
          un-rounded-full
        >
        <span
          v-else
          un-w-6
          un-h-6
          un-rounded-full
          un-bg="stone-200 dark:stone-700"
          un-flex
          un-items-center
          un-justify-center
          un-text="xs stone-500"
        >
          {{ ann.author.login.slice(0, 1).toUpperCase() }}
        </span>
        <span
          un-text-xs
          un-font-semibold
          un-text="stone-700 dark:stone-300"
        >
          {{ ann.author.login }}
        </span>
        <span
          un-text="xs stone-400 dark:stone-500"
        >
          · {{ formatTime(ann.data.createdAt) }}
        </span>
        <span
          v-if="statusLabel[ann.matchState]"
          un-text="xs orange-600 dark:orange-400"
          un-ml-auto
        >
          {{ statusLabel[ann.matchState] }}
        </span>
      </div>

      <!-- 批注正文：3 行截断 + 行内展开 -->
      <p
        un-text-sm
        un-text="stone-700 dark:stone-300"
        un-leading-relaxed
        un-whitespace-pre-wrap
      >
        {{ isExpanded(ann.commentId) ? ann.data.text : bodyPreview(ann) }}
        <button
          v-if="needsTruncate(ann)"
          un-text="xs stone-400 hover:stone-600 dark:stone-500 dark:hover:stone-300"
          un-ml-1
          @click.stop="toggleExpand(ann.commentId)"
        >
          {{ isExpanded(ann.commentId) ? '收起' : '更多' }}
        </button>
      </p>

      <!-- 回复列表（parentCommentId 指向本卡片；缩进 + 竖线；点击回复该回复） -->
      <div
        v-for="reply in repliesOf(ann.commentId)"
        :key="reply.commentId"
        un-mt-2
        un-pl-3
        un-border="l-2 stone-200 dark:stone-700"
        un-cursor-pointer
        :class="{ 'annotation-reply-hover': hoveredReplyId === reply.commentId }"
        @mouseenter="hoverReply(reply)"
        @mouseleave="clearReplyHover"
        @click.stop="openReply(reply)"
      >
        <div
          un-flex
          un-items-center
          un-gap-1.5
          un-mb-0.5
        >
          <img
            v-if="reply.author.avatarUrl"
            :src="reply.author.avatarUrl"
            un-w-4
            un-h-4
            un-rounded-full
          >
          <span
            un-text="xs stone-600 dark:stone-300"
            un-font-medium
          >
            {{ reply.author.login }}
          </span>
          <span
            un-text="xs stone-400 dark:stone-500"
          >
            · {{ formatTime(reply.data.createdAt) }}
          </span>
        </div>
        <div
          class="annotation-reply-body"
          un-text="xs stone-700 dark:stone-300"
          un-leading-relaxed
          v-html="renderReplyBody(reply.data.text)"
        />
      </div>

      <!-- 卡片不内嵌回复 UI——点击卡片弹出浮层（annotation-float-reply） -->
    </div>

    <!-- 无法定位分组（沉底在最后一个锚定卡片之后） -->
    <div
      v-if="unanchored.length > 0"
      class="annotation-rail-una"
      :style="{ position: 'absolute', right: '0', top: `${unanchoredTop}px` }"
      un-w-full
    >
      <div
        un-text="xs stone-400 dark:stone-500"
        un-font-semibold
        un-uppercase
        un-tracking-wider
        un-mt-4
        un-mb-2
      >
        无法定位 ({{ unanchored.length }})
      </div>

      <div
        v-for="ann in unanchored"
        :key="ann.commentId"
        class="annotation-card"
        un-bg="stone-100/80 dark:stone-800/80"
        un-border="~ stone-200 dark:stone-700"
        un-rounded
        un-p-3
        un-mb-3
        un-opacity-80
      >
        <!-- 头部：作者 + 时间 + 状态 -->
        <div
          un-flex
          un-items-center
          un-gap-2
          un-mb-1
        >
          <img
            v-if="ann.author.avatarUrl"
            :src="ann.author.avatarUrl"
            un-w-6
            un-h-6
            un-rounded-full
          >
          <span
            un-text-xs
            un-font-semibold
            un-text="stone-700 dark:stone-300"
          >
            {{ ann.author.login }}
          </span>
          <span
            un-text="xs stone-400 dark:stone-500"
          >
            · {{ formatTime(ann.data.createdAt) }}
          </span>
          <span
            un-text="xs amber-600 dark:amber-400"
            un-ml-auto
          >
            {{ statusLabel[ann.matchState] }}
          </span>
        </div>

        <!-- 引用快照（斜体，竖线） -->
        <div
          un-text-xs
          un-text="stone-400 dark:stone-500"
          un-italic
          un-border="l-2 stone-300 dark:stone-600"
          un-pl-2
          un-mb-1
          un-leading-relaxed
        >
          {{ ann.data.anchor.selected.slice(0, 60) }}{{ ann.data.anchor.selected.length > 60 ? '…' : '' }}
        </div>

        <p
          un-text-sm
          un-text="stone-700 dark:stone-300"
          un-leading-relaxed
          un-whitespace-pre-wrap
        >
          {{ isExpanded(ann.commentId) ? ann.data.text : bodyPreview(ann) }}
          <button
            v-if="needsTruncate(ann)"
            un-text="xs stone-400 hover:stone-600 dark:stone-500 dark:hover:stone-300"
            un-ml-1
            @click.stop="toggleExpand(ann.commentId)"
          >
            {{ isExpanded(ann.commentId) ? '收起' : '更多' }}
          </button>
        </p>
      </div>
    </div>
  </aside>

  <!-- 回复浮层（点击卡片弹出；fixed 定位在卡片旁，卡片高度不变） -->
  <div
    v-if="floatReply"
    class="annotation-float-reply"
    :style="floatStyle"
    un-fixed
    un-z-50
    un-w-72
    un-bg="white dark:stone-800"
    un-border="~ stone-200 dark:stone-700"
    un-rounded
    un-shadow-lg
    un-p-3
  >
    <div
      un-text="xs stone-400 dark:stone-500"
      un-mb-2
      un-leading-relaxed
    >
      {{ floatReply.parentCommentId ? '回复回复' : '回复批注' }}
      <span
        un-font-semibold
        un-text="stone-600 dark:stone-300"
      >
        {{ floatReply.author.login }}
      </span>
      <!-- 被回复内容：显示该条批注/回复自身的内容 -->
      <div
        un-text-xs
        un-text="stone-400 dark:stone-500"
        un-border="l-2 stone-300 dark:stone-600"
        un-pl-2
        un-mt-1
        un-leading-relaxed
        un-whitespace-pre-wrap
      >
        {{ floatReply.data.text.slice(0, 80) }}{{ floatReply.data.text.length > 80 ? '…' : '' }}
      </div>
    </div>
    <input
      v-model="floatText"
      type="text"
      :placeholder="floatReply.parentCommentId ? `回复 @${floatReply.author.login}…（⏎ 发送，Esc 关闭）` : '回复…（⏎ 发送，Esc 关闭）'"
      autofocus
      un-w-full
      un-text-sm
      un-bg="stone-50 dark:stone-800/60"
      un-border="~ stone-200 dark:stone-700"
      un-rounded
      un-px-3
      un-py-1.5
      un-outline-none
      un-text="stone-800 dark:stone-200"
      un-placeholder="stone-400 dark:stone-500"
      @keydown="handleReplyKeydown"
    >
    <div
      un-flex
      un-items-center
      un-justify-between
      un-mt-2
    >
      <span
        v-if="floatError"
        un-text="xs red-500"
      >
        {{ floatError }}
      </span>
      <div
        un-flex
        un-items-center
        un-gap-2
        un-ml-auto
      >
        <button
          un-text="xs stone-400 hover:stone-600"
          @click="closeReply"
        >
          取消
        </button>
        <button
          class="annotation-btn-primary"
          :disabled="floatSubmitting || !floatText.trim()"
          @click="submitFloatReply"
        >
          {{ floatSubmitting ? '提交中…' : '发送' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.annotation-card {
  transition:
    border-color 0.2s,
    background-color 0.2s,
    top 0.25s ease;
  will-change: top;
}
/* 首次测量完成前不过渡（避免加载时卡片从错误位置滑动） */
.annotation-card.no-anim {
  transition: none;
}
.annotation-card:hover {
  border-color: var(--annotation-card-hover-border, rgba(120, 113, 108, 0.5));
}
.annotation-card-active {
  border-color: var(--annotation-active-border, rgba(120, 113, 108, 0.9));
  background-color: var(--annotation-active-card-bg, rgba(120, 113, 108, 0.08));
}
/* 回复条目 hover 反馈（粒度区分：条目自身高亮 + 联动父批注正文高亮） */
.annotation-reply-hover {
  background-color: rgba(120, 113, 108, 0.08);
  border-radius: 4px;
}
.annotation-btn-primary {
  @apply un-px-3 un-py-1 un-text-xs un-rounded un-bg-stone-900 dark:un-bg-stone-100 un-text-white dark:un-text-stone-900 un-transition un-duration-300;
}
.annotation-btn-primary:hover:not(:disabled) {
  @apply un-opacity-80;
}
.annotation-btn-primary:disabled {
  @apply un-opacity-40 un-cursor-not-allowed;
}

/* 回复正文渲染（v-html 内容，需 :deep 穿透 scoped） */
.annotation-reply-body :deep(blockquote) {
  @apply un-m-0 un-mb-1 un-pl-2 un-text-stone-400 dark:un-text-stone-500;
  border-left: 2px solid rgba(120, 113, 108, 0.35);
}
.annotation-reply-body :deep(a) {
  color: var(--annotation-link, rgba(120, 113, 108, 0.9));
  text-decoration: underline;
  text-underline-offset: 2px;
}
.annotation-reply-body :deep(p) {
  margin: 0;
}
</style>
