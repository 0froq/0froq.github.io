<script setup lang="ts">
defineProps<{
  caption?: string
}>()
</script>

<template>
  <figure class="prose-figure">
    <figcaption
      v-if="caption"
      class="prose-caption"
    >
      {{ caption }}
    </figcaption>
    <div class="prose-table-wrap">
      <table>
        <slot />
      </table>
    </div>
  </figure>
</template>
