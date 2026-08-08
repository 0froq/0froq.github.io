<script setup lang="ts">
import { useRoute } from 'vitepress'
import { useI18n } from 'vue-i18n'
import LinkUnderline from '@/ui/base/LinkUnderline.vue'
import PageTitle from '@/ui/base/PageTitle.vue'

const route = useRoute()
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

const categories: string[] = ['610-log', '620-roadmap', '630-collection']
</script>

<template>
  <div>
    <PageTitle
      title="Posts"
      un-mb-8
      un-font="script"
    />
    <Content
      :key="route.path"
      un-text="base/10"
      class="markdown-rendered"
    />

    <div
      v-for="category in categories"
      :key="`${category}-${$i18n.locale}`"
      un-even="pl-10"
      un-my-10
      un-mx-20
      un-flex
      un-gap-4
      un-text="stone-700 dark:stone-300 hover:stone-950 dark:hover:stone-50 xl"
    >
      <LinkUnderline
        :href="`/posts/${category}/`"
        :text="t(`categories.${category}`)"
        un-before="bg-rose-600 dark:bg-rose-400"
      >
        <template #tooltip>
          <div
            un-max-w-300px
          >
            {{ t(`intros.${category}`) || '' }}
          </div>
        </template>
      </LinkUnderline>
    </div>
  </div>
</template>
