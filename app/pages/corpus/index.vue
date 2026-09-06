<script setup lang="ts">
import { pickHubEntries, toLayerEntry } from '~/utils/issueList'

const { visible, showExcerpt } = useIssueVisibility('corpus')

const { data: entries } = await useAsyncData('corpus-hub-picks', async () => {
  const all = await queryCollection('corpus')
    .select('path', 'title', 'created', 'index', 'stem', 'status', 'aigc', 'locale', 'description', 'body')
    .order('created', 'DESC')
    .all()
  return all
    .filter((entry) => {
      if (entry.index)
        return false
      if (entry.path === '/corpus')
        return false
      return entry.path.split('/').filter(Boolean).length >= 3
    })
    .map(entry => toLayerEntry(entry))
})

const picks = computed(() =>
  pickHubEntries((entries.value ?? []).filter(entry => visible(entry)), 6),
)
</script>

<template>
  <div
    un-flex
    un-flex-col
    un-gap-5
  >
    <p
      un-m-0
      un-font-serif
      un-text="[1.05em] muted"
    >
      Open a door — recent notes across layers.
    </p>
    <IssueList
      :items="picks"
      :show-excerpt="showExcerpt"
    />
  </div>
</template>
