<script setup lang="ts">
const props = defineProps<{
  items: LayerEntry[]
}>()

provideJournalDeck(() => props.items)
</script>

<template>
  <PublicationHubShell
    class="journal-index"
    title="Journal"
    axis="wheel"
    fan
  >
    <PublicationJournalHeat :items="items" />
  </PublicationHubShell>
</template>

<style scoped>
.journal-index {
  min-height: 0;
}
</style>
