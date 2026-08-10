<script setup lang="ts">
import { useRoute } from 'vitepress'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import ArticleList from '@/ui/article/ArticleList.vue'
import PageTitle from '@/ui/base/PageTitle.vue'
import QCheckbox from '@/ui/base/QCheckbox.vue'
import { data as posts } from '~/src/posts.data'
import { toChineseNumber } from '~/utils/toChineseNumber'
import QSeperator from '../ui/base/QSeperator.vue'

const { path } = useRoute()
const { t, locale } = useI18n({
  useScope: 'global',
  messages: {
    en: {
      posts: 'Posts',
      toc: 'Table of Contents',
      categories: {
        '610-log': 'Log',
        '620-roadmap': 'Roadmap',
        '630-collection': 'Collection',
        'all': 'All',
      },
      intros: {
        '610-log': 'Jotting down those unplanned daily ups and downs and mood changes, letting time arrange the context itself.',
        '620-roadmap': 'Filling in the technical and project pits that were once made, often leaving traces of completion in the form of a series of articles.',
        '630-collection': 'Collecting sentences and viewpoints from predecessors and like-minded people as cataloging and notes while still learning from them.',
      },
      excerptToggle: {
        show: 'showing',
        hide: 'hiding',
        prefix: 'Excerpt',
        suffix: '',
      },
    },
    zh: {
      posts: '文章',
      toc: '目录',
      categories: {
        '610-log': '代序',
        '620-roadmap': '成言',
        '630-collection': '前脩',
        'all': '全',
      },
      intros: {
        '610-log': '记下那些无计划的日常起伏与心境变化，让时间自己排布脉络。',
        '620-roadmap': '把曾经立下的技术与项目之坑一一填上，多以系列文章的形式留下完成的痕迹。',
        '630-collection': '收集前贤与同路人的句子与观点，作为仍在向他们学习时的编目与注记。',
      },
      excerptToggle: {
        show: '显示',
        hide: '隐藏',
        prefix: '已',
        suffix: '摘要',
      },
    },
  },
})

const category = path.split('/')[2]
const excerptVisible = ref(false)

const categoryPosts = computed(() =>
  posts
    .filter(post => post.url.split('/')[2] === category)
    .sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime()),
)

const yearGroups = computed(() => {
  const years = Array.from(
    new Set(categoryPosts.value.map(p => new Date(p.created).getFullYear().toString())),
  ).sort((a, b) => Number.parseInt(b) - Number.parseInt(a))

  return years.map(year => ({
    year,
    label: locale.value === 'zh' ? toChineseNumber(year) : year,
    items: categoryPosts.value
      .filter(p => new Date(p.created).getFullYear().toString() === year)
      .map(p => ({
        url: p.url,
        title: p.title,
        created: p.created,
        frontmatter: p.frontmatter,
        post: p,
        excerpt: p.excerpt,
      })),
  }))
})
</script>

<template>
  <PageTitle
    :id="t(`categories.${category}`)"
    :title="t(`categories.${category}`)"
    :intro="t(`intros.${category}`)"
  >
    <template #default>
      <div
        un-flex="~ row"
        un-items-center
        un-gap-4
      >
        <QCheckbox
          :id="`${category}-excerpt`"
          :model-value="excerptVisible"
          :label-prefix="t('excerptToggle.prefix')"
          :label-text="{ checked: t('excerptToggle.show'), unchecked: t('excerptToggle.hide') }"
          :label-suffix="t('excerptToggle.suffix')"
          @update:model-value="excerptVisible = $event"
        />
      </div>
    </template>
  </PageTitle>

  <div
    un-flex="~ col"
    un-w-full
  >
    <div
      v-for="group in yearGroups"
      :key="group.year"
      un-py-10
      un-flex="~ col"
      un-gap-4
      un-w-full
    >
      <!-- <div
        un-text="neutral-600 dark:neutral-400 2xl"
        :style="locale === 'zh' ? { writingMode: 'vertical-lr' } : undefined"
        un-px-4
        un-text-3xl
        un-sticky
        un-top-0
        un-pt-10
        un-z-2
        un-w-fit
        un-font-serif
      >
        {{ group.label }}
      </div> -->
      <QSeperator
        :title="group.label"
        position="right"
        type="dashed"
        un-font-mono
      />
      <ArticleList
        :items="group.items"
        title-serif
        :show-excerpts="excerptVisible"
      />
    </div>
  </div>
</template>
