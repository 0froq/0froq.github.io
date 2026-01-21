<script setup lang="ts">
import { onClickOutside } from '@vueuse/core'
import { ref } from 'vue'
import { useTagUtils } from '../../utils/useTagUtils'
import LinkUnderline from './LinkUnderline.vue'

const { currentTagHierarchy, extendedTagsForCurrentTag } = useTagUtils()

const showExtendedTags = ref(false)
const extendedTagsRef = ref<HTMLElement | null>(null)

onClickOutside(extendedTagsRef as any, () => {
  showExtendedTags.value = false
})
</script>

<template>
  <div
    un-my-10
    un-text="2xl"
    un-max-w-full
    un-flex="~ row"
    un-items-center
  >
    <un-i-ph-tag-duotone
      un-w-6
      un-h-6
      un-mr-2
      un-inline-block
      un-align-middle
      un-text="sky-400 dark:sky-600"
    />
    <template
      v-for="(tag, index) in currentTagHierarchy"
      :key="tag"
    >
      <LinkUnderline
        :href="`/tags/${tag}`"
        :text="tag.split('/').pop()"
        :un-text="index === currentTagHierarchy.length - 1
          ? `neutral-700 dark:neutral-300 hover:neutral-950 dark:hover:neutral-50`
          : `neutral-500 hover:neutral-950 dark:hover:neutral-50`"
        un-before="bg-sky-400 dark:bg-sky-600"
      />
      <span
        v-if="index < currentTagHierarchy.length - 1"
        un-inline-block
        un-text="neutral-500"
      >
        /
      </span>
    </template>

    <div
      v-if="extendedTagsForCurrentTag.length > 0"
      un-relative
      un-inline-block
    >
      <span
        un-inline-block
        un-relative
        un-text="neutral-500"
      >
        /
      </span>
      <span
        un-cursor-pointer
        un-text="neutral-500 hover:neutral-950 dark:hover:neutral-50"
        @click="showExtendedTags = !showExtendedTags"
      >
        ...
      </span>
      <div
        v-if="showExtendedTags"
        ref="extendedTagsRef"
        un-absolute
        un-z-20
        un-bg="neutral-100 dark:neutral-900"
        un-border="~ neutral-300 dark:neutral-700"
        un-rounded-sm
        un-text-base
        un-p-2
        un-min-w-max
      >
        <div
          v-for="tag in extendedTagsForCurrentTag"
          :key="tag"
          un-py-1
        >
          <!-- <LinkUnderline
            :href="`/tags/${tag}`"
            :text="`.../${tag.replace(`${currentTagHierarchy.map(tag => tag.split('/').pop()).join('/')}/`, '')}`"
            un-text="neutral-700 dark:neutral-300 hover:neutral-950 dark:hover:neutral-50"
            un-before="bg-emerald-600 dark:bg-emerald-600/80"
          /> -->
          ./<a
            :href="`/tags/${tag}`"
            un-transition
            un-duration-200
            un-text="neutral-500 hover:neutral-950 dark:hover:neutral-50"
            un-underline="~ px neutral-500 hover:neutral-950 dark:hover:neutral-50"
          >
            {{ `${tag.replace(`${currentTagHierarchy.map(_tag => _tag.split('/').pop()).join('/')}/`, '')}` }}
          </a>
        </div>
      </div>
    </div>
  </div>
</template>
