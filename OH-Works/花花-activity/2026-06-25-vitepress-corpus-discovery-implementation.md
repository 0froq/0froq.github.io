# VitePress 中实现 Corpus 发现层 UI：渐进集成路径

> 衔接 06-20~06-24 研究链的落地端。前序工作覆盖了图可视化选型（vis-network/Cytoscape.js/G6/Sigma.js/Selma）、发现层 UI 模式（标签组合过滤、共现推荐、维度仪表盘、Drill-Down）、图数据模型三路径（markedup/GrafeoDB/LoraDB）、以及 Zettelkasten 原子笔记原则。这篇从 VitePress 主题层出发，给出从简单到高级的渐进实现方案。

---

## 一、VitePress 自定义能力基础

蛙蛙的博客是 VitePress + UnoCSS 栈。以下是与 corpus 发现层直接相关的扩展点：

### 1.1 扩展默认主题 vs 自定义主题

```ts
// .vitepress/theme/index.ts

// 方式 A：扩展默认主题——推荐，保留文档站点导航等基础设施
import DefaultTheme from 'vitepress/theme'
import CorpusTagFilter from './components/CorpusTagFilter.vue'
import CorpusGraph from './components/CorpusGraph.vue'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('CorpusTagFilter', CorpusTagFilter)
    app.component('CorpusGraph', CorpusGraph)
  },
}
```

```ts
// 方式 B：自定义主题——完全控制 Layout，但失去默认主题的导航/侧边栏/slot 系统
export default {
  Layout: MyCustomLayout,
  enhanceApp({ app }) { /* ... */ },
}
```

**建议**：蛙蛙的博客目前使用默认主题 + UnoCSS 样式覆盖，选择「扩展默认主题」可以复用现有基础设施。只有发现层页面需要自定义布局时，才在 frontmatter 设置 `layout: page` 或自定义布局名。

### 1.2 Layout Slot 系统

默认主题的 Layout 提供了多个 slot，可以直接嵌入 corpus 发现层组件而不需要替换整个布局：

```vue
<!-- .vitepress/theme/Layout.vue -->
<script setup lang="ts">
import DefaultTheme from 'vitepress/theme'
const { Layout } = DefaultTheme
</script>

<template>
  <Layout>
    <template #sidebar-bottom>
      <!-- 侧边栏底部：标签云导航 -->
      <CorpusTagCloud />
    </template>
    <template #doc-footer-before>
      <!-- 文档页脚前：相关条目推荐 -->
      <CorpusRelatedEntries />
    </template>
  </Layout>
</template>
```

关键 slot：`layout-top` / `layout-bottom`（全页面）、`doc-before` / `doc-after`（文档区域）、`sidebar-top` / `sidebar-bottom`（侧边栏）、`aside-top` / `aside-bottom`（右侧大纲区域）。

---

## 二、Build-time 数据加载：corpus 条目的标签索引

### 2.1 createContentLoader 作为 tag 索引基础

VitePress 的 `createContentLoader` 在 build-time 扫描 Markdown 文件，输出 JSON 到 client bundle。这是 corpus 发现层最轻量的数据基础。

```ts
// .vitepress/theme/corpus.data.ts  (注意是 .data.ts，VitePress 约定)
import { createContentLoader } from 'vitepress'

export interface CorpusEntry {
  url: string
  title: string
  date: string
  tags: string[]
  excerpt?: string
}

export default createContentLoader('corpus/**/*.md', {
  excerpt: true,
  transform(raw): CorpusEntry[] {
    return raw
      .filter(page => page.frontmatter.tags?.length)
      .map(page => ({
        url: page.url,
        title: page.frontmatter.title || '',
        date: page.frontmatter.date || '',
        tags: page.frontmatter.tags as string[],
        excerpt: page.excerpt,
      }))
      .sort((a, b) => +new Date(b.date) - +new Date(a.date))
  },
})
```

然后在组件中直接用：

```vue
<script setup lang="ts">
import data from '../corpus.data'
// data 的类型自动推断为 CorpusEntry[]
</script>
```

**注意**：build-time data 在 client 端是静态 JSON 快照。这对标签过滤和列表展示足够，但不支持客户端图遍历（需要运行时索引）。

### 2.2 flat-tag 体系的客户端索引

