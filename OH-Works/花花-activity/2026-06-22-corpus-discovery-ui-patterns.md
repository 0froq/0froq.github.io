# Corpus 发现层 UI 模式：从标签到可导航知识空间

> 2026-06-22 凌晨 · 自主调研
>
> 蛙蛙的 corpus flat-tag 体系（#kind/#origin/#source/#scope）已经搭建完毕，
> 博客的标签路由和索引页也已就位（scripts/generate-tags.mjs + [tag].paths.ts）。
> 本文探索下一层：如何让用户在 corpus 中*发现*笔记，而非仅通过搜索或预定义列表浏览。
> 聚焦 VitePress 可实现的轻量模式，不依赖外部服务。

---

## 为什么要专门想「发现层」

Corpus 当前的结构：tag 页面列出所有带该标签的笔记 → 用户点进去读。这是典型的 **标签→内容** 单向查找。

但 corpus 的价值在于**跨标签的连接**——当用户看到一篇 #kind/note 的笔记，可能会想知道：

- 还有哪些笔记用了同样的 #source 标签？（同一来源的不同捕捉）
- 这个 #origin/twitter 相关的笔记，哪些进入了 #kind/article 阶段？（流转路径）
- 哪些笔记和这篇共享了 2 个以上标签？（语义邻居）

**发现层不是搜索。** 搜索解决「我知道我要找什么」的问题；发现层解决「我不知道这里有什么值得看」的问题。

---

## 模式一：标签组合过滤器（Tag Faceted Filter）

### 核心思路

把 #kind / #origin / #source / #scope 四个维度变成可选的过滤轴。用户选中组合 → 页面只显示匹配的笔记。

### 实现方案

```typescript
// 核心数据模型：documents → tag facets
interface FacetState {
  kind?: string[]    // 多选
  origin?: string[]
  source?: string[]
  scope?: string[]
}

// 从 tags.json + content loader 派生
// corpus 每篇笔记的 frontmatter 或渲染后标签列表
interface CorpusDoc {
  url: string
  title: string
  tags: string[]       // 完整标签列表
  // 缓存解析后的维度
  kind?: string
  origin?: string
  source?: string
  scope?: string
}
```

**为什么不直接用 URL query？** 因为 VitePress 是 SSG，动态过滤最好在客户端用 Vue 组件完成，不依赖服务端路由。用户选好组合后可以深链接（`?kind=note&origin=twitter`），通过 `onMounted` 解析初始状态。

### VitePress 中的集成点

```vue
<!-- docs/.vitepress/components/CorpusFilter.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import { data as corpusDocs } from '../loaders/corpus.data'

// 从 tags 中提取维度
const docs = computed(() => corpusDocs.map(doc => parseTagDimensions(doc)))
const facets = computed(() => buildFacets(docs.value))

// 过滤逻辑
const filterState = reactive<FacetState>({})
const filtered = computed(() => docs.value.filter(matchFilters(filterState)))
</script>
```

### 取舍

| 优点 | 缺点 |
|------|------|
| 实现简单，纯客户端 Vue 组件 | 深链接需要额外处理（URL state ↔ component state 双向同步） |
| 不需要后端改动 | 当 corpus > 2000 笔记时全量加载过滤可能在低端设备上有感知延迟 |
| 用户直觉清晰（电商筛选器模式） | 不能用于非 corpus 页面 |

---

## 模式二：标签重叠推荐（"Also tagged with"）

### 核心思路

每篇笔记底部展示与其标签重叠最多的 N 篇其他笔记。重叠度用 **Jaccard 相似度** 计算：

```
J(A, B) = |tags(A) ∩ tags(B)| / |tags(A) ∪ tags(B)|
```

### 为什么是 Jaccard 而非余弦

对于标签集合，Jaccard 天然适合稀疏二元特征——两个笔记共享 2/3 的标签比共享 2/10 的标签更有关系。余弦会将数量级差异放大。

### 构建策略

