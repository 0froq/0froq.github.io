<script setup lang="ts">
/**
 * Isolated journal-folder motion lab.
 * Not linked from nav. Delete this file and JournalMonthFolder.vue to revert.
 */
const { data: entries } = await useAsyncData(
  'lab-journal-folder',
  async () => {
    const all = await queryCollection('publication')
      .select('path', 'title', 'created', 'last_modified', 'status', 'locale', 'description', 'kind', 'body')
      .order('created', 'DESC')
      .all()
    return all
      .filter(entry => isPublicationEntry(entry.path, 'journal'))
      .map(entry => toLayerEntry(entry))
  },
)

useHead({
  title: 'lab · folder',
  meta: [{ name: 'robots', content: 'noindex' }],
})
</script>

<template>
  <div
    un-box-border
    un-flex
    un-min-h-dvh
    un-flex-col
    un-px="[var(--gutter)]"
    un-py-8
    un-gap-6
  >
    <p
      un-m-0
      un-font-mono
      un-text="xs muted"
    >
      lab · month folder.
      <NuxtLink
        to="/journal"
        un-text="muted hover:colored-ink"
        un-underline
        un-underline-offset-2
        un-decoration-line
      >
        back to journal
      </NuxtLink>
    </p>
    <PublicationJournalMonthFolder :items="entries ?? []" />
  </div>
</template>
