<script setup lang="ts">
withDefaults(defineProps<{
  current: PublicationRoom
  size?: 'display' | 'chrome'
}>(), {
  size: 'display',
})
</script>

<template>
  <nav
    class="room-switch"
    aria-label="Sections"
    un-flex
    un-flex-wrap
    un-items-baseline
    un-gap-y-2
    :data-size="size"
  >
    <SiteRailLink
      v-for="item in publicationSections"
      :key="item.slug"
      :to="`/${item.slug}`"
      :label="item.label"
      :active="item.slug === current"
      :size="size"
      :ink="item.ink"
    />
  </nav>
</template>

<style scoped>
.room-switch[data-size='display'] {
  column-gap: 1.25rem;
}

.room-switch[data-size='chrome'] {
  justify-content: flex-end;
  column-gap: 1rem;
}
</style>
