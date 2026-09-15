<script setup lang="ts">
const links = [
  { to: '/essays', label: 'Essays' },
  { to: '/journal', label: 'Journal' },
  { to: '/cabinet', label: 'Cabinet' },
  { to: '/dashboard', label: 'Dashboard' },
] as const
</script>

<template>
  <nav
    un-flex
    un-items-baseline
    un-gap-4
  >
    <NuxtLink
      to="/"
      un-text-sm
      un-font-medium
    >
      froQ
    </NuxtLink>
    <NuxtLink
      v-for="link in links"
      :key="link.to"
      :to="link.to"
      un-text-sm
      un-opacity="60 hover:100"
      active-class="un-opacity-100"
    >
      {{ link.label }}
    </NuxtLink>
  </nav>
</template>
