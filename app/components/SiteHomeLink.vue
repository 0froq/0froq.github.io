<script setup lang="ts">
const { isHome, isHub } = useIssueFrame()
</script>

<template>
  <div
    v-if="isHub && !isHome"
    un-fixed
    un-top-0
    un-left="[var(--gutter)] max-md:4"
    un-z-40
    un-flex
    un-h="[var(--site-chrome)]"
    un-items-center
  >
    <SiteChromeNav
      to="/"
      aria-label="Home"
    >
      ← home
    </SiteChromeNav>
  </div>
</template>
