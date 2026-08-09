<script setup lang="ts">
import { defaultWindow, useScroll } from '@vueuse/core'
import { toRefs } from 'vue'

// useScroll(Document) writes via body.scrollTo(), which is a no-op when
// the page scrolls on documentElement — use window instead.
const { y, arrivedState } = useScroll(defaultWindow)
const { top, bottom } = toRefs(arrivedState)

function scrollToTop() {
  y.value = 0
}

function scrollToBottom() {
  y.value = defaultWindow!.document.documentElement.scrollHeight
}
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
      un-text="neutral-950 dark:neutral-50"
      un-border-none
      un-rounded-full
      un-w-10
      un-h-10
      un-flex
      un-justify-center
      un-cursor-pointer
      un-duration-300
      @click="scrollToTop"
    >
      <un-i-ph-arrow-up-duotone />
    </button>
    <button
      :un-opacity="bottom ? 0 : 100"
      un-text="neutral-950 dark:neutral-50"
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
      @click="scrollToBottom"
    >
      <un-i-ph-arrow-down-duotone />
    </button>
  </div>
</template>
