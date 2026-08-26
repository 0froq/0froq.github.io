<script setup lang="ts">
const { pref, cycle } = useColorScheme()
</script>

<template>
  <button
    type="button"
    :data-pref="pref"
    un-m-0
    un-inline
    un-cursor-pointer
    un-border-0
    un-bg-transparent
    un-p-0
    un-font-mono
    un-leading-inherit
    un-text="sm colored-ink"
    :aria-label="`color scheme ${pref}`"
    @click="cycle"
  >
    <span
      v-if="pref === 'auto'"
      un-i-ph-circle-half-duotone
      un-inline-block
      un-mr-1
      un-size="1em"
      un-align="[-0.125em]"
    />
    <span
      v-else-if="pref === 'light'"
      un-i-ph-sun-dim-duotone
      un-inline-block
      un-mr-1
      un-size="1em"
      un-align="[-0.125em]"
    />
    <span
      v-else
      un-i-ph-moon-stars-duotone
      un-inline-block
      un-mr-1
      un-size="1em"
      un-align="[-0.125em]"
    />
    {{ pref }}
  </button>
</template>
