<script setup lang="ts">
const props = withDefaults(defineProps<{
  kind?: 'warning' | 'note' | 'tip'
  title?: string
  /** Unfolded on first paint. Defaults to collapsed. */
  open?: boolean
}>(), {
  kind: 'note',
  open: false,
})

const slots = defineSlots<{
  default?: () => unknown
  title?: () => unknown
}>()

const hasTitle = computed(() => Boolean(props.title || slots.title))
const kindLabel = computed(() => {
  if (props.kind === 'warning')
    return 'Warning'
  if (props.kind === 'tip')
    return 'Tip'
  return 'Note'
})
const foldLabel = computed(() => props.title || kindLabel.value)
const kindColor = computed(() => `var(--callout-${props.kind})`)
</script>

<template>
  <div
    role="note"
    :aria-label="foldLabel"
    :data-kind="kind"
    un-my-7
    un-pl-4
  >
    <InkFold
      :seed="`callout-${foldLabel}`"
      :label="foldLabel"
      :tone="kindColor"
      :open="open"
      un-text="left [1.05em]"
      un-font-stylish
      un-leading-snug
    >
      <template #trigger>
        <template v-if="hasTitle">
          <slot name="title">
            {{ title }}
          </slot>
        </template>
        <span
          v-else
          un-sr-only
        >{{ foldLabel }}</span>
      </template>
      <div
        un-text-ink
        un-leading-relaxed
      >
        <slot />
      </div>
    </InkFold>
  </div>
</template>
