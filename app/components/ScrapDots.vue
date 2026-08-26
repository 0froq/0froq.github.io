<script setup lang="ts">
/**
 * @deprecated Use InkDots. Kept so existing call sites keep working.
 */
defineProps<{
  seed: string
}>()
</script>

<template>
  <InkDots :seed="seed" />
</template>
