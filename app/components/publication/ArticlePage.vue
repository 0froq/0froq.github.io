<script setup lang="ts">
const props = defineProps<{
  section: string
}>()

const route = useRoute()
const path = computed(() => {
  const slug = route.params.slug
  const parts = Array.isArray(slug) ? slug : [slug]
  return `/${props.section}/${parts.filter(Boolean).join('/')}`
})

const { data: page } = await useAsyncData(
  () => `publication:${path.value}`,
  () => queryCollection('publication').path(path.value).first(),
  { watch: [path] },
)

if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Publication entry not found' })
}

const entry = computed(() => page.value ? toLayerEntry(page.value) : null)
useSeoMeta({ title: page.value.title })
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
