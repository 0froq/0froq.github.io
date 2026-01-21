<script setup lang="ts">
import { useData } from 'vitepress'
import { computed, ref } from 'vue'
import { toChineseNumber } from '../../utils/toChineseNumber'
import { data as posts } from '../src/posts.data'
import LinkUnderline from './LinkUnderline.vue'
import PostListSection from './PostListSection.vue'
import PostMetaInfo from './PostMetaInfo.vue'
import TagDisplay from './TagDisplay.vue'

const { params } = useData()

const postsInCurrentTag = computed(() => {
  return posts.filter(post =>
    post.tags.includes(params.value?.tag),
  )
})

const postsInExtendedTags = computed(() => {
  return posts.filter(post =>
    post.tagsExtended?.some(tag => tag === params.value?.tag && !post.tags.includes(params.value?.tag)),
  )
})

const metaStrings = computed(() => [
  `${postsInCurrentTag.value.length} 篇在此`,
  `${postsInExtendedTags.value.length} 篇在更深处`,
])
</script>

<template>
  <un-page-content>
    <TagDisplay />
    <PostMetaInfo :meta-strings="metaStrings" />
  </un-page-content>

  <ClientOnly>
    <PostListSection
      :posts="postsInCurrentTag"
      :show-excerpt-toggle="true"
      title="在此"
      :group-by-year="true"
      :intro="`包含标签「${params?.tag}」的文章`"
      :year-formatter="$i18n.locale === 'zh' ? toChineseNumber : (year: string) => year"
      :date-formatter="(date: Date) => {
        return new Date(date).toLocaleDateString('zh-CN', {
          month: 'long',
          day: 'numeric',
        })
      }"
    >
      <template
        v-if="Object.keys(postsInCurrentTag).length === 0"
        #empty-message-addons
      >
        <div
          un-text="2xl neutral-800 dark:neutral-200"
          un-my-10
          un-flex="~ row"
          un-justify-center
        >
          此处没有任何文章
        </div>
        <div
          un-text="2xl neutral-700 dark:neutral-300"
          un-my-10
          un-flex="~ row"
          un-justify-center
        >
          很可能是由于「{{ params?.tag }}」是一个泛类
        </div>
        <div
          un-text="2xl neutral-600 dark:neutral-400"
          un-my-10
          un-flex="~ row"
          un-justify-center
        >
          您需要看看
          <LinkUnderline
            un-align-base
            href="#更深处"
            text="更深处"
            un-text="cyan-500"
            un-before="bg-cyan-600 dark:bg-cyan-600/80"
          />
        </div>
      </template>
    </PostListSection>
    <PostListSection
      :posts="postsInExtendedTags"
      :show-excerpt-toggle="true"
      title="更深处"
      :group-by-year="true"
      :intro="`扩展标签包含「${params?.tag}」的文章`"
      :year-formatter="$i18n.locale === 'zh' ? toChineseNumber : (year: string) => year"
      :date-formatter="(date: Date) => {
        return new Date(date).toLocaleDateString('zh-CN', {
          month: 'long',
          day: 'numeric',
        })
      }"
    >
      <template
        v-if="Object.keys(postsInExtendedTags).length === 0"
        #empty-message-addons-更深处
      >
        <div
          un-text="2xl neutral-800 dark:neutral-200"
          un-my-10
          un-flex="~ row"
          un-justify-center
        >
          更深处没有任何文章
        </div>
      </template>
    </PostListSection>
  </ClientOnly>
</template>
