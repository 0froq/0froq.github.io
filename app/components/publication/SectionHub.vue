<script setup lang="ts">
const props = defineProps<{
  section: string
}>()

const route = useRoute()
const isArticle = computed(() => {
  const slug = route.params.slug
  return Array.isArray(slug) ? slug.filter(Boolean).length > 0 : Boolean(slug)
})
const definition = computed(() => findPublicationSection(props.section))

if (!definition.value) {
  throw createError({ statusCode: 404, statusMessage: 'Publication section not found' })
}

const room = computed((): PublicationRoom => {
  const slug = definition.value!.slug
  switch (slug) {
    case 'essays':
    case 'journal':
    case 'cabinet':
      return slug
    default: {
      const _never: never = slug
      return _never
    }
  }
})

const { data: entries } = await useAsyncData(
  () => `publication-section:${props.section}`,
  async () => {
    const all = await queryCollection('publication')
      .select('path', 'title', 'created', 'last_modified', 'status', 'locale', 'description', 'kind', 'body')
      .order('created', 'DESC')
      .all()
    return all
      .filter(entry => isPublicationEntry(entry.path, props.section))
      .map(entry => toLayerEntry(entry))
  },
)

const visibleEntries = computed(() => entries.value ?? [])

useHead(() => isArticle.value ? {} : { title: definition.value?.label ?? 'froQ' })
</script>

<template>
  <NuxtPage v-if="isArticle" />

  <template v-else>
    <PublicationEssaysIndex
      v-if="room === 'essays'"
      :items="visibleEntries"
    />
    <PublicationJournalIndex
      v-else-if="room === 'journal'"
      :items="visibleEntries"
    />
    <PublicationCabinetIndex
      v-else-if="room === 'cabinet'"
      :items="visibleEntries"
    />
  </template>
</template>
