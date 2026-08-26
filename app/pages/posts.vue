<script setup lang="ts">
const route = useRoute()

const isArticle = computed(() => {
  const slug = route.params.slug
  if (Array.isArray(slug))
    return slug.filter(Boolean).length > 0
  return Boolean(slug)
})

const activeLayer = computed(() => String(route.params.layer || ''))
const layer = computed(() => findPostLayer(activeLayer.value) ?? null)
const feedTransition = useHubFeedTransition()

const { data: intro } = await useAsyncData('posts-intro', () => {
  return queryCollection('posts').path('/posts').first()
})

useHead(() => {
  if (isArticle.value)
    return {}
  return {
    title: layer.value ? `${layer.value.label} · Posts` : 'Posts',
  }
})
</script>

<template>
  <NuxtPage v-if="isArticle" />

  <SiteHub
    v-else
    title="Posts"
    tone="posts"
    :layer="layer"
  >
    <template #routes>
      <SiteRailLink
        v-for="item in postLayers"
        :key="item.slug"
        :to="`/posts/${item.slug}`"
        :label="item.label"
        :note="item.note"
        :active="activeLayer === item.slug"
        ink="underline"
        hover-ink="underline"
      />
    </template>

    <template v-if="!activeLayer">
      <ContentRenderer
        v-if="intro"
        :value="intro"
      />
      <p v-else>
        Writing intro not found.
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
