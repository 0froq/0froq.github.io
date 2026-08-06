<script setup lang="ts">
import type { ResolvedAnnotation } from '../../types/annotation'
import { computed, ref } from 'vue'
import { submitAnnotation } from '~/composables/useAnnotationStore'

const props = defineProps<{
  annotations: ResolvedAnnotation[]
  activeCommentId: string | null
}>()

const emit = defineEmits<{
  select: [annotation: ResolvedAnnotation]
}>()

// 批注按时间倒序（最近的在上）；回复（parentCommentId 非空）紧随其父批注后显示
const sorted = computed(() => {
  const tops = props.annotations.filter(a => !a.parentCommentId)
  const replies = props.annotations.filter(a => a.parentCommentId)
  const byTime = (xs: ResolvedAnnotation[]) =>
    [...xs].sort((a, b) =>
      new Date(b.data.createdAt).getTime() - new Date(a.data.createdAt).getTime(),
    )
  const ordered: ResolvedAnnotation[] = []
  for (const top of byTime(tops)) {
    ordered.push(top)
    // 该父批注的回复（按时间正序：旧→新，紧随父批注）
    const children = byTime(replies.filter(r => r.parentCommentId === top.commentId))
    for (const c of children.reverse())
      ordered.push(c)
  }
  // 孤儿回复（父批注缺失）沉底
  const knownParents = new Set(tops.map(t => t.commentId))
  for (const r of byTime(replies.filter(r => !knownParents.has(r.parentCommentId!))))
    ordered.push(r)
  return ordered
})

// ---- 回复 / 文章评论输入状态 ----
const replyTarget = ref<string | null>(null) // commentId，null = 文章评论输入框
const replyText = ref('')
const articleCommentText = ref('')
const submitting = ref(false)
const replyError = ref<string | null>(null)

function startReply(commentId: string) {
  replyTarget.value = commentId
  replyText.value = ''
  replyError.value = null
}

async function submitReply(ann: ResolvedAnnotation) {
  const text = replyText.value.trim()
  if (!text) {
    replyError.value = '请输入内容'
    return
  }
  submitting.value = true
  replyError.value = null
  try {
    // 回复已有批注：复用其锚点（anchor 可能为 null → 文章级回复）
    await submitAnnotation(text, ann.data.anchor ?? null)
    replyTarget.value = null
    replyText.value = ''
  }
  catch (e: any) {
    replyError.value = e.message || '回复失败'
  }
  finally {
    submitting.value = false
  }
}

async function submitArticleComment() {
  const text = articleCommentText.value.trim()
  if (!text) {
    replyError.value = '请输入内容'
    return
  }
  submitting.value = true
  replyError.value = null
  try {
    // 文章级评论：anchor = null
    await submitAnnotation(text, null)
    articleCommentText.value = ''
  }
  catch (e: any) {
    replyError.value = e.message || '评论失败'
  }
  finally {
    submitting.value = false
  }
}

/** 文章评论框：⌘⏎ / Ctrl+⏎ 提交，Shift+⏎ 换行，Esc 清空 */
function handleArticleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
    e.preventDefault()
    submitArticleComment()
  }
  else if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
    // 纯 Enter：也提交（评论场景惯例）
    e.preventDefault()
    submitArticleComment()
  }
  else if (e.key === 'Escape') {
    articleCommentText.value = ''
  }
}

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

const statusLabel: Record<string, string> = {
  exact: '',
  approximate: '原文可能已修改',
  ambiguous: '位置不确定',
  stale: '原文已修改',
}
</script>

