<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import LinkUnderline from '@/LinkUnderline.vue'
import { data as visionData } from '~/src/vision.data'

const visions = visionData
const { locale, t } = useI18n({
  useScope: 'global',
  messages: {
    en: {
      vision: 'Visions',
    },
    zh: {
      vision: '愿景',
    },
  },
})
</script>

<template>
  <section
    class="section-card"
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
      {{ t('vision') }}
    </h3>
    <ul
      un-pt-4
      un-ml-4
    >
      <li
        v-for="vision in visions.filter(v => v.locale === locale || !v.locale)"
        :key="vision.title"
      >
        <div>
          {{ vision.title }}
        </div>
        <ul
          v-if="vision.links?.length"
          un-ml-5
          un-text-sm
          un-text-stone-500
        >
          <li
            v-for="link in vision.links"
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
  </section>
</template>
