<script setup lang="ts">
import { useData } from 'vitepress'
import { computed, ref } from 'vue'
import { toChineseNumber } from '../../utils/toChineseNumber'
import { data as corpus } from '../src/corpus.data'
import { data as posts } from '../src/posts.data'
import LinkUnderline from './LinkUnderline.vue'
import PostListSection from './PostListSection.vue'
import PostMetaInfo from './PostMetaInfo.vue'
import ProgressBarHeader from './ProgressBarHeader.vue'
import TagDisplay from './TagDisplay.vue'
import TooltipPostInfo from './TooltipPostInfo.vue'

const { params } = useData()

// Combine corpus and posts data
// Add a 'source' field to distinguish between corpus and posts
const articles = [
  ...corpus.map(item => ({ ...item, source: 'corpus' })),
  ...posts.map(item => ({ ...item, source: 'posts' })),
]

const postsInCurrentTag = computed(() => {
  return articles.filter(post =>
    post.tags.includes(params.value?.tag),
  )
})

const postsInExtendedTags = computed(() => {
  return articles.filter(post =>
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

  <un-page-content>
    <div
      v-for="_posts in [
        {
          label: '在此',
          desc: `包含标签 <span un-text-neutral-500>${params?.tag}</span> 的文章`,
          posts: postsInCurrentTag,
        },
        {
          label: '更深处',
          desc: `<span un-text-neutral-500>${params?.tag}</span> 更下级标签的文章`,
          posts: postsInExtendedTags,
        },
      ]"
      :key="_posts.label"
      un-mt-8
    >
      <ProgressBarHeader
        :title="_posts.label"
        :intro="_posts.desc"
        un-mb-8
      />
      <div
        v-for="post in _posts.posts"
        :key="post.url"
        un-gap-2
        un-flex="~ row"
        un-items-baseline
        un-text-ellipsis
      >
        <span
          v-if="post.source === 'corpus'"
          un-text="rose-600 dark:rose-400"
          un-font-mono
          un-px-1
        >C
        </span>
        <span
          v-else
          un-text="emerald-600 dark:emerald-400"
          un-font-mono
          un-px-1
        >P
        </span>
        <LinkUnderline
          :vanilla="true"
          :href="post.url"
          :text="post.title"
          :tooltip="true"
          :tooltip-text="post.frontmatter.title"
          un-min-w-0
        >
          <template #tooltipAddons>
            <TooltipPostInfo :post="post" />
          </template>
        </LinkUnderline>
        <div
          un-text="neutral-500 dark:neutral-400 xs"
          un-whitespace-nowrap
        >
          {{ new Date(post.created).toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }) }}
        </div>
      </div>
    </div>
    <!-- <PostListSection -->
    <!--   :posts="postsInCurrentTag" -->
    <!--   :show-excerpt-toggle="true" -->
    <!--   title="在此" -->
    <!--   :group-by-year="true" -->
    <!--   :intro="`包含标签 <span un-text-neutral-500>${params?.tag} </span>的文章`" -->
    <!--   :year-formatter="$i18n.locale === 'zh' ? toChineseNumber : (year: string) => year" -->
    <!--   :date-formatter="(date: Date) => { -->
    <!--     return new Date(date).toLocaleDateString('zh-CN', { -->
    <!--       month: 'long', -->
    <!--       day: 'numeric', -->
    <!--     }) -->
    <!--   }" -->
    <!-- > -->
    <!--   <template -->
    <!--     v-if="Object.keys(postsInCurrentTag).length === 0" -->
    <!--     #empty-message-addons -->
    <!--   > -->
    <!--     <div -->
    <!--       un-text="2xl neutral-800 dark:neutral-200" -->
    <!--       un-my-10 -->
    <!--       un-flex="~ row" -->
    <!--       un-justify-center -->
    <!--     > -->
    <!--       此处没有任何文章 -->
    <!--     </div> -->
    <!--     <div -->
    <!--       un-text="2xl neutral-700 dark:neutral-300" -->
    <!--       un-my-10 -->
    <!--       un-flex="~ row" -->
    <!--       un-justify-center -->
    <!--     > -->
    <!--       很可能是由于「{{ params?.tag }}」是一个泛类 -->
    <!--     </div> -->
    <!--     <div -->
    <!--       un-text="2xl neutral-600 dark:neutral-400" -->
    <!--       un-my-10 -->
    <!--       un-flex="~ row" -->
    <!--       un-justify-center -->
    <!--     > -->
    <!--       您需要看看 -->
    <!--       <LinkUnderline -->
    <!--         un-align-base -->
    <!--         href="#更深处" -->
    <!--         text="更深处" -->
    <!--         un-text="cyan-500" -->
    <!--         un-before="bg-cyan-600 dark:bg-cyan-600/80" -->
    <!--       /> -->
    <!--     </div> -->
    <!--   </template> -->
    <!-- </PostListSection> -->
    <!-- <PostListSection -->
    <!--   :posts="postsInExtendedTags" -->
    <!--   :show-excerpt-toggle="true" -->
    <!--   title="更深处" -->
    <!--   :group-by-year="true" -->
    <!--   :intro="`扩展标签包含「${params?.tag}」的文章`" -->
    <!--   :year-formatter="$i18n.locale === 'zh' ? toChineseNumber : (year: string) => year" -->
    <!--   :date-formatter="(date: Date) => { -->
    <!--     return new Date(date).toLocaleDateString('zh-CN', { -->
    <!--       month: 'long', -->
    <!--       day: 'numeric', -->
    <!--     }) -->
    <!--   }" -->
    <!-- > -->
    <!--   <template -->
    <!--     v-if="Object.keys(postsInExtendedTags).length === 0" -->
    <!--     #empty-message-addons-更深处 -->
    <!--   > -->
    <!--     <div -->
    <!--       un-text="2xl neutral-800 dark:neutral-200" -->
    <!--       un-my-10 -->
    <!--       un-flex="~ row" -->
    <!--       un-justify-center -->
    <!--     > -->
    <!--       更深处没有任何文章 -->
    <!--     </div> -->
    <!--   </template> -->
    <!-- </PostListSection> -->
  </un-page-content>
</template>
