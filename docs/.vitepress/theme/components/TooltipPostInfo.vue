<script setup lang="ts">
defineProps<{
  post: any
}>()
</script>

<template>
  <div
    un-py-2
    un-flex="~ col"
    un-text="sm neutral-600 dark:neutral-400"
    un-gap-2
    un-max-w-600px
  >
    <div
      un-flex="~ row"
      un-items-center
      un-gap-2
    >
      <un-i-ph-clock-duotone
        un-w-4
        un-h-4
        un-inline-block
        un-align-middle
        :class="post.readingTime < 5
          ? `text-green-700 dark:text-green-300`
          : post.readingTime < 10
            ? `text-yellow-700 dark:text-yellow-300`
            : `text-red-700 dark:text-red-300`"
      />
      <div>
        {{ `约${post.readingTime.toString()}分钟` }}
      </div>
    </div>
    <div
      v-if="post.tags && post.tags.length > 0"
      un-flex="~ row wrap"
      un-items-start
      un-gap-2
    >
      <un-i-ph-tag-duotone
        un-w-4
        un-h-4
        un-shrink-0
        un-inline-block
        un-text="sky-400 dark:sky-600"
      />
      <div>
        <div
          v-for="tag in post.tags"
          :key="tag"
          un-text="neutral-700 dark:neutral-300"
          un-underline="~ px sky-500"
        >
          #{{ tag }}
        </div>
      </div>
    </div>
    <div
      v-if="post.excerpt"
      un-flex="~ row"
      un-items-start
      un-gap-2
    >
      <un-i-ph-file-text-duotone
        un-w-4
        un-h-4
        un-shrink-0
        un-inline-block
        un-align-middle
        un-text="emerald-400 dark:emerald-600"
      />
      <div
        un-text="neutral-800 dark:neutral-200"
        un-whitespace-normal
        v-html="post.excerpt"
      />
    </div>
  </div>
</template>
