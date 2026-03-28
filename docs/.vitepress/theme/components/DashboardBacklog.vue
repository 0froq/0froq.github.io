<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { data as backlog } from '~/src/backlog.data'
import { renderMdInline } from '~/utils/renderMdInline'
import LinkUnderline from './LinkUnderline.vue'
import QSeperator from './QSeperator.vue'

type BacklogStatus = 'arranging' | 'notPlanned' | 'deferred' | 'deffered'

const { t } = useI18n({
  useScope: 'global',
  messages: {
    en: {
      empty: 'No backlog this month',
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
      empty: '本月没有 backlog',
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

const statusOrder: BacklogStatus[] = ['arranging', 'notPlanned', 'deferred', 'deffered']
const isOpen = ref(true)

function toggle() {
  isOpen.value = !isOpen.value
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

const groupedByStatus = computed(() => {
  const items = backlog.current?.items ?? []
  const grouped = new Map<BacklogStatus, typeof items>()

  for (const item of items) {
    const status = (item.status ?? 'notPlanned') as BacklogStatus
    if (!grouped.has(status))
      grouped.set(status, [])
    grouped.get(status)?.push(item)
  }

  return grouped
})
</script>

<template>
  <section
    v-if="backlog.current"
    un-flex="~ col"
    un-gap-2
    un-pt-4
  >
    <div
      un-rounded="0.5"
      un-flex="~ col"
      un-overflow-hidden
      un-relative
      un-bg="sky-100/20 dark:sky-900/20"
    >
      <div
        class="task-title"
        un-cursor-pointer
        un-p-2
        un-text-base
        un-border-b
        un-flex
        un-justify-between
        un-font-mono
        un-bg="sky-100/40 dark:sky-900/40"
        un-border="sky-300 dark:sky-700"
        @click="toggle"
      >
        <span
          un-font-medium
          un-tracking-wide
        >
          {{ backlog.current.month }}
        </span>
        <span style="font-variant-numeric: diagonal-fractions;">
          {{ backlog.current.items.length }}
        </span>
      </div>

      <Transition name="expand">
        <div
          v-show="isOpen"
          un-p-2
          un-text-sm
          un-overflow-hidden
        >
          <template v-if="backlog.current.items.length">
            <div
              v-for="status in statusOrder"
              :key="status"
            >
              <div
                v-if="groupedByStatus.get(status)?.length"
                un-mb-2
              >
                <div
                  un-w="50%"
                  un-mx-auto
                >
                  <QSeperator
                    un-text="stone-900 dark:stone-100"
                    un-my-2
                    :title="t(`status.${status}`)"
                  />
                </div>

                <ul un-list-none>
                  <li
                    v-for="item in groupedByStatus.get(status)"
                    :key="item.title"
                    un-mb-4
                  >
                    <div
                      un-flex="~ row wrap"
                      un-items-center
                      un-gap-x-2
                    >
                      <div
                        class="status-badge"
                        :class="[
                          status === 'arranging' && 'status-arranging',
                          status === 'notPlanned' && 'status-notplanned',
                          (status === 'deferred' || status === 'deffered') && 'status-deferred',
                        ]"
                      />
                      <div v-html="renderMdInline(item.title)" />
                      <span
                        v-if="item.due"
                        :data-due="dueTag(item.due)"
                        un-inline-flex
                        un-items-center
                        un-gap-1
                        un-text-xs
                        un-font-mono
                        un-px-1.5
                        un-py-0.5
                        un-border="~"
                      >
                        ⏰ {{ t(`due.${dueTag(item.due)}`) }} · {{ t('dueDate', { date: item.due }) }}
                      </span>
                    </div>

                    <div
                      v-if="item.dod"
                      class="dod-text"
                      un-ml-6
                      un-text="stone-700 dark:stone-300"
                      v-html="renderMdInline(item.dod)"
                    />

                    <ul
                      v-if="item.links?.length"
                      un-ml-10
                      un-text-sm
                      un-text="stone-500"
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
            </div>
          </template>

          <div
            v-else
            un-w="50%"
            un-mx-auto
          >
            <QSeperator
              un-my-2
              un-text="stone-400 dark:stone-600"
              un-italic
              :title="t('empty')"
              type="dashed"
            />
          </div>
        </div>
      </Transition>
    </div>
  </section>
</template>

<style scoped>
.status-badge {
  --uno: 'w-2 h-2 rounded-full flex-shrink-0';
  --uno: 'bg-stone-600 dark:bg-stone-400';
}

.status-arranging {
  --uno: 'bg-emerald-600 dark:bg-emerald-400';
}

.status-notplanned {
  --uno: 'bg-stone-600 dark:bg-stone-400';
}

.status-deferred {
  --uno: 'bg-amber-600 dark:bg-amber-400';
}

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

.expand-enter-active,
.expand-leave-active {
  transition:
    max-height 0.25s ease,
    opacity 0.2s ease;
}

.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
}

.expand-enter-to,
.expand-leave-from {
  max-height: 800px;
  opacity: 1;
}
</style>
