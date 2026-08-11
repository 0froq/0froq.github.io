<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import SiteLikeButton from '~/components/home/SiteLikeButton.vue'
import { SITE_LAUNCH_AT } from '~/composables/stats/constants'
import { usePagePresenceState } from '~/composables/stats/usePagePresence'
import { useSiteStats } from '~/composables/stats/useSiteStats'
import { data as siteMeta } from '~/src/siteMeta.data'
import { formatCompactNumber, formatUptime } from '~/utils/formatStats'

const { t, locale } = useI18n({ useScope: 'global' })
const presence = usePagePresenceState()
const fetched = useSiteStats()

const uniqueVisitors = computed(
  () => presence.uniqueVisitors.value ?? fetched.uniqueVisitors.value,
)
const totalVisits = computed(
  () => presence.totalVisits.value ?? fetched.totalVisits.value,
)
const onlineCount = computed(
  () => presence.online.value ?? fetched.online.value,
)

const now = ref(Date.now())
let tick: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  tick = setInterval(() => {
    now.value = Date.now()
  }, 60_000)
})

onUnmounted(() => {
  if (tick)
    clearInterval(tick)
})

const launchAt = computed(() => {
  const raw = siteMeta?.siteLaunchAt || SITE_LAUNCH_AT
  return new Date(raw).getTime()
})

const uptimeLabel = computed(() => {
  return t('stats.uptime', {
    duration: formatUptime(now.value - launchAt.value, locale.value),
  })
})

const wordLabel = computed(() => {
  const n = siteMeta?.totalWordCount
  if (typeof n !== 'number' || n <= 0)
    return null
  return t('stats.wordCount', {
    n: formatCompactNumber(n, locale.value),
  })
})

const onlineLabel = computed(() => {
  if (onlineCount.value == null || onlineCount.value <= 0)
    return null
  if (onlineCount.value === 1)
    return t('stats.onlineOne')
  return t('stats.online', {
    n: formatCompactNumber(onlineCount.value, locale.value),
  })
})

const uniqueLabel = computed(() => {
  if (uniqueVisitors.value == null)
    return null
  return t('stats.uniqueVisitors', {
    n: formatCompactNumber(uniqueVisitors.value, locale.value),
  })
})

const visitsLabel = computed(() => {
  if (totalVisits.value == null)
    return null
  return t('stats.totalVisits', {
    n: formatCompactNumber(totalVisits.value, locale.value),
  })
})

const parts = computed(() => {
  return [
    onlineLabel.value,
    uniqueLabel.value,
    visitsLabel.value,
    uptimeLabel.value,
    wordLabel.value,
  ].filter(Boolean) as string[]
})
</script>

<template>
  <div
    un-flex="~ row wrap"
    un-items-center
    un-gap-x-2
    un-gap-y-1
    un-text="xs neutral-500 dark:neutral-500"
    un-font-mono
    un-mt-3
  >
    <template v-if="parts.length">
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
        un-opacity-40
        aria-hidden="true"
      >·</span>
      <SiteLikeButton />
    </template>
  </div>
</template>
