<script setup lang="ts">
import { inkWaitBlob } from '~/utils/inkDraw'

const props = defineProps<{
  seed: string
}>()

const d = computed(() => inkWaitBlob(props.seed))
</script>

<template>
  <svg
    class="ink-blob"
    viewBox="0 0 24 24"
    aria-hidden="true"
    un-block
    un-h-full
    un-w-full
    un-overflow-visible
  >
    <path
      :d="d"
      fill="currentColor"
    />
  </svg>
</template>
