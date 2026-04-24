<script setup lang="ts">
import { useRoute } from 'vitepress'
import { useI18n } from 'vue-i18n'
import PostListSection from '@/ui/article/PostListSection.vue'
import { data as posts } from '~/src/posts.data'
import { toChineseNumber } from '~/utils/toChineseNumber'

const { path } = useRoute()
const { t } = useI18n({
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
    },
  },
})

const category = path.split('/')[2]
</script>

<template>
  <PostListSection
    :show-excerpt-toggle="true"
    :posts="posts.filter(post => {
      return post.url.split('/')[2] === category
    })"
    :title="t(`categories.${category}`)"
    :group-by-year="true"
    :year-formatter="$i18n.locale === 'zh' ? toChineseNumber : (year: string) => year"
    :intro="t(`intros.${category}`)"
  />
</template>
