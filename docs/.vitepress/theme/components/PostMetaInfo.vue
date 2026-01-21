<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  metaStrings: string[]
}>()

/**
 * Computed property to determine if there are any meta strings to display.
 */
const hasMetaStrings = computed(() => props.metaStrings && props.metaStrings.length > 0)
</script>

<template>
  <div
    v-if="hasMetaStrings"

    un-flex
    un-items-center
    un-gap-5
    un-justify-end
  >
    <div
      v-for="metaString in metaStrings"
      :key="metaString"
    >
      {{ metaString }}
    </div>
  </div>
</template>
