<script setup lang="ts">
const { isHome } = useIssueFrame()
</script>

<template>
  <NuxtLink
    v-if="!isHome"
    to="/"
    class="site-home"
    aria-label="Home"
  >
    ← home
  </NuxtLink>
</template>

<style scoped>
.site-home {
  position: fixed;
  top: 0;
  left: var(--gutter);
  z-index: 40;
  display: flex;
  align-items: center;
  height: var(--site-chrome);
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.04em;
  text-decoration: none;
  color: var(--muted);
}

.site-home:hover,
.site-home:focus-visible {
  color: var(--colored-ink);
}

@media (max-width: 759px) {
  .site-home {
    left: 1rem;
  }
}
</style>
