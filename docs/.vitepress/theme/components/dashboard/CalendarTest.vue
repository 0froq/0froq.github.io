<script setup lang="ts">
import type { DashboardCalendarEvent } from '~/types'
import { computed, ref } from 'vue'
import FloatWindow from '@/ui/base/FloatWindow.vue'
import { data as calendarData } from '~/src/calendar.data'

type TimelineEvent = DashboardCalendarEvent & {
  startMs: number
  endMs: number
  left: number
  width: number
  lane: number
}

type TimelineTask = DashboardCalendarEvent & {
  dueMs: number
  left: number
  stack: number
}

const DAY = 24 * 60 * 60 * 1000
const HOUR = 60 * 60 * 1000
const DAY_WIDTH = 112
const TIMELINE_PADDING = 96
const BASELINE_Y = 164
const SCHEDULE_START_Y = 56
const SCHEDULE_LANE_HEIGHT = 14
const TASK_STACK_GAP = 12

const hoveredEvent = ref<DashboardCalendarEvent | null>(null)
const floatWindowRef = ref<InstanceType<typeof FloatWindow> | null>(null)

const fixtureEvents: DashboardCalendarEvent[] = [
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
  {
    id: 'fixture-task-done',
    title: '[fixture] 已完成 task',
    start: '2026-06-11 00:00',
    end: '2026-06-11 23:59',
    allDay: true,
    source: 'board',
    type: 'task-fixture',
    priority: 'medium',
    status: 'done',
    content: '测试：已完成 task 的 due 点应该更低对比。',
    url: '/dashboard/calendar-test/',
  },
  {
    id: 'fixture-task-timed-high',
    title: '[fixture] 有具体时间 high task',
    start: '2026-06-12 19:30',
    end: '2026-06-12 20:00',
    source: 'board',
    type: 'task-fixture',
    priority: 'high',
    content: '测试：有具体时间的 task due 不落在 22:00，而落在精确时间。',
    url: '/dashboard/calendar-test/',
  },
  {
    id: 'fixture-schedule-multiday-single',
    title: '[fixture] 单个跨多天 schedule',
    start: '2026-06-09 09:00',
    end: '2026-06-12 18:00',
    source: 'schedule',
    type: 'fixture',
    priority: 'high',
    content: '测试：单个跨越多天的 high priority schedule 横线渲染。',
    url: '/dashboard/calendar-test/',
  },
  {
    id: 'fixture-schedule-overlap-a',
    title: '[fixture] 重叠跨日 schedule A',
    start: '2026-06-11 10:00',
    end: '2026-06-14 16:00',
    source: 'schedule',
    type: 'fixture',
    priority: 'medium',
    content: '测试：多个跨多天 medium schedule 互相重合时的 lane 分配。',
    url: '/dashboard/calendar-test/',
  },
  {
    id: 'fixture-schedule-overlap-b',
    title: '[fixture] 重叠跨日 schedule B',
    start: '2026-06-12 14:00',
    end: '2026-06-15 11:00',
    source: 'schedule',
    type: 'fixture',
    priority: 'low',
    content: '测试：与 schedule A 部分重叠，并跨到下一周的 low schedule。',
    url: '/dashboard/calendar-test/',
  },
  {
    id: 'fixture-schedule-parallel-a',
    title: '[fixture] 平行 schedule A',
    start: '2026-06-10 09:00',
    end: '2026-06-10 18:00',
    source: 'schedule',
    type: 'fixture',
    priority: 'high',
    content: '测试：同一天大段平行 schedule A。',
    url: '/dashboard/calendar-test/',
  },
  {
    id: 'fixture-schedule-parallel-b',
    title: '[fixture] 平行 schedule B',
    start: '2026-06-10 10:00',
    end: '2026-06-10 16:00',
    source: 'schedule',
    type: 'fixture',
    priority: 'medium',
    content: '测试：同一天大段平行 schedule B。',
    url: '/dashboard/calendar-test/',
  },
  {
    id: 'fixture-schedule-parallel-c',
    title: '[fixture] 平行 schedule C',
    start: '2026-06-10 11:00',
    end: '2026-06-10 15:00',
    source: 'schedule',
    type: 'fixture',
    priority: 'low',
    content: '测试：同一天大段平行 schedule C。',
    url: '/dashboard/calendar-test/',
  },
  {
    id: 'fixture-schedule-parallel-d',
    title: '[fixture] 平行 schedule D',
    start: '2026-06-10 13:00',
    end: '2026-06-10 19:30',
    source: 'schedule',
    type: 'fixture',
    priority: 'medium',
    content: '测试：同一天更多平行 schedule D。',
    url: '/dashboard/calendar-test/',
  },
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

const rawEvents = computed(() => [...calendarData.events, ...fixtureEvents])

const timeBounds = computed(() => {
  const times = rawEvents.value.flatMap(event => [toMs(event.start), toMs(event.end)])
  const min = startOfDay(Math.min(...times) - DAY)
  const max = startOfDay(Math.max(...times) + DAY * 2)
  return { min, max }
})

const timelineWidth = computed(() => TIMELINE_PADDING * 2 + ((timeBounds.value.max - timeBounds.value.min) / DAY) * DAY_WIDTH)

const scheduleEvents = computed<TimelineEvent[]>(() => assignScheduleLanes(
  rawEvents.value
    .filter(event => event.source === 'schedule')
    .map((event) => {
      const startMs = toMs(event.start)
      const endMs = toMs(event.end)
      return {
        ...event,
        startMs,
        endMs,
        left: xForMs(startMs),
        width: Math.max(12, xForMs(endMs) - xForMs(startMs)),
        lane: 0,
      }
    })
    .sort((a, b) => a.startMs - b.startMs),
))

const taskEvents = computed<TimelineTask[]>(() => {
  const stackByDate = new Map<string, number>()

  return rawEvents.value
    .filter(event => event.source === 'board')
    .map((event) => {
      const dueMs = event.allDay ? startOfDay(toMs(event.end)) + 22 * HOUR : toMs(event.end)
      const dateKey = formatDate(new Date(dueMs))
      const stack = stackByDate.get(dateKey) ?? 0
      stackByDate.set(dateKey, stack + 1)

      return {
        ...event,
        dueMs,
        left: xForMs(dueMs),
        stack,
      }
    })
    .sort((a, b) => a.dueMs - b.dueMs)
})

const ticks = computed(() => {
  const result: Array<{ key: string, x: number, label: string, subLabel: string, major: boolean }> = []
  for (let t = timeBounds.value.min; t <= timeBounds.value.max; t += DAY) {
    const date = new Date(t)
    result.push({
      key: formatDate(date),
      x: xForMs(t),
      label: `${date.getMonth() + 1}/${date.getDate()}`,
      subLabel: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()],
      major: date.getDate() === 1 || date.getDay() === 1,
    })
  }
  return result
})

