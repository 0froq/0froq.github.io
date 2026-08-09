<script setup lang="ts">
import { useI18n } from 'vue-i18n'

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
      notSupposedToBeHere: '您不应该出现在{here}',
      ifYouReachHere: '如果您通过任何内部链接到达这里,请{contactMe}',
    },
  },
})
</script>

<template>
  <h1
    un-text="align-right 600px rose-500/10"
    un-font="900 stylish"
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
    un-text="lg neutral-800 dark:neutral-200"
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
        <template
          #contactMe
        >
          <span
            class="markdown-rendered"
          >
            <a
              href="mailto:sayhola@froq.me"
            >
              {{ t('contactMeText') }}
            </a>
          </span>
        </template>
      </i18n-t>
    </div>
  </un-page-content>
</template>
