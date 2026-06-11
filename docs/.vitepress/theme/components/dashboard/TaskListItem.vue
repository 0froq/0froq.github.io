<script setup lang="ts">
import type { TaskItem } from '../../types'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import LinkUnderline from '@/ui/base/LinkUnderline.vue'
import { renderMdInline } from '~/utils/renderMdInline'

const props = withDefaults(defineProps<{
  task: TaskItem
  status?: string
  showPriority?: boolean
  showDueDate?: boolean
  enableMarkdown?: boolean
}>(), {
  status: '',
  showPriority: false,
  showDueDate: false,
  enableMarkdown: false,
})

const isExpanded = ref(false)
const hasDetails = computed(() => Boolean(props.task.dod) || Boolean(props.task.notes?.length))

function toggleExpand() {
  if (!hasDetails.value)
    return
  isExpanded.value = !isExpanded.value
}

function asHTMLElement(el: Element): HTMLElement | null {
  return el instanceof HTMLElement ? el : null
}

function beforeEnter(el: Element) {
  const element = asHTMLElement(el)
  if (!element)
    return
  element.style.maxHeight = '0px'
  element.style.opacity = '0'
}

function enter(el: Element) {
  const element = asHTMLElement(el)
  if (!element)
    return
  requestAnimationFrame(() => {
    element.style.maxHeight = `${element.scrollHeight}px`
    element.style.opacity = '1'
  })
}

function afterEnter(el: Element) {
  const element = asHTMLElement(el)
  if (!element)
    return
  element.style.maxHeight = ''
  element.style.opacity = ''
}

function beforeLeave(el: Element) {
  const element = asHTMLElement(el)
  if (!element)
    return
  element.style.maxHeight = `${element.scrollHeight}px`
  element.style.opacity = '1'
}

function leave(el: Element) {
  const element = asHTMLElement(el)
  if (!element)
    return
  requestAnimationFrame(() => {
    element.style.maxHeight = '0px'
    element.style.opacity = '0'
  })
}

function afterLeave(el: Element) {
  const element = asHTMLElement(el)
  if (!element)
    return
  element.style.maxHeight = ''
  element.style.opacity = ''
}

const { t } = useI18n({
  useScope: 'global',
  messages: {
    en: {
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

function priorityLevel(priority?: 'high' | 'medium' | 'low'): number {
  if (priority === 'high')
    return 3
  if (priority === 'medium')
    return 2
  if (priority === 'low')
    return 1
  return 0
}

const SLASH_RE = /\//g

function normalizeDate(dueDate: string): string {
  return dueDate.replace(SLASH_RE, '-')
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

function renderTitle(title: string): string {
  return props.enableMarkdown ? renderMdInline(title) : title
}

function renderDod(dod: string): string {
  return props.enableMarkdown ? renderMdInline(dod) : dod
}
</script>

<template>
  <li un-mb-4>
    <div
      un-flex="~ row wrap"
      un-items-center
      un-gap-x-2
      class="task-header"
      :class="{ 'has-details': hasDetails, 'is-expanded': isExpanded }"
      @click="toggleExpand"
    >
      <un-i-solar-alt-arrow-right-bold-duotone
        v-if="task.notes?.length || task.dod?.length"
        un-w-4
        un-h-4
        class="expanded-indicator"
        :data-status="status"
        :data-expanded="isExpanded ? 'true' : 'false'"
      />
      <span
        v-else
        un-w-4
        un-h-4
      />
      <span
        v-if="showPriority && priorityLevel(task.priority)"
        un-font-mono
        un-text="amber-600 dark:amber-400"
        un-text-xs
      >
        {{ '🔥'.repeat(priorityLevel(task.priority)) }}
      </span>
      <div v-html="renderTitle(task.title)" />
      <span
        v-if="showDueDate && task.due"
        :data-due="dueTag(task.due)"
        un-inline-flex
        un-items-center
        un-gap-1
        un-text-xs
        un-font-mono
        un-px-1.5
        un-py-0.5
        un-border="~"
      >
        ⏰ {{ t(`due.${dueTag(task.due)}`) }} · {{ t('dueDate', { date: task.due }) }}
      </span>
      <div
        v-if="task.tags?.length"
        un-flex="~ row wrap"
      >
        <un-i-openmoji-check-mark-button
          v-if="task.tags?.includes('optional')"
          un-text-xl
        />
        <un-i-openmj-drooling-face
          v-if="task.tags?.includes('forIdiot')"
          un-text-xl
        />
        <un-i-openmoji-sweat-droplets
          v-if="task.tags?.includes('deepWork')"
          un-text-xl
        />
        <un-i-openmoji-alarm-clock
          v-if="task.tags?.includes('timeBoxing')"
          un-text-xl
        />
      </div>
    </div>
    <Transition
      name="task-expand"
      @before-enter="beforeEnter"
      @enter="enter"
      @after-enter="afterEnter"
      @before-leave="beforeLeave"
      @leave="leave"
      @after-leave="afterLeave"
    >
      <div v-show="isExpanded">
        <div
          v-if="task.dod"
          class="dod-text"
          un-ml-6
          un-mt-2
          un-text="stone-700 dark:stone-300"
          un-border-l="~"
          un-pl-4
          v-html="renderDod(task.dod)"
        />

        <ul
          v-if="task.notes?.length"
          un-mt-2
          un-ml-10
          un-text-xs
          un-text="stone-500"
        >
          <li
            v-for="note in task.notes"
            :key="`${note.text}:${note.url ?? ''}`"
          >
            <LinkUnderline
              v-if="note.url"
              :href="note.url"
              :text="note.text"
              un-before="bg-stone-700 dark:bg-stone-300"
            />
            <span
              v-else
              un-text="stone-600 dark:stone-400"
            >
              {{ note.text }}
            </span>
          </li>
        </ul>
      </div>
    </Transition>
  </li>
</template>

<style scoped>
.expanded-indicator {
  --uno: 'flex-shrink-0';
  --uno: 'border-px';
  --uno: 'transition duration-200';

  &[data-expanded='true'] {
    --uno: 'rotate-90';
  }

  &[data-status='done'] {
    --uno: 'border-green-500';
  }

  &[data-status='cancelled'] {
    --uno: 'bg-green-500 border-green-500';
  }
}

.task-header {
  --uno: 'cursor-default';
}

.task-header.has-details {
  --uno: 'cursor-pointer';
}

.task-header.is-expanded .expand-indicator {
  --uno: 'rotate-0';
}

.task-expand-enter-active,
.task-expand-leave-active {
  transition:
    max-height 220ms ease,
    opacity 220ms ease;
  overflow: hidden;
}

.task-expand-enter-from,
.task-expand-leave-to {
  max-height: 0;
  opacity: 0;
}
</style>
