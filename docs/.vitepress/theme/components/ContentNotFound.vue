<script setup lang="ts">
import { data as posts } from '../src/posts.data.ts'
import LinkUnderline from './LinkUnderline.vue'
import PostListSection from './PostListSection.vue'

const randomPosts = posts
  .sort(() => 0.5 - Math.random())
  .slice(0, 5)
</script>

<template>
  <h1
    un-text="align-right 400px rose-500/10"
    un-font="900"

    un-absolute
    un-bottom-0
    un-select-none
    un-right-0
    un-z-0
  >
    404
  </h1>
  <un-page-content
    un-relative
    un-z-1
  >
    <div
      un-text="2xl neutral-800 dark:neutral-200"
      un-my-10
      un-flex="~ row"
    >
      您其实不应该出现在 <span
        un-text-rose-500
      >这里</span> /
    </div>
    <div
      un-text="2xl neutral-700 dark:neutral-300"
      un-my-10
      un-flex="~ row"
    >
      如果您通过任何内部链接到达这里,请
      <LinkUnderline
        un-align-base
        href="/posts/get_along/"
        text="联系我"
        un-text="emerald-500"
        un-before="bg-emerald-600 dark:bg-emerald-400"
      /> /
    </div>
    <div
      un-text="2xl neutral-600 dark:neutral-400"
      un-my-10
      un-flex="~ row"
    >
      或者这里有一些
      <LinkUnderline
        un-align-base
        href="/#%E5%85%A8"
        text="文章"
        un-text="cyan-500"
        un-before="bg-cyan-600 dark:bg-cyan-600/80"
      />
      您可能会感兴趣:
    </div>

    <PostListSection
      title=""
      :posts="randomPosts"
      :excerpt-visible="false"
      :show-excerpt-toggle="false"
    />
  </un-page-content>
</template>
