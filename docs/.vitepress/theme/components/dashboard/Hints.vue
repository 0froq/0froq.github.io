<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import DashboardItem from '@/ui/base/DashboardItem.vue'
import PageTitle from '@/ui/base/PageTitle.vue'
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
  <PageTitle
    id="hints-header"
    :title="t('headerText')"
  />

  <!-- Fence Section -->
  <h2
    un-text-3xl
    un-font-medium
    un-my-6
    un-font-serif
  >
    {{ t('fenceTitle') }}
  </h2>
  <div
    v-for="block in hints.fence.categories[locale]"
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
      un-font-serif
    >
      {{ block.category }}
    </h3>
    <ul>
      <DashboardItem
        v-for="item in block.items.filter(i => i.locale === locale || !i.locale)"
        :key="item.title"
        :item="item"
        link-indent="md"
      />
    </ul>
  </div>

  <!-- Tip Section -->
  <h2
    un-text-3xl
    un-font-medium
    un-my-6
    un-font-serif
  >
    {{ t('tipTitle') }}
  </h2>
  <div
    v-for="block in hints.tip.categories[locale]"
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
      un-font-serif
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
