<script setup lang="ts">
defineProps<{
  modelValue: string | number
  options: Array<{ value: string | number, label: string }>
  id?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number): void
}>()

function handleChange(event: Event) {
  const target = event.target as HTMLSelectElement
  emit('update:modelValue', target.value)
}
</script>

<template>
  <select
    :id="id"
    :value="modelValue"
    un-bg="transparent"
    un-border="~ neutral-300 dark:neutral-700 rounded"
    un-px-3
    un-py-1
    un-text="base neutral-700 dark:neutral-300"
    un-outline-none
    un-focus:border-primary
    un-transition-colors
    @change="handleChange"
  >
    <option
      v-for="opt in options"
      :key="opt.value"
      :value="opt.value"
      un-bg="white dark:neutral-900"
    >
      {{ opt.label }}
    </option>
  </select>
</template>
