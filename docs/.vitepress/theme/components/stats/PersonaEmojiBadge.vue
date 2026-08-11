<script setup lang="ts">
/**
 * Colored disk + animal emoji for anonymous persona (and ghost ink marks).
 */
withDefaults(defineProps<{
  emoji: string
  colorHex: string
  label?: string
  size?: number
}>(), {
  label: '',
  size: 18,
})
</script>

<template>
  <span
    class="persona-emoji-badge"
    :title="label || undefined"
    :aria-label="label || undefined"
    :style="{
      width: `${size}px`,
      height: `${size}px`,
      backgroundColor: colorHex,
      fontSize: `${Math.round(size * 0.62)}px`,
    }"
  >{{ emoji }}</span>
</template>

<style scoped>
.persona-emoji-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  line-height: 1;
  flex-shrink: 0;
  user-select: none;
}
</style>
