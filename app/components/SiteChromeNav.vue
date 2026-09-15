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
    class="site-chrome-nav"
    :to="to"
    un-shrink-0
    un-inline-flex
    un-items-center
    un-gap-1.5
    un-border-0
    un-bg-transparent
    un-p-0
    un-font-mono
    un-text="xs muted hover:colored-ink focus-visible:colored-ink"
    un-tracking-wide
    un-decoration-none
    un-cursor-pointer
  >
    <InkArrow
      class="site-chrome-nav__mark"
      :seed="`chrome-nav:${to}`"
      dir="left"
      label="back"
      aria-hidden="true"
    />
    <slot />
  </NuxtLink>
  <button
    v-else
    v-bind="$attrs"
    class="site-chrome-nav"
    type="button"
    un-shrink-0
    un-inline-flex
    un-items-center
    un-gap-1.5
    un-border-0
    un-bg-transparent
    un-p-0
    un-font-mono
    un-text="xs muted hover:colored-ink focus-visible:colored-ink"
    un-tracking-wide
    un-decoration-none
    un-cursor-pointer
  >
    <InkArrow
      class="site-chrome-nav__mark"
      seed="chrome-nav:back"
      dir="left"
      label="back"
      aria-hidden="true"
    />
    <slot />
  </button>
</template>

<style scoped>
.site-chrome-nav :deep(.site-chrome-nav__mark) {
  color: inherit;
  transition: transform 160ms var(--ease-out);
}

.site-chrome-nav:hover .site-chrome-nav__mark,
.site-chrome-nav:focus-visible .site-chrome-nav__mark {
  transform: translateX(-0.2em);
}

@media (prefers-reduced-motion: reduce) {
  .site-chrome-nav__mark {
    transition: none;
  }
}
</style>
