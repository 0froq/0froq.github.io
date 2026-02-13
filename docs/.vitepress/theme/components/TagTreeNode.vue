<script setup lang="ts">
import { computed, ref } from 'vue'
import LinkUnderline from './LinkUnderline.vue'

interface TagNode {
  name: string
  fullPath: string
  children: TagNode[]
}

const props = withDefaults(defineProps<{ node: TagNode, defaultOpen?: boolean, depth?: number }>(), {
  defaultOpen: false,
  depth: 0,
})

const hasChildren = computed(() => props.node.children && props.node.children.length > 0)
const isOpen = ref(Boolean(props.defaultOpen))

function beforeEnter(el: HTMLElement) {
  el.style.maxHeight = '0px'
  el.style.opacity = '0'
}

function enter(el: HTMLElement) {
  requestAnimationFrame(() => {
    el.style.maxHeight = `${el.scrollHeight}px`
    el.style.opacity = '1'
  })
}

function afterEnter(el: HTMLElement) {
  el.style.maxHeight = ''
  el.style.opacity = ''
}

function beforeLeave(el: HTMLElement) {
  el.style.maxHeight = `${el.scrollHeight}px`
  el.style.opacity = '1'
}

function leave(el: HTMLElement) {
  requestAnimationFrame(() => {
    el.style.maxHeight = '0px'
    el.style.opacity = '0'
  })
}

function afterLeave(el: HTMLElement) {
  el.style.maxHeight = ''
  el.style.opacity = ''
}

function toggle() {
  if (!hasChildren.value)
    return
  isOpen.value = !isOpen.value
}
</script>

<template>
  <li un-mb-1>
    <div
      un-flex="~ row"
      un-items-center
      un-gap-1
      un-text-lg
    >
      <span
        v-if="props.depth > 0"
        un-text="neutral-500"
      >
        ../
      </span>
      <LinkUnderline
        :href="`/tags/${props.node.fullPath}`"
        :text="node.name"
        :vanilla="true"
        un-text="neutral-600 dark:neutral-400"
        un-underline="~ px neutral-400 dark:neutral-600 hover:sky-500"
      />
      <template

        v-if="hasChildren"
      >
        <span
          un-text="neutral-500"
        >
          /
        </span>
        <span
          v-if="hasChildren"
          un-text="neutral-500 hover:neutral-950 dark:hover:neutral-50"
          un-cursor-pointer
          un-transition
          :aria-expanded="isOpen"
          :aria-label="isOpen ? '折叠子标签' : '展开子标签'"
          @click="toggle"
        >
          <span>..</span>
        </span>
      </template>
    </div>
    <Transition
      name="tag-collapse"
      @before-enter="beforeEnter"
      @enter="enter"
      @after-enter="afterEnter"
      @before-leave="beforeLeave"
      @leave="leave"
      @after-leave="afterLeave"
    >
      <ul
        v-if="hasChildren"
        v-show="isOpen"
        un-ml-4
        un-list-none
        un-mt-1
        un-pl-0
        un-space-y-1
      >
        <TagTreeNode
          v-for="child in props.node.children"
          :key="child.fullPath"
          :node="child"
          :depth="props.depth + 1"
        />
      </ul>
    </Transition>
  </li>
</template>

<style scoped>
.tag-collapse-enter-active,
.tag-collapse-leave-active {
  transition:
    max-height 220ms ease,
    opacity 220ms ease;
  overflow: hidden;
}

.tag-collapse-enter-active > li,
.tag-collapse-leave-active > li {
  transition:
    opacity 180ms ease,
    transform 180ms ease;
  transition-delay: 120ms;
}

.tag-collapse-enter-from > li {
  opacity: 0;
  transform: translateY(4px);
}

.tag-collapse-leave-to > li {
  opacity: 0;
  transform: translateY(4px);
}
</style>
