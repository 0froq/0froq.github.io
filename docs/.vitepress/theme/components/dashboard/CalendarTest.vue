<script setup lang="ts">
import type { DashboardCalendarEvent } from '~/types'
import type { VueCalEvent, VueCalViewKeys } from 'vue-cal'
import { useDark } from '@vueuse/core'
import { addDatePrototypes, VueCal } from 'vue-cal'
import { computed, ref } from 'vue'
import FloatWindow from '@/ui/base/FloatWindow.vue'
import { data as calendarData } from '~/src/calendar.data'
import 'vue-cal/style.css'

addDatePrototypes()

type CalendarViewEvent = VueCalEvent & DashboardCalendarEvent & { class?: string }

const isDark = useDark()

const view = ref<VueCalViewKeys>('week')
const viewDate = ref('2026-06-10')
const hoveredEvent = ref<CalendarViewEvent | null>(null)
const floatWindowRef = ref<InstanceType<typeof FloatWindow> | null>(null)

const fixtureEvents: DashboardCalendarEvent[] = [
  // Case 1: same-day multiple task deadlines.
  {
    id: 'fixture-task-1',
    title: '[fixture] 同日到期 task A',
    start: '2026-06-10 00:00',
    end: '2026-06-10 23:59',
    allDay: true,
    source: 'board',
    type: 'task-fixture',
    priority: 'high',
    content: '测试：同一天多个 due task 的圆点堆叠。',
    url: '/dashboard/calendar-test/',
  },
  {
    id: 'fixture-task-2',
    title: '[fixture] 同日到期 task B',
    start: '2026-06-10 00:00',
    end: '2026-06-10 23:59',
    allDay: true,
    source: 'board',
    type: 'task-fixture',
    priority: 'medium',
    content: '测试：同一天多个 due task 的圆点堆叠。',
    url: '/dashboard/calendar-test/',
  },
  {
    id: 'fixture-task-3',
    title: '[fixture] 同日到期 task C',
    start: '2026-06-10 00:00',
    end: '2026-06-10 23:59',
    allDay: true,
    source: 'board',
    type: 'task-fixture',
    priority: 'low',
    content: '测试：同一天多个 due task 的圆点堆叠。',
    url: '/dashboard/calendar-test/',
  },
  // Case 2a: single multi-day schedule.
  {
    id: 'fixture-schedule-multiday-single',
    title: '[fixture] 单个跨多天 schedule',
    start: '2026-06-09 09:00',
    end: '2026-06-12 18:00',
    source: 'schedule',
    type: 'fixture',
    content: '测试：单个跨越多天的 schedule 在月/周视图中的长条渲染。',
    url: '/dashboard/calendar-test/',
  },
  // Case 2b: overlapping multi-day schedules.
  {
    id: 'fixture-schedule-overlap-a',
    title: '[fixture] 重叠跨日 schedule A',
    start: '2026-06-11 10:00',
    end: '2026-06-14 16:00',
    source: 'schedule',
    type: 'fixture',
    content: '测试：多个跨多天日程互相重合时的堆叠方式。',
    url: '/dashboard/calendar-test/',
  },
  {
    id: 'fixture-schedule-overlap-b',
    title: '[fixture] 重叠跨日 schedule B',
    start: '2026-06-12 14:00',
    end: '2026-06-15 11:00',
    source: 'schedule',
    type: 'fixture',
    content: '测试：与 schedule A 部分重叠，并跨到下一周。',
    url: '/dashboard/calendar-test/',
  },
  // Case 3: different time slots and overnight schedule.
  {
    id: 'fixture-schedule-morning',
    title: '[fixture] 上午短日程',
    start: '2026-06-08 08:30',
    end: '2026-06-08 10:00',
    source: 'schedule',
    type: 'fixture',
    content: '测试：同一天不同时段之一。',
    url: '/dashboard/calendar-test/',
  },
  {
    id: 'fixture-schedule-afternoon',
    title: '[fixture] 下午短日程',
    start: '2026-06-08 15:00',
    end: '2026-06-08 17:30',
    source: 'schedule',
    type: 'fixture',
    content: '测试：同一天不同时段之二。',
    url: '/dashboard/calendar-test/',
  },
  {
    id: 'fixture-schedule-overnight',
    title: '[fixture] 今日下午到明天上午',
    start: '2026-06-08 16:00',
    end: '2026-06-09 10:00',
    source: 'schedule',
    type: 'fixture',
    content: '测试：从今天下午跨到明天上午的过夜日程。',
    url: '/dashboard/calendar-test/',
  },
]

const events = computed<CalendarViewEvent[]>(() => [...calendarData.events, ...fixtureEvents]
  .map(event => ({
    ...event,
    class: [event.source, event.type, event.priority].filter(Boolean).join(' '),
  }))
  .sort((a, b) => String(a.start).localeCompare(String(b.start))))

