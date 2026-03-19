<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  id: string
  modelValue: boolean | undefined
  labelPrefix?: string
  labelSuffix?: string
  labelText?: {
    checked: string
    unchecked: string
  }
}>()

const emit = defineEmits(['update:modelValue'])

const isChecked = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value),
})
</script>

<template>
  <div
    un-flex="~ row"
    un-items-center
  >
    <input
      :id="id"
      v-model="isChecked"
      type="checkbox"
      un-relative
      un-transition
      un-appearance-none
      un-w-4
      un-h-4
      un-rounded-sm
      un-border="px stone-600"
      un-before="transition duration-200 content-empty bg-stone-800 dark:bg-stone-200 w-2 h-2 scale-0 absolute top-50% left-50% translate--50% rounded-none"
      un-checked="border-stone-600 dark:border-stone-400 before:scale-100"
      un-hover="border-stone-800 dark:border-stone-200 before:scale-20 checked:before:scale-100"
    >
    <label
      :for="id"
      un-text="stone-600 dark:stone-400 base"
      un-flex="~ row"
      un-w-fit
      un-gap-1
      un-items-center
      un-ml-2
    >
      {{ props.labelPrefix }}
      <span>
        <span
          un-inline-block
          un-transition-all
          un-duration-400
          un-text="rose-600 dark:rose-400"
          un-absolute
          :class="isChecked ? 'translate-[0,100%] opacity-0' : 'translate-[0,0] opacity-100'"
        >
          {{ props.labelText?.unchecked }}
        </span>
        <span
          un-inline-block
          un-transition-all
          un-duration-400
          un-relative
          un-text="emerald-600 dark:emerald-400"
          :class="isChecked ? 'translate-[0,0] opacity-100' : 'translate-[0,-100%] opacity-0'"
        >
          {{ props.labelText?.checked }}
        </span>
      </span>
      {{ props.labelSuffix }}
    </label>
  </div>
</template>
