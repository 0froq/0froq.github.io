<script setup lang="ts">
import type { CorpusData } from '~/types'
import { useRoute } from 'vitepress'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import ArticleList from '@/ui/article/ArticleList.vue'
import PageTitle from '@/ui/base/PageTitle.vue'
import QCheckbox from '@/ui/base/QCheckbox.vue'
import { data as posts } from '~/src/corpus.data'

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

const thisPosts: CorpusData[] = posts.filter((post) => {
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

const listItems = computed(() =>
  filteredPosts.value.map(post => ({
    url: post.url,
    title: post.title,
    created: post.created,
    frontmatter: post.frontmatter,
    post,
  })),
)
</script>

<template>
  <div>
    <PageTitle
      :key="layer"
      un-mb-4
      un-font="stylish"
      :title="layer"
    />
    <Content
      id="content"
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
    <ArticleList
      :items="listItems"
      title-serif
    />
  </div>
</template>
