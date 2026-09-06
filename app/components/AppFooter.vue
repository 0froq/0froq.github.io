<script setup lang="ts">
withDefaults(defineProps<{
  flush?: boolean
}>(), {
  flush: false,
})
</script>

<template>
  <footer
    un-box-border
    un-flex
    un-w-full
    un-flex-col
    un-gap="4 data-[flush]:3"
    un-px="[var(--gutter)] max-md:4 data-[flush]:0"
    un-pb="14 data-[flush]:0"
    un-pt="10 data-[flush]:0"
    un-font-mono
    un-text="sm muted"
    :data-flush="flush ? '' : undefined"
  >
    <div
      un-flex
      un-min-h="[1.25rem]"
      un-w-full
      un-items-center
      un-justify-start
    >
      <SiteDoing />
    </div>

    <div
      un-grid
      un-w-full
      un-grid-cols="[minmax(0,1fr)_auto_minmax(0,1fr)]"
      un-items-baseline
      un-gap-x-4
    >
      <div
        un-min-w-0
        un-justify-self-start
      >
        <SiteStatsLine />
      </div>
      <NuxtLink
        to="/"
        un-justify-self-center
        un-whitespace-nowrap
        un-text="muted hover:colored-ink focus-visible:colored-ink"
        un-max-md:invisible
        un-max-md:max-w-0
        un-max-md:overflow-hidden
        un-max-md:pointer-events-none
      >
        © 2024–present froQ · CC BY-NC-SA 4.0
      </NuxtLink>
      <span
        un-inline-flex
        un-items-baseline
        un-justify-self-end
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
    </div>
  </footer>
</template>
