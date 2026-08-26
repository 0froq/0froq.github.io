<script setup lang="ts">
const route = useRoute()

const layerSlug = computed(() => String(route.params.layer || ''))
const layer = computed(() => findPostLayer(layerSlug.value))

const path = computed(() => {
  const slug = route.params.slug
  const parts = Array.isArray(slug) ? slug : [slug]
  return `/posts/${layerSlug.value}/${parts.filter(Boolean).join('/')}`
})

if (!layer.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Writing layer not found',
  })
}

const { data: page } = await useAsyncData(
  () => `post:${path.value}`,
  () => queryCollection('posts').path(path.value).first(),
  { watch: [path] },
)

if (!page.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Post not found',
  })
}

useSeoMeta({
  title: page.value.title,
})

useIssueArticleMast(() => page.value?.title)
</script>

<template>
  <IssueReading
    v-if="page && layer"
    kind="POST"
    :title="page.title"
    :created="page.created"
    :status="page.status"
    :back-to="`/posts/${layer.slug}`"
    :back-label="layer.label"
  >
    <ContentRenderer :value="page" />
  </IssueReading>
</template>