function showEventTooltip(event: CalendarViewEvent, e: MouseEvent) {
  hoveredEvent.value = event
  floatWindowRef.value?.updateMousePosition(e)
}

function moveEventTooltip(e: MouseEvent) {
  floatWindowRef.value?.updateMousePosition(e)
}

function hideEventTooltip() {
  hoveredEvent.value = null
}

function openEvent(event = hoveredEvent.value) {
  if (!event?.url)
    return

  if (event.url.startsWith('http')) {
    window.open(event.url, '_blank', 'noopener,noreferrer')
    return
  }

  window.location.href = event.url
}

function formatTimeRange(event: CalendarViewEvent) {
  if (event.allDay)
    return '全天'

  return `${extractTime(event.start)}–${extractTime(event.end)}`
}

function extractTime(value: CalendarViewEvent['start']) {
  if (value instanceof Date)
    return `${String(value.getHours()).padStart(2, '0')}:${String(value.getMinutes()).padStart(2, '0')}`

  return value.split(' ')[1]?.slice(0, 5) ?? ''
}

function eventSourceLabel(source: DashboardCalendarEvent['source']) {
  return source === 'board' ? 'task' : 'schedule'
}
</script>

<template>
  <section
    un-mx-auto
    un-max-w="6xl"
    un-px="4 md:6"
    un-py="8"
  >
    <div
      un-mb-5
      un-flex="~ col gap-2 md:row md:items-end md:justify-between"
    >
      <div>
        <p
          un-font-mono
          un-text="xs stone-500 dark:stone-400"
          un-uppercase
          un-tracking-widest
        >
          Calendar Prototype
        </p>
        <h1
          un-mt-1
          un-text="2xl md:3xl stone-900 dark:stone-100"
          un-font-semibold
        >
          Board 日程视图测试
        </h1>
        <p
          un-mt-2
          un-max-w-2xl
          un-text="sm stone-600 dark:stone-400"
        >
          只读日历视图。数据来自 board.yml 中带 due 的 task，以及 docs/dashboard/schedule.yml 中的时间段日程。当前测试页额外注入 fixture，用于压力测试同日多 task、跨日 schedule、重叠跨日和过夜日程。
        </p>
      </div>

      <div
        un-flex="~ wrap gap-2"
        un-text="xs"
      >
        <span un-rounded-full un-bg="amber-100 dark:amber-950" un-px-3 un-py-1 un-text="amber-800 dark:amber-200">task due</span>
        <span un-rounded-full un-bg="sky-100 dark:sky-950" un-px-3 un-py-1 un-text="sky-800 dark:sky-200">schedule</span>
        <span un-rounded-full un-bg="stone-200 dark:stone-800" un-px-3 un-py-1 un-text="stone-700 dark:stone-300">fixture on</span>
      </div>
    </div>

    <div
      class="calendar-shell"
      un-overflow-hidden
      un-rounded-2xl
      un-border="1 stone-200 dark:stone-800"
      un-bg="stone-50/80 dark:stone-950/70"
      un-shadow="sm"
    >
        <ClientOnly>
          <VueCal
            v-model:view="view"
            v-model:view-date="viewDate"
            :dark="isDark"
            locale="zh-cn"
            :views="['month', 'week', 'day']"
            :events="events"
            :editable-events="false"
            :events-on-month-view="'short'"
            :event-count="false"
            :time="true"
            :time-from="0"
            :time-to="24 * 60"
            :time-step="120"
            :time-cell-height="42"
            :current-time-label="true"
            :today-button="true"
            :watch-real-time="false"
          >
            <template #event="{ event }">
              <button
                class="cal-event-card"
                :class="{
                  'is-month': view === 'month',
                  'is-task': event.source === 'board',
                  'is-schedule': event.source === 'schedule',
                }"
                :title="`${event.title}\n${event.content ?? ''}`"
                type="button"
                @click.stop="openEvent(event)"
                @mouseenter="showEventTooltip(event, $event)"
                @mousemove="moveEventTooltip"
                @mouseleave="hideEventTooltip"
              >
                <template v-if="view === 'month'">
                  <span
                    v-if="event.source === 'board'"
                    class="cal-event-card__dot"
                    aria-hidden="true"
                  />
                  <span
                    v-else
                    class="cal-event-card__bar"
                    aria-hidden="true"
                  />
                </template>
                <template v-else>
                  <span class="cal-event-card__meta">
                    <span>{{ eventSourceLabel(event.source) }}</span>
                    <span>{{ formatTimeRange(event) }}</span>
                  </span>
                  <span class="cal-event-card__title">{{ event.title }}</span>
                </template>
              </button>
            </template>
          </VueCal>
          <template #fallback>
            <div un-p-8 un-text="sm stone-500">
              Calendar loading...
            </div>
          </template>
        </ClientOnly>
    </div>

    <FloatWindow
      ref="floatWindowRef"
      :visible="!!hoveredEvent"
      :follow-mouse="true"
      :mouse-margin="14"
    >
      <div
        v-if="hoveredEvent"
        class="calendar-tooltip"
        un-w="72"
        un-rounded-xl
        un-border="1 stone-300/80 dark:stone-700/90"
        un-bg="stone-50/95 dark:stone-950/95"
        un-p="3.5"
        un-shadow="xl"
        un-backdrop-blur="md"
        un-text-align-start
      >
        <div
          un-inline-flex
          un-items-center
          un-gap-2
          un-rounded-full
          un-bg="stone-200/70 dark:stone-800/80"
          un-px-2.5
          un-py-1
          un-text="xs stone-600 dark:stone-300"
          un-font-mono
        >
          <span>{{ eventSourceLabel(hoveredEvent.source) }}</span>
          <span>·</span>
          <span>{{ hoveredEvent.type }}</span>
        </div>

        <h2
          un-mt-3
          un-text="base stone-900 dark:stone-100"
          un-font-semibold
          un-leading-snug
        >
          {{ hoveredEvent.title }}
        </h2>

        <p
          un-mt-1
          un-font-mono
          un-text="xs stone-500 dark:stone-400"
        >
          {{ formatTimeRange(hoveredEvent) }}
        </p>

        <p
          v-if="hoveredEvent.content"
          un-mt-3
          un-whitespace-pre-line
          un-text="sm stone-700 dark:stone-300"
          un-leading-relaxed
        >
          {{ hoveredEvent.content }}
        </p>

        <p
          v-if="hoveredEvent.url"
          un-mt-3
          un-font-mono
          un-text="xs stone-500 dark:stone-400"
        >
          click to open source
        </p>
      </div>
    </FloatWindow>
  </section>
