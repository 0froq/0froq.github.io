<script setup lang="ts">
const peek = useHubPeek()
const entry = computed(() => peek?.value ?? null)
</script>

<template>
  <aside
    class="hub-peek"
    un-hidden
    un-py-1
    un-pr-3
    un-pl-1
    un-lg="block fixed top-[8vh] left-[var(--hub-chrome-inset)] z-10 w-[var(--hub-side)] max-h-[calc(100dvh-8vh-2rem)] overflow-auto pointer-events-none [scrollbar-width:thin]"
    aria-live="polite"
    :aria-hidden="entry ? undefined : 'true'"
  >
    <div
      v-if="entry"
      :key="entry.path"
      class="hub-peek-inner"
      un-max-w-sm
      un-pointer-events-auto
      un-ms="lg:auto"
      un-animate="fade-in duration-200 ease-paper motion-reduce:none"
    >
      <IssueEntryHead
        :entry="entry"
        variant="peek"
      />
    </div>
  </aside>
</template>
