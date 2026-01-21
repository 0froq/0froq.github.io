<script setup lang="ts">
import { useCssVar, useElementVisibility, useEventListener } from '@vueuse/core'
import { useTemplateRef, watchEffect } from 'vue'

defineProps<{
  title: string
  id?: string
  intro?: string
}>()

const titleWrapper = useTemplateRef('titleWrapper')
const titleWrapperVisible = useElementVisibility(titleWrapper)

const progressBarWidth = useCssVar('--progress-bar-width', titleWrapper)

function handleScroll() {
  // const categoryWrapper = titleWrapper.value!.parentElement
  if (!titleWrapper.value)
    return
  const categoryWrapper = titleWrapper.value.parentElement
  if (categoryWrapper) {
    const scrollY = window.scrollY
    const wrapperOffsetY = categoryWrapper.offsetTop
    const fullWidth = titleWrapper.value!.offsetWidth
    const windowHeight = window.innerHeight

    // if the height of the category wrapper is less than the height of the window,
    // then the progress bar should be 100%
    if (categoryWrapper.offsetHeight <= windowHeight) {
      progressBarWidth.value = `${fullWidth}px`
      return
    }

    const percentage = Math.min(1, Math.max(0, (scrollY - wrapperOffsetY) / Math.max(0, categoryWrapper.offsetHeight - windowHeight)))
    progressBarWidth.value = `${percentage * fullWidth}px`
  }
}
watchEffect(() => {
  if (titleWrapperVisible.value) {
    useEventListener(window, ['scroll', 'resize'], handleScroll)
  }
  else {
    const clean = useEventListener(window, ['scroll', 'resize'], handleScroll)
    clean()
  }
})
</script>

<template>
  <div
    :id="id || 'title-wrapper'"
    ref="titleWrapper"
    un-sticky
    un-top-0
    un-py-5
    un-z-10
    un-bg="neutral-50 dark:neutral-950"
    class="title-wrapper"
  >
    <div class="progress-bar">
      <div
        class="progress-bar-inner"
        un-bg="neutral-600 dark:neutral-400"
        :style="{ width: 'var(--progress-bar-width, 0)' }"
        un-h-2px
        un-absolute
        un-bottom-0
        un-z-1
      />
      <div
        class="progress-bar-bg"
        un-bg="neutral-200 dark:neutral-800"
        un-w-full
        un-h-2px
        un-absolute
        un-z-0
        un-bottom-0
      />
    </div>
    <h2
      un-my-4
      un-text-4xl
    >
      {{ title !== '-' ? title : '' }}
    </h2>
    <div
      v-if="intro"
      un-text="neutral-600 dark:neutral-400"
      un-mb-4
      un-pl-8
    >
      {{ intro }}
    </div>
    <slot />
  </div>
</template>