</template>

<style scoped>
.calendar-shell {
  height: min(70vh, 640px);
  min-height: 560px;
}

.calendar-shell :deep(.vuecal) {
  height: 100%;
  border: 0;
  font-family: var(--font-sans, ui-sans-serif, system-ui, sans-serif);
  background: transparent;
}

.calendar-shell :deep(.vuecal__header) {
  border-bottom: 1px solid rgb(214 211 209 / 0.65);
}

.calendar-shell :deep(.vuecal__title-bar),
.calendar-shell :deep(.vuecal__views-bar) {
  background: transparent;
}

.calendar-shell :deep(.vuecal__event) {
  border: 0;
  border-radius: 0.6rem;
  background: rgb(231 229 228 / 0.9);
  color: rgb(68 64 60);
  box-shadow: 0 1px 2px rgb(0 0 0 / 0.08);
  overflow: hidden;
}

.calendar-shell :deep(.vuecal__event:has(.cal-event-card.is-month)) {
  min-height: 0;
  border-radius: 0;
  background: transparent;
  box-shadow: none;
}

.cal-event-card {
  width: 100%;
  height: 100%;
  padding: 0.25rem 0.4rem;
  border: 0;
  background: transparent;
  color: inherit;
  text-align: left;
  cursor: pointer;
}

.cal-event-card.is-month {
  display: flex;
  align-items: center;
  min-height: 0.75rem;
  padding: 0.05rem 0.2rem;
}

.cal-event-card.is-month.is-task {
  justify-content: center;
}

.cal-event-card__dot {
  width: 0.42rem;
  height: 0.42rem;
  border: 1.5px solid rgb(87 83 78);
  border-radius: 999px;
  background: transparent;
}

.cal-event-card__bar {
  display: block;
  width: 100%;
  height: 0.32rem;
  border-radius: 999px;
  background: rgb(87 83 78 / 0.7);
}

.cal-event-card__meta {
  display: flex;
  gap: 0.35rem;
  align-items: center;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.65rem;
  opacity: 0.65;
}

.cal-event-card__title {
  display: block;
  margin-top: 0.1rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.78rem;
  font-weight: 600;
}

:global(.dark) .calendar-shell :deep(.vuecal__header) {
  border-bottom-color: rgb(41 37 36 / 0.9);
}

:global(.dark) .calendar-shell :deep(.vuecal__event) {
  background: rgb(68 64 60 / 0.9);
  color: rgb(245 245 244);
}

:global(.dark) .calendar-shell :deep(.vuecal__event:has(.cal-event-card.is-month)) {
  background: transparent;
  box-shadow: none;
}

:global(.dark) .cal-event-card__dot {
  border-color: rgb(214 211 209);
}

:global(.dark) .cal-event-card__bar {
  background: rgb(214 211 209 / 0.72);
}
</style>
