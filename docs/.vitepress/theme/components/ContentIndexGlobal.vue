<script setup lang="ts">
import { useRoute } from 'vitepress'
import { useI18n } from 'vue-i18n'
import PageTitle from '@/ui/base/PageTitle.vue'
import ContentNav from '@/ui/nav/ContentNav.vue'
import AnnotationRail from '~/components/annotation/AnnotationRail.vue'
import CommitHeatmap from '~/components/home/CommitHeatmap.vue'
import NowHappening from '~/components/home/NowHappening.vue'
import ProjectCard from '~/components/home/ProjectCard.vue'
import RecentPosts from '~/components/home/RecentPosts.vue'
import QSeperator from './ui/base/QSeperator.vue'

const route = useRoute()
const { t } = useI18n({
  useScope: 'global',
  messages: {
    en: {
      greeting: 'Greetings!',
      secIntro: 'Welcome',
      secRecentPosts: 'Recent Writes',
      secHappening: 'Happening',
      secProjects: 'Projects',
    },
    zh: {
      greeting: '您好！',
      secIntro: '欢迎',
      secRecentPosts: '最近落笔',
      secHappening: '正在发生',
      secProjects: '项目',
    },
  },
})

const navItems = [
  [{ label: 'Home', url: '/', current: true }],
  [
    { label: 'Corpus', url: '/corpus/', children: [
      { label: 'Autopsia', url: '/corpus/000-autopsia/' },
      { label: 'Ingesta', url: '/corpus/100-ingesta/' },
      { label: 'Neoplasma', url: '/corpus/200-neoplasma/' },
      { label: 'Putredo', url: '/corpus/300-putredo/' },
      { label: 'Delirium', url: '/corpus/400-delirium/' },
      { label: 'Vigil', url: '/corpus/500-vigil/' },
    ] },
    { label: 'Posts', url: '/posts/', children: [
      { label: 'Log', url: '/posts/610-log/' },
      { label: 'Roadmap', url: '/posts/620-roadmap/' },
      { label: 'Collection', url: '/posts/630-collection/' },
    ] },
    { label: 'Dashboard', url: '/dashboard/', children: [
      { label: 'Visions', url: '/dashboard/visions/' },
      { label: 'Hints', url: '/dashboard/hints/' },
    ] },
    { label: 'Tags', url: '/tags/' },
  ],
]
</script>

<template>
  <ContentNav
    :items="navItems"
  />
  <div un-my-8>
    <QSeperator
      :title="t('secIntro')"
      position="right"
      type="dashed"
      un-font-mono
    />
  </div>
  <PageTitle
    :key="$i18n.locale"
    :title="$t('greeting')"
  />
  <div
    un-relative
  >
    <Content
      id="content"
      :key="route.path"
      un-text="base/10"
      class="markdown-rendered"
    />
    <AnnotationRail />
  </div>
  <div
    un-mt-16
    un-flex="~ col"
    un-gap-10
  >
    <QSeperator
      :title="t('secRecentPosts')"
      position="right"
      type="dashed"
      un-font-mono
    />
    <ClientOnly>
      <RecentPosts />
    </ClientOnly>
    <ClientOnly>
      <div un-mt-16>
        <QSeperator
          :title="t('secHappening')"
          position="right"
          type="dashed"
          un-font-mono
        />
        <div>
          <NowHappening />
        </div>
      </div>
    </ClientOnly>
  </div>
</template>
