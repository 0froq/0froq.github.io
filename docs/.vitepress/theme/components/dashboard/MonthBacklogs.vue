<script setup lang="ts">
import type { TaskItem } from '../../types'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { data as backlog } from '~/src/backlog.data'
import TaskList from './TaskList.vue'

const { t } = useI18n({
  useScope: 'global',
  messages: {
    en: {
      status: {
        arranging: 'Arranging',
        notPlanned: 'Not Planned',
        deferred: 'Deferred',
        deffered: 'Deferred',
      },
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
      status: {
        arranging: '安排中',
        notPlanned: '未计划',
        deferred: '延期',
        deffered: '延期',
      },
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

const statusOrder = ['arranging', 'notPlanned', 'deferred', 'deffered']

const statusConfig = {
  arranging: { label: t('status.arranging') },
  notPlanned: { label: t('status.notPlanned') },
  deferred: { label: t('status.deferred') },
  deffered: { label: t('status.deffered') },
}

const tasks = computed((): TaskItem[] => {
  return backlog.current?.items ?? []
})

const itemCount = computed(() => backlog.current?.items.length ?? 0)
</script>

<template>
  <TaskList
    v-if="backlog.current"
    :title="backlog.current.month"
    :tasks="tasks"
    :status-order="statusOrder"
    :status-config="statusConfig"
    show-due-date
    enable-markdown
    :progress="itemCount"
    un-bg-header="sky-100/40 dark:sky-900/40"
    un-bg-content="sky-100/20 dark:sky-900/20"
    un-border-color="sky-400 dark:sky-600"
  />
  <!-- To generate unocss classes -->
  <div
    un-bg="sky-100/20 dark:sky-900/20"
    un-border-color="sky-400 dark:sky-600"
  />
  <div
    un-bg="sky-100/40 dark:sky-900/40"
  />
</template>

<style>
[data-due='overdue'] {
  --uno: 'text-rose-700 dark:text-rose-300 border-rose-400 dark:border-rose-600 bg-rose-100/50 dark:bg-rose-900/30';
}

[data-due='today'] {
  --uno: 'text-orange-700 dark:text-orange-300 border-orange-400 dark:border-orange-600 bg-orange-100/50 dark:bg-orange-900/30';
}

[data-due='week'] {
  --uno: 'text-yellow-700 dark:text-yellow-300 border-yellow-400 dark:border-yellow-600 bg-yellow-100/50 dark:bg-yellow-900/30';
}

[data-due='month'] {
  --uno: 'text-lime-700 dark:text-lime-300 border-lime-400 dark:border-lime-600 bg-lime-100/50 dark:bg-lime-900/30';
}

[data-due='future'] {
  --uno: 'text-stone-700 dark:text-stone-300 border-stone-400 dark:border-stone-600 bg-stone-100/50 dark:bg-stone-900/30';
}
</style>
