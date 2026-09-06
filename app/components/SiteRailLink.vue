<script setup lang="ts">
import { morphRoughInk, paintRoughInk } from '~/utils/roughInk'

const props = withDefaults(defineProps<{
  to: string
  label: string
  note?: string
  active?: boolean
  ink?: 'underline' | 'mark' | 'circle'
  hoverInk?: 'underline' | 'mark' | 'circle'
  voice?: 'italic' | 'roman'
}>(), {
  voice: 'italic',
})

const labelRef = ref<HTMLElement | null>(null)
const hoverKind = computed(() => props.hoverInk ?? props.ink ?? 'underline')
const liveKind = computed(() => props.ink ?? 'underline')

watch(() => props.active, async (_active, prev) => {
  await nextTick()
  const el = labelRef.value
  if (!el || import.meta.server)
    return
  if (prev === undefined || hoverKind.value === liveKind.value)
    paintRoughInk(el)
  else
    morphRoughInk(el)
})
</script>

<template>
  <NuxtLink
    :to="to"
    class="ink-host"
    active-class=""
    exact-active-class=""
    un-flex
    un-flex-col
    un-gap-1
    un-decoration-none
    un-outline-none
    un-transition-transform
    un-duration-200
    :aria-current="active ? 'page' : undefined"
  >
    <span
      ref="labelRef"
      class="label data-[voice=italic]:tracking-tight data-[voice=roman]:tracking-wide data-[voice=italic]:italic data-[voice=roman]:not-italic"
      :data-ink="active ? liveKind : undefined"
      :data-hover-ink="active ? undefined : hoverKind"
      :data-current="active ? '' : undefined"
      un-relative
      un-font-serif
      un-leading-none
      un-text="[clamp(1.15rem,1.7vw,1.45rem)] ink/80 data-[current]:ink max-md:lg"
      un-transition-colors
      :data-voice="voice"
    >
      {{ label }}
    </span>
    <span
      v-if="note"
      class="note"
      un-font-sans
      un-text="xs muted"
      un-tracking-wide
      un-leading-snug
      un-max-md:hidden
    >
      {{ note }}
    </span>
  </NuxtLink>
</template>
