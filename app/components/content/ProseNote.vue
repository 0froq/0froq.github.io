<script setup lang="ts">
defineProps<{
  title?: string
}>()
</script>

<template>
  <ProseCallout
    kind="note"
    :title="title"
  >
    <template
      v-if="$slots.title"
      #title
    >
      <slot name="title" />
    </template>
    <slot />
  </ProseCallout>
</template>
