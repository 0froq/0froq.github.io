<script setup lang="ts">
import { useCssVar, useElementVisibility, useEventListener } from '@vueuse/core'
import { useTemplateRef, watchEffect } from 'vue'

defineProps<{
  title: string
  id?: string
  intro?: string
}>()

const titleWrapper = useTemplateRef('titleWrapper')
const progressTrack = useTemplateRef('progressTrack')
const titleWrapperVisible = useElementVisibility(titleWrapper)

const progressBarWidth = useCssVar('--progress-bar-width', titleWrapper)

function handleScroll() {
  if (typeof window === 'undefined')
    return
  if (!titleWrapper.value || !progressTrack.value)
    return
  const categoryWrapper = titleWrapper.value.parentElement
  if (categoryWrapper) {
    const scrollY = window.scrollY
    const wrapperOffsetY = categoryWrapper.offsetTop
    const fullWidth = progressTrack.value.offsetWidth
    const windowHeight = window.innerHeight

    if (categoryWrapper.offsetHeight <= windowHeight) {
      progressBarWidth.value = `${fullWidth}px`
      return
    }

    const percentage = Math.min(1, Math.max(0, (scrollY - wrapperOffsetY) / Math.max(0, categoryWrapper.offsetHeight - windowHeight)))
    progressBarWidth.value = `${percentage * fullWidth}px`
  }
}

watchEffect(() => {
  if (typeof window === 'undefined')
    return
  if (titleWrapperVisible.value) {
    useEventListener(['scroll', 'resize'], handleScroll)
  }
  else {
    const clean = useEventListener(['scroll', 'resize'], handleScroll)
    clean()
  }
})
</script>

<template>
  <div
    :id="id || 'title-wrapper'"
    ref="titleWrapper"
    class="title-wrapper"
    un-sticky
    un-top-0
    un-z-10
  >
    <!--
      Full-bleed opaque band: covers site-shell lined paper in the header
      zone; title/progress stay in page-content column.
    -->
    <div
      un-w-screen
      un-ml="[calc(50%-50vw)]"
      un-pt-5
      un-bg="neutral-200 dark:neutral-900"
    >
      <div
        class="page-content"
        un-relative
      >
        <div
          un-flex="~ col"
          un-items-start
          un-gap-2
        >
          <h2
            un-mt-4
            un-text-3xl
            un-w-fit
            un-font-serif
            un-text="neutral-900 dark:neutral-100"
            v-html="title !== '-' ? title : ''"
          />
          <div
            un-place-self-end
            un-flex="~ row"
            un-gap-4
          >
            <slot name="titleAddon" />
          </div>
          <div
            un-place-self-end
            un-flex="~ row"
            un-items-center
            un-gap-3
          >
            <slot name="actions" />
          </div>
        </div>
        <div
          v-if="intro"
          un-text="stone-600 dark:stone-400"
          un-mb-4
          un-pl-8
          v-html="intro"
        />
        <slot />

        <div
          ref="progressTrack"
          class="progress-bar"
          un-relative
          un-h-2px
          un-mt-4
        >
          <div
            class="progress-bar-inner"
            un-bg="stone-600 dark:stone-400"
            :style="{ width: 'var(--progress-bar-width, 0)' }"
            un-h-2px
            un-absolute
            un-bottom-0
            un-z-1
          />
          <div
            class="progress-bar-bg"
            un-bg="stone-200 dark:stone-800"
            un-w-full
            un-h-2px
            un-absolute
            un-z-0
            un-bottom-0
          />
        </div>
      </div>
    </div>
  </div>
</template>
