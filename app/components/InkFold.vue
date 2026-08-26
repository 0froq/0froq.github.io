<script setup lang="ts">
defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<{
  seed: string
  label: string
  panelId?: string
  tone?: string
}>(), {})

const triggerId = useId()
const resolvedPanelId = computed(() => props.panelId || `ink-fold-panel-${triggerId}`)
const open = shallowRef(false)
const shown = shallowRef(false)
let closeTimer: number | undefined

function prefersReducedMotion() {
  return import.meta.client
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function release() {
  if (closeTimer !== undefined) {
    window.clearTimeout(closeTimer)
    closeTimer = undefined
  }
  if (open.value)
    return
  shown.value = false
}

function onSlotTransitionEnd(event: TransitionEvent) {
  if (event.target !== event.currentTarget)
    return
  release()
}

async function toggle() {
  if (open.value) {
    open.value = false
    if (prefersReducedMotion()) {
      release()
      return
    }
    closeTimer = window.setTimeout(release, 320)
    return
  }

  if (closeTimer !== undefined) {
    window.clearTimeout(closeTimer)
    closeTimer = undefined
  }
  shown.value = true
  await nextTick()
  open.value = true
}

onUnmounted(() => {
  if (closeTimer !== undefined)
    window.clearTimeout(closeTimer)
})
</script>

<template>
  <div>
    <button
      v-bind="$attrs"
      type="button"
      un-relative
      un-block
      un-w-full
      un-appearance-none
      un-cursor-pointer
      un-border-0
      un-bg-transparent
      un-p-0
      :style="{ color: tone }"
      :aria-expanded="open"
      :aria-controls="resolvedPanelId"
      :aria-label="open ? `Collapse: ${label}` : `Expand: ${label}`"
      @click="toggle"
    >
      <span
        un-absolute
        un-left="[-1.55rem]"
        un-top="[0.3em]"
        un-inline-flex
        un-items-center
        un-justify-center
        un-leading-none
        aria-hidden="true"
      >
        <span
          un-absolute
          un-inset="[-0.55em_-0.42em]"
        />
        <InkDots
          :seed="seed"
          :count="1"
          :hollow="open"
        />
      </span>
      <slot name="trigger">
        {{ label }}
      </slot>
    </button>

    <div
      un-grid
      un-grid-rows="[0fr] data-[open]:[1fr]"
      un-transition="[grid-template-rows] motion-reduce:none"
      un-duration="[280ms] data-[open]:[380ms]"
      un-ease="[var(--ease-out)]"
      :data-open="open ? '' : undefined"
      @transitionend="onSlotTransitionEnd"
    >
      <div
        un-min-h-0
        un-overflow-hidden
        un-opacity="0 data-[open]:100 motion-reduce:100"
        un-blur="[2px] data-[open]:none motion-reduce:none"
        un-transition="[opacity,filter] motion-reduce:none"
        un-duration="[220ms]"
        un-ease="[var(--ease-out)]"
        :data-open="open ? '' : undefined"
      >
        <div
          v-if="shown"
          :id="resolvedPanelId"
        >
          <slot />
        </div>
      </div>
    </div>
  </div>
</template>
