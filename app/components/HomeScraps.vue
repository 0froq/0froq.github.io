<script setup lang="ts">
const props = withDefaults(defineProps<{
  chromeHeight?: number
}>(), {
  chromeHeight: 0,
})

const { scraps, reactions, onReact } = useScrapsBoard()
</script>

<template>
  <section
    un-relative
    un-z-2
    un-bg-paper
    un-box-border
    un-pt="[clamp(1.25rem,4vh,2.5rem)]"
    un-pb-16
    un-px="4 md:[clamp(1.5rem,6vw,6rem)]"
    aria-label="Scraps"
    :style="{ minHeight: `calc(100svh - ${props.chromeHeight}px)` }"
  >
    <p
      v-if="!scraps.length"
      un-mx-auto
      un-max-w-xl
      un-m-0
      un-text="sm muted"
    >
      No scraps yet.
    </p>

    <div
      v-else
      un-mx-auto
      un-w-full
      un-max-w-xl
    >
      <HomeScrapFold
        :scraps="scraps"
        :reactions="reactions"
        @react="onReact"
      />
    </div>
  </section>
</template>
