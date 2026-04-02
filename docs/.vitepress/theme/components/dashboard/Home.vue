<script setup lang="ts">
import ProgressBarHeader from '@/ui/base/ProgressBarHeader.vue'
import DayTodos from './DayTodos.vue'
import BackLogs from './MonthBacklogs.vue'
import WeekTasks from './WeekTasks.vue'
</script>

<template>
  <ProgressBarHeader
    un-font="mono"
    title="Dashboard"
  />
  <DayTodos />
  <WeekTasks />
  <BackLogs />
</template>

<style scoped>
[data-current='true'] {
  --uno: 'text-stone-950 dark:text-stone-50 font-semibold';
  --uno: 'before:(w-full bg-stone-950 dark:bg-stone-50)';
}
</style>
