<script setup lang="ts">
import { usePreferredReducedMotion } from '@vueuse/core'

defineProps<{
  axis: 'list' | 'wheel'
}>()

const peek = usePublicationPeek()
const shown = peek.shown
const peekEnterMs = 240
const motion = usePreferredReducedMotion()

function onPeekLeave(el: Element, done: () => void) {
  const wait = motion.value !== 'reduce' && shown.value ? peekEnterMs : 0
  if (!wait) {
    crackApart(el as HTMLElement, done)
    return
  }
  window.setTimeout(() => crackApart(el as HTMLElement, done), wait)
}

function onPeekEnter(el: Element, done: () => void) {
  if (motion.value === 'reduce') {
    done()
    return
  }
  const anim = (el as HTMLElement).animate(
    [
      { opacity: 0, transform: 'translateY(8px)' },
      { opacity: 1, transform: 'translateY(0)' },
    ],
    { duration: peekEnterMs, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' },
  )
  anim.finished.then(() => done()).catch(() => done())
}
</script>

<template>
  <aside
    class="hub-shell__rail"
    :class="axis === 'list'
      ? 'lg:shrink lg:grow-0'
      : 'lg:flex-none lg:min-w-96 lg:pt-[var(--hub-pad-top)] lg:pb-[var(--hub-pad-bottom)] lg:justify-center'"
    un-relative
    un-flex
    un-flex-col
    un-pointer-events-none
    un-min-w-0
    un-w-full
    un-pb="[var(--site-footer)]"
    un-lg:w-96
    un-lg:min-w-96
    un-lg:pt="[calc(var(--hub-pad-top)+var(--hub-body-pad-top))]"
  >
    <div
      un-relative
      un-isolate
      un-grid
      un-w-full
      un-min-h="[min(42vh,22rem)] lg:0"
      un-place-items-center
      aria-live="polite"
    >
      <Transition
        :css="false"
        @enter="onPeekEnter"
        @leave="onPeekLeave"
      >
        <IssuePeekCard
          v-if="shown"
          :entry="shown"
          un-col-start-1
          un-row-start-1
          un-z-2
          un-pointer-events-auto
          @dismiss="peek.dismiss"
        />
      </Transition>
    </div>
  </aside>
</template>
