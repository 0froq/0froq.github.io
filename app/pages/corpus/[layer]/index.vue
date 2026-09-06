<script setup lang="ts">
import type { LayerEntry } from '~/utils/issueList'
import { toLayerEntry } from '~/utils/issueList'

const route = useRoute()
const { visible, showExcerpt } = useIssueVisibility('corpus')

const layerSlug = computed(() => String(route.params.layer || ''))
const layer = computed(() => findCorpusLayer(layerSlug.value))

if (!layer.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Corpus layer not found',
  })
}

const { data: entries } = await useAsyncData(
  () => `corpus-layer:${layerSlug.value}`,
  async () => {
    const all = await queryCollection('corpus')
      .select('path', 'title', 'created', 'index', 'stem', 'status', 'aigc', 'locale', 'description', 'body')
      .order('created', 'DESC')
      .all()
    return all.filter((entry) => {
      if (entry.index)
        return false
      return isLayerEntry(entry.path, 'corpus', layerSlug.value)
    })
  },
  { watch: [layerSlug] },
)

const items = computed<LayerEntry[]>(() =>
  (entries.value ?? [])
    .filter(entry => visible(entry))
    .map(entry => toLayerEntry(entry)),
)
</script>

<template>
  <IssueList
    v-if="layer"
    :items="items"
    :show-excerpt="showExcerpt"
  />
</template>
