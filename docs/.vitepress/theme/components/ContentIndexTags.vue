<script setup lang="ts">
import { computed } from 'vue'
import tags from '../../generated/tags.json'
import { data as corpus } from '../src/corpus.data'
import { data as posts } from '../src/posts.data'
import ContentNav from './ContentNav.vue'
import ProgressBarHeader from './ProgressBarHeader.vue'
import TagTreeNode from './TagTreeNode.vue'

interface TagNode {
  name: string
  fullPath: string
  exactCount: number
  totalCount: number
  children: TagNode[]
}

const tagList = computed(() => Array.isArray(tags) ? [...tags] : [])

const articles = [
  ...corpus,
  ...posts,
]

const exactCountMap = computed(() => {
  const map = new Map<string, number>()
  articles.forEach((article) => {
    const uniqueTags = new Set(article.tags || [])
    uniqueTags.forEach((tag) => {
      map.set(tag, (map.get(tag) || 0) + 1)
    })
  })
  return map
})

const tagTree = computed<TagNode[]>(() => {
  const root: Record<string, any> = {}
  const ensureNode = (container: any, name: string, fullPath: string) => {
    if (!container[name]) {
      container[name] = { name, fullPath, exactCount: 0, totalCount: 0, children: {} }
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
      exactCount: exactCountMap.value.get(node.fullPath) || 0,
      totalCount: 0,
      children: toArray(node.children),
    }))
    .sort((a: TagNode, b: TagNode) => a.name.localeCompare(b.name))

  const applyTotalCount = (nodes: TagNode[]): TagNode[] => {
    return nodes.map((node) => {
      const children = applyTotalCount(node.children)
      const childrenTotal = children.reduce((sum, child) => sum + child.totalCount, 0)
      return {
        ...node,
        children,
        totalCount: node.exactCount + childrenTotal,
      }
    })
  }

  return applyTotalCount(toArray(root))
})

const navItems = [
  [{ label: 'Home', url: '/' }],
  [
    { label: 'Corpus', url: '/corpus/', children: [
      { label: 'Autopsia', url: '/corpus/000_autopsia/' },
      { label: 'Ingesta', url: '/corpus/100_ingesta/' },
      { label: 'Neoplasma', url: '/corpus/200_neoplasma/' },
      { label: 'Putredo', url: '/corpus/300_putredo/' },
      { label: 'Delirium', url: '/corpus/400_delirium/' },
      { label: 'Vigil', url: '/corpus/500_vigil/' },
    ] },
    { label: 'Posts', url: '/posts/' },
    { label: 'Dashboard', url: '/dashboard/' },
    { label: 'Tags', url: '/tags/', current: true },
  ],
]
</script>

<template>
  <ContentNav
    :items="navItems"
  />
  <ProgressBarHeader
    title="Tags"
    intro=""
    un-mb-8
  />
  <Content
    class="markdown-rendered"
    un-text="base/10"
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
        :default-open="false"
      />
    </ul>
  </div>
  <div
    v-else
    un-text="stone-500"
  >
    没有可用的标签。
  </div>
</template>
