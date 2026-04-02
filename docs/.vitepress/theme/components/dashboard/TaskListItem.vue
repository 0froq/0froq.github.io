<script setup lang="ts">
import type { TaskItem } from '../../types'
import { useI18n } from 'vue-i18n'
import LinkUnderline from '@/ui/base/LinkUnderline.vue'
import { renderMdInline } from '~/utils/renderMdInline'

const props = withDefaults(defineProps<{
  task: TaskItem
  status: string
  showPriority?: boolean
  showDueDate?: boolean
  enableMarkdown?: boolean
}>(), {
  showPriority: false,
  showDueDate: false,
  enableMarkdown: false,
})

const { t } = useI18n({
  useScope: 'global',
  messages: {
    en: {
      due: {
        overdue: 'Overdue',
        today: 'Due Today',
        week: 'Due This Week',
        month: 'Due This Month',
        future: 'Future Due',
      },
      dueDate: 'due {date}',
    },
    zh: {
      due: {
        overdue: '已过期',
        today: '今日到期',
        week: '本周到期',
        month: '本月到期',
        future: '未来到期',
      },
      dueDate: '{date} 到期',
    },
  },
})

function priorityLevel(priority?: 'high' | 'medium' | 'low'): number {
  if (priority === 'high')
    return 3
  if (priority === 'medium')
    return 2
  if (priority === 'low')
    return 1
  return 0
}

function normalizeDate(dueDate: string): string {
  return dueDate.replace(/\//g, '-')
}

function calculateDaysUntilDue(dueDate: string): number {
  const today = new Date()
  const due = new Date(normalizeDate(dueDate))

  if (Number.isNaN(due.getTime()))
    return Number.POSITIVE_INFINITY

  const timeDiff = due.getTime() - today.getTime()
  return Math.ceil(timeDiff / (1000 * 3600 * 24))
}

function dueTag(dueDate: string): 'overdue' | 'today' | 'week' | 'month' | 'future' {
  const days = calculateDaysUntilDue(dueDate)
  if (!Number.isFinite(days))
    return 'future'
  if (days < 0)
    return 'overdue'
  if (days === 0)
    return 'today'
  if (days <= 7)
    return 'week'
  if (days <= 30)
    return 'month'
  return 'future'
}

function renderTitle(title: string): string {
  return props.enableMarkdown ? renderMdInline(title) : title
}

function renderDod(dod: string): string {
  return props.enableMarkdown ? renderMdInline(dod) : dod
}
</script>

<template>
  <li un-mb-4>
    <div
      un-flex="~ row wrap"
      un-items-center
      un-gap-x-2
    >
      <div
        class="status-badge"
      />
      <span
        v-if="showPriority && priorityLevel(task.priority)"
        un-font-mono
        un-text="amber-600 dark:amber-400"
        un-text-xs
      >
        {{ '🔥'.repeat(priorityLevel(task.priority)) }}
      </span>
      <div v-html="renderTitle(task.title)" />
      <span
        v-if="showDueDate && task.due"
        :data-due="dueTag(task.due)"
        un-inline-flex
        un-items-center
        un-gap-1
        un-text-xs
        un-font-mono
        un-px-1.5
        un-py-0.5
        un-border="~"
      >
        ⏰ {{ t(`due.${dueTag(task.due)}`) }} · {{ t('dueDate', { date: task.due }) }}
      </span>
      <un-i-openmj-drooling-face
        v-if="task.tags?.includes('forIdiot')"
        un-text-xl
      />
    </div>
    <div
      v-if="task.dod"
      class="dod-text"
      un-ml-6
      un-text="stone-700 dark:stone-300"
      v-html="renderDod(task.dod)"
    />

    <ul
      v-if="task.links?.length"
      un-ml-10
      un-text-sm
      un-text="stone-500"
    >
      <li
        v-for="link in task.links"
        :key="link.url"
      >
        <LinkUnderline
          v-if="link.url"
          :href="link.url"
          :text="link.label"
          un-before="bg-stone-700 dark:bg-stone-300"
        />
        <span
          v-else
          un-text="stone-600 dark:stone-400"
        >
          {{ link.label }}
        </span>
      </li>
    </ul>
  </li>
</template>

<style scoped>
.status-badge {
  --uno: 'w-2 h-2 flex-shrink-0';
  --uno: 'border-px border-stone-600 dark:border-stone-400';
}
</style>
