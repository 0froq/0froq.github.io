<script setup lang="ts">
const route = useRoute()

const layerSlug = computed(() => String(route.params.layer || ''))
const layer = computed(() => findCorpusLayer(layerSlug.value))

const path = computed(() => {
  const slug = route.params.slug
  const parts = Array.isArray(slug) ? slug : [slug]
  return `/corpus/${layerSlug.value}/${parts.filter(Boolean).join('/')}`
})

if (!layer.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Corpus layer not found',
  })
}

const { data: page } = await useAsyncData(
  () => `corpus:${path.value}`,
  () => queryCollection('corpus').path(path.value).first(),
  { watch: [path] },
)

if (!page.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Corpus entry not found',
  })
}

const entry = computed(() => page.value ? toLayerEntry(page.value) : null)

useSeoMeta({
  title: page.value.title,
})

useIssueArticleMast(() => page.value?.title)
</script>

<template>
  <IssueReading
    v-if="entry"
    :entry="entry"
  >
    <ContentRenderer :value="page!" />
  </IssueReading>
</template>
