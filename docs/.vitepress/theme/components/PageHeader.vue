<script setup lang="ts">
import { useData, useRoute, useRouter } from 'vitepress'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import HeaderPresenceControls from '~/components/stats/HeaderPresenceControls.vue'
import { isGhostPresencePath } from '~/composables/stats/useGhostPresence'
import { isDark, toggleDark } from '~/composables/useDarkMode'
import Doing from './header/Doing.vue'
import Logo from './header/Logo.vue'

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

const showPresenceControls = computed(() => isGhostPresencePath(route.path))

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
        un-hidden
        un-sm="block"
        un-text-ellipsis
      />
    </div>
    <div
      un-flex="~ row"
      un-items-center
      un-py-1
      un-text-xl
    >
      <ClientOnly v-if="showPresenceControls">
        <HeaderPresenceControls />
      </ClientOnly>
      <div
        un-flex="~ col"
        un-m-1
      >
        <span
          v-for="l in $i18n.availableLocales"
          :key="l"
          un-text-sm
          un-px-1
        >
          <button
            un-transition-colors
            un-duration-200
            :class="l === $i18n.locale
              ? 'text-neutral-950 dark:text-neutral-50'
              : 'text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-400 disabled:hover:text-neutral-500'"
            un-disabled="cursor-not-allowed"
            @click="handleChangeLocale(l)"
          >{{ localeMap[l] }}</button>
        </span>
      </div>
      <span
        un-text-neutral-500
      >
        /
      </span>
      <div
        un-flex="~ row"
        un-items-center
        un-m1
        un-gap-1
      >
        <a
          un-hidden
          un-px-2
          un-py-1
          un-flex="~ row"
          un-md="flex"
          un-op-50
          un-hover="op-80"
          un-transition
          un-items-center
          un-justify-center
          un-text="neutral-700 dark:neutral-300"
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
          un-text="neutral-700 dark:neutral-300"
          un-transition
          un-duration-200
          @click="toggleDark($event)"
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
