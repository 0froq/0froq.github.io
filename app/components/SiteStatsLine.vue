<script setup lang="ts">
import { formatCompact, formatUptime } from '~/utils/formatStats'
import { SITE_LAUNCH_AT } from '~/utils/siteConstants'

const props = withDefaults(defineProps<{
  /** Full counters. Footer stays compact (now + likes). */
  detailed?: boolean
}>(), {
  detailed: false,
})

const stats = useSiteStats()
const now = ref(Date.now())
let tick: ReturnType<typeof setInterval> | null = null

const { data: meta } = await useAsyncData('site-meta', () => $fetch('/api/site-meta'))

onMounted(() => {
  tick = setInterval(() => {
    now.value = Date.now()
  }, 60_000)
})

onBeforeUnmount(() => {
  if (tick)
    clearInterval(tick)
})

const launch = computed(() => {
  const raw = meta.value?.siteLaunchAt || SITE_LAUNCH_AT
  return new Date(raw).getTime()
})

const parts = computed(() => {
  const list: string[] = []
  const online = stats.online.value
  if (online != null && online > 0)
    list.push(online === 1 ? '1 here now' : `${formatCompact(online)} here now`)

  if (!props.detailed)
    return list

  if (stats.uniqueVisitors.value != null)
    list.push(`${formatCompact(stats.uniqueVisitors.value)} visitors`)
  if (stats.totalVisits.value != null)
    list.push(`${formatCompact(stats.totalVisits.value)} visits`)
  list.push(`${formatUptime(now.value - launch.value)} up`)
  const words = meta.value?.totalWordCount
  if (typeof words === 'number' && words > 0)
    list.push(`${formatCompact(words)} words`)
  return list
})
</script>

<template>
  <div
    un-flex
    un-flex-wrap
    un-items-center
    un-gap-x-2
    un-gap-y-1
    un-font-mono
    un-text="sm muted"
  >
    <template
      v-for="(part, i) in parts"
      :key="part"
    >
      <span
        v-if="i > 0"
        un-opacity-40
        aria-hidden="true"
      >·</span>
      <span>{{ part }}</span>
    </template>
    <span
      v-if="parts.length"
      un-opacity-40
      aria-hidden="true"
    >·</span>
    <SiteLikeButton />
  </div>
</template>
