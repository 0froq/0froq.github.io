<script setup lang="ts">
import { inkRulePath } from '~/utils/inkDraw'

const d = inkRulePath('prose-hr', 120, 4)
</script>

<template>
  <div
    role="separator"
    un-flex
    un-justify-center
    un-my-12
    un-text-muted
  >
    <svg
      viewBox="0 0 120 8"
      aria-hidden="true"
      un-block
      un-h-2
      un-w="[7.5rem]"
      un-overflow-visible
    >
      <path
        :d="d"
        fill="none"
        stroke="currentColor"
        stroke-width="1.2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  </div>
</template>