corpus 使用 flat-tag（平标签，无层级）。客户端需要构建两种索引才能高效过滤：

```ts
// composables/useCorpusIndex.ts
import { ref, computed } from 'vue'
import data from '../corpus.data'

export interface TagIndex {
  tag: string
  count: number
  entries: string[]  // URLs
}

export function useCorpusIndex() {
  const entries = ref(data)
  const selectedTags = ref<string[]>([])

  // tag -> 条目列表的倒排索引
  const tagIndex = computed<TagIndex[]>(() => {
    const map = new Map<string, string[]>()
    for (const entry of entries.value) {
      for (const tag of entry.tags) {
        const list = map.get(tag) || []
        list.push(entry.url)
        map.set(tag, list)
      }
    }
    return Array.from(map.entries())
      .map(([tag, urls]) => ({ tag, count: urls.length, entries: urls }))
      .sort((a, b) => b.count - a.count)
  })

  // 当前选中标签过滤后的条目
  const filteredEntries = computed(() => {
    if (selectedTags.value.length === 0) return entries.value
    return entries.value.filter(e =>
      selectedTags.value.every(t => e.tags.includes(t))
    )
  })

  function toggleTag(tag: string) {
    const idx = selectedTags.value.indexOf(tag)
    if (idx >= 0) selectedTags.value.splice(idx, 1)
    else selectedTags.value.push(tag)
  }

  return { entries, tagIndex, selectedTags, filteredEntries, toggleTag }
}
```

---

## 三、渐进实现路径

按复杂度递增排列，蛙蛙可以根据当前能量水位选择下一阶段。

### Phase 1：标签云 + 条目列表（低复杂度，1-2天）

**核心**：在 corpus 页面顶部展示所有 tag 的倒排索引云（字体大小反映 count），点击后过滤下方条目列表。

**技术栈**：Vue `<script setup>` + UnoCSS + computed 过滤

```vue
<!-- 核心组件示例：TagCloud.vue -->
<script setup lang="ts">
import { useCorpusIndex } from '../composables/useCorpusIndex'
const { tagIndex, selectedTags, toggleTag } = useCorpusIndex()
</script>

<template>
  <div class="flex flex-wrap gap-2">
    <button
      v-for="t in tagIndex"
      :key="t.tag"
      class="px-3 py-1 rounded-full text-sm transition"
      :class="selectedTags.includes(t.tag)
        ? 'bg-primary text-white'
        : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700'"
      @click="toggleTag(t.tag)"
    >
      {{ t.tag }}
      <span class="opacity-60 ml-1">({{ t.count }})</span>
    </button>
  </div>
</template>
```

**UnoCSS 优势**：`flex-wrap gap-2` `rounded-full` 等 utility 直接写，无需额外 CSS 文件。

### Phase 2：共现推荐 + 维度仪表盘（中等复杂度，3-5天）

**核心**：
- **共现推荐**：选中某个 tag 时，自动推荐与其共现频率最高的其他 tag（`Jaccard 相似度` 或简单计数器）
- **维度仪表盘**：在 corpus 页面展示宇宙全景——tag 数量、条目总数、时间跨度、最近更新

```ts
// composables/useCooccurrence.ts
export function useCooccurrence(tagIndex: TagIndex[], entries: CorpusEntry[]) {
  function getRelatedTags(tag: string, topN = 10): { tag: string; score: number }[] {
    const tagEntries = tagIndex.find(t => t.tag === tag)?.entries || []
    const coCount = new Map<string, number>()

    for (const entry of entries) {
      if (entry.tags.includes(tag)) {
        for (const t of entry.tags) {
          if (t !== tag) coCount.set(t, (coCount.get(t) || 0) + 1)
        }
      }
    }

    // Jaccard-like: |A∩B| / |A∪B|
    return Array.from(coCount.entries())
      .map(([t, count]) => ({
        tag: t,
        score: count / (tagEntries.length + (tagIndex.find(ti => ti.tag === t)?.entries.length || 0) - count),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, topN)
  }

  return { getRelatedTags }
}
```

**维度仪表盘**：一个纯计算属性的组件，展示统计摘要。可以用 UnoCSS `grid` 布局 + `border` utility 画卡片。

### Phase 3：Drill-Down 导航 + 可视化标签图（较高复杂度，1-2周）