function assignScheduleLanes(events: TimelineEvent[]) {
  const laneEnds: number[] = []

  return events.map((event) => {
    let lane = laneEnds.findIndex(end => event.startMs >= end)
    if (lane === -1) {
      lane = laneEnds.length
      laneEnds.push(event.endMs)
    }
    else {
      laneEnds[lane] = event.endMs
    }

    return { ...event, lane }
  })
}

function xForMs(ms: number) {
  return TIMELINE_PADDING + ((ms - timeBounds.value.min) / DAY) * DAY_WIDTH
}

function yForSchedule(event: TimelineEvent) {
  return SCHEDULE_START_Y + event.lane * SCHEDULE_LANE_HEIGHT
}

function yForTask(task: TimelineTask) {
  const direction = task.stack % 2 === 0 ? 1 : -1
  const distance = Math.ceil(task.stack / 2) * TASK_STACK_GAP
  return BASELINE_Y + direction * distance
}

function showTooltip(event: DashboardCalendarEvent, e: MouseEvent) {
  hoveredEvent.value = event
  floatWindowRef.value?.updateMousePosition(e)
}

function moveTooltip(e: MouseEvent) {
  floatWindowRef.value?.updateMousePosition(e)
}

function hideTooltip() {
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

function toMs(value: string) {
  const normalized = value.replace(' ', 'T')
  return new Date(normalized).getTime()
}

function startOfDay(ms: number) {
  const date = new Date(ms)
  date.setHours(0, 0, 0, 0)
  return date.getTime()
}

function formatDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function formatTimeRange(event: DashboardCalendarEvent) {
  if (event.source === 'board')
    return event.allDay ? `due · ${datePart(event.end)}` : `due · ${datePart(event.end)} ${timePart(event.end)}`

  return `${datePart(event.start)} ${timePart(event.start)} → ${datePart(event.end)} ${timePart(event.end)}`
}

function datePart(value: string) {
  return value.split(' ')[0]
}

function timePart(value: string) {
  return value.split(' ')[1]?.slice(0, 5) ?? '00:00'
}
</script>

<template>
  <section
    un-mx-auto
    un-max-w="6xl"
    un-px="4 md:6"
    un-py="8"
  >
    <div un-mb-6>
      <p
        un-font-mono
        un-text="xs stone-500 dark:stone-400"
        un-uppercase
        un-tracking-widest
      >
        Timeline Prototype
      </p>
      <h1
        un-mt-1
        un-text="2xl md:3xl stone-900 dark:stone-100"
        un-font-semibold
      >
        Board 时间线测试
      </h1>
      <p
        un-mt-2
        un-max-w-2xl
        un-text="sm stone-600 dark:stone-400"
      >
        一条可横向滚动的连续时间轴。schedule 渲染为短横线，task due 渲染为圆点。当前页面包含 fixture，用于压力测试同日多 task、跨日 schedule、重叠 schedule 和过夜 schedule。
      </p>
    </div>

    <div
      class="timeline-viewport"
      un-overflow-x-auto
      un-overflow-y-hidden
      un-rounded-2xl
      un-border="1 stone-200 dark:stone-800"
      un-bg="stone-50/80 dark:stone-950/70"
      un-shadow="sm"
    >
      <div
        class="timeline-canvas"
        :style="{ width: `${timelineWidth}px` }"
      >
        <div
          class="timeline-axis"
          :style="{
            left: `${TIMELINE_PADDING}px`,
            right: `${TIMELINE_PADDING}px`,
            top: `${BASELINE_Y}px`,
          }"
        />

        <div
          v-for="tick in ticks"
          :key="tick.key"
          class="timeline-tick"
          :class="{ major: tick.major }"
          :style="{ left: `${tick.x}px`, top: `${BASELINE_Y}px` }"
        >
          <span class="timeline-tick__line" />
          <span class="timeline-tick__label">{{ tick.label }}</span>
          <span class="timeline-tick__sub">{{ tick.subLabel }}</span>
        </div>

        <button
          v-for="event in scheduleEvents"
          :key="event.id"
          class="timeline-schedule"
          :class="`priority-${event.priority ?? 'medium'}`"
          :style="{
            left: `${event.left}px`,
            top: `${yForSchedule(event)}px`,
            width: `${event.width}px`,
          }"
          type="button"
          @click.stop="openEvent(event)"
          @mouseenter="showTooltip(event, $event)"
          @mousemove="moveTooltip"
          @mouseleave="hideTooltip"
        >
          <span class="timeline-schedule__line" />
        </button>

        <button
          v-for="task in taskEvents"
          :key="task.id"
          class="timeline-task"
          :class="[`priority-${task.priority ?? 'medium'}`, { 'is-done': task.status === 'done' }]"
          :style="{
            left: `${task.left}px`,
            top: `${yForTask(task)}px`,
          }"
          type="button"
          @click.stop="openEvent(task)"
          @mouseenter="showTooltip(task, $event)"
          @mousemove="moveTooltip"
          @mouseleave="hideTooltip"
        >
          <span class="timeline-task__dot" />
        </button>
      </div>
    </div>

    <FloatWindow
      ref="floatWindowRef"
      :visible="!!hoveredEvent"
      :follow-mouse="true"
      :mouse-margin="14"
    >
      <div
        v-if="hoveredEvent"
        class="timeline-tooltip"
        un-w="76"
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
          <span>{{ hoveredEvent.source }}</span>
          <span>·</span>
          <span>{{ hoveredEvent.type }}</span>
          <template v-if="hoveredEvent.priority">
            <span>·</span>
            <span>{{ hoveredEvent.priority }}</span>
          </template>
          <template v-if="hoveredEvent.status">
            <span>·</span>
            <span>{{ hoveredEvent.status }}</span>
          </template>
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
.timeline-viewport {
  height: 300px;
  scrollbar-width: thin;
}

