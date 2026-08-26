<script setup lang="ts">
import type { LayerEntry } from '~/utils/issueList'
import { toLayerEntry } from '~/utils/issueList'

const route = useRoute()

const layerSlug = computed(() => String(route.params.layer || ''))
const layer = computed(() => findCorpusLayer(layerSlug.value))

if (!layer.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Corpus layer not found',
  })
}

const showAigc = useState('corpus-show-aigc', () => true)
const showDraft = useState('corpus-show-draft', () => true)
const showVoid = useState('corpus-show-void', () => false)

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
    .filter((entry) => {
      if (!showAigc.value && entry.aigc)
        return false
      if (!showVoid.value && entry.status === 'void')
        return false
      if (!showDraft.value && entry.status === 'draft')
        return false
      return true
    })
    .map(entry => toLayerEntry(entry)),
)
</script>

<template>
  <div
    v-if="layer"
    un-flex
    un-flex-col
    un-gap-6
  >
    <header
      un-flex
      un-flex-wrap
      un-items-center
      un-justify-end
      un-gap-x-5
      un-gap-y-2
    >
      <IssueFilter
        :id="`corpus-${layer.slug}-aigc`"
        v-model="showAigc"
        suffix="AIGC"
      />
      <IssueFilter
        :id="`corpus-${layer.slug}-draft`"
        v-model="showDraft"
        suffix="draft"
      />
      <IssueFilter
        :id="`corpus-${layer.slug}-void`"
        v-model="showVoid"
        suffix="void"
      />
    </header>
    <IssueList
      tone="corpus"
      :items="items"
    />
  </div>
</template>
