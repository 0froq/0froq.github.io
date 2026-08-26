<script setup lang="ts">
const route = useRoute()

const isArticle = computed(() => {
  const slug = route.params.slug
  if (Array.isArray(slug))
    return slug.filter(Boolean).length > 0
  return Boolean(slug)
})

const activeLayer = computed(() => String(route.params.layer || ''))
const layer = computed(() => findCorpusLayer(activeLayer.value) ?? null)
const feedTransition = useHubFeedTransition()

const { data: intro } = await useAsyncData('corpus-intro', () => {
  return queryCollection('corpus').path('/corpus').first()
})

useHead(() => {
  if (isArticle.value)
    return {}
  return {
    title: layer.value ? `${layer.value.label} · Corpus` : 'Corpus',
  }
})
</script>

<template>
  <NuxtPage v-if="isArticle" />

  <SiteHub
    v-else
    title="Corpus"
    tone="corpus"
    :layer="layer"
  >
    <template #routes>
      <SiteRailLink
        v-for="item in corpusLayers"
        :key="item.slug"
        :to="`/corpus/${item.slug}`"
        :label="item.label"
        :note="item.note"
        :active="activeLayer === item.slug"
        voice="roman"
        ink="mark"
        hover-ink="mark"
      />
    </template>

    <template v-if="!activeLayer">
      <ContentRenderer
        v-if="intro"
        :value="intro"
      />
      <p v-else>
        Corpus intro not found.
      </p>
    </template>

    <div
      class="hub-feed-wrap"
      :data-bare="activeLayer ? '' : undefined"
    >
      <div class="hub-feed">
        <NuxtPage :transition="feedTransition" />
      </div>
    </div>
  </SiteHub>
</template>

<style scoped>
.hub-feed-wrap {
  margin-top: 2.5rem;
  padding-top: 2rem;
  border-top: 1px solid var(--line);
}

.hub-feed-wrap[data-bare] {
  margin-top: 0;
  padding-top: 0;
  border-top: 0;
}
</style>
