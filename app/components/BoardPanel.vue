<script setup lang="ts">
import type { BoardData } from '~/utils/board'
import { TASK_STATUS } from '~/utils/board'

const { data: board } = await useAsyncData('board', () => $fetch<BoardData>('/api/board'))

const columns = computed(() => {
  const data = board.value
  if (!data)
    return []
  return [
    { id: 'active', title: 'Active', tasks: data.active },
    { id: 'backlog', title: 'Backlog', tasks: data.backlog },
    { id: 'archive', title: 'Archive', tasks: data.archive },
  ].filter(col => col.tasks.length)
})

function statusLabel(status?: string) {
  if (!status)
    return ''
  return TASK_STATUS[status] ?? status
}
</script>

<template>
  <div
    v-if="columns.length"
    un-flex
    un-flex-col
    un-gap-10
  >
    <section
      v-for="col in columns"
      :key="col.id"
    >
      <h2
        un-m-0
        un-mb-4
        un-font-serif
        un-text="[1.35em] ink"
        un-font-medium
        un-tracking="[-0.03em]"
      >
        {{ col.title }}
      </h2>
      <ol
        un-m-0
        un-flex
        un-flex-col
        un-gap-3
        un-p-0
        un-list-none
      >
        <li
          v-for="task in col.tasks"
          :key="task.title"
          un-border-b
          un-border-line
          un-pb-3
        >
          <p
            un-m-0
            un-font-serif
            un-text="[1.05em] ink"
          >
            {{ task.title }}
          </p>
          <p
            v-if="statusLabel(task.status) || task.dod"
            un-m-0
            un-mt-1
            un-font-mono
            un-text="11px muted"
          >
            <span v-if="statusLabel(task.status)">{{ statusLabel(task.status) }}</span>
            <span
              v-if="statusLabel(task.status) && task.dod"
              un-opacity-40
            > · </span>
            <span v-if="task.dod">{{ task.dod }}</span>
          </p>
        </li>
      </ol>
    </section>
  </div>
  <p
    v-else
    un-m-0
    un-font-serif
    un-text="muted"
    un-italic
  >
    Board is empty.
  </p>
</template>
