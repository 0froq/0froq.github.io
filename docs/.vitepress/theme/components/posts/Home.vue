<script setup lang="ts">
import { useRoute } from 'vitepress'
import { useI18n } from 'vue-i18n'
import HeaderNav from '@/header/Nav.vue'
import PostListSection from '@/ui/article/PostListSection.vue'
import LinkUnderline from '@/ui/base/LinkUnderline.vue'
import ProgressBarHeader from '@/ui/base/ProgressBarHeader.vue'
import { data as posts } from '~/src/posts.data'
import { toChineseNumber } from '~/utils/toChineseNumber'

const route = useRoute()
const { t } = useI18n({
  useScope: 'global',
  messages: {
    en: {
      posts: 'Posts',
      toc: 'Table of Contents',
      categories: {
        log: 'Log',
        roadmap: 'Roadmap',
        collection: 'Collection',
        all: 'All',
      },
      intros: {
        log: 'Jotting down those unplanned daily ups and downs and mood changes, letting time arrange the context itself.',
        roadmap: 'Filling in the technical and project pits that were once made, often leaving traces of completion in the form of a series of articles.',
        collection: 'Collecting sentences and viewpoints from predecessors and like-minded people as cataloging and notes while still learning from them.',
      },
    },
    zh: {
      posts: '文章',
      toc: '目录',
      categories: {
        log: '代序',
        roadmap: '成言',
        collection: '前脩',
        all: '全',
      },
      intros: {
        log: '记下那些无计划的日常起伏与心境变化，让时间自己排布脉络。',
        roadmap: '把曾经立下的技术与项目之坑一一填上，多以系列文章的形式留下完成的痕迹。',
        collection: '收集前贤与同路人的句子与观点，作为仍在向他们学习时的编目与注记。',
      },
    },
  },
})

const categories: string[] = ['log', 'roadmap', 'collection']

const navItems = [
  [{ label: 'Home', url: '/' }],
  [
    { label: 'Corpus', url: '/corpus/', children: [
      { label: 'Autopsia', url: '/corpus/000_autopsia/' },
      { label: 'Ingesta', url: '/corpus/100_ingesta/' },
      { label: 'Neoplasma', url: '/corpus/200_neoplasma/' },
      { label: 'Putredo', url: '/corpus/300_putredo/' },
      { label: 'Delirium', url: '/corpus/400_delirium/' },
      { label: 'Vigil', url: '/corpus/500_vigil/' },
    ] },
    { label: 'Posts', url: '/posts/', current: true },
    { label: 'Dashboard', url: '/dashboard/' },
    { label: 'Tags', url: '/tags/' },
  ],
]
</script>

<template>
  <HeaderNav
    :items="navItems"
  />
  <div>
    <ProgressBarHeader
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
        :href="`#${t(`categories.${category}`)}`"
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

  <ClientOnly>
    <div
      v-for="category in categories"
      :key="category"
    >
      <PostListSection
        :show-excerpt-toggle="true"
        :posts="posts.filter(post => {
          return post.url.split('/').slice(0, -1).join('/').endsWith(`${category}`)
        })"
        :title="t(`categories.${category}`)"
        :group-by-year="true"
        :year-formatter="$i18n.locale === 'zh' ? toChineseNumber : (year: string) => year"
        :intro="t(`intros.${category}`)"
      />
    </div>
  </ClientOnly>
</template>
