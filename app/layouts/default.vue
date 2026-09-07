<script setup lang="ts">
const { isHome, isHub } = useIssueFrame()

const hideChromeMast = computed(() => isHome.value || isHub.value)
</script>

<template>
  <div
    un-box-border
    un-flex
    un-min-h-dvh
    un-flex-col
  >
    <SiteHomeLink />
    <AppHeader v-if="!hideChromeMast" />
    <main
      data-sheet
      class="[view-transition-name:issue-sheet] motion-reduce:[view-transition-name:none]"
      un-flex-1
      un-w-full
    >
      <slot />
    </main>
    <AppFooter v-if="!isHome" />
    <StatsSession />
    <SelectionToolbar />
    <SiteStickyCursor />
  </div>
</template>