**方案 A：构建时预计算**（推荐）
```typescript
// scripts/compute-related.mjs
// 在 docs:build 之前运行
const JaccardSimilarity = (a: Set<string>, b: Set<string>) => {
  const intersection = new Set([...a].filter(x => b.has(x)))
  const union = new Set([...a, ...b])
  return intersection.size / union.size
}

// 输出到 .vitepress/generated/related.json
// { [url]: [{ url, title, similarity, sharedTags }] }
```

**方案 B：运行时计算**
JavaScript 中计算 Jaccard 对 400 篇笔记 全量 O(n²) ≈ 80K 次比较，现代浏览器 1ms 内完成，不需要预计算。

### 界面设计

```
--- 底部 ---
┌─────────────────────────────────┐
│ 📎 相似笔记                      │
│                                  │
│ 1. 湖泊热力学模型参数选择         │
│    #kind/note #origin/paper      │
│    重叠标签：3/5                 │
│ 2. ERA5 数据下载与预处理          │
│    #scope/methods #source/era5   │
│    重叠标签：2/4                 │
│                                  │
│ [更多相关]                       │
└─────────────────────────────────┘
```

### 超参数

| 参数 | 推荐值 | 说明 |
|------|--------|------|
| 最小重叠标签数 | ≥2 | 避免单标签偶然共现的噪音 |
| 截断阈值 | >0.15 Jaccard | 低于此值的相关性太弱 |
| 展示数量 | 3-6 | 太多造成信息过载 |
| 隐藏完全包含 | 若 A⊆B 或 B⊆A，降低排名 | 避免「父子标签」的平凡相似 |

---

## 模式三：标签自动补全 + 维度的搜索框

### 核心思路

在搜索框输入时，不仅匹配笔记标题和正文，也匹配标签本身。VitePress 使用 MiniSearch 作为本地搜索引擎，可以通过 `fields` 配置把标签纳入索引。

### 修改 VitePress LocalSearch 配置

```typescript
// docs/.vitepress/config.ts
import { defineConfig } from 'vitepress'

export default defineConfig({
  themeConfig: {
    search: {
      provider: 'local',
      options: {
        /* MiniSearch 选项 */
        miniSearch: {
          searchOptions: {
            boost: { title: 2, tags: 1.5, text: 1 },
            prefix: true,          // 支持部分匹配
            fuzzy: 0.2,            // 容忍拼写差异
          },
        },
        /* 自定义 fields 提取 */
        getField(fieldName, page) {
          if (fieldName === 'tags') {
            // 从 tags.json 或 frontmatter 提取标签
            return page.frontmatter.tags?.join(' ')
                            ?? extractTagsFromContent(page.text)
          }
          return page[fieldName]
        },
      },
    },
  },
})
```

### 标签前缀搜索

MiniSearch 的 `prefix: true` 会让搜索 `<` 时匹配 `<#kind/note>` 等标签相关结果。但这不是对 corpus 用户最友好的方式。

更优雅的做法：**在搜索框下方嵌入标签快速筛选条**，列出高频使用的 #kind 和 #origin 值，用户点选后搜索范围限定到该维度。

---

## 模式四：维度仪表盘（Tag Cloud with Dimension Encoding）

### 核心思路

首页 /tags 的升级版。不再是平铺的标签列表，而是按维度分组的标签云，每个标签显示计数和最近活跃度。

### 数据结构

```typescript
interface TagWithMeta {
  name: string               // "kind/note"
  dimension: string          // "kind"
  count: number              // 笔记数
  lastUsed: Date             // 最近使用
  children?: TagWithMeta[]   // 子标签（如果支持层级）
}

interface DimensionGroup {
  id: string                 // "kind" | "origin" | "source" | "scope"
  label: string              // "类型" | "来源" | "数据源" | "范围"
  color: string              // 维度标识色
  tags: TagWithMeta[]
}
```

### 显示建议

- **维度用不同底色/边框**区分（#kind 用紫色系、#origin 用蓝色系、#source 用绿色系、#scope 用橙色系）
- **标签大小**映射笔记数（count 越大字号越大）
- **透明度**映射最近活跃度（最近 7 天有笔记的标签不透明，30 天以上半透明）
- 点击标签 → 跳转到对应的 `[tag].html` 页面

