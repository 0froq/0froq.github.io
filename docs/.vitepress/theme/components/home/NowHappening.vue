<script setup lang="ts">
import { useRoute } from 'vitepress'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import ArticleList from '@/ui/article/ArticleList.vue'
import { froqApiConfigured } from '~/composables/stats/froqApi'
import { usePagePresenceState } from '~/composables/stats/usePagePresence'
import { useSiteStats } from '~/composables/stats/useSiteStats'
import { data as corpus } from '~/src/corpus.data'
import { data as posts } from '~/src/posts.data'
import { formatCompactNumber } from '~/utils/formatStats'

const TRAILING_SLASH_RE = /\/$/

const { t, locale } = useI18n({ useScope: 'global' })
const route = useRoute()
const presence = usePagePresenceState()
const fetched = useSiteStats()

const entryByUrl = computed(() => {
  const map = new Map<string, (typeof corpus)[number] | (typeof posts)[number]>()
  for (const entry of [...corpus, ...posts]) {
    if (entry.url)
      map.set(entry.url, entry)
  }
  return map
})

function normalizePath(p: string): string {
  if (p === '/')
    return '/'
  return p.replace(TRAILING_SLASH_RE, '') || '/'
}

function isSelfPage(pagePath: string): boolean {
  return normalizePath(pagePath) === normalizePath(route.path)
}

function resolveEntry(path: string) {
  return entryByUrl.value.get(path)
    || entryByUrl.value.get(normalizePath(path))
    || entryByUrl.value.get(`${normalizePath(path)}/`)
}

const onlineCount = computed(
  () => presence.online.value ?? fetched.online.value,
)

const onlineLabel = computed(() => {
  const n = onlineCount.value
  if (n === null || n === undefined)
    return ''
  if (n === 1)
    return t('stats.onlineOne')
  return t('stats.online', { n: formatCompactNumber(n, locale.value) })
})

const listItems = computed(() => {
  const list = presence.pages.value.length
    ? presence.pages.value
    : fetched.pages.value
  return list
    .map((r) => {
      let viewing = r.viewing
      if (isSelfPage(r.pagePath))
        viewing -= 1
      return { pagePath: r.pagePath, viewing }
    })
    .filter(r => r.viewing > 0 && r.pagePath)
    .sort((a, b) => b.viewing - a.viewing)
    .slice(0, 6)
    .map((r) => {
      const entry = resolveEntry(r.pagePath)
      const meta = r.viewing === 1
        ? t('stats.viewingOne')
        : t('stats.viewing', { n: formatCompactNumber(r.viewing, locale.value) })
      return {
        url: entry?.url ?? r.pagePath,
        title: entry?.title ?? r.pagePath,
        created: entry?.created ?? Date.now(),
        frontmatter: entry?.frontmatter,
        post: entry,
        meta,
      }
    })
})

const statsReady = computed(() => {
  if (!froqApiConfigured())
    return false
  return presence.online.value != null || fetched.loaded.value
})

const alone = computed(() => statsReady.value && listItems.value.length === 0)

const show = computed(() => alone.value || listItems.value.length > 0 || !!onlineLabel.value)

const showTooltip = computed(() => listItems.value.some(i => !!i.post))
</script>

<template>
  <div
    v-if="show"
    un-w-full
  >
    <div
      un-flex="~ col"
      un-gap-3
    >
      <div
        un-text="sm neutral-600 dark:neutral-400"
        un-font-mono
      >
        {{ onlineLabel }}
      </div>
      <p
        v-if="alone"
        un-m-0
        un-text="sm neutral-500 dark:neutral-500"
        un-font-serif
      >
        {{ t('stats.nobodyOnline') }}
      </p>
      <ArticleList
        v-else
        :items="listItems"
        title-serif
        :show-badges="false"
        :show-tooltip="showTooltip"
      />
    </div>
  </div>
</template>
