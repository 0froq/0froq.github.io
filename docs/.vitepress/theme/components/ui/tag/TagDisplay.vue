<script setup lang="ts">
import { onClickOutside } from '@vueuse/core'
import { ref } from 'vue'
import FloatWindow from '@/ui/base/FloatWindow.vue'
import LinkUnderline from '@/ui/base/LinkUnderline.vue'
import { useTagUtils } from '~/utils/useTagUtils'

const { currentTagHierarchy, extendedTagsForCurrentTag } = useTagUtils()

const showExtendedTags = ref(false)
const extendedTagsTriggerRef = ref<HTMLElement | null>(null)

onClickOutside(extendedTagsTriggerRef, () => {
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
    <un-i-solar-tag-horizontal-bold-duotone
      un-w-6
      un-h-6
      un-mr-2
      un-inline-block
      un-align-middle
      un-text="sky-600 dark:sky-400"
    />
    <template
      v-for="(tag, index) in currentTagHierarchy"
      :key="tag"
    >
      <LinkUnderline
        :href="`/tags/${tag}`"
        :text="tag.split('/').pop() || ''"
        :un-text="index === currentTagHierarchy.length - 1
          ? `stone-700 dark:stone-300 hover:stone-950 dark:hover:stone-50`
          : `stone-500 hover:stone-950 dark:hover:stone-50`"
        un-before="bg-sky-600 dark:bg-sky-400"
      />
      <span
        v-if="index < currentTagHierarchy.length - 1"
        un-inline-block
        un-text="stone-500"
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
        un-text="stone-500"
      >
        /
      </span>
      <span
        ref="extendedTagsTriggerRef"
        un-cursor-pointer
        un-text="stone-500 hover:stone-950 dark:hover:stone-50"
        @click="showExtendedTags = !showExtendedTags"
      >
        ..
      </span>

      <FloatWindow
        v-model:visible="showExtendedTags"
        :trigger-ref="extendedTagsTriggerRef"
        :follow-mouse="false"
        placement="bottom"
        :offset="4"
      >
        <div
          class="no-scrollbar garden-float-panel"
          un-text="stone-700 dark:stone-300"
          un-text-align-start
          un-py-2
          un-px-4
          un-max-w-fit
          un-w-full
          un-text-base
          un-max-h-300px
          un-overflow-y-auto
        >
          <div
            v-for="tag in extendedTagsForCurrentTag"
            :key="tag"
            un-py-1
            un-flex="~ row"
            un-items-center
          >
            <div
              un-text="stone-500"
            >
              ../
            </div>
            <LinkUnderline
              :href="`/tags/${tag}`"
              :text="`${tag.replace(`${currentTagHierarchy.map(_tag => _tag.split('/').pop()).join('/')}/`, '')}`"
              un-inline-block
              un-text-sm
              un-w-fit
              un-text="stone-600 dark:stone-400"
              un-before="h-px bg-stone-950 dark:bg-stone-50"
            />
          </div>
        </div>
      </FloatWindow>
    </div>
  </div>
</template>

<style>
.no-scrollbar::-webkit-scrollbar {
  width: 1px;
}
</style>
