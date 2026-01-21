<script setup lang="ts">
import { defaultDocument, useScroll } from '@vueuse/core'
import { toRefs } from 'vue'

const { y, arrivedState } = useScroll(window)
const { top, bottom } = toRefs(arrivedState)
</script>

<template>
  <div
    un-fixed
    un-left-20px
    un-bottom-20px
    un-flex-col
    un-gap-2
    un-z-1000
  >
    <button
      :un-opacity="top ? 0 : 100"
      un-items-center
      un-transition
      un-bg-vp-c-brand-1
      un-text-white
      un-border-none
      un-rounded-full
      un-w-10
      un-h-10
      un-flex
      un-justify-center
      un-cursor-pointer
      un-duration-300
      @click="y = 0"
    >
      <un-i-ph-arrow-up-duotone />
    </button>
    <button
      :un-opacity="bottom ? 0 : 100"
      un-bg-vp-c-brand-1
      un-text-white
      un-border-none
      un-rounded-full
      un-w-10
      un-h-10
      un-flex
      un-items-center
      un-justify-center
      un-cursor-pointer
      un-transition
      un-duration-300
      @click="y = defaultDocument!.documentElement.scrollHeight"
    >
      <un-i-ph-arrow-down-duotone />
    </button>
  </div>
</template>
