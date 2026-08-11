<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { froqApiConfigured, froqFetch } from '~/composables/stats/froqApi'
import { getAnonId } from '~/composables/stats/useAnonId'
import { useSiteStats } from '~/composables/stats/useSiteStats'
import { formatCompactNumber } from '~/utils/formatStats'

const props = withDefaults(defineProps<{
  /** When set, counts likes for this page; otherwise site-wide. */
  pagePath?: string
  /** compact: "n ♥" (footer); people: "n 人喜欢本文" (article end). */
  format?: 'compact' | 'people'
}>(), {
  format: 'compact',
})

const TRAILING_SLASH_RE = /\/$/

const { t, locale } = useI18n({ useScope: 'global' })
const fetched = useSiteStats()

const localLikes = ref<number | null>(null)
const busy = ref(false)
const failed = ref(false)

function normalizePath(p: string): string {
  if (!p || p === '/')
    return '/'
  return p.replace(TRAILING_SLASH_RE, '') || '/'
}

const fetchedPageLikes = computed(() => {
  if (!props.pagePath)
    return null
  const target = normalizePath(props.pagePath)
  const rows = fetched.pageLikes.value
  for (const row of rows) {
    if (normalizePath(row.pagePath) === target || row.pagePath === props.pagePath)
      return row.likes
  }
  return 0
})

const likes = computed(() => {
  if (localLikes.value != null)
    return localLikes.value
  if (props.pagePath)
    return fetched.loaded.value ? (fetchedPageLikes.value ?? 0) : null
  return fetched.siteLikes.value
})

const label = computed(() => {
  const n = likes.value
  if (props.format === 'people') {
    if (n == null)
      return t('stats.likeArticleCta')
    return t('stats.likedByCount', { n: formatCompactNumber(n, locale.value) })
  }
  if (n == null)
    return props.pagePath ? t('stats.likeArticleCta') : t('stats.likeCta')
  return formatCompactNumber(n, locale.value)
})

const show = computed(() => froqApiConfigured())

watch(() => props.pagePath, () => {
  localLikes.value = null
  failed.value = false
})

onMounted(() => {
  if (props.pagePath && !fetched.loaded.value)
    void fetched.refresh()
})

async function onLike() {
  if (busy.value || !froqApiConfigured())
    return
  busy.value = true
  failed.value = false
  try {
    const res = await froqFetch('/likes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        anonId: getAnonId(),
        ...(props.pagePath ? { pagePath: props.pagePath } : {}),
      }),
    })
    if (!res)
      return
    if (!res.ok && res.status !== 429) {
      failed.value = true
      return
    }
    const data = await res.json() as {
      ok?: boolean
      likes?: number
      siteLikes?: number
    }
    const next = typeof data.likes === 'number'
      ? data.likes
      : typeof data.siteLikes === 'number'
        ? data.siteLikes
        : null
    if (next != null)
      localLikes.value = next
  }
  catch {
    failed.value = true
  }
  finally {
    busy.value = false
  }
}
</script>

<template>
  <div
    v-if="show"
    un-flex="~ row"
    un-items-center
    un-gap-2
  >
    <button
      v-if="format === 'people'"
      class="site-like-btn"
      :disabled="busy || failed"
      un-text="sm neutral-500 dark:neutral-500"
      un-font-mono
      un-transition
      un-flex="~ row"
      un-items-center
      un-gap-1.5
      @click="onLike"
    >
      <span>{{ label }}</span>
      <un-i-solar-hearts-bold-duotone
        un-w-3.5
        un-h-3.5
        un-text="rose-300 dark:rose-800"
      />
    </button>
    <template v-else>
      <span>{{ label }}</span>
      <button
        class="site-like-btn"
        :disabled="busy || failed"
        un-text="xs neutral-500 dark:neutral-500"
        un-font-mono
        un-transition
        un-flex="~ row"
        un-items-center
        un-gap-2
        @click="onLike"
      >
        <un-i-solar-hearts-bold-duotone
          un-w-3
          un-h-3
          un-text="rose-300 dark:rose-800"
        />
      </button>
    </template>
  </div>
</template>

<style scoped>
</style>
