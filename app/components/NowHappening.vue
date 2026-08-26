<script setup lang="ts">
import { formatCompact } from '~/utils/formatStats'

const stats = useSiteStats()
const route = useRoute()

function normalize(path: string) {
  if (!path || path === '/')
    return '/'
  return path.replace(/\/$/, '') || '/'
}

const items = computed(() => {
  return stats.pages.value
    .map((row) => {
      let viewing = row.viewing
      if (normalize(row.pagePath) === normalize(route.path))
        viewing -= 1
      return { ...row, viewing }
    })
    .filter(row => row.viewing > 0 && row.pagePath && row.pagePath !== '/')
    .sort((a, b) => b.viewing - a.viewing)
    .slice(0, 6)
})

const alone = computed(() => stats.loaded.value && items.value.length === 0)
</script>

<template>
  <section v-if="stats.loaded.value">
    <h2
      un-m-0
      un-mb-3
      un-font-serif
      un-text="[1.2em] ink"
      un-tracking="[-0.03em]"
    >
      Happening now
    </h2>
    <p
      v-if="alone"
      un-m-0
      un-font-serif
      un-text="muted"
      un-italic
    >
      Quiet out there.
    </p>
    <ol
      v-else
      un-m-0
      un-flex
      un-flex-col
      un-gap-2
      un-p-0
      un-list-none
    >
      <li
        v-for="item in items"
        :key="item.pagePath"
      >
        <NuxtLink
          :to="item.pagePath"
          un-flex
          un-items-baseline
          un-justify-between
          un-gap-4
          un-text="ink hover:colored-ink"
        >
          <span un-font-serif>{{ item.pagePath }}</span>
          <span un-font-mono un-text="11px muted">
            {{ item.viewing === 1 ? '1 reading' : `${formatCompact(item.viewing)} reading` }}
          </span>
        </NuxtLink>
      </li>
    </ol>
  </section>
</template>
