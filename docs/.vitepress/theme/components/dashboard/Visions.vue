<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import LinkUnderline from '@/ui/base/LinkUnderline.vue'
import ProgressBarHeader from '@/ui/base/ProgressBarHeader.vue'
import { data as visions } from '~/src/vision.data'
import DashboardItem from '@/ui/base/DashboardItem.vue'

const { t, locale } = useI18n({
  useScope: 'global',
  messages: {
    en: {
      headerText: 'I want to……',
      globalTitle: 'Visions',
    },
    zh: {
      headerText: '我想……',
      globalTitle: '愿景',
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
    id="yearly-and-vision-header"
    :title="t('headerText')"
  />

  <!-- Year Visions -->
  <section class="section-card">
    <div
      v-for="yearVision in visions.years"
      :key="yearVision.year"
      un-pt-4
      un-mb-4
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
        {{ yearVision.year }}
      </h3>
      <ul un-ml-4>
        <DashboardItem
          v-for="goal in yearVision.items.filter(g => g.locale === $i18n.locale || !g.locale)"
          :key="goal.title"
          :item="goal"
          link-indent="sm"
        />
      </ul>
    </div>
  </section>

  <!-- Global Visions -->
  <section
    class="section-card"
    un-relative
    un-mt-8
  >
    <h3
      un-text-5xl
      un-font-medium
      un-mb-2
      un-absolute
      un-opacity-10
      un-right-0
    >
      {{ t('globalTitle') }}
    </h3>
    <ul
      un-pt-4
      un-ml-4
    >
      <DashboardItem
        v-for="vision in visions.global.items.filter(v => v.locale === locale || !v.locale)"
        :key="vision.title"
        :item="vision"
        link-indent="sm"
      />
    </ul>
  </section>
</template>
