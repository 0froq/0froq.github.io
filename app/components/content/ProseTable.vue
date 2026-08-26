<script setup lang="ts">
defineProps<{
  caption?: string
}>()
</script>

<template>
  <figure class="prose-figure">
    <div class="prose-table-wrap">
      <table>
        <slot />
      </table>
    </div>
    <figcaption
      v-if="caption"
      class="prose-caption"
    >
      {{ caption }}
    </figcaption>
  </figure>
</template>
