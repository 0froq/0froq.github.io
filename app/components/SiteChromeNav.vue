<script setup lang="ts">
defineOptions({ inheritAttrs: false })

defineProps<{
  to?: string
}>()
</script>

<template>
  <NuxtLink
    v-if="to"
    v-bind="$attrs"
    :to="to"
    un-shrink-0
    un-inline-flex
    un-items-center
    un-border-0
    un-bg-transparent
    un-p-0
    un-font-mono
    un-text="xs muted hover:colored-ink focus-visible:colored-ink"
    un-tracking-wide
    un-decoration-none
    un-cursor-pointer
  >
    <slot />
  </NuxtLink>
  <button
    v-else
    v-bind="$attrs"
    type="button"
    un-shrink-0
    un-inline-flex
    un-items-center
    un-border-0
    un-bg-transparent
    un-p-0
    un-font-mono
    un-text="xs muted hover:colored-ink focus-visible:colored-ink"
    un-tracking-wide
    un-decoration-none
    un-cursor-pointer
  >
    <slot />
  </button>
</template>
