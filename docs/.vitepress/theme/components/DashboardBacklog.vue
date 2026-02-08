<script setup lang="ts">
import { renderMdInline } from '../../utils/renderMdInline'
import { data as backlog } from '../src/backlog.data'
import LinkUnderline from './LinkUnderline.vue'

// Calculate days until due
function calculateDaysUntilDue(dueDate: string): number {
  const today = new Date()
  const due = new Date(dueDate)
  const timeDiff = due.getTime() - today.getTime()
  return Math.ceil(timeDiff / (1000 * 3600 * 24))
}

function tillDueMapping(days: number): string {
  if (days < 0)
    return 'overdue'
  else if (days === 0)
    return 'today'
  else if (days <= 7)
    return 'week'
  else if (days <= 30)
    return 'month'
  else
    return 'future'
}
</script>

<template>
  <section class="section-card">
    <div
      v-if="backlog.current"
      un-py-8
    >
      <ul>
        <li
          v-for="item in backlog.current.items"
          :key="item.title"
          un-my-2
        >
          <div
            un-flex="~ row wrap"
            un-items-center
            un-gap-x-2
          >
            <!-- <span un-font-bold>{{ item.title }}</span> -->
            <span
              un-font-bold
              v-html="renderMdInline(item.title)"
            />
            <span
              v-if="item.status"
              un-font-mono
              un-text-sm
              un-text="neutral-500"
              un-bg="neutral-200 dark:neutral-800"
              un-px-2
              un-rounded-full
            >
              {{ item.status }}
            </span>
            <span
              v-if="item.due"
              un-text-sm
              un-text="neutral-500"
            >
              due on
              <span
                :data-till-due="tillDueMapping(calculateDaysUntilDue(item.due))"
                un-font-mono
                un-underline="~ wavy px"
              >
                {{ item.due }}
              </span>
            </span>
          </div>
          <div
            v-if="item.dod"
            class="dod-text"
            un-ml-4
          >
            {{ item.dod }}
          </div>
          <ul
            v-if="item.links?.length"
            un-ml-8
            un-text-sm
            un-text="neutral-500"
          >
            <li
              v-for="link in item.links"
              :key="link.url"
            >
              <LinkUnderline
                :href="link.url"
                :text="link.label"
                :vanilla="true"
              />
            </li>
          </ul>
        </li>
      </ul>
    </div>
    <div
      v-else
      un-pt-4
      un-text-sm
      un-text="neutral-500"
    >
      本月暂无 backlog
    </div>
  </section>
</template>

<style scoped>
[data-till-due='overdue'] {
  --uno: 'text-red-500';
}

[data-till-due='today'] {
  --uno: 'text-amber-500';
}

[data-till-due='week'] {
  --uno: 'text-yellow-500';
}

[data-till-due='month'] {
  --uno: 'text-lime-500';
}

[data-till-due='future'] {
  --uno: 'text-neutral-500';
}
</style>
