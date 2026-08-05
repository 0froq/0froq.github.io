<script setup lang="ts">
import type { ResolvedAnnotation } from '../../types/annotation'

defineProps<{
  annotations: ResolvedAnnotation[]
  activeCommentId: string | null
}>()

const emit = defineEmits<{
  select: [annotation: ResolvedAnnotation]
  close: []
}>()

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
</script>

<template>
  <aside
    class="annotation-sidebar -translate-x-0"
    un-bg="white/90 dark:stone-800/90"
    un-backdrop-blur
    un-border="l ~ stone-200 dark:stone-700"
    un-w-80
    un-max-h="[calc(100vh-4rem)]"
    un-overflow-y-auto
    un-p-4
    un-fixed
    un-right-0
    un-top-16
    un-z-100
    un-transition-transform
  >
    <div
      un-flex
      un-items-center
      un-justify-between
      un-mb-4
    >
      <h2
        un-text-sm
        un-font-semibold
        un-text="stone-600 dark:stone-400"
      >
        批注 ({{ annotations.length }})
      </h2>
      <button
        un-text="stone-400 hover:stone-600 dark:stone-500 dark:hover:stone-300"
        un-text-xl
        un-leading-none
        @click="emit('close')"
      >
        ×
      </button>
    </div>

    <div
      v-if="annotations.length === 0"
      un-text-sm
      un-text="stone-400 dark:stone-500"
      un-py-8
      un-text-center
    >
      选中文本以添加批注
    </div>

    <div
      v-for="ann in annotations"
      :key="ann.commentId"
      class="annotation-item"
      un-border="b ~ stone-100 dark:stone-700"
      un-py-3
      un-cursor-pointer
      :class="{
        'opacity-60': ann.data.status === 'outdated',
        'bg-stone-100 dark:bg-stone-700/50 -mx-2 un-px-2 rounded': activeCommentId === ann.commentId,
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
          un-w-4
          un-h-4
          un-rounded-full
        >
        <span
          un-text-xs
          un-text="stone-500 dark:stone-400"
        >
          {{ ann.author.login }}
        </span>
        <span
          un-text-xs
          un-text="stone-400 dark:stone-500"
        >
          · {{ formatTime(ann.data.createdAt) }}
        </span>
        <span
          v-if="ann.data.status === 'stale' || ann.data.domRange === null && ann.data.status !== 'outdated'"
          un-text="xs amber-500"
          un-ml-auto
        >
          {{ ann.data.status === 'outdated' ? '已过时' : '原文已变更' }}
        </span>
      </div>

      <!-- 选中的原文（截断） -->
      <div
        un-text-xs
        un-text="stone-400 dark:stone-500"
        un-italic
        un-truncate
        un-mb-1
        un-border="l-2 stone-300 dark:stone-600"
        un-pl-2
      >
        "{{ ann.data.anchor.selected.slice(0, 80) }}{{ ann.data.anchor.selected.length > 80 ? '…' : '' }}"
      </div>

      <!-- 批注内容 -->
      <div
        un-text-sm
        un-text="stone-700 dark:stone-300"
        un-whitespace-pre-wrap
        un-line-height-relaxed
      >
        {{ ann.data.text }}
      </div>
    </div>
  </aside>
</template>

<style scoped>
.annotation-sidebar {
  scrollbar-width: thin;
  scrollbar-color: var(--vp-c-divider) transparent;
}
.annotation-item:hover {
  background: var(--vp-c-bg-soft);
}
</style>
