<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { renderMdInline } from '../../utils/renderMdInline'
import { data as hints } from '../src/guidance.data'
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
  <ProgressBarHeader
    id="guidance-header"
    :title="t('headerText')"
  />
  <section
    class="section-card"
  >
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
            un-text="neutral-600 dark:neutral-400"
            v-html="renderMdInline(item.description)"
          />
          <ul
            un-ml-8
            un-text-neutral-500
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
  </section>
</template>
