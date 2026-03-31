<script setup lang="ts">
import type { TaskItem } from '~/types'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { data as dayData } from '~/src/day.data'
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
  notStarted: { label: t('status.notStarted') },
}

const tasks = computed((): TaskItem[] => {
  return dayData.currentDay?.tasks ?? []
})

const totalDone = computed(() =>
  (dayData.currentDay?.tasks ?? []).filter(task => task.status === 'done').length,
)

const totalActive = computed(() =>
  (dayData.currentDay?.tasks ?? []).filter(task => !['deferred', 'deffered', 'cancelled'].includes(task.status)).length,
)
</script>

<template>
  <TaskList
    v-if="dayData.currentDay"
    :title="`${dayData.currentDay.date}`"
    :subtitle="dayData.currentDay.date === dayData.today ? dayData.currentDay.theme : '👻 Not Today'"
    :tasks="tasks"
    :status-order="statusOrder"
    :status-config="statusConfig"
    show-priority
    :progress="{ done: totalDone, total: totalActive }"
    un-bg-header="amber-100/40 dark:amber-900/40"
    un-bg-content="amber-100/20 dark:amber-900/20"
    un-border-color="amber-400 dark:amber-600"
  />
  <!-- To generate unocss classes -->
  <div
    un-bg="amber-100/20 dark:amber-900/20"
    un-border-color="amber-400 dark:amber-600"
  />
  <div
    un-bg="amber-100/40 dark:amber-900/40"
  />
</template>
