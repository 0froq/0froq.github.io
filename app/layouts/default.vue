<script setup lang="ts">
const { isHome, isHub } = useIssueFrame()
const { away } = useSiteChromeAway()

const pinHubChrome = computed(() => isHub.value)
const hideChromeMast = computed(() => isHome.value || isHub.value)
</script>

<template>
  <div
    un-box-border
    un-flex
    un-min-h-dvh
    un-flex-col
    :data-hub-frame="pinHubChrome ? '' : undefined"
    :data-chrome-away="away ? '' : undefined"
  >
    <SiteHomeLink />
    <AppHeader v-if="!hideChromeMast" />
    <main
      data-sheet
      class="[view-transition-name:issue-sheet] motion-reduce:[view-transition-name:none]"
      un-flex-1
      un-px="[--gutter] data-[home]:0"
      :data-home="isHome ? '' : undefined"
      :un-min-h="pinHubChrome ? '0' : undefined"
    >
      <slot />
    </main>
    <AppFooter v-if="!isHome && !pinHubChrome" />
    <Teleport to="body">
      <AppFooter
        v-if="pinHubChrome"
        overlay
      />
    </Teleport>
    <StatsSession />
    <SelectionToolbar />
  </div>
</template>

<style scoped>
[data-hub-frame] {
  height: 100dvh;
  overflow: hidden;
}
</style>