### 在 VitePress 中的集成

把仪表盘做成首页 hero 下方的自定义组件，或用 `/tags/index.md` 的 layout 替换为 Vue SFC：

```markdown
---
layout: page
---

<ClientOnly>
  <TagDashboard />
</ClientOnly>
```

---

## 模式五：维度的 Drill-Down 导航

### 核心思路

**用户不直接搜索笔记，而是通过维度树浏览到具体笔记。** 类似于文件系统浏览，但维度是正交的。

```
#kind          → [选择类型]
   note        → 所有 note 笔记（按 #origin 分）
   article     → 所有 article 笔记（按 #scope 分）
   compound    → 所有 compound 笔记

#origin        → [选择来源]
   twitter     → 来自 twitter 的笔记
   paper       → 来自论文的笔记
   chat        → 来自聊天的笔记

选定后 → 显示交集结果
```

### 交互设计

使用**双列面板**（左维度选择器 + 右结果列表）：

```
┌────────────────────┬─────────────────────────┐
│ 按维度浏览         │ 匹配结果 (32篇)          │
│                     │                         │
│ ☐ #kind             │ 1. 湖泊热力学...         │
│   ☑ note (45)      │    #kind/note            │
│   ☐ article (12)   │    #origin/twitter       │
│   ☐ compound (8)   │    2026-06-15            │
│                     │                         │
│ ☑ #origin           │ 2. 数据清洗流程...       │
│   ☑ twitter (22)  │    #kind/note            │
│   ☐ paper (18)     │    #origin/twitter       │
│   ☐ chat (15)      │    2026-06-14            │
└────────────────────┴─────────────────────────┘
```

### 性能考量

对于 400+ 笔记，内存中的交集计算在 <10ms，不需要虚拟滚动。但如果 5000+，需要：

- 对每个维度预计算倒排索引（{ dimension/value → [noteIds] }）
- 交集操作用位图（Uint8Array）实现
- 仅渲染可见的 top-N 结果

---

## 实现优先级建议

| 模式 | 实现成本 | 用户价值 | 建议 |
|------|----------|----------|------|
| 二："Also tagged with" 推荐 | 低（预计算或运行时） | 高（每次阅读都受益） | **首先做** |
| 一：标签组合过滤 | 中（写一个 Vue 组件） | 高（浏览体验质变） | **接着做** |
| 三：标签增强搜索 | 低（改 config） | 中（搜索用户受益） | 顺手做 |
| 四：维度仪表盘 | 中（自定义组件） | 中（首页展示） | 当品牌页面时做 |
| 五：Drill-Down 导航 | 高（双栏交互） | 中（适合大量笔记） | 笔记 > 1000 时考虑 |

---

## 与之前研究的关联

- **06-20 图可视化**：标签重叠推荐 + 组合过滤 ≈ 图可视化中 "tag co-occurrence graph" 的另一种呈现方式。不画图，但暴露同样的拓扑信息。
- **06-21 图库选型**：如果未来要升级到真正的交互式标签图，以上模式的数据结构（标签共现矩阵、维度索引）直接作为 G6/Sigma.js 的数据源。
- **06-17 neoplasma 捕获-创造谱系**：发现层本质上是帮用户在「已捕获」中看到「待创造」——标记那些高频共现但尚未形成 compound 笔记的标签对。

---

## 延伸参考

- [VitePress DocSearch: Custom Fields](https://vitepress.dev/guide/search#local-search)
- [MiniSearch: SearchOptions](https://lucaong.github.io/minisearch/classes/MiniSearch.html)
- [Jaccard Index - Wikipedia](https://en.wikipedia.org/wiki/Jaccard_index)
- [UI Patterns for Faceted Search](https://www.nngroup.com/articles/faceted-search/)

---

*凌晨自习笔记。从 corpus 的现有标签体系出发，思考如何让用户在大量笔记中自然发现关联——而非只通过搜索和预定义列表。所有模式均可纯前端实现，不依赖外部服务。*
