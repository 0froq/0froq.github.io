<script setup lang="ts">
const props = withDefaults(defineProps<{
  note: string
  dir?: InkArrowDir
  seed?: string
}>(), {
  dir: 'left',
})

const pointerSeed = computed(() => props.seed ?? props.note)
</script>

<template>
  <span
    class="ink-gloss"
    un-relative
    un-inline
    un-whitespace-nowrap
  >
    <span data-ink="mark"><slot /></span>
    <span
      class="ink-gloss__annote"
      un-absolute
      un-left="full"
      un-top="[50%]"
      un-translate-y="-50%"
      un-ml-1
      un-flex
      un-items-center
      un-gap-1
      un-pointer-events-none
    >
      <InkPointer
        :seed="pointerSeed"
        :dir="dir"
        size="sm"
        draw
      />
      <span
        un-font-serif
        un-italic
        un-leading-none
        un-whitespace-nowrap
        un-text="muted [0.62em]"
      >{{ note }}</span>
    </span>
  </span>
</template>
