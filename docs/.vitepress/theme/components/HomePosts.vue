<script setup lang="ts">
import { useRoute } from 'vitepress'
import { useI18n } from 'vue-i18n'
import { toChineseNumber } from '../../utils/toChineseNumber'
import { data as posts } from '../src/posts.data'
import LinkUnderline from './LinkUnderline.vue'
import PostListSection from './PostListSection.vue'
import ProgressBarHeader from './ProgressBarHeader.vue'

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
</script>

<template>
  <un-page-content>
    <LinkUnderline
      href="/"
      text="> cd ../"
      un-inline-block
      un-text-sm
      un-font-mono
      un-text="neutral-600 dark:neutral-400"
      un-before="h-px bg-neutral-950 dark:bg-neutral-50"
    />
    <div
      un-flex="~ row wrap"
      un-gap-2
    >
      <LinkUnderline
        v-for="({ label, url }) in [
          { label: 'Corpus', url: 'corpus/' },
          { label: 'Posts', url: 'posts/' },
          { label: 'Dashboard', url: 'dashboard/' },
        ]"
        :key="url"
        :href="`/${url}`"
        :text="label"
        un-inline-block
        un-text-sm
        un-text="neutral-600 dark:neutral-400"
        un-before="h-px bg-neutral-950 dark:bg-neutral-50"
        :data-current="route.path.endsWith(url) ? 'true' : ''"
      />
    </div>
    <ProgressBarHeader
      :title="t('posts')"
      un-mb-8
    />
    <!-- <hr> -->
    <Content
      :key="route.path"
      un-text="base/10"
      class="markdown-rendered"
    />
  </un-page-content>
  <un-page-content
    :key="$i18n.locale"
  >
    <!-- <ProgressBarHeader -->
    <!--   :id="t('toc')" -->
    <!--   :key="$i18n.locale" -->
    <!--   :title="t('toc')" -->
    <!-- /> -->
    <div
      v-for="category in categories"
      :key="category"
      un-even="pl-10"
      un-my-10
      un-mx-20
      un-flex
      un-gap-4
    >
      <LinkUnderline
        :href="`#${t(`categories.${category}`)}`"
        :text="t(`categories.${category}`)"
        un-text="neutral-700 dark:neutral-300 hover:neutral-950 dark:hover:neutral-50 2xl"
        un-before="bg-rose-600 dark:bg-rose-400"
        un-italic
        :tooltip="t(`intros.${category}`) ? true : false"
        :tooltip-text="t(`intros.${category}`) || ''"
      />
    </div>
  </un-page-content>

  <ClientOnly>
    <PostListSection
      v-for="category in categories"
      :key="category"
      :show-excerpt-toggle="true"
      :posts="posts.filter(post => {
        return post.url.split('/').slice(0, -1).join('/').endsWith(`${category}`)
      })"
      :title="t(`categories.${category}`)"
      :group-by-year="true"
      :year-formatter="$i18n.locale === 'zh' ? toChineseNumber : (year: string) => year"
      :intro="t(`intros.${category}`)"
      :date-formatter="(date: Date) => {
        return new Date(date).toLocaleDateString($i18n.locale === 'zh' ? 'zh-CN' : 'en-US', {
          month: 'long',
          day: 'numeric',
        })
      }"
    />
  </ClientOnly>
</template>

<style scoped>
[data-current='true'] {
  --uno: 'text-neutral-950 dark:text-neutral-50 font-semibold';
  --uno: 'before:(w-full bg-neutral-950 dark:bg-neutral-50)';
}
</style>
