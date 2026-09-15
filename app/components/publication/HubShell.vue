<script setup lang="ts">
import { usePreferredReducedMotion } from '@vueuse/core'

withDefaults(defineProps<{
  title?: string
  axis?: 'list' | 'wheel'
}>(), {
  axis: 'list',
})

const peek = providePublicationPeek()
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
  <div
    class="hub-shell group/hub"
    :data-axis="axis"
    un-relative
    un-box-border
    un-flex
    un-h-dvh
    un-w-full
    un-min-h-0
    un-flex-col
    un-overflow-hidden
    un-overscroll-none
    un-px="[var(--gutter)]"
    un-max-md="[--hub-pad-bottom:1.25rem] [--track-fade-bottom:4.75rem] [--track-fade-solid-bottom:1.25rem]"
  >
    <h1
      v-if="title"
      un-sr-only
    >
      {{ title }}
    </h1>
    <div
      class="hub-shell__cluster"
      un-relative
      un-flex
      un-h-full
      un-min-h-0
      un-min-w-0
      un-w-full
      un-flex-col
      un-lg:flex-row
      un-lg:gap-5
    >
      <div
        class="hub-shell__axis"
        :class="axis === 'list'
          ? 'lg:max-w-176'
          : 'lg:flex-none lg:w-max lg:max-w-[calc(100%-24rem-1.25rem)] lg:shrink'"
        un-relative
        un-min-h-0
        un-min-w-0
        un-flex-1
        un-overflow-hidden
      >
        <div
          v-if="axis === 'list'"
          class="hub-shell__track"
          un-absolute
          un-inset-x-0
          un-top="[var(--hub-pad-top)]"
          un-bottom="[var(--hub-pad-bottom)]"
          un-overflow-x-hidden
          un-overflow-y-auto
          un-overscroll-contain
          un-pt="[var(--hub-body-pad-top)]"
          un-pb="[calc(var(--track-fade-bottom)-var(--hub-pad-bottom)+1.25rem)]"
        >
          <slot />
        </div>
        <slot v-else />
        <SiteTrackFade edge="top" />
        <SiteTrackFade edge="bottom" />
      </div>
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
        un-pt="[var(--hub-body-pad-top)]"
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
              :key="shown.path"
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
    </div>
  </div>
</template>

<style scoped>
.hub-shell {
  --hub-pad-top: var(--site-chrome);
  --hub-pad-bottom: var(--site-footer);
  --hub-body-pad-top: 2.75rem;
  --track-fade-bottom: calc(var(--hub-pad-bottom) + 3.5rem);
  --track-fade-solid-bottom: var(--hub-pad-bottom);
}

.hub-shell__track {
  scrollbar-width: none;
}

.hub-shell__track::-webkit-scrollbar {
  display: none;
}
</style>
