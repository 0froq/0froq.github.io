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

const { data: intro } = await useAsyncData('posts-intro', () => {
  return queryCollection('posts').path('/posts').first()
})

useHead(() => {
  if (isArticle.value)
    return {}
  const layer = findPostLayer(activeLayer.value)
  return {
    title: layer ? `${layer.label} · Posts` : 'Posts',
  }
})
</script>

<template>
  <NuxtPage v-if="isArticle" />

  <SiteHub
    v-else
    title="Posts"
    tone="posts"
  >
    <template #routes>
      <SiteRailLink
        v-for="layer in postLayers"
        :key="layer.slug"
        :to="`/posts/${layer.slug}`"
        :label="layer.label"
        :note="layer.note"
        :active="activeLayer === layer.slug"
        ink="underline"
        hover-ink="underline"
      />
    </template>

    <ContentRenderer
      v-if="intro"
      :value="intro"
    />
    <p v-else>
      Writing intro not found.
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
