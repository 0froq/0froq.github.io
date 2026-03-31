<script setup lang="ts">
import type { TaskItem } from '../../types'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { data as weekData } from '~/src/week.data'
import TaskList from './TaskList.vue'

const { t } = useI18n({
  useScope: 'global',
  messages: {
    en: {
      status: {
        done: 'Done',
        inProgress: 'In Progress',
        notStarted: 'Not Started',
        deferred: 'Deferred',
        deffered: 'Deferred',
        cancelled: 'Cancelled',
        blocked: 'Blocked',
      },
    },
    zh: {
      status: {
        done: '完毕',
        inProgress: '途中',
        notStarted: '未始',
        deferred: '延期',
        deffered: '延期',
        cancelled: '取消',
        blocked: '阻塞',
      },
    },
  },
})

const statusOrder = ['inProgress', 'notStarted', 'blocked', 'done', 'deferred', 'deffered', 'cancelled']

const statusConfig = {
  done: { label: t('status.done') },
  inProgress: { label: t('status.inProgress') },
  blocked: { label: t('status.blocked') },
  cancelled: { label: t('status.cancelled') },
  deferred: { label: t('status.deferred') },
  deffered: { label: t('status.deffered') },
  notStarted: { label: t('status.notStarted') },
}

const tasks = computed((): TaskItem[] => {
  return weekData.currentWeek?.tasks ?? []
})

const totalDone = computed(() =>
  (weekData.currentWeek?.tasks ?? []).filter(t => t.status === 'done').length,
)

const totalActive = computed(() =>
  (weekData.currentWeek?.tasks ?? []).filter(t => !['deferred', 'deffered', 'cancelled'].includes(t.status ?? '')).length,
)

const weekTitle = computed(() => {
  if (!weekData.currentWeek)
    return ''
  return `${weekData.currentWeek.start} - ${weekData.currentWeek.end}`
})
</script>

<template>
  <TaskList
    v-if="weekData.currentWeek"
    :title="weekTitle"
    :subtitle="weekData.currentWeek.theme"
    :tasks="tasks"
    :status-order="statusOrder"
    :status-config="statusConfig"
    show-priority
    enable-markdown
    :progress="{ done: totalDone, total: totalActive }"
    un-bg-header="emerald-100/40 dark:emerald-900/40"
    un-bg-content="emerald-100/20 dark:emerald-900/20"
    un-border-color="emerald-400 dark:emerald-600"
  />
  <!-- To generate unocss classes -->
  <div
    un-bg="emerald-100/20 dark:emerald-900/20"
    un-border-color="emerald-400 dark:emerald-600"
  />
  <div
    un-bg="emerald-100/40 dark:emerald-900/40"
  />
</template>