.timeline-canvas {
  position: relative;
  height: 300px;
  min-width: 100%;
}

.timeline-axis {
  position: absolute;
  height: 1px;
  background: rgb(120 113 108 / 0.45);
}

.timeline-tick {
  position: absolute;
  width: 1px;
  color: rgb(120 113 108);
  transform: translateX(-0.5px);
}

.timeline-tick__line {
  position: absolute;
  top: -7px;
  left: 0;
  width: 1px;
  height: 14px;
  background: rgb(120 113 108 / 0.35);
}

.timeline-tick.major .timeline-tick__line {
  top: -11px;
  height: 22px;
  background: rgb(120 113 108 / 0.7);
}

.timeline-tick__label,
.timeline-tick__sub {
  position: absolute;
  left: 0.5rem;
  white-space: nowrap;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.7rem;
}

.timeline-tick__label {
  top: 1rem;
}

.timeline-tick__sub {
  top: 2.05rem;
  opacity: 0.6;
}

.timeline-schedule,
.timeline-task {
  position: absolute;
  border: 0;
  background: transparent;
  color: inherit;
  text-align: left;
  cursor: pointer;
}

.timeline-schedule {
  height: 10px;
  padding: 0;
}

.timeline-schedule__line {
  display: block;
  width: 100%;
  height: 2px;
  margin-top: 4px;
  border-radius: 999px;
  background: currentColor;
  opacity: 0.68;
}

