<script lang="ts" setup>
import LinkUnderline from './LinkUnderline.vue'

const layers = [
  {
    label: 'Autopsia',
    url: '000_autopsia/',
    tooltip: '自我反思与内省',
  },
  {
    label: 'Ingesta',
    url: '100_ingesta/',
    tooltip: '摄入，未经评判的原始信息',
  },
  {
    label: 'Neoplasma',
    url: '200_neoplasma/',
    tooltip: '内化后的思考碎片',
  },
  {
    label: 'Putredo',
    url: '300_putredo/',
    tooltip: '实践与试验的记录',
  },
  {
    label: 'Delirium',
    url: '400_delirium/',
    tooltip: '审美与非理性',
  },
  {
    label: 'Vigil',
    url: '500_vigil/',
    tooltip: '存在的证明',
  },
]
</script>

<template>
  <div
    un-flex="~ row wrap"
    un-gap-2
    un-my-4
  >
    <LinkUnderline
      v-for="layer in layers"
      :key="layer.url"
      :href="`/corpus/${layer.url}`"
      :text="layer.label"
      :tooltip="true"
      :tooltip-text="layer.tooltip"
      un-inline-block
      un-text-sm
      un-text="neutral-600 dark:neutral-400"
      un-before="h-px bg-neutral-950 dark:bg-neutral-50"
    />
  </div>
  <Content
    class="markdown-rendered"
    un-text="base/10"
  />
</template>

<style scoped>
[data-current='true'] {
  --uno: 'text-neutral-950 dark:text-neutral-50 font-semibold';
  --uno: 'before:(w-full bg-neutral-950 dark:bg-neutral-50)';
}
</style>
