<script setup lang="ts">
import type { ResolvedAnnotation } from '~/types/annotation'
import { storeToRefs } from 'pinia'
import { useData, useRoute } from 'vitepress'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import ArticleNavigation from '@/ui/article/ArticleNavigation.vue'
import TableOfContents from '@/ui/article/TableOfContents.vue'
import LinkUnderline from '@/ui/base/LinkUnderline.vue'
import QCheckbox from '@/ui/base/QCheckbox.vue'
import AnnotationList from '~/components/annotation/AnnotationList.vue'
import AnnotationRail from '~/components/annotation/AnnotationRail.vue'
import AnnotationReplyFloat from '~/components/annotation/AnnotationReplyFloat.vue'
import { scrollToAnnotation } from '~/composables/useAnnotationHighlight'
import { useLazyContent } from '~/composables/useLazyContent'
import { data as corpus } from '~/src/corpus.data'
import { data as posts } from '~/src/posts.data'
import { useAnnotationStore } from '~/stores/annotation'
import { renderMdInline } from '~/utils/renderMdInline'

// 侧栏显隐（默认展开；偏好持久化 localStorage）
const showRail = ref(localStorage.getItem('annotation-show-rail') !== 'false')

function toggleRail(v: boolean | undefined) {
  showRail.value = !!v
  localStorage.setItem('annotation-show-rail', showRail.value ? 'true' : 'false')
}

const store = useAnnotationStore()
const { annotations } = storeToRefs(store)

const { t, d, locale } = useI18n({
  useScope: 'global',
  messages: {
    en: {
      readingTime: '{count} min | {count} mins',
      original: 'Original: ',
      otherLangs: 'In Other Languages:',
      noTranslation: 'No translation available.',
      voidHint: 'This post is marked as "void", which means it might be outdated or no longer maintained. Please read with caution.',
      draftHint: 'This post is currently a "draft", which means it is still being worked on and may contain incomplete information. Please stay tuned for updates.',
      aigcHint: 'This post contains AI-generated content. Please read with discernment.',
    },
    zh: {
      readingTime: '约 {count} 分钟',
      original: '原文：',
      otherLangs: '其他语言：',
      noTranslation: '暂无翻译稿。',
      voidHint: '此文章被标记为「void」，可能已经过时或不再维护，请谨慎阅读。',
      draftHint: '此文章目前处于「draft」状态，仍在撰写中，可能包含不完整的信息，敬请期待更新。',
      aigcHint: '此文章包含 AI 生成内容，请注意甄别。',
    },
  },
})

const articles = [
  ...corpus,
  ...posts,
]

const { frontmatter } = useData()
const { path } = useRoute()
useLazyContent('#content')
// const { findPostByTitle, getNextPost, getPrevPost, filterPostsByFrontmatter } = usePostFilters()

/**
 * Computed property to find the current post based on its title from frontmatter.
 * @returns The current post object or null if not found.
 */
const post = computed(() => {
  // const foundPost = findPostByTitle(frontmatter.value.title)
  // const foundPost = posts.find(post => post.frontmatter.title === frontmatter.value.title)
  const foundPost = articles.find(post => post.url === path)
  return foundPost
})

/**
 * Computed property to generate meta strings for display, such as creation date and reading time.
 * @returns An array of strings containing post metadata.
 */
const metaStrings = computed(() => {
  if (!post.value) {
    return []
  }
  const strings = [
    d(new Date(post.value.created), 'long'),
    t('readingTime', { count: Math.ceil(post.value.readingTime) }),
  ]
  return strings
})

/**
 * Computed property to create a pool of related posts for navigation.
 * Posts are filtered by the same category and optionally by the same series.
 * @returns An array of related post objects.
 */
const postPool = computed(() => {
  if (!post.value)
    return []
  let filteredPosts = articles.filter(p => p.url.split('/').slice(-2)[0] === post.value!.url.split('/').slice(-2)[0])
  if (post.value.frontmatter.series) {
    filteredPosts = filteredPosts.filter(p => p.frontmatter.series === post.value!.frontmatter.series)
  }
  return filteredPosts
})

