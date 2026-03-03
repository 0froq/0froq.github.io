<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
})

const props = defineProps<{
  type?: 'dashed' | 'solid'
  title?: string
}>()
</script>

<template>
  <div
    v-if="props.title"
    un-flex="~ row items-center"
    un-w-full
    v-bind="$attrs"
    aria-hidden
  >
    <div
      :class="`${props.type || 'solid'}-separator left-separator`"
      un-flex-grow
      un-h-px
      un-text="neutral-400 dark:neutral-600"
    />
    <span
      un-text="neutral-700 dark:neutral-300"
      v-bind="$attrs"
      class="separator-title"
      un-px-2
    >{{ props.title }}</span>
    <div
      :class="`${props.type || 'solid'}-separator right-separator`"
      un-flex-grow
      un-h-px
      un-text="neutral-400 dark:neutral-600"
    />
  </div>

  <div
    v-else
    :class="`${props.type || 'solid'}-separator separator`"
    un-w-full
    un-shrink-1
    un-h-px
    un-text="neutral-400 dark:neutral-600"
    v-bind="$attrs"
    aria-hidden
  />
</template>

<style scoped>
.dashed-separator {
  /* use currentColor so UnoCSS dark/light text color affects the dash color */
  background-image: repeating-linear-gradient(to right, currentColor 0 8px, rgba(0, 0, 0, 0) 8px 16px);
  background-repeat: repeat-x;
  background-position: left center;
}

.solid-separator {
  background-color: currentColor;
}

.separator-title {
  font-size: 0.875rem;
  line-height: 1;
  white-space: nowrap;
  display: inline-block;
}

.left-separator,
.right-separator {
  min-width: 4px;
}
</style>
