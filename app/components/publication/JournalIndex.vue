<script setup lang="ts">
defineProps<{
  items: LayerEntry[]
}>()
</script>

<template>
  <PublicationHubShell
    class="journal-index"
    title="Journal"
    axis="wheel"
  >
    <PublicationJournalHeat :items="items" />
  </PublicationHubShell>
</template>

<style scoped>
.journal-index {
  min-height: 0;
}
</style>
