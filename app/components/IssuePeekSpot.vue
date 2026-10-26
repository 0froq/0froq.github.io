<script setup lang="ts">
import { useElementBounding, useMouseInElement } from '@vueuse/core'

const props = defineProps<{
  card: HTMLElement | null
  title: HTMLElement | null
}>()

const cardTarget = computed(() => props.card)
const titleTarget = computed(() => props.title)
const { elementX, elementY, elementWidth, elementHeight, isOutside } = useMouseInElement(
  cardTarget,
  {
    handleOutside: false,
  },
)
const cardBox = useElementBounding(cardTarget)
const titleBox = useElementBounding(titleTarget)

watchEffect(() => {
  const card = props.card
  if (!card || isOutside.value) return
  const bw = elementWidth.value
  const bh = elementHeight.value
  if (!(bw >= 1) || !(bh >= 1)) return
  const w = card.clientWidth || bw
  const h = card.clientHeight || bh
  const x = (elementX.value / bw) * w
  const y = (elementY.value / bh) * h
  card.style.setProperty('--ink-x', `${x.toFixed(1)}px`)
  card.style.setProperty('--ink-y', `${y.toFixed(1)}px`)
  const title = props.title
  if (!title) return
  const boxW = cardBox.width.value || w
  const boxH = cardBox.height.value || h
  const hx = x - (titleBox.x.value - cardBox.x.value) * (w / boxW)
  const hy = y - (titleBox.y.value - cardBox.y.value) * (h / boxH)
  title.style.setProperty('--halo-x', `${hx.toFixed(1)}px`)
  title.style.setProperty('--halo-y', `${hy.toFixed(1)}px`)
})
</script>

<template>
  <span hidden />
</template>
