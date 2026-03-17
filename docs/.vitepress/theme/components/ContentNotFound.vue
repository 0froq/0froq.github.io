<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import LinkUnderline from './LinkUnderline.vue'

const { t } = useI18n({
  useScope: 'global',
  messages: {
    en: {
      hereText: 'here',
      contactMeText: 'contact me',
      notSupposedToBeHere: 'You are not supposed to be {here}',
      ifYouReachHere: 'If you reached here through any internal link, please {contactMe}',
    },
    zh: {
      hereText: '这里',
      contactMeText: '联系我',
      notSupposedToBeHere: '您其实不应该出现在{here}',
      ifYouReachHere: '如果您通过任何内部链接到达这里,请{contactMe}',
    },
  },
})
</script>

<template>
  <h1
    un-text="align-right 400px rose-500/10"
    un-font="900"
    un-absolute
    un-bottom-0
    un-select-none
    un-right-0
    un-z-0
  >
    404
  </h1>
  <un-page-content
    un-relative
    un-z-1
    un-text="2xl neutral-800 dark:neutral-200"
    un-flex="~ col"
    un-gap-6
  >
    <div>
      <i18n-t
        keypath="notSupposedToBeHere"
      >
        <template #here>
          <span
            un-text-rose-500
          >
            {{ t('hereText') }}
          </span>
        </template>
      </i18n-t> /
    </div>
    <div>
      <i18n-t
        keypath="ifYouReachHere"
      >
        <template #contactMe>
          <LinkUnderline
            un-align-base
            href="mailto:sayhola@froq.me"
            :text="t('contactMeText')"
            un-text="emerald-500"
            un-before="bg-emerald-600 dark:bg-emerald-400"
            un-vertical="bottom"
          />
        </template>
      </i18n-t> /
    </div>
  </un-page-content>
</template>
