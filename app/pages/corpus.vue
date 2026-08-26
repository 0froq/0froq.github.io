<script setup lang="ts">
const route = useRoute()

const isArticle = computed(() => {
  const slug = route.params.slug
  if (Array.isArray(slug))
    return slug.filter(Boolean).length > 0
  return Boolean(slug)
})

const activeLayer = computed(() => String(route.params.layer || ''))

const feedTransition = useHubFeedTransition()

const { data: intro } = await useAsyncData('corpus-intro', () => {
  return queryCollection('corpus').path('/corpus').first()
})

useHead(() => {
  if (isArticle.value)
    return {}
  const layer = findCorpusLayer(activeLayer.value)
  return {
    title: layer ? `${layer.label} · Corpus` : 'Corpus',
  }
})
</script>

<template>
  <NuxtPage v-if="isArticle" />

  <SiteHub
    v-else
    title="Corpus"
    tone="corpus"
  >
    <template #routes>
      <SiteRailLink
        v-for="layer in corpusLayers"
        :key="layer.slug"
        :to="`/corpus/${layer.slug}`"
        :label="layer.label"
        :note="layer.note"
        :active="activeLayer === layer.slug"
        voice="roman"
        ink="mark"
        hover-ink="mark"
      />
    </template>

    <ContentRenderer
      v-if="intro"
      :value="intro"
    />
    <p v-else>
      Corpus intro not found.
    </p>

    <div
      un-mt-10
      un-border-t
      un-border-line
      un-pt-8
    >
      <div class="hub-feed">
        <NuxtPage :transition="feedTransition" />
      </div>
    </div>
  </SiteHub>
</template>
