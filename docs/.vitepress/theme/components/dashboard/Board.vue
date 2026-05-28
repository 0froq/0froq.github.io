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
      done: 'Done',
      backlog: 'Backlog',
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
      done: '已完成',
      backlog: '待办池',
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

const activeStatusOrder = ['inProgress', 'notStarted', 'blocked', 'deferred', 'deffered', 'cancelled']
const doneStatusOrder = ['done']
const backlogStatusOrder = ['notStarted']

const activeStatusConfig = {
  inProgress: { label: t('status.inProgress') },
  notStarted: { label: t('status.notStarted') },
  blocked: { label: t('status.blocked') },
  deferred: { label: t('status.deferred') },
  deffered: { label: t('status.deffered') },
  cancelled: { label: t('status.cancelled') },
}

const doneStatusConfig = {
  done: { label: t('status.done') },
}

const backlogStatusConfig = {
  notStarted: { label: t('status.notStarted') },
}

const activeTasks = boardData.asTaskItems.active
const doneTasks = boardData.asTaskItems.done
const backlogTasks = boardData.asTaskItems.backlog

const activeDone = activeTasks.filter((t: TaskItem) => t.status === 'done').length
const activeTotal = activeTasks.filter((t: TaskItem) => !['deferred', 'deffered', 'cancelled'].includes(t.status)).length
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
    v-if="doneTasks.length"
    :title="t('done')"
    :tasks="doneTasks"
    :status-order="doneStatusOrder"
    :status-config="doneStatusConfig"
    :progress="doneTasks.length"
    un-bg-header="emerald-100/40 dark:emerald-900/40"
    un-bg-content="emerald-100/20 dark:emerald-900/20"
    un-border-color="emerald-400 dark:emerald-600"
  />
  <TaskList
    v-if="backlogTasks.length"
    :title="t('backlog')"
    :tasks="backlogTasks"
    :status-order="backlogStatusOrder"
    :status-config="backlogStatusConfig"
    enable-markdown
    :progress="backlogTasks.length"
    un-bg-header="sky-100/40 dark:sky-900/40"
    un-bg-content="sky-100/20 dark:sky-900/20"
    un-border-color="sky-400 dark:sky-600"
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
