<script setup lang="ts">
import type { DayTaskPriority } from '~/src/day.data'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { data as dayData } from '~/src/day.data'
import { renderMdInline } from '~/utils/renderMdInline'
import LinkUnderline from './LinkUnderline.vue'
import QSeperator from './QSeperator.vue'

const { t } = useI18n({
  useScope: 'global',
  messages: {
    en: {
      empty: 'Empty',
      status: {
        done: 'Done',
        inProgress: 'In Progress',
        notStarted: 'Not Started',
        deferred: 'Deferred',
        deffered: 'Deffered',
        cancelled: 'Cancelled',
        blocked: 'Blocked',
      },
    },
    zh: {
      empty: '空的',
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

const statusOrder = ['inProgress', 'notStarted', 'blocked', 'done', 'deferred', 'deffered', 'cancelled'] as const
const isOpen = ref(true)

function toggle() {
  isOpen.value = !isOpen.value
}

function priorityLevel(priority: DayTaskPriority | undefined): number {
  if (priority === 'high')
    return 3
  if (priority === 'medium')
    return 2
  if (priority === 'low')
    return 1
  return 0
}

const groupedTasks = computed(() => {
  const tasks = dayData.currentDay?.tasks ?? []
  const grouped = new Map<string, typeof tasks>()

  for (const task of tasks) {
    const key = task.status
    if (!grouped.has(key))
      grouped.set(key, [])
    grouped.get(key)?.push(task)
  }

  return grouped
})

const totalDone = computed(() =>
  (dayData.currentDay?.tasks ?? []).filter(task => task.status === 'done').length,
)

const totalActive = computed(() =>
  (dayData.currentDay?.tasks ?? []).filter(task => !['deferred', 'deffered', 'cancelled'].includes(task.status)).length,
)
</script>

<template>
  <section
    v-if="dayData.currentDay"
    un-flex="~ col"
    un-gap-2
    un-pt-4
  >
    <div
      un-rounded="0.5"
      un-flex="~ col"
      un-overflow-hidden
      un-relative
      un-bg="amber-100/20 dark:amber-900/20"
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
        un-bg="amber-100/40 dark:amber-900/40"
        un-border="amber-300 dark:amber-700"
        @click="toggle"
      >
        <span
          un-font-medium
          un-tracking-wide
        >
          {{ dayData.currentDay.date }}
          <span v-if="dayData.currentDay.theme"> -
            <span
              un-text="stoene-950 dark:stone-50"
              un-underline="~ px"
              un-font="bold"
            >
              {{ dayData.currentDay.theme }}
            </span>
          </span>
        </span>
        <span style="font-variant-numeric: diagonal-fractions;">
          {{ totalDone }}/{{ totalActive }}
        </span>
      </div>

      <Transition name="expand">
        <div
          v-show="isOpen"
          un-p-2
          un-text-sm
          un-overflow-hidden
        >
          <template v-if="dayData.currentDay.tasks.length">
            <div
              v-for="status in statusOrder"
              :key="status"
            >
              <div
                v-if="groupedTasks.get(status)?.length"
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
                    v-for="task in groupedTasks.get(status)"
                    :key="task.title"
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
                          task.status === 'done' && 'status-done',
                          task.status === 'inProgress' && 'status-inprogress',
                          task.status === 'blocked' && 'status-blocked',
                          task.status === 'cancelled' && 'status-cancelled',
                          (task.status === 'deferred' || task.status === 'deffered') && 'status-deferred',
                        ]"
                      />
                      <span
                        v-if="priorityLevel(task.priority)"
                        un-font-mono
                        un-text="amber-600 dark:amber-400"
                        un-text-xs
                      >
                        {{ '🔥'.repeat(priorityLevel(task.priority)) }}
                      </span>
                      <div v-html="renderMdInline(task.title)" />
                      <un-i-openmj-drooling-face
                        v-if="task.tags?.includes('forIdiot')"
                        un-text-xl
                      />
                    </div>
                    <div
                      v-if="task.dod"
                      class="dod-text"
                      un-ml-6
                      un-text="stone-700 dark:stone-300"
                      v-html="renderMdInline(task.dod)"
                    />
                    <ul
                      v-if="task.links?.length"
                      un-ml-10
                      un-text-sm
                      un-text="stone-500"
                    >
                      <li
                        v-for="link in task.links"
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

.status-done {
  --uno: 'bg-emerald-600 dark:bg-emerald-400';
}

.status-inprogress {
  --uno: 'bg-sky-600 dark:bg-sky-400';
}

.status-blocked {
  --uno: 'bg-rose-600 dark:bg-rose-400';
}

.status-cancelled {
  --uno: 'bg-stone-600 dark:bg-stone-400';
}

.status-deferred {
  --uno: 'bg-amber-600 dark:bg-amber-400';
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
