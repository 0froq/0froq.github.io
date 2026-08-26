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
    un-gap="[0.35rem]"
    un-decoration-none
    un-outline-none
    un-transition-transform
    un-duration-200
    :aria-current="active ? 'page' : undefined"
  >
    <span
      ref="labelRef"
      class="label"
      :data-ink="active ? liveKind : undefined"
      :data-hover-ink="active ? undefined : hoverKind"
      :data-current="active ? '' : undefined"
      un-font-serif
      un-leading-none
      un-text="[clamp(26px,2.4vw,34px)] ink data-[current]:colored-ink max-md:22px"
      :data-voice="voice"
    >
      {{ label }}
    </span>
    <span
      v-if="note"
      class="note"
      un-font-sans
      un-text="10px muted"
      un-tracking="[0.03em]"
      un-leading="[1.45]"
      un-max-md:hidden
    >
      {{ note }}
    </span>
  </NuxtLink>
</template>

<style scoped>
.label {
  position: relative;
}

.label[data-voice='italic'] {
  font-style: italic;
  letter-spacing: -0.03em;
}

.label[data-voice='roman'] {
  font-style: normal;
  letter-spacing: 0.02em;
}
</style>
