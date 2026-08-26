<script setup lang="ts">
const props = defineProps<{
  gid: string
}>()
</script>

<template>
  <svg
    aria-hidden="true"
    focusable="false"
    un-pointer-events-none
    un-absolute
    un-left-0
    un-top-0
    un-h-px
    un-w-px
    un-opacity-0
    un-overflow-visible
  >
    <defs>
      <filter
        :id="props.gid"
        x="-50%"
        y="-50%"
        width="200%"
        height="200%"
        color-interpolation-filters="sRGB"
      >
        <feGaussianBlur
          in="SourceGraphic"
          stdDeviation="6.5"
          result="blur"
        />
        <feColorMatrix
          in="blur"
          mode="matrix"
          values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -8"
          result="goo"
        />
      </filter>
    </defs>
  </svg>
</template>