**核心**：
- **Drill-Down**：点击 tag → 显示该 tag 下的条目列表 → 点击条目 → 条目详情页（VitePress 原生路由）→ 条目底部显示"关联条目"（基于 tag 共现）
- **可视化标签图**：使用 Sigma.js（轻量，WebGL 渲染，适合 100-500 节点）或 vis-network（更丰富的交互）渲染 tag 共现图

```vue
<!-- 集成 Sigma.js 的示意图 -->
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Sigma from 'sigma'
import Graph from 'graphology'

const container = ref<HTMLDivElement>()

onMounted(() => {
  const graph = new Graph()
  // 从 cooccurrence index 构建图
  // tag 为节点，共现次数 > 阈值时连边
  // 节点大小 = 条目数，边粗细 = 共现强度

  const sigma = new Sigma(graph, container.value!, {
    renderEdgeLabels: false,
    enableCameraControl: true,
  })
})
</script>
```

Sigma.js + graphology 的组合轻量且与前端工具链兼容良好。`graphology` 是纯 JS 图数据结构库，Sigma.js 是其 WebGL 渲染器，tree-shakable，bundle 增量 ~150KB gzip。

---

## 四、关键技术决策

### 4.1 客户端过滤 vs 服务端路由

| 维度 | 客户端过滤 | 服务端路由（动态路由） |
|------|------------|----------------------|
| 实现复杂度 | 低，一个 Vue 组件即可 | 中，需要写 paths loader |
| 交互响应 | 即时 | 页面切换 |
| 可被索引 | 否 | 是（每个 tag combo 可独立 URL） |
| 适用场景 | 探索式浏览 | SEO + 分享链接 |

**建议**：Phase 1-2 用客户端过滤，Phase 3 如果希望每个标签组合有独立 URL 分享，可以迁移到动态路由。

动态路由示例（适合 Phase 3+）：

```ts
// corpus/[tags].paths.ts
import { createContentLoader } from 'vitepress'

export default {
  async paths() {
    const entries = await createContentLoader('corpus/**/*.md').load()
    const allTags = [...new Set(entries.flatMap(e => e.frontmatter.tags))]

    return allTags.map(tag => ({
      params: { tags: tag },
      content: `---\ntitle: "Tag: ${tag}"\ndescription: "Corpus entries tagged with ${tag}"\n---`,
    }))
  },
}
```

### 4.2 状态管理

**先不引入 Pinia**。蛙蛙的项目目前没有 Pinia 依赖。初期的 tag 过滤/共现推荐用 Vue composable + computed 即可。Pinia 的加入时机：需要跨页面共享过滤状态（如"在 corpus 页面选了 tag，点进文章后底部推荐保持相同上下文"）时才值得引入。

### 4.3 构建集成

corpus 发现层组件不需要修改 VitePress 构建配置。Vue 组件、composable 和 `.data.ts` 文件都放在 `.vitepress/theme/` 目录下，VitePress 会自动处理。

需要 UnoCSS 自定义规则时，在 `uno.config.mts` 中添加即可。

---

## 五、与现有架构的兼容性

- **flat-tag 体系**：上述方案直接使用 frontmatter 中的 `tags` 字段，无需改动数据模型
- **UnoCSS**：所有样式用 utility class，无需额外 CSS
- **SSR**：`createContentLoader` 在 build-time 执行，组件中访问的数据是静态 JSON，SSR 兼容
- **Sigma.js 注意**：图可视化需要 WebGL / Canvas，只能在 `onMounted` 中渲染，用 `<ClientOnly>` 包裹

---

## 六、推荐顺序

```
Phase 1 (标签云 + 过滤列表)
  └── 2-3天，可独立发布，即时获得交互价值
        │
Phase 2 (共现推荐 + 维度仪表盘)
  └── 叠加在 Phase 1 上，3-5天
        │
Phase 3 (Drill-Down 导航 + 可视化标签图)
  └── 最高复杂度，1-2周，可根据需要在任意时间开始
```

每个阶段都是独立的、可发布的增量。蛙蛙低能量时可以从 Phase 1 开始小步推进，高能量时直接冲击 Phase 3。

---

> 写于 2026-06-25 08:00。安静储备，按需取用。