/**
 * Computed property to determine the next post in the navigation pool.
 * @returns The next post object or null if there is no next post.
 */
const nextPost = computed(() => {
  if (!post.value)
    return null
  const currentIndex = postPool.value.findIndex(p => p.url === post.value!.url)
  if (currentIndex === -1)
    return null
  return postPool.value[currentIndex + 1] ?? null
})

/**
 * Computed property to determine the previous post in the navigation pool.
 * @returns The previous post object or null if there is no previous post.
 */
const prevPost = computed(() => {
  if (!post.value)
    return null
  const currentIndex = postPool.value.findIndex(p => p.url === post.value!.url)
  if (currentIndex === -1)
    return null
  return currentIndex > 0 ? postPool.value[currentIndex - 1] : null
})

/** 批注列表点击：定位到正文高亮（只滚动，不闪烁） */
function handleAnnotationSelect(ann: ResolvedAnnotation) {
  if (ann.domRange)
    scrollToAnnotation(ann.commentId)
}

const translatedPosts = computed(() => {
  if (!post.value || post.value.frontmatter.translated)
    return []
  const translated = articles.filter((p) => {
    return (p.frontmatter.lang || 'zh') !== (post.value?.frontmatter.lang || 'zh') && p.frontmatter.translated === true
      && p.url.includes(post.value!.url)
  })

  return translated || []
})

const originalPost = computed(() => {
  if (!post.value)
    return null
  if (!post.value.frontmatter.translated)
    return null
  const original = articles.find((p) => {
    return !p.frontmatter.translated
      && post.value!.url.includes(p.url)
  })

  return original || null
})

// const otherLangPosts = computed(() => {
//   if (!post.value)
//     return []
//   // If this is original, then all the translations are other language.
//   if (!post.value.frontmatter.translated)
//     return translatedPosts.value
//   // If not, then original is one,
//   // original's translations except this is others.
//   const translatedOfOriginal = articles
//     .filter((p) => {
//       return (p.frontmatter.lang || 'zh') !== (originalPost.value!.frontmatter.lang || 'zh')
//         && p.frontmatter.translated === true
//         && p.url.includes(originalPost.value!.url)
//     })
//   return [
//     originalPost.value,
//     ...translatedOfOriginal,
//   ]
// })
</script>

