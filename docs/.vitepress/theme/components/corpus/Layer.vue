<script setup lang="ts">
import type { CorpusData } from '~/types'
import { useRoute } from 'vitepress'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import TooltipArticleInfo from '@/ui/article/TooltipArticleInfo.vue'
import LinkUnderline from '@/ui/base/LinkUnderline.vue'
import ProgressBarHeader from '@/ui/base/ProgressBarHeader.vue'
import QCheckbox from '@/ui/base/QCheckbox.vue'
import QSeperator from '@/ui/base/QSeperator.vue'
import { data as posts } from '~/src/corpus.data'
import { useSeparatorOpacity } from '~/utils/useSeparatorOpacity'

const { path } = useRoute()
const { locale, t } = useI18n({
  useScope: 'global',
  messages: {
    en: {
      aigcToggle: {
        prefix: 'AIGC',
        show: 'showing',
        hide: 'hiding',
        suffix: '',
      },
      voidToggle: {
        prefix: 'Void',
        show: 'showing',
        hide: 'hiding',
        suffix: '',
      },
      draftToggle: {
        prefix: 'Draft',
        show: 'showing',
        hide: 'hiding',
        suffix: '',
      },
      otherLangToggle: {
        prefix: 'Other languages',
        show: 'showing',
        hide: 'hiding',
        suffix: '',
      },
    },
    zh: {
      aigcToggle: {
        prefix: '已',
        show: '显示',
        hide: '隐藏',
        suffix: 'AI 生成内容',
      },
      voidToggle: {
        prefix: '已',
        show: '显示',
        hide: '隐藏',
        suffix: 'void',
      },
      draftToggle: {
        prefix: '已',
        show: '显示',
        hide: '隐藏',
        suffix: 'draft',
      },
      otherLangToggle: {
        prefix: '已',
        show: '显示',
        hide: '隐藏',
        suffix: '其他语言',
      },
    },
  },
})

const showAigc = ref(true)
const showDraft = ref(true)
const showOtherLang = ref(true)
const showVoid = ref(false)

const layer = path.split('/')[2].split('-')[1].slice(0, 1).toUpperCase() + path.split('/')[2].split('-')[1].slice(1)

// Extend Data type to include createdComponent
interface PostWithCreatedComponent extends CorpusData {
  createdComponent?: {
    year: string | number
    month?: string | number
    day?: string | number
  }
}

const thisPosts: PostWithCreatedComponent[] = posts.filter((post) => {
  return post.layer === path.split('/')[2] && !post.frontmatter.index
})

const filteredPosts = computed(() => {
  let result = thisPosts
  if (!showAigc.value)
    result = result.filter(post => !post.frontmatter.aigc)
  if (!showVoid.value)
    result = result.filter(post => post.frontmatter.status !== 'void')
  if (!showDraft.value)
    result = result.filter(post => post.frontmatter.status !== 'draft')
  if (!showOtherLang.value)
    result = result.filter(post => locale.value === (post.frontmatter.lang || 'zh'))
  return result
})

thisPosts.forEach((post, index) => {
  const year = new Date(post.created).getFullYear().toString()
  const month = (new Date(post.created).getMonth() + 1).toString().padStart(2, '0')
  const day = new Date(post.created).getDate().toString().padStart(2, '0')

  let yearFormatted: string | undefined,
    monthFormatted: string | undefined,
    dayFormatted: string | undefined

  const prevPost = thisPosts[index - 1]
  if (!prevPost) {
    post.createdComponent = {
      year,
      month,
      day,
    }
    return
  }

  const prevYear = new Date(prevPost.created).getFullYear().toString()
  if (year === prevYear) {
    yearFormatted = ''
  }

  const prevMonth = (new Date(prevPost.created).getMonth() + 1).toString().padStart(2, '0')
  if (month === prevMonth && year === prevYear) {
    monthFormatted = ''
  }
  const prevDay = new Date(prevPost.created).getDate().toString().padStart(2, '0')
  if (day === prevDay && month === prevMonth && year === prevYear) {
    dayFormatted = ''
  }

  post.createdComponent = {
    year: yearFormatted === '' ? '' : year,
    month: monthFormatted === '' ? '' : month,
    day: dayFormatted === '' ? '' : day,
  }
})

// Mouse position / opacity effect
const { setRowRef, getOpacity, refresh: refreshSeparator } = useSeparatorOpacity()

watch([showAigc, showVoid, showDraft, showOtherLang], () => {
  refreshSeparator()
})
</script>

