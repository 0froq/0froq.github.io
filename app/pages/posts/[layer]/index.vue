<script setup lang="ts">
import type { LayerEntry } from '~/utils/issueList'
import { toLayerEntry } from '~/utils/issueList'

const route = useRoute()

const layerSlug = computed(() => String(route.params.layer || ''))
const layer = computed(() => findPostLayer(layerSlug.value))

if (!layer.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Writing layer not found',
  })
}

const showExcerpt = useState('posts-show-excerpt', () => false)
const showDraft = useState('posts-show-draft', () => true)
const showVoid = useState('posts-show-void', () => false)

const { data: entries } = await useAsyncData(
  () => `posts-layer:${layerSlug.value}`,
  async () => {
    const all = await queryCollection('posts')
      .select('path', 'title', 'created', 'index', 'stem', 'status', 'aigc', 'locale', 'description', 'body')
      .order('created', 'DESC')
      .all()
    return all
      .filter((entry) => {
        if (entry.index)
          return false
        return isLayerEntry(entry.path, 'posts', layerSlug.value)
      })
      .map(entry => toLayerEntry(entry))
  },
  { watch: [layerSlug] },
)

const items = computed<LayerEntry[]>(() =>
  (entries.value ?? []).filter((entry) => {
    if (!showVoid.value && entry.status === 'void')
      return false
    if (!showDraft.value && entry.status === 'draft')
      return false
    return true
  }),
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
        :id="`posts-${layer.slug}-draft`"
        v-model="showDraft"
        suffix="draft"
      />
      <IssueFilter
        :id="`posts-${layer.slug}-void`"
        v-model="showVoid"
        suffix="void"
      />
      <IssueFilter
        :id="`posts-${layer.slug}-excerpt`"
        v-model="showExcerpt"
        suffix="excerpts"
      />
    </header>
    <IssueList
      tone="posts"
      :items="items"
      :show-excerpt="showExcerpt"
    />
  </div>
</template>