<template>
  <!-- Floating minimal header shown after scrolling past the title -->
  <!-- (mounted globally in Layout.vue) -->

  <!-- In-flow article title block (article pages don't use PageTitle) -->
  <div
    v-if="post?.frontmatter.title"
    un-pt-5
  >
    <div
      un-flex="~ col"
      un-items-start
      un-gap-2
    >
      <h2
        un-mt-4
        un-text-3xl
        un-w-fit
        un-font-serif
        un-text="neutral-900 dark:neutral-100"
        v-html="renderMdInline(frontmatter.title) || ''"
      />
      <div
        un-place-self-end
        un-flex="~ row"
        un-gap-4
      >
        <div
          v-if="post.frontmatter.status === 'void'"
          un-text="rose-600 dark:rose-400 text-xl"
          un-font="mono italic"
        >
          {{ post.frontmatter.status }}
        </div>
        <div
          v-if="post.frontmatter.status === 'draft'"
          un-text="sky-600 dark:sky-400 text-xl"
          un-font="mono italic"
        >
          {{ post.frontmatter.status }}
        </div>
        <div
          v-if="locale !== (post.frontmatter.lang || 'zh') && (post.frontmatter.lang || 'zh')"
          un-text="amber-600 dark:amber-400 text-xl"
          un-font="mono italic"
        >
          {{ post.frontmatter.lang || 'zh' }}
        </div>
        <div
          v-if="post.frontmatter.aigc"
          un-text="violet-600 dark:violet-400 text-xl"
          un-font="mono italic"
        >
          AIGC
        </div>
      </div>
      <!-- 侧栏显隐开关 + 回复浮层（位于标题区右下） -->
      <div
        un-place-self-end
        un-flex="~ row"
        un-items-center
        un-gap-3
      >
        <QCheckbox
          v-if="annotations.length > 0"
          id="annotation-rail-toggle"
          :model-value="showRail"
          :label-prefix="t('rail.prefix')"
          :label-text="{ checked: t('rail.checked'), unchecked: t('rail.unchecked') }"
          @update:model-value="toggleRail"
        />
        <!-- 回复浮层（Pinia replyTarget；Rail/List 通过 openReplyFloat 打开） -->
        <AnnotationReplyFloat />
      </div>
    </div>
  </div>
  <div
    un-flex="~ row"
    un-justify-end
    un-mt-4
    un-gap-4
    un-text-stone-500
  >
    <div
      v-for="string, i in metaStrings"
      :key="i"
    >
      {{ string }}
    </div>
  </div>

  <div
    un-mt-6
    un-border-l="~ 2px amber-600 dark:amber-400"
    un-px-4
  >
    <div
      v-if="!post"
    />
    <!-- If has translated, this is original, show all translated -->
    <div
      v-else-if="translatedPosts && translatedPosts.length > 0"
      un-flex="~ col"
    >
      <div>
        {{ t('otherLangs') }}
      </div>
      <div
        v-for="translated in translatedPosts"
        :key="translated.url"
        un-ml-4
        un-flex="~ row"
        un-gap-2
      >
        {{ translated.frontmatter.lang || 'zh' }}
        <LinkUnderline
          :href="translated.url"
          :text="(translated.frontmatter.title || translated.url)"
          un-before="bg-stone-950 dark:bg-stone-50"
        />
      </div>
    </div>
    <!-- If no translated and this is original -->
    <div
      v-else-if="!post.frontmatter.translated"
      un-text-stone-500
    >
      <div>
        {{ t('noTranslation') }}
      </div>
    </div>
    <!-- If this is translated, show original -->
    <div
      v-else-if="originalPost"
      un-flex="~ row"
    >
      <div>
        {{ t('original') }}
      </div>
      <LinkUnderline
        :href="originalPost.url"
        :text="originalPost.frontmatter.title || originalPost.url"
        un-before="bg-stone-950 dark:bg-stone-50"
      />
    </div>
  </div>
  <div
    v-if="post?.frontmatter.status === 'void'"
    un-mt-6
    un-border-l="~ 2px rose-600 dark:rose-400"
    un-px-4
  >
    {{ t('voidHint') }}
  </div>
  <div
    v-if="post?.frontmatter.status === 'draft'"
    un-mt-6
    un-border-l="~ 2px sky-600 dark:sky-400"
    un-px-4
  >
    {{ t('draftHint') }}
  </div>
  <div
    v-if="post?.frontmatter.aigc"
    un-mt-6
    un-border-l="~ 2px violet-600 dark:violet-400"
    un-px-4
  >
    {{ t('aigcHint') }}
  </div>

  <div
    un-relative
  >
    <Content
      id="content"
      data-allow-mismatch
      :class="frontmatter.unstyled ? 'unstyled' : ''"
    />

    <!-- 右侧批注列（宽屏，紧贴 content 右侧；自包含，从 store 取数据） -->
    <AnnotationRail v-if="showRail && annotations.length > 0" />
  </div>

  <!-- 右侧目录：静止只显短横线，hover 展开标题列表 -->
  <TableOfContents />

  <!-- 文章尾部批注列表（窄屏；数据来自 Pinia store） -->
  <AnnotationList
    v-if="annotations.length > 0"
    @select="handleAnnotationSelect"
  />

  <!-- Post navigation links (previous and next post) -->
  <ArticleNavigation
    :prev-post="prevPost || null"
    :next-post="nextPost || null"
  />
</template>