<template>
  <div>
    <ProgressBarHeader
      :key="layer"
      un-mb-4
      un-font="stylish"
      :title="layer"
    />
    <Content
      class="markdown-rendered"
    />
    <div
      un-flex="~ row wrap"
      un-items-center
      un-mb-4
      un-justify-between
    >
      <QCheckbox
        id="corpus-aigc-toggle"
        :model-value="showAigc"
        :label-prefix="t('aigcToggle.prefix')"
        :label-text="{ checked: t('aigcToggle.show'), unchecked: t('aigcToggle.hide') }"
        :label-suffix="t('aigcToggle.suffix')"
        @update:model-value="showAigc = $event"
      />
      <QCheckbox
        id="corpus-draft-toggle"
        :model-value="showDraft"
        :label-prefix="t('draftToggle.prefix')"
        :label-text="{ checked: t('draftToggle.show'), unchecked: t('draftToggle.hide') }"
        :label-suffix="t('draftToggle.suffix')"
        @update:model-value="showDraft = $event"
      />
      <QCheckbox
        id="corpus-other-lang-toggle"
        :model-value="showOtherLang"
        :label-prefix="t('otherLangToggle.prefix')"
        :label-text="{ checked: t('otherLangToggle.show'), unchecked: t('otherLangToggle.hide') }"
        :label-suffix="t('otherLangToggle.suffix')"
        @update:model-value="showOtherLang = $event"
      />
      <QCheckbox
        id="corpus-void-toggle"
        :model-value="showVoid"
        :label-prefix="t('voidToggle.prefix')"
        :label-text="{ checked: t('voidToggle.show'), unchecked: t('voidToggle.hide') }"
        :label-suffix="t('voidToggle.suffix')"
        @update:model-value="showVoid = $event"
      />
    </div>
    <div
      v-for="(post, index) in filteredPosts"
      :key="post.url"
      :ref="(el) => setRowRef(index, el as HTMLElement | null)"
      un-gap-2
      un-flex="~ row"
      un-items-center
      un-text-ellipsis
      class="article-row"
    >
      <div
        v-if="post.frontmatter.status === 'void'"
        un-text="rose-600 dark:rose-400 xs"
        un-font="mono italic"
      >
        {{ post.frontmatter.status }}
      </div>

      <div
        v-if="post.frontmatter.status === 'draft'"
        un-text="sky-600 dark:sky-400 xs"
        un-font="mono italic"
      >
        {{ post.frontmatter.status }}
      </div>

      <div
        v-if="locale !== (post.frontmatter.lang || 'zh') && (post.frontmatter.lang || 'zh')"
        un-text="amber-600 dark:amber-400 xs"
        un-font="mono italic"
      >
        {{ post.frontmatter.lang || 'zh' }}
      </div>

      <div
        v-if="post.frontmatter.aigc"
        un-text="violet-600 dark:violet-400 xs"
        un-font="mono italic"
      >
        AIGC
      </div>

      <div
        un-w-fit
        un-max-w="50%"
        un-shrink-0
        :style="post.frontmatter.status === 'void' ? {
          textDecorationLine: 'line-through',
          textDecorationThickness: '1px',
        } : ''"
      >
        <LinkUnderline
          :href="post.url"
          :text="post.title"
          un-before="bg-rose-600 dark:bg-rose-400"
        >
          <template #tooltip>
            <TooltipArticleInfo :post="post" />
          </template>
        </LinkUnderline>
      </div>

      <QSeperator
        type="dashed"
        un-shrink-1
        :style="{ opacity: getOpacity(index), transition: 'opacity 140ms cubic-bezier(0.22, 1, 0.36, 1)' }"
      />

      <div
        v-if="post.createdComponent"
        class="date"
        un-font="mono"
        un-whitespace-nowrap
        un-transition="colors duration-200"
        un-text="stone-500"
      >
        <span
          v-if="post.createdComponent.year"
          un-text="sm"
        >
          {{ post.createdComponent.year }}
        </span>
        <span
          v-else
          un-text="stone-400 dark:stone-600 sm"
        >…………</span>/<span
          v-if="post.createdComponent.month"
          un-text="sm"
        >
          {{ post.createdComponent.month }}
        </span>
        <span
          v-else
          un-text="stone-400 dark:stone-600 sm"
        >……</span>/<span
          v-if="post.createdComponent.day"
          un-text="sm"
        >
          {{ post.createdComponent.day }}
        </span>
        <span
          v-else
          un-text="stone-400 dark:stone-600 sm"
        >……</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
[data-current='true'] {
  --uno: 'text-stone-950 dark:text-stone-50 font-semibold';
  --uno: 'before:(w-full bg-stone-950 dark:bg-stone-50)';
}

.article-row:hover .date span {
  --uno: 'text-stone-950 dark:text-stone-50';
  --uno: 'transition-colors duration-200';
  /* --uno: 'underline-(~ px dashed stone-950 dark:stone-50)'; */
}
</style>
