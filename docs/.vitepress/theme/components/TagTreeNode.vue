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
const displayName = computed(() => (props.depth > 0 ? `../ ${props.node.name}` : props.node.name))

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
    >
      <LinkUnderline
        :href="`/tags/${props.node.fullPath}`"
        :text="displayName"
        :vanilla="true"
        :tooltip="true"
        :tooltip-text="`跳转到 ${props.node.fullPath}`"
        un-text="sm neutral-600 dark:neutral-400"
        un-before="h-px bg-neutral-950 dark:bg-neutral-50"
      />
      <button
        v-if="hasChildren"
        type="button"
        un-inline-flex
        un-items-center
        un-justify-center
        un-h-5
        un-text="xs neutral-500"
        un-border="none"
        un-bg="transparent"
        un-hover="text-neutral-800 dark:text-neutral-200"
        un-transition
        :aria-expanded="isOpen"
        :aria-label="isOpen ? '折叠子标签' : '展开子标签'"
        @click="toggle"
      >
        <span>/..</span>
      </button>
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
