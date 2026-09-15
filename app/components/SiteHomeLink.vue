<script setup lang="ts">
const { isHome, isHub } = useIssueFrame()
const { away } = useSiteChromeAway()
</script>

<template>
  <div
    v-if="isHub && !isHome"
    class="site-home-link"
    :data-away="away ? '' : undefined"
    un-fixed
    un-top-0
    un-left="[var(--gutter)]"
    un-z-40
    un-flex
    un-h="[var(--site-chrome)]"
    un-items-center
  >
    <SiteChromeNav
      to="/"
      aria-label="Home"
    >
      home
    </SiteChromeNav>
  </div>
</template>

<style scoped>
.site-home-link {
  transition: transform 340ms var(--ease-out);
}

.site-home-link[data-away] {
  transform: translateY(-120%);
  pointer-events: none;
}
</style>
