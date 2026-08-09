<script setup lang="ts">
defineProps<{
  title: string
  id?: string
  intro?: string
}>()
</script>

<template>
  <div
    :id="id || 'title-wrapper'"
    class="page-title"
    un-pt-5
    un-mb-2
  >
    <div
      un-flex="~ col"
      un-items-start
      un-gap-2
    >
      <h2
        un-mt-4
        un-text-3xl
        un-w-fit
        un-font-serif
        un-text="neutral-900 dark:neutral-100"
        v-html="title !== '-' ? title : ''"
      />
      <div
        un-flex="~ row"
        un-items-center
        un-gap-4
        un-w-full
      >
        <slot name="titleAddon" />
        <div
          un-flex="~ row"
          un-items-center
          un-gap-3
          un-ml-auto
        >
          <slot name="actions" />
        </div>
      </div>
    </div>
    <div
      v-if="intro"
      un-text="neutral-600 dark:neutral-400"
      un-mb-4
      un-pl-8
      v-html="intro"
    />
    <slot />
  </div>
</template>
