<script setup lang="ts">
import type { TaskItem } from '~/types'
import { useI18n } from 'vue-i18n'
import { data as boardData } from '~/src/board.data'
import TaskList from './TaskList.vue'

const { t } = useI18n({
  useScope: 'global',
  messages: {
    en: {
      active: 'Active',
      backlog: 'Backlog',
      archive: 'Archive',
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
      active: '进行中',
      backlog: '待办池',
      archive: '归档',
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

const activeStatusOrder = ['inProgress', 'notStarted', 'blocked', 'done', 'deferred', 'deffered', 'cancelled']

const activeStatusConfig = {
  inProgress: { label: t('status.inProgress') },
  done: { label: t('status.done') },
  notStarted: { label: t('status.notStarted') },
  blocked: { label: t('status.blocked') },
  deferred: { label: t('status.deferred') },
  deffered: { label: t('status.deffered') },
  cancelled: { label: t('status.cancelled') },
}

const activeTasks = boardData.asTaskItems.active
const backlogTasks = boardData.asTaskItems.backlog
const archiveTasks = boardData.asTaskItems.archive

const activeDone = activeTasks.filter((t: TaskItem) => t.status === 'done').length
const activeTotal = activeTasks.filter((t: TaskItem) => !['deferred', 'deffered', 'cancelled'].includes(t.status!)).length
</script>

<template>
  <TaskList
    v-if="activeTasks.length"
    :title="t('active')"
    :subtitle="boardData.weekTheme"
    :tasks="activeTasks"
    :status-order="activeStatusOrder"
    :status-config="activeStatusConfig"
    show-priority
    :progress="{ done: activeDone, total: activeTotal }"
    un-bg-header="amber-100/40 dark:amber-900/40"
    un-bg-content="amber-100/20 dark:amber-900/20"
    un-border-color="amber-400 dark:amber-600"
  />
  <TaskList
    v-if="backlogTasks.length"
    :title="t('backlog')"
    :tasks="backlogTasks"
    enable-markdown
    :progress="backlogTasks.length"
    un-bg-header="sky-100/40 dark:sky-900/40"
    un-bg-content="sky-100/20 dark:sky-900/20"
    un-border-color="sky-400 dark:sky-600"
  />
  <TaskList
    v-if="archiveTasks.length"
    :title="t('archive')"
    :tasks="archiveTasks"
    :progress="archiveTasks.length"
    un-bg-header="emerald-100/40 dark:emerald-900/40"
    un-bg-content="emerald-100/20 dark:emerald-900/20"
    un-border-color="emerald-400 dark:emerald-600"
  />
  <!-- To generate unocss classes -->
  <div
    un-bg="amber-100/20 dark:amber-900/20"
    un-border-color="amber-400 dark:amber-600"
  />
  <div
    un-bg="amber-100/40 dark:amber-900/40"
  />
  <div
    un-bg="emerald-100/20 dark:emerald-900/20"
    un-border-color="emerald-400 dark:emerald-600"
  />
  <div
    un-bg="emerald-100/40 dark:emerald-900/40"
  />
  <div
    un-bg="sky-100/20 dark:sky-900/20"
    un-border-color="sky-400 dark:sky-600"
  />
  <div
    un-bg="sky-100/40 dark:sky-900/40"
  />
</template>
