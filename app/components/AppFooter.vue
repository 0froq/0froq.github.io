<script setup lang="ts">
withDefaults(defineProps<{
  flush?: boolean
}>(), {
  flush: false,
})
</script>

<template>
  <footer
    class="site-bar"
    un-box-border
    un-w-full
    un-px="[var(--gutter)] max-md:4 data-[flush]:0"
    un-pb="14 data-[flush]:0"
    un-pt="10 data-[flush]:0"
    un-font-mono
    un-text="sm muted"
    :data-flush="flush ? '' : undefined"
  >
    <div class="site-bar-start">
      <slot>
        <SiteStatsLine v-if="!flush" />
      </slot>
    </div>
    <NuxtLink
      class="site-bar-mid"
      to="/"
      un-whitespace-nowrap
      un-text="muted hover:colored-ink focus-visible:colored-ink"
    >
      © 2024–present froQ · CC BY-NC-SA 4.0
    </NuxtLink>
    <span
      class="site-bar-end"
      un-inline-flex
      un-items-baseline
      un-gap-2.5
      un-whitespace-nowrap
    >
      <a
        href="https://github.com/Fro-Q"
        rel="noreferrer"
        target="_blank"
        un-text="muted hover:colored-ink focus-visible:colored-ink"
      >github</a>
      <span aria-hidden="true">·</span>
      <ColorSchemeToggle />
    </span>
  </footer>
</template>

<style scoped>
.site-bar {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  align-items: baseline;
  column-gap: 1rem;
}

.site-bar-start {
  justify-self: start;
  min-width: 0;
}

.site-bar-mid {
  justify-self: center;
}

.site-bar-end {
  justify-self: end;
}

@media (max-width: 768px) {
  .site-bar-mid {
    visibility: hidden;
    overflow: hidden;
    max-width: 0;
    pointer-events: none;
  }
}
</style>
