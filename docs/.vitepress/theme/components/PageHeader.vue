<script setup lang="ts">
import { useDark, useToggle } from '@vueuse/core'
import { useData, useRoute, useRouter } from 'vitepress'
import { useI18n } from 'vue-i18n'
import Doing from './header/Doing.vue'
import Layer from './header/Layer.vue'
import Logo from './header/Logo.vue'

const isDark = useDark()
const toggleDark = useToggle(isDark)
const router = useRouter()
const { frontmatter } = useData()
const { locale } = useI18n({
  useScope: 'global',
  messages: {
    en: {},
    zh: {},
  },
})
const route = useRoute()

const localeMap: Record<string, string> = {
  en: 'English',
  zh: '中文',
}

function handleChangeLocale(newVal: string) {
  if (newVal === locale.value) {
    return
  }
  // Only change route if page.frontmatter.locale is defined
  if (frontmatter.value.locale) {
    if (newVal === 'zh' && locale.value !== 'zh') {
      const newPath = `${route.path.replace(`/${locale.value}/`, '/')}`
      router.go(newPath, {
        initialLoad: true,
      })
    }
    else {
      const newPath = `${route.path}${newVal}/`
      router.go(newPath, {
        initialLoad: true,
      })
    }
  }
  locale.value = newVal as any
  localStorage.setItem('locale', newVal)
}
</script>

<template>
  <nav
    un-flex="~ row"
    un-justify-between
    un-p-4
    un-top-0
    un-z-100
  >
    <div
      un-flex="~ row"
      un-items-center
      un-gap-2
      un-text-xl
      un-overflow-x-hidden
    >
      <Logo />
      <Doing
        un-text-ellipsis
      />
    </div>
    <div
      un-flex="~ row"
      un-items-center
      un-py-1
      un-text-xl
    >
      <div
        un-flex="~ col"
      >
        <span
          v-for="l in $i18n.availableLocales"
          :key="l"
          un-text-sm
        >
          <button
            un-transition-colors
            un-duration-200
            :class="l === $i18n.locale
              ? 'text-stone-950 dark:text-stone-50'
              : 'text-stone-500 hover:text-stone-600 dark:hover:text-stone-400 disabled:hover:text-stone-500'"
            un-disabled="cursor-not-allowed"
            @click="handleChangeLocale(l)"
          >{{ localeMap[l] }}</button>
        </span>
      </div>
      <Layer
        :key="`${route.path}-${$i18n.locale}`"
        :path-suffix="$i18n.locale === 'zh' ? '' : `${$i18n.locale}/`"
      />
      <span
        un-text-stone-500
      >
        /
      </span>
      <div
        un-flex="~ row"
        un-m1
      >
        <a
          un-hidden
          un-px-2
          un-py-1
          un-flex="~ row"
          un-md="flex"
          un-op-50
          un-hover="op-80 translate-y--0.5 scale-105"
          un-transition
          un-items-center
          un-justify-center
          un-text="stone-700 dark:stone-300"
          un-duration-200
          href="https://github.com/0froq"
        >
          <un-i-ph-github-logo-duotone />
        </a>
        <div
          un-px-2
          un-py-1
          un-flex="~ row"
          un-md="flex"
          un-cursor-pointer
          un-items-center
          un-justify-center
          un-text="stone-700 dark:stone-300"
          un-hover="translate-y--0.5 scale-105"
          un-transition
          un-duration-200
          @click="toggleDark()"
        >
          <ClientOnly>
            <un-i-ph-moon-duotone v-if="isDark" />
            <un-i-ph-sun-duotone v-else />
          </ClientOnly>
        </div>
      </div>
    </div>
  </nav>
</template>
