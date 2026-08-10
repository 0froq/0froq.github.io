<script setup lang="ts">
import { useCssVar, useEventListener } from '@vueuse/core'
import { useData, useRoute, useRouter } from 'vitepress'
import { computed, onMounted, ref, useTemplateRef } from 'vue'
import { useI18n } from 'vue-i18n'
import SvgFroqLogo from '@/ui/icon/SvgFroqLogo.vue'
import { isDark, toggleDark } from '~/composables/useDarkMode'
import { renderMdInline } from '~/utils/renderMdInline'

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

/** 未显式传参时从页面 frontmatter 兜底，便于全局挂载 */
const displayTitle = computed(() => props.title || renderMdInline(frontmatter.value.title || '') || '')
const displayStatus = computed(() => props.status || frontmatter.value.status || '')
const displayLang = computed(() => props.lang || frontmatter.value.lang || '')
const displayAigc = computed(() => props.aigc || !!frontmatter.value.aigc)

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
const articleLang = computed(() => displayLang.value || 'zh')

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

const headerEl = useTemplateRef('headerEl')
const progressTrack = useTemplateRef('progressTrack')
const progressBarWidth = useCssVar('--progress-bar-width', headerEl)

/** Same progress logic as PageTitle: scroll through the article wrapper */
function handleScroll() {
  if (typeof window === 'undefined')
    return
  visible.value = window.scrollY > props.threshold
  if (!headerEl.value || !progressTrack.value)
    return
  const articleWrapper = document.getElementById('content') ?? headerEl.value.parentElement
  if (articleWrapper) {
    const scrollY = window.scrollY
    const wrapperOffsetY = articleWrapper.offsetTop
    const fullWidth = progressTrack.value.offsetWidth
    const windowHeight = window.innerHeight

    if (articleWrapper.offsetHeight <= windowHeight) {
      progressBarWidth.value = `${fullWidth}px`
      return
    }

    const percentage = Math.min(1, Math.max(0, (scrollY - wrapperOffsetY) / Math.max(0, articleWrapper.offsetHeight - windowHeight)))
    progressBarWidth.value = `${percentage * fullWidth}px`
  }
}

if (typeof window !== 'undefined')
  useEventListener(window, ['scroll', 'resize'], handleScroll, { passive: true })

onMounted(() => {
  handleScroll()
})
</script>

<template>
  <Transition name="scroll-top-header">
    <header
      v-if="visible"
      ref="headerEl"
      un-fixed
      un-top-0
      un-left-0
      un-right-0
      un-z-100
      un-bg="neutral-50/50 dark:neutral-800/50"
      un-backdrop-blur-md
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
            v-html="displayTitle"
          />
          <div
            un-flex="~ row"
            un-items-center
            un-gap="1.5"
            un-flex-shrink-0
          >
            <span
              v-if="displayStatus === 'void'"
              title="void"
              class="rounded-full"
              un-w="2.5"
              un-h="2.5"
              un-bg="rose-600 dark:rose-400"
            />
            <span
              v-if="displayStatus === 'draft'"
              title="draft"
              class="rounded-full"
              un-w="2.5"
              un-h="2.5"
              un-bg="sky-600 dark:sky-400"
            />
            <span
              v-if="displayAigc"
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
                  ? 'text-neutral-950 dark:text-neutral-50'
                  : 'text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-400 disabled:hover:text-neutral-500'"
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
            un-text="lg neutral-700 dark:neutral-300"
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

      <!-- Reading progress — same logic as PageTitle -->
      <div
        ref="progressTrack"
        class="progress-bar"
        un-relative
        un-h-2px
      >
        <div
          class="progress-bar-inner"
          un-bg="neutral-800 dark:neutral-100"
          :style="{ width: 'var(--progress-bar-width, 0)' }"
          un-h-px
          un-absolute
          un-bottom-0
          un-z-1
        />
        <div
          class="progress-bar-bg"
          un-bg="neutral-400/60 dark:neutral-600/60"
          un-w-full
          un-h-px
          un-absolute
          un-z-0
          un-bottom-0
        />
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
