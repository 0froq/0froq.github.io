<script setup lang="ts">
import type { TaskItem, TaskProgress, TaskStatusConfig } from '../../types'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import QSeperator from '@/ui/base/QSeperator.vue'
import TaskListItem from './TaskListItem.vue'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<{
  title: string
  subtitle?: string
  tasks: TaskItem[]
  statusOrder?: string[]
  statusConfig?: Record<string, TaskStatusConfig>
  showPriority?: boolean
  showDueDate?: boolean
  enableMarkdown?: boolean
  progress?: TaskProgress
  emptyText?: string
}>(), {
  showPriority: false,
  showDueDate: true,
  enableMarkdown: false,
})

const { t } = useI18n({
  useScope: 'global',
  messages: {
    en: {
      empty: 'Empty',
    },
    zh: {
      empty: '空的',
    },
  },
})

const isOpen = ref(true)

function toggle() {
  isOpen.value = !isOpen.value
}

const statusSequence = computed(() => props.statusOrder ?? [])
const shouldGroupByStatus = computed(() => statusSequence.value.length > 0)

const groupedTasks = computed(() => {
  const grouped = new Map<string, TaskItem[]>()

  for (const task of props.tasks) {
    const key = task.status ?? 'unclassified'
    if (!grouped.has(key))
      grouped.set(key, [])
    grouped.get(key)?.push(task)
  }

  return grouped
})

function getStatusLabel(status: string): string {
  return props.statusConfig?.[status]?.label ?? status
}

function formatProgress(): string {
  if (typeof props.progress === 'number')
    return String(props.progress)
  if (props.progress)
    return `${props.progress.done}/${props.progress.total}`
  return ''
}
</script>

<template>
  <section
    un-flex="~ col"
    un-gap-2
    un-pt-4
  >
    <div
      un-rounded="0.5"
      un-flex="~ col"
      un-overflow-hidden
      un-relative
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
        v-bind="{ 'un-bg': $attrs['un-bg-header'], 'un-border-color': $attrs['un-border-color'] }"
        @click="toggle"
      >
        <span
          un-font-medium
          un-tracking-wide
        >
          {{ title }}
          <span v-if="subtitle"> -
            <span
              un-text="neutral-950 dark:neutral-50"
              un-font="bold"
            >
              {{ subtitle }}
            </span>
          </span>
        </span>
        <span
          v-if="progress !== undefined"
          :style="`font-variant-numeric: ${typeof props.progress !== 'number' ? 'diagonal-fractions' : ''}`"
        >
          {{ formatProgress() }}
        </span>
      </div>

      <Transition name="expand">
        <div
          v-show="isOpen"
          un-p-2
          un-pt-4
          un-text-sm
          un-overflow-hidden
          v-bind="{ 'un-bg': $attrs['un-bg-content'] }"
        >
          <template v-if="tasks.length">
            <template v-if="shouldGroupByStatus">
              <div
                v-for="status in statusSequence"
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
                      un-text="neutral-900 dark:neutral-100"
                      un-my-2
                      :title="getStatusLabel(status)"
                    />
                  </div>
                  <ul un-list-none>
                    <TaskListItem
                      v-for="task in groupedTasks.get(status)"
                      :key="task.title"
                      :task="task"
                      :status="status"
                      :show-priority="showPriority"
                      :show-due-date="showDueDate"
                      :enable-markdown="enableMarkdown"
                    />
                  </ul>
                </div>
              </div>
            </template>

            <ul
              v-else
              un-list-none
            >
              <TaskListItem
                v-for="task in tasks"
                :key="task.title"
                :task="task"
                :show-priority="showPriority"
                :show-due-date="showDueDate"
                :enable-markdown="enableMarkdown"
              />
            </ul>
          </template>

          <div
            v-else
            un-w="50%"
            un-mx-auto
          >
            <QSeperator
              un-my-2
              un-text="neutral-400 dark:neutral-600"
              un-italic
              :title="emptyText || t('empty')"
              type="dashed"
            />
          </div>
        </div>
      </Transition>
    </div>
  </section>
</template>

<style scoped>
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
