<script setup lang="ts">
defineProps<{
  title?: string
}>()
</script>

<template>
  <ProseCallout
    kind="warning"
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
