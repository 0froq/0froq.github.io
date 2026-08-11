<script setup lang="ts">
import { useRoute } from 'vitepress'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { usePagePresenceState } from '~/composables/stats/usePagePresence'
import { useReadingProgress } from '~/composables/stats/useReadingProgress'
import { formatCompactNumber } from '~/utils/formatStats'

/**
 * Article-only UI for viewing count + personal progress.
 * Persona chip lives in the footer (SiteStatsLine).
 * Ghost toggle lives in ScrollTopHeader; WS owned by GhostPresenceRail.
 */
const route = useRoute()
const pagePath = computed(() => route.path)

const { t, locale } = useI18n({ useScope: 'global' })
const { viewing } = usePagePresenceState()
const { progressPercent, read } = useReadingProgress(pagePath)

const viewingLabel = computed(() => {
  if (viewing.value == null)
    return null
  if (viewing.value <= 0)
    return null
  if (viewing.value === 1)
    return t('stats.viewingOne')
  return t('stats.viewing', {
    n: formatCompactNumber(viewing.value, locale.value),
  })
})

const progressLabel = computed(() => {
  if (read.value)
    return t('stats.youRead')
  if (progressPercent.value <= 0)
    return null
  return t('stats.yourProgress', { pct: progressPercent.value })
})

const showMeta = computed(() => Boolean(viewingLabel.value || progressLabel.value))
</script>

<template>
  <div
    v-if="showMeta"
    un-flex="~ row wrap"
    un-items-center
    un-justify-end
    un-gap-x-3
    un-gap-y-1
    un-text="sm neutral-500 dark:neutral-500"
    un-font-mono
  >
    <span v-if="viewingLabel">{{ viewingLabel }}</span>
    <span
      v-if="viewingLabel && progressLabel"
      un-opacity-40
      aria-hidden="true"
    >·</span>
    <span v-if="progressLabel">{{ progressLabel }}</span>
  </div>
</template>
