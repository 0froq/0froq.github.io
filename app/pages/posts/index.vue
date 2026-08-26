<script setup lang="ts">
import { pickHubEntries, toLayerEntry } from '~/utils/issueList'

const { data: entries } = await useAsyncData('posts-hub-picks', async () => {
  const all = await queryCollection('posts')
    .select('path', 'title', 'created', 'index', 'stem', 'status', 'aigc', 'locale', 'description', 'body')
    .order('created', 'DESC')
    .all()
  return all
    .filter((entry) => {
      if (entry.index)
        return false
      if (entry.path === '/posts' || entry.path.endsWith('/en'))
        return false
      return entry.path.split('/').filter(Boolean).length >= 3
    })
    .map(entry => toLayerEntry(entry))
})

const picks = computed(() => pickHubEntries(entries.value ?? [], 6))
</script>

<template>
  <div un-flex un-flex-col un-gap-5>
    <p
      un-m-0
      un-font-serif
      un-text="[1.05em] muted"
      un-italic
    >
      Open a door — recent writing across layers.
    </p>
    <IssueList
      tone="posts"
      :items="picks"
    />
  </div>
</template>
