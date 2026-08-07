<script setup lang="ts">
import { useData, useRoute, useRouter } from 'vitepress'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import SvgFroqLogo from '@/ui/icon/SvgFroqLogo.vue'
import { isDark, toggleDark } from '~/composables/useDarkMode'

const props = withDefaults(defineProps<{
  title?: string
  status?: string
  /** Article content language (defaults to zh, same as ContentArticle) */
  lang?: string
  aigc?: boolean
  /** Scroll distance (px) before the bar appears */
  threshold?: number
}>(), {
  title: '',
  status: '',
  lang: '',
  aigc: false,
  threshold: 240,
})

const { frontmatter } = useData()
const route = useRoute()
const router = useRouter()

const { locale } = useI18n({
  useScope: 'global',
  messages: {
    en: {},
    zh: {},
  },
})

const localeMap: Record<string, string> = {
  en: 'English',
  zh: '中文',
}

/** Article lang tag — matches ContentArticle: frontmatter.lang || 'zh' */
const articleLang = computed(() => props.lang || 'zh')

/** Show when UI locale ≠ article language (independent of lang toggle) */
const showLangTag = computed(() => locale.value !== articleLang.value)

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

const visible = ref(false)

function onScroll() {
  visible.value = window.scrollY > props.threshold
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
})
onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
})
</script>

<template>
  <Transition name="scroll-top-header">
    <header
      v-if="visible"
      un-fixed
      un-top-0
      un-left-0
      un-right-0
      un-z-100
      un-bg="neutral-200/85 dark:neutral-900/85"
      un-backdrop-blur-md
      un-border="b stone-300/60 dark:stone-700/60"
    >
      <div
        un-flex="~ row"
        un-items-center
        un-px-4
        un-py-2
        un-gap-4
      >
        <!-- Left: froQ logo -->
        <a
          class="group"
          un-flex="~ row"
          un-items-center
          un-flex-shrink-0
          :href="locale === 'zh' ? '/' : `/${locale}/`"
        >
          <SvgFroqLogo
            un-w-14
            un-h-auto
          />
        </a>

        <!--
          Center: title + compact tags flush to its right.
          Title truncates first when space is tight; tags stay visible.
        -->
        <div
          un-flex="~ row"
          un-flex-1
          un-items-center
          un-justify-center
          un-min-w-0
          un-gap-2
        >
          <div
            un-min-w-0
            un-font-serif
            un-text="lg neutral-900 dark:neutral-100"
            un-truncate
            v-html="title || ''"
          />
          <div
            un-flex="~ row"
            un-items-center
            un-gap="1.5"
            un-flex-shrink-0
          >
            <span
              v-if="status === 'void'"
              title="void"
              class="rounded-full"
              un-w="2.5"
              un-h="2.5"
              un-bg="rose-600 dark:rose-400"
            />
            <span
              v-if="status === 'draft'"
              title="draft"
              class="rounded-full"
              un-w="2.5"
              un-h="2.5"
              un-bg="sky-600 dark:sky-400"
            />
            <span
              v-if="aigc"
              title="AIGC"
              class="rounded-full"
              un-w="2.5"
              un-h="2.5"
              un-bg="violet-600 dark:violet-400"
            />
            <span
              v-if="showLangTag"
              un-text="amber-600 dark:amber-400 sm"
              un-font="mono italic"
              un-leading-none
            >
              {{ articleLang }}
            </span>
          </div>
        </div>

        <!-- Right: UI lang toggle + dark toggle (not article tags) -->
        <div
          un-flex="~ row"
          un-items-center
          un-gap-1
          un-flex-shrink-0
        >
          <div
            un-flex="~ col"
            un-mx-1
          >
            <span
              v-for="l in $i18n.availableLocales"
              :key="l"
              un-text-xs
              un-leading-tight
              un-px-1
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
          <div
            un-px-1
            un-flex="~ row"
            un-cursor-pointer
            un-items-center
            un-text="lg stone-700 dark:stone-300"
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
    </header>
  </Transition>
</template>

<style scoped>
.scroll-top-header-enter-active,
.scroll-top-header-leave-active {
  transition:
    transform 0.25s ease,
    opacity 0.25s ease;
}
.scroll-top-header-enter-from,
.scroll-top-header-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}
.scroll-top-header-enter-to,
.scroll-top-header-leave-from {
  transform: translateY(0);
  opacity: 1;
}
</style>
