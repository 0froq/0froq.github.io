<script setup lang="ts">
import { computed } from 'vue'
import { useCommitHeatmap } from '~/composables/home/useCommitHeatmap'

const props = defineProps<{
  /** GitHub login for contribution calendar (profile heatmap). */
  login: string
}>()

const { days, total, loading } = useCommitHeatmap(props.login)

interface Cell {
  date: string
  count: number
  level: 0 | 1 | 2 | 3 | 4
}

function levelOf(count: number, max: number): Cell['level'] {
  if (count === 0)
    return 0
  if (max <= 1)
    return 2
  const ratio = count / max
  if (ratio < 0.25)
    return 1
  if (ratio < 0.5)
    return 2
  if (ratio < 0.75)
    return 3
  return 4
}

const maxCount = computed(() => days.value.reduce((m, d) => Math.max(m, d.count), 0))

/** Columns (weeks) × 7 rows; column-major for CSS grid grid-flow-col. */
const columns = computed<Cell[][]>(() => {
  const out: Cell[][] = []
  const list = days.value
  if (!list.length)
    return out

  // Pad the first week so it starts on Sunday
  const first = new Date(`${list[0].date}T00:00:00Z`)
  const firstDow = first.getUTCDay()
  const padded: Array<Cell | null> = [
    ...Array.from({ length: firstDow }).fill(null),
    ...list.map(d => ({
      date: d.date,
      count: d.count,
      level: levelOf(d.count, maxCount.value),
    })),
  ]
  // Pad tail so the grid is a full rectangle
  while (padded.length % 7 !== 0)
    padded.push(null)

  for (let i = 0; i < padded.length; i += 7)
    out.push(padded.slice(i, i + 7) as Cell[])
  return out
})

const CELL = 10
const GAP = 3

const monthTicks = computed(() => {
  const ticks: Array<{ col: number, label: string }> = []
  let prev = ''
  const formatter = new Intl.DateTimeFormat('en-US', { month: 'short', timeZone: 'UTC' })
  columns.value.forEach((week, col) => {
    const firstReal = week.find(Boolean)
    if (!firstReal)
      return
    const d = new Date(`${firstReal.date}T00:00:00Z`)
    const key = `${d.getUTCFullYear()}-${d.getUTCMonth()}`
    if (key !== prev) {
      ticks.push({ col, label: formatter.format(d) })
      prev = key
    }
  })
  return ticks
})
</script>

<template>
  <section
    un-w-full
    un-overflow-hidden
  >
    <div
      v-if="loading && !days.length"
      un-h-32
      un-flex
      un-items-center
      un-justify-center
      un-text="sm neutral-600 dark:neutral-400"
      un-font-mono
    >
      …
    </div>
    <div
      v-else
      un-flex="~ col"
      un-gap-3
    >
      <div
        un-relative
        un-overflow-x-auto
        un-pb-1
        class="scrollbar-none"
      >
        <div
          un-relative
          un-h-4
          un-text="xs neutral-500 dark:neutral-500"
          un-font-mono
          :style="{ width: `${columns.length * (CELL + GAP)}px` }"
        >
          <span
            v-for="tick in monthTicks"
            :key="`${tick.col}-${tick.label}`"
            un-absolute
            un-top-0
            :style="{ left: `${tick.col * (CELL + GAP)}px` }"
          >{{ tick.label }}</span>
        </div>
        <div
          un-grid
          un-grid-flow-col
          :style="{
            gridTemplateRows: 'repeat(7, 1fr)',
            gridAutoColumns: `${CELL}px`,
            gap: `${GAP}px`,
            width: 'max-content',
          }"
        >
          <template
            v-for="(week, wi) in columns"
            :key="wi"
          >
            <span
              v-for="(cell, di) in week"
              :key="di"
              un-block
              un-rounded-sm
              :title="cell ? `${cell.date}: ${cell.count} contribution${cell.count === 1 ? '' : 's'}` : ''"
              :class="cell ? `lv-${cell.level}` : 'lv-empty'"
              :style="{ width: `${CELL}px`, height: `${CELL}px` }"
            />
          </template>
        </div>
      </div>

      <div
        un-flex
        un-items-center
        un-justify-between
        un-text="xs neutral-600 dark:neutral-400"
        un-font-mono
      >
        <span>{{ total }} contributions in the last year</span>
      </div>
    </div>
  </section>
</template>

<style scoped>
.lv-empty {
  visibility: hidden;
}
.lv-0 {
  --uno: 'border-neutral-800/5 dark:border-neutral-100/5 border-(solid px)';
}
.lv-1 {
  --uno: 'bg-neutral-800/20 dark:bg-neutral-100/20';
}
.lv-2 {
  --uno: 'bg-neutral-800/50 dark:bg-neutral-100/50';
}
.lv-3 {
  --uno: 'bg-neutral-800/80 dark:bg-neutral-100/80';
}
.lv-4 {
  --uno: 'bg-neutral-800/100 dark:bg-neutral-100/100';
}
.scrollbar-none {
  scrollbar-width: none;
}
.scrollbar-none::-webkit-scrollbar {
  display: none;
}
</style>
