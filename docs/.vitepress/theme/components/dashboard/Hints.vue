<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import LinkUnderline from '@/ui/base/LinkUnderline.vue'
import ProgressBarHeader from '@/ui/base/ProgressBarHeader.vue'
import DashboardItem from '@/ui/base/DashboardItem.vue'
import { data as hints } from '~/src/hints.data'

const { t, locale } = useI18n({
  useScope: 'global',
  messages: {
    en: {
      headerText: 'Need to follow……',
      fenceTitle: 'Fences',
      tipTitle: 'Tips',
    },
    zh: {
      headerText: '需要遵守……',
      fenceTitle: '边界',
      tipTitle: '建议',
    },
  },
})
</script>

<template>
  <LinkUnderline
    :href="`/dashboard/${locale === 'zh' ? '' : `${locale}/`}`"
    text="Dashboard"
    un-inline-block
    un-text-sm
    un-w-fit
    un-text="stone-600 dark:stone-400"
    un-before="h-px bg-stone-950 dark:bg-stone-50"
  />
  <ProgressBarHeader
    id="hints-header"
    :title="t('headerText')"
  />

  <!-- Fence Section -->
  <h2 un-text-3xl un-font-medium un-my-6>{{ t('fenceTitle') }}</h2>
  <div
    v-for="block in hints.fence.categories"
    :key="block.category"
    un-my-10
    un-relative
  >
    <h3
      un-text-5xl
      un-font-medium
      un-mb-2
      un-absolute
      un-opacity-10
      un-right-0
    >
      {{ block.category }}
    </h3>
    <ul un-ml-4>
      <DashboardItem
        v-for="item in block.items.filter(i => i.locale === locale || !i.locale)"
        :key="item.title"
        :item="item"
        link-indent="md"
      />
    </ul>
  </div>

  <!-- Tip Section -->
  <h2 un-text-3xl un-font-medium un-my-6>{{ t('tipTitle') }}</h2>
  <div
    v-for="block in hints.tip.categories"
    :key="block.category"
    un-my-10
    un-relative
  >
    <h3
      un-text-5xl
      un-font-medium
      un-mb-2
      un-absolute
      un-opacity-10
      un-right-0
    >
      {{ block.category }}
    </h3>
    <ul un-ml-4>
      <DashboardItem
        v-for="item in block.items.filter(i => i.locale === locale || !i.locale)"
        :key="item.title"
        :item="item"
        link-indent="md"
      />
    </ul>
  </div>
</template>