<template>
  <section
    class="annotation-list"
    un-mt-8
    un-pt-6
  >
    <h2
      un-text-lg
      un-font-semibold
      un-mb-4
    >
      批注 ({{ annotations.length }})
    </h2>

    <!-- 文章评论输入框 -->
    <div
      un-pb-4
      un-mb-4
    >
      <textarea
        v-model="articleCommentText"
        rows="2"
        placeholder="评论这篇文章…（⌘⏎ 提交，Shift+⏎ 换行）"
        un-w-full
        un-resize-none
        un-transition-all
        un-text-sm
        un-bg="stone-200/20 dark:stone-800/20"
        un-border="~ stone-200 dark:stone-800"
        un-rounded-xs
        un-px-3
        un-py-2
        un-outline-none
        un-text="stone-800 dark:stone-200"
        un-placeholder="stone-400 dark:stone-600"
        un-leading-relaxed
        un-focus="border-stone-600 dark:border-stone-400 rounded-lg"
        @keydown="handleArticleKeydown"
      />
      <div
        un-flex
        un-items-center
        un-justify-between
        un-mt-2
      >
        <span
          v-if="replyError"
          un-text="xs red-500"
        >
          {{ replyError }}
        </span>
        <div
          un-flex
          un-items-center
          un-gap-2
        >
          <button
            v-if="articleCommentText.trim()"
            class="annotation-btn-primary"
            :disabled="submitting"
            @click="submitArticleComment"
          >
            {{ submitting ? '提交中…' : '评论' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 批注列表（按时间倒序，最近的在上；回复紧随父批注缩进显示） -->
    <div
      v-for="ann in sorted"
      :key="ann.commentId"
      class="annotation-list-item"
      un-border="b ~ stone-100 dark:stone-700"
      un-py-3
      un-cursor-pointer
      :class="{
        'bg-stone-100 dark:bg-stone-700/30 un-px-2 -mx-2 rounded': activeCommentId === ann.commentId,
        'un-pl-6 un-border-l-2 un-border-l-stone-200 dark:un-border-l-stone-700': ann.parentCommentId,
      }"
      @click="emit('select', ann)"
    >
      <!-- 作者行 -->
      <div
        un-flex
        un-items-center
        un-gap-2
        un-mb-1
      >
        <img
          v-if="ann.author.avatarUrl"
          :src="ann.author.avatarUrl"
          un-w-5
          un-h-5
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
          v-if="ann.matchState !== 'article' && statusLabel[ann.matchState]"
          un-text="xs amber-600 dark:amber-400"
          un-ml-auto
        >
          {{ statusLabel[ann.matchState] }}
        </span>
      </div>

      <!-- 引用快照（文本批注） -->
      <div
        v-if="ann.data.anchor"
        un-text-xs
        un-text="stone-400 dark:stone-500"
        un-italic
        un-border="l-2 stone-300 dark:stone-600"
        un-pl-2
        un-mb-1
        un-leading-relaxed
      >
        {{ ann.data.anchor.selected.slice(0, 80) }}{{ ann.data.anchor.selected.length > 80 ? '…' : '' }}
      </div>

      <!-- 批注内容 -->
      <p
        un-text-sm
        un-text="stone-700 dark:stone-300"
        un-leading-relaxed
        un-whitespace-pre-wrap
      >
        {{ ann.data.text }}
      </p>

      <!-- 操作区：回到原文 / 回复 -->
      <div
        un-flex
        un-items-center
        un-gap-3
        un-mt-1
      >
        <button
          v-if="ann.domRange"
          un-text="xs stone-400 hover:stone-600 dark:stone-500 dark:hover:stone-300"
          @click.stop="emit('select', ann)"
        >
          回到原文
        </button>
        <button
          v-if="replyTarget !== ann.commentId"
          un-text="xs stone-400 hover:stone-600 dark:stone-500 dark:hover:stone-300"
          @click.stop="startReply(ann.commentId)"
        >
          评论
        </button>
      </div>

      <!-- 回复输入区 -->
      <template v-if="replyTarget === ann.commentId">
        <textarea
          v-model="replyText"
          rows="2"
          placeholder="回复…"
          un-w-full
          un-resize-none
          un-text-sm
          un-bg="stone-50 dark:stone-800/60"
          un-border="~ stone-200 dark:stone-700"
          un-rounded
          un-px-3
          un-py-2
          un-mt-2
          un-outline-none
          un-text="stone-800 dark:stone-200"
          un-placeholder="stone-400 dark:stone-500"
          un-leading-relaxed
        />
        <div
          un-flex
          un-items-center
          un-justify-end
          un-gap-2
          un-mt-1
        >
          <button
            un-text="xs stone-400 hover:stone-600"
            @click.stop="replyTarget = null"
          >
            取消
          </button>
          <button
            class="annotation-btn-primary"
            :disabled="submitting || !replyText.trim()"
            @click.stop="submitReply(ann)"
          >
            {{ submitting ? '提交中…' : '评论' }}
          </button>
        </div>
      </template>
    </div>
  </section>
</template>

<style scoped>
.annotation-btn-primary {
  @apply un-px-3 un-py-1 un-text-xs un-rounded un-bg-stone-900 dark:un-bg-stone-100 un-text-white dark:un-text-stone-900 un-transition un-duration-300;
}
.annotation-btn-primary:hover:not(:disabled) {
  @apply un-opacity-80;
}
.annotation-btn-primary:disabled {
  @apply un-opacity-40 un-cursor-not-allowed;
}
</style>