.timeline-schedule.priority-high {
  color: rgb(120 113 108);
}

.timeline-schedule.priority-medium {
  color: rgb(120 113 108 / 0.72);
}

.timeline-schedule.priority-low {
  color: rgb(120 113 108 / 0.48);
}

.timeline-task {
  width: 16px;
  height: 16px;
  padding: 0;
  transform: translate(-50%, -50%);
}

.timeline-task__dot {
  display: block;
  width: 9px;
  height: 9px;
  margin: 3.5px;
  border: 1.5px solid currentColor;
  border-radius: 999px;
  background: rgb(250 250 249);
}

.timeline-task.priority-high {
  color: rgb(220 38 38);
}

.timeline-task.priority-medium {
  color: rgb(217 119 6);
}

.timeline-task.priority-low {
  color: rgb(2 132 199);
}

.timeline-task.is-done {
  color: rgb(120 113 108);
  opacity: 0.42;
}

.timeline-task.is-done .timeline-task__dot {
  background: currentColor;
}

:global(.dark) .timeline-axis {
  background: rgb(214 211 209 / 0.36);
}

:global(.dark) .timeline-tick {
  color: rgb(168 162 158);
}

:global(.dark) .timeline-tick__line {
  background: rgb(214 211 209 / 0.28);
}

:global(.dark) .timeline-tick.major .timeline-tick__line {
  background: rgb(214 211 209 / 0.6);
}

:global(.dark) .timeline-schedule.priority-high {
  color: rgb(214 211 209);
}

:global(.dark) .timeline-schedule.priority-medium {
  color: rgb(214 211 209 / 0.72);
}

:global(.dark) .timeline-schedule.priority-low {
  color: rgb(214 211 209 / 0.48);
}

:global(.dark) .timeline-task__dot {
  background: rgb(28 25 23);
}

:global(.dark) .timeline-task.priority-high {
  color: rgb(248 113 113);
}

:global(.dark) .timeline-task.priority-medium {
  color: rgb(251 191 36);
}

:global(.dark) .timeline-task.priority-low {
  color: rgb(56 189 248);
}
</style>
