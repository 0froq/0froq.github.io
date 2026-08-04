<script setup lang="ts">
import type { ResolvedAnnotation } from '../../types/annotation'

defineProps<{
  annotations: ResolvedAnnotation[]
  activeCommentId: number | null
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
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes} 分钟前`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} 小时前`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days} 天前`
  return d.toLocaleDateString('zh-CN')
}
</script>

<template>
  <aside
    class="annotation-sidebar"
    bg="white/90 dark:stone-800/90"
    backdrop-blur
    border="l ~ stone-200 dark:stone-700"
    w-80
    max-h="[calc(100vh-4rem)]"
    overflow-y-auto
    p-4
    fixed
    right-0
    top-16
    z-100
    transition-transform
    :class="{ '-translate-x-0': true }"
  >
    <div flex items-center justify-between mb-4>
      <h2 text-sm font-semibold text="stone-600 dark:stone-400">
        批注 ({{ annotations.length }})
      </h2>
      <button
        text="stone-400 hover:stone-600 dark:stone-500 dark:hover:stone-300"
        text-xl
        leading-none
        @click="emit('close')"
      >
        ×
      </button>
    </div>

    <div v-if="annotations.length === 0" text-sm text="stone-400 dark:stone-500" py-8 text-center>
      选中文本以添加批注
    </div>

    <div
      v-for="ann in annotations"
      :key="ann.commentId"
      class="annotation-item"
      border="b ~ stone-100 dark:stone-700"
      py-3
      cursor-pointer
      :class="{
        'opacity-60': ann.data.status === 'outdated',
        'bg-stone-100 dark:bg-stone-700/50 -mx-2 px-2 rounded': activeCommentId === ann.commentId,
      }"
      @click="emit('select', ann)"
    >
      <!-- 作者行 -->
      <div flex items-center gap-2 mb-1>
        <img
          v-if="ann.author.avatarUrl"
          :src="ann.author.avatarUrl"
          w-4 h-4
          rounded-full
        >
        <span text-xs text="stone-500 dark:stone-400">
          {{ ann.author.login }}
        </span>
        <span text-xs text="stone-400 dark:stone-500">
          · {{ formatTime(ann.data.createdAt) }}
        </span>
        <span
          v-if="ann.data.status === 'stale' || ann.data.domRange === null && ann.data.status !== 'outdated'"
          text="xs amber-500"
          ml-auto
        >
          {{ ann.data.status === 'outdated' ? '已过时' : '原文已变更' }}
        </span>
      </div>

      <!-- 选中的原文（截断） -->
      <div
        text-xs
        text="stone-400 dark:stone-500"
        italic
        truncate
        mb-1
        border="l-2 stone-300 dark:stone-600"
        pl-2
      >
        "{{ ann.data.anchor.selected.slice(0, 80) }}{{ ann.data.anchor.selected.length > 80 ? '…' : '' }}"
      </div>

      <!-- 批注内容 -->
      <div text-sm text="stone-700 dark:stone-300" whitespace-pre-wrap line-height-relaxed>
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
