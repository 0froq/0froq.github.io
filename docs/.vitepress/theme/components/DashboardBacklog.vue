<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { renderMdInline } from '../../utils/renderMdInline'
import { data as backlog } from '../src/backlog.data'
import LinkUnderline from './LinkUnderline.vue'

const { t } = useI18n({
  useScope: 'global',
  messages: {
    en: {
      due: 'due on {date}',
      BacklogEmpty: 'No backlog this month',
    },
    zh: {
      due: '在 {date} 到期',
      backlogEmpty: '本月没有 backlog',
    },
  },
})

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
            <span
              v-html="renderMdInline(item.title)"
            />
            <span
              v-if="item.status"
              un-font="mono italic"
              un-text-sm
              :un-text="{
                arranging: 'emerald-400 dark:emerald-600',
                deffered: 'amber-400 dark:amber-600',
                notPlanned: 'neutral-400 night:neutral-600',
              }[item.status]"
              :un-underline="{
                arranging: '~ px emerald-400 dark:emerald-600',
                deffered: '~ px amber-400 dark:amber-600',
                notPlanned: '~ px neutral-400 night:neutral-600',
              }[item.status]"
            >
              {{ item.status }}
            </span>
            <i18n-t
              keypath="due"
            >
              <template #date>
                <span
                  v-if="item.due"
                  :data-till-due="tillDueMapping(calculateDaysUntilDue(item.due))"
                  un-font-mono
                  un-underline="~ wavy px"
                >
                  {{ item.due }}
                </span>
              </template>
            </i18n-t>
          </div>
          <div
            v-if="item.dod"
            class="dod-text"
            un-ml-4
            un-text="neutral-600 dark:neutral-400"
            v-html="renderMdInline(item.dod)"
          />
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
      {{ t('backlogEmpty') }}
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
