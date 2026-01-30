<script lang="ts" setup>
import { useRoute } from 'vitepress'
import LinkUnderline from './LinkUnderline.vue'

// - [<ruby><rb>Autopsia</rb><rt>dissection</rt></ruby>](000_autopsia/)：自我反思与内省
// - [<ruby><rb>Ingesta</rb><rt>intake</rt></ruby>](100_ingesta/)：摄入，未经评判的原始信息
// - [<ruby><rb>Neo</rb><rt>new</rt></ruby><ruby><rb>plasma</rb><rt>growth</rt></ruby>](200_neoplasma/)：内化后的思考碎片
// - [<ruby><rb>Putredo</rb><rt>decay</rt></ruby>](300_putredo/)：实践与试验的记录
// - [Delirium](400_delirium/)：审美与非理性
// - [Vigil](500_vigil/)：存在的证明

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
  <un-page-content>
    <Content
      class="markdown-rendered"
      un-text="base/10"
    />
    <div
      un-flex="~ row wrap"
      un-gap-2
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
  </un-page-content>
</template>

<style scoped>
[data-current='true'] {
  --uno: 'text-neutral-950 dark:text-neutral-50 font-semibold';
  --uno: 'before:(w-full bg-neutral-950 dark:bg-neutral-50)';
}
</style>
