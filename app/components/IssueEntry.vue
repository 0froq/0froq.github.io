<script setup lang="ts">
defineProps<{
  kind: string
  date?: string
  title: string
  to: string
}>()
</script>

<template>
  <NuxtLink
    :to="to"
    un-flex
    un-items-baseline
    un-gap-3
    un-border-t
    un-border-line
    un-py-3.5
    un-last:border-b
    un-transition="[transform,background-color] duration-150"
    un-translate-x="hover:1.5 focus-visible:1.5"
    un-bg="hover:colored-ink/6 focus-visible:colored-ink/6"
  >
    <span
      un-w-16
      un-shrink-0
      un-font-mono
      un-text="xs muted"
      un-tracking-wide
    >{{ kind }}</span>
    <time
      un-w-14
      un-shrink-0
      un-font-mono
      un-text="xs muted"
      un-tracking-wide
      un-max-md:hidden
    >{{ issueDate(date) }}</time>
    <span
      un-min-w-0
      un-text-lg
      un-font-medium
      un-tracking-tighter
      un-leading-tight
    >{{ title }}</span>
  </NuxtLink>
</template>
