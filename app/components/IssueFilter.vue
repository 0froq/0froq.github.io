<script setup lang="ts">
defineProps<{
  id: string
  prefix?: string
  suffix?: string
}>()

const checked = defineModel<boolean>({ required: true })
</script>

<template>
  <label
    :for="id"
    class="filter-hit"
    un-m-0
    un-inline-flex
    un-cursor-pointer
    un-select-none
    un-items-center
    un-gap-1.5
    un-font-mono
    un-text="xs focus-within:ink"
    un-tracking-wide
    un-leading-none
    un-outline-none
  >
    <input
      :id="id"
      v-model="checked"
      type="checkbox"
      un-sr-only
    >
    <InkCheck
      v-model="checked"
      :seed="id"
    />
    <span
      un-flex
      un-items-center
      un-gap-1
    >
      <span v-if="prefix">{{ prefix }}</span>
      <span
        un-relative
        un-inline-grid
        un-min-w="[2em]"
        un-overflow-hidden
        un-text-center
        un-leading-relaxed
      >
        <span
          un-col-start-1
          un-row-start-1
          un-text="colored-ink"
          un-transition="[transform,opacity] duration-300"
          :style="{
            opacity: checked ? 1 : 0,
            transform: checked ? 'translateY(0)' : 'translateY(-70%)',
          }"
        >show</span>
        <span
          un-col-start-1
          un-row-start-1
          un-transition="[transform,opacity] duration-300"
          un-text-muted
          :style="{
            opacity: checked ? 0 : 1,
            transform: checked ? 'translateY(70%)' : 'translateY(0)',
          }"
        >hide</span>
      </span>
      <span>{{ suffix }}</span>
    </span>
  </label>
</template>
