<script setup lang="ts">
import { computed } from 'vue'
import tags from '../../generated/tags.json'
import ProgressBarHeader from './ProgressBarHeader.vue'
import TagTreeNode from './TagTreeNode.vue'

interface TagNode {
  name: string
  fullPath: string
  children: TagNode[]
}

const tagList = computed(() => Array.isArray(tags) ? [...tags] : [])

const tagTree = computed<TagNode[]>(() => {
  const root: Record<string, any> = {}
  const ensureNode = (container: any, name: string, fullPath: string) => {
    if (!container[name]) {
      container[name] = { name, fullPath, children: {} }
    }
    return container[name]
  }

  tagList.value.forEach((tag) => {
    const parts = tag.split('/')
    let cursor = root
    let acc = ''
    parts.forEach((part) => {
      acc = acc ? `${acc}/${part}` : part
      cursor = ensureNode(cursor, part, acc).children
    })
  })

  const toArray = (container: any): TagNode[] => Object
    .values(container)
    .map((node: any) => ({
      name: node.name,
      fullPath: node.fullPath,
      children: toArray(node.children),
    }))
    .sort((a: TagNode, b: TagNode) => a.name.localeCompare(b.name))

  return toArray(root)
})
</script>

<template>
  <ProgressBarHeader
    title="Tags"
    intro="所有文章的标签索引（层级展开）。"
    un-mb-8
  />
  <div
    v-if="tagTree.length"
    un-mb-6
  >
    <ul
      un-ml-0
      un-pl-0
      un-list-none
    >
      <TagTreeNode
        v-for="node in tagTree"
        :key="node.fullPath"
        :node="node"
        :default-open="true"
      />
    </ul>
  </div>
  <div
    v-else
    un-text="neutral-500"
  >
    没有可用的标签。
  </div>
  <Content
    class="markdown-rendered"
    un-text="base/10"
  />
</template>
