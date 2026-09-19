<script setup lang="ts">
withDefaults(defineProps<{
  flush?: boolean
  overlay?: boolean
}>(), {
  flush: false,
  overlay: false,
})

const { publication } = useIssueFrame()
const { away } = useSiteChromeAway()
</script>

<template>
  <footer
    un-box-border
    un-flex
    un-w-full
    un-flex-col
    un-bg-paper
    un-gap-3
    un-px="[var(--gutter)] max-md:8 data-[flush]:0"
    un-py="2.5 data-[flush]:0"
    un-font-mono
    un-text="sm muted"
    un-print:hidden
    :data-flush="flush ? '' : undefined"
    :data-overlay="overlay ? '' : undefined"
    :data-away="away ? '' : undefined"
  >
    <div
      un-flex
      un-min-h="[1.25rem]"
      un-w-full
      un-items-center
      un-justify-between
      un-gap-x-6
      un-gap-y-2
    >
      <SiteDoing
        un-min-w-0
        un-flex-1
      />
      <PublicationRoomSwitch
        v-if="publication"
        :current="publication.slug"
        size="chrome"
        un-shrink-0
      />
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
        class="footer-copy"
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

<style scoped>
footer {
  transition: transform 340ms var(--ease-out);
}

footer[data-overlay] {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 30;
  background: var(--paper);
}

footer[data-away] {
  transform: translateY(110%);
  pointer-events: none;
}
</style>
