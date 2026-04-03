<script setup lang="ts">
import QSeperator from './QSeperator.vue'

const props = defineProps<{
  labelText: string
  labelId: string
}>()
</script>

<template>
  <div
    un-flex="~ row"
    un-gap-4
    un-justify-between
    un-items-center
  >
    <label
      un-text-base
      :for="labelId"
      v-bind="$attrs"
    >
      {{ props.labelText }}
    </label>
    <QSeperator type="dashed" />
    <slot name="value" />
  </div>
</template>
