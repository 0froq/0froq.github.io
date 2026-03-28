<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { data as hints } from '~/src/guidance.data'
import { renderMdInline } from '~/utils/renderMdInline'
import LinkUnderline from './LinkUnderline.vue'
import ProgressBarHeader from './ProgressBarHeader.vue'

const { t, locale } = useI18n({
  useScope: 'global',
  messages: {
    en: {
      headerText: 'Need to follow……',
    },
    zh: {
      headerText: '需要遵守……',
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
    id="guidance-header"
    :title="t('headerText')"
  />
  <div
    v-for="block in hints.categories"
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
    <ul
      un-ml-4
    >
      <li
        v-for="item in block.items.filter(i => i.locale === locale || !i.locale)"
        :key="item.title"
      >
        <div>
          {{ item.title }}
        </div>
        <div
          v-if="item.description"
          un-ml-4
          un-text="stone-600 dark:stone-400"
          v-html="renderMdInline(item.description)"
        />
        <ul
          un-ml-8
          un-text-stone-500
        >
          <li
            v-for="link in item.links"
            :key="link.url"
          >
            <LinkUnderline
              :href="link.url"
              :text="link.label"
              :vanilla="true"
            />
          </li>
        </ul>
      </li>
    </ul>
  </div>
</template>
