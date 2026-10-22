<script setup lang="ts">
import { SITE_DESCRIPTION } from '~/utils/siteConstants'

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

const entry = computed(() => (page.value ? toLayerEntry(page.value) : null))
const articleTitle = computed(() => entry.value?.title ?? page.value.title)
const articleDescription = computed(() => entry.value?.description?.trim() || undefined)

useHead({ title: articleTitle })

const files = useRuntimeConfig().public.publicFiles
const override = computed(() => contentOgOverride(page.value, 'publication', files))
if (override.value === undefined) {
  defineOgImage(
    ogComponentName(page.value),
    {
      title: () => paperFields(page.value).title,
      description: () => paperFields(page.value, SITE_DESCRIPTION).description,
      evergreen: () => paperFields(page.value).evergreen,
      created: () => paperFields(page.value).created,
      updated: () => paperFields(page.value).updated,
      words: () => paperFields(page.value).words,
      ...ogExtraProps(page.value),
    },
    {
      alt: () => paperFields(page.value).title,
    },
  )
}
useShareCard({
  title: articleTitle,
  description: articleDescription,
  type: 'article',
  image: () => (override.value === undefined ? false : override.value),
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
