<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
})

const props = defineProps<{
  type?: 'dashed' | 'solid'
  title?: string
  position?: 'left' | 'right' | 'center'
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
    <span
      v-if="props.position === 'left'"
      un-text="neutral-700 dark:neutral-300"
      v-bind="$attrs"
      class="separator-title"
      un-px-2
    >{{ props.title }}</span>
    <div
      v-if="props.position === 'center'"
      :class="`${props.type || 'solid'}-separator left-separator`"
      un-flex-grow
      un-h-px
      un-text="neutral-400 dark:neutral-600"
    />
    <span
      v-if="props.position !== 'left' && props.position !== 'right'"
      un-text="neutral-600 dark:neutral-400"
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
    <span
      v-if="props.position === 'right'"
      un-text="neutral-600 dark:neutral-400"
      v-bind="$attrs"
      class="separator-title"
      un-px-2
    >{{ props.title }}</span>
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
