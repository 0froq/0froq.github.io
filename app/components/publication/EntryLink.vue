<script setup lang="ts">
defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<{
  entry: LayerEntry
  /** `title` pins the pointer to the first line; default is the row midline. */
  arrow?: 'mid' | 'title'
}>(), {
  arrow: 'mid',
})

const peek = usePublicationPeek()
</script>

<template>
  <a
    v-bind="$attrs"
    un-relative
    un-p-block-2
    un-pl-12
    un-pr-4
    :href="props.entry.path"
    :data-void="props.entry.status === 'void' ? '' : undefined"
    :data-rest="peek.isShown(props.entry) ? '' : undefined"
    :data-pin="peek.isPinned(props.entry) ? '' : undefined"
    un-focus-visible="outline outline-1 outline-colored-ink outline-offset-[3px]"
    @pointerenter="peek.hover(props.entry)"
    @pointerleave="peek.leave"
    @focusin="peek.hover(props.entry)"
    @focusout="peek.leave"
    @click="peek.activate(props.entry, $event)"
  >
    <span
      class="entry-link__arrow"
      aria-hidden="true"
      :class="arrow === 'title'
        ? 'top-2 translate-y-[0.2rem] md:translate-y-[0.35rem]'
        : 'top-1/2 -translate-y-1/2'"
      un-absolute
      un-left-0
      un-pointer-events-none
      un-text-colored-ink
    >
      <InkPointer
        :seed="props.entry.path"
        dir="left"
        size="lg"
        pace="fast"
        :drawn="peek.isPinned(props.entry)"
      />
    </span>
    <slot
      :shown="peek.isShown(props.entry)"
      :pinned="peek.isPinned(props.entry)"
    />
  </a>
</template>

<style scoped>
.entry-link {
  position: relative;
  padding-block: 0.4rem;
  padding-left: 3.25rem;
}

.entry-link[data-pin]:focus-visible {
  outline: none;
}
</style>
