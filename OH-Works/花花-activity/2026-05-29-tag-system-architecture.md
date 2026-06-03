# 博客标签系统架构分析

日期：2026-05-29 15:00

## 概览

博客的标签系统是一个多层架构，从构建时的静态生成、到运行时的数据加载、再到前端组件渲染，贯穿了整个内容管线。它的核心设计是一个**层级化标签体系**，用 `/` 分隔符表达标签的父子关系。

```
构建时 → 运行时 → UI 层
generate-tags.mjs → tags.data.ts → Home / Detail / TagDisplay
post/corpus data loaders → usePostUtils.ts → TagTreeNode
```

## 第一层：构建时标签生成（`scripts/generate-tags.mjs`）

这是标签系统的**唯一真实来源**。脚本在 `dev` 和 `build` 前执行（见 `package.json` 的 `docs:dev` 和 `docs:build`），遍历所有 markdown 文件，提取标签并输出 `tags.json`。

### 核心逻辑

1. **文件遍历**：递归遍历 `docs/` 下所有 `.md` 文件，通过 `shouldInclude()` 过滤（排除模板、索引文件）
2. **标签提取**：使用一个**最小化的 markdown-it 实例**（仅加载 `markdown-it-hashtag` 插件）渲染内容，然后从渲染后的 HTML 中提取标签
3. **层级展开**：每个标签如 `scope/work/corpus` 被展开为 `scope`、`scope/work`、`scope/work/corpus` 三个标签
4. **去重合并**：所有标签（含层级展开后的）放入 Set 去重，排序后写入 `tags.json`

### 关键观察：两个几乎重复的标签提取路径

项目中存在两个高度相似的标签提取逻辑：

- `scripts/generate-tags.mjs` 中的 `getTags()` 函数
- `theme/utils/usePostUtils.ts` 中的 `getTags()` 函数

两者都使用 regex `/<a href="[./tags][^"]*">\s*<span class="tag">(.*?)<\/span>\s*<\/a>/g` 从渲染后 HTML 中提取标签。区别在于：

| 维度 | generate-tags.mjs | usePostUtils.ts |
|---|---|---|
| 运行时机 | 构建时（Node.js） | VitePress data loader 中 |
| 输出 | `tags.json`（全局扁平列表） | 单篇文章的 `tags` + `tagsExtended` |
| 应用 | tag 首页树形结构 | 文章数据、tag 详情页筛选 |
| 环境 | 独立 markdown-it 实例 | 使用 VitePress 内置渲染 |

这种重复源于需求分层：`scripts/generate-tags.mjs` 需要**全局标签汇总**（用于标签首页），而 data loaders 需要**每篇文章的标签列表**（用于摘要、筛选、详情页）。

### 为什么用渲染后 HTML 而非直接解析 markdown？

`markdown-it-hashtag` 将 `#scope/work/corpus` 转换为 `<a href="/tags/scope/work/corpus"><span class="tag">scope/work/corpus</span></a>`。从 HTML 中提取标签利用了插件已有的解析规则，避免了重复实现 hashtag 正则匹配。但这个 regex 路径依赖了渲染配置，如果渲染规则改变（如 `hashtagRegExp` 修改），提取逻辑也必须同步更新。

## 第二层：运行时数据加载

### tags.data.ts

最简单的一层。直接从生成好的 `tags.json` 读取：

```typescript
const tagFile = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '../../generated/tags.json')
export const data: TagsData = readTags()
```

注意这不是 `defineLoader`，而是一个简单的模块级导出。因为 `tags.json` 是构建脚本产生的静态文件，不需要 `watch` 机制。

### posts.data.ts 和 corpus.data.ts

两个 data loader 的模式类似，以 `createContentLoader` + `transform` 为基础。在 transform 中调用 `getTags(html, frontmatter)` 获取：
- `tags`：文章的精确标签集合
- `tagsExtended`：展开后的层级标签集合

## 第三层：标签层级模型

这是整个系统的核心设计。标签用 `/` 分隔符表达层级：

```
scope/work/corpus
  ├── scope
  ├── scope/work
  └── scope/work/corpus
```

在 `usePostUtils.ts` 中，`dealTagHierarchy()` 实现这个展开逻辑：

```typescript
function dealTagHierarchy(tag: string): Set<string> {
  const tags = new Set<string>()
  const levels = tag.split('/')
  levels.forEach((_: string, i: number) => {
    tags.add(levels.slice(0, i + 1).join('/'))
  })
  return tags
}
```

### exactCount vs totalCount

在 tag 树结构中，区分两种计数：

- **exactCount**：直接匹配该标签的文章数
- **totalCount**：匹配该标签或其子标签的文章总数

举例：如果一篇文章标记为 `scope/work/corpus`，则：
- `scope/work/corpus` 的 exactCount +1
- `scope/work` 的 exactCount 不变，但 totalCount +1
- `scope` 的 exactCount 不变，但 totalCount +1

这构成了标签详情页中"In This"（exact）和"In Extended"（hierarchical）两个区块的数据基础。

## 第四层：UI 组件层

### TagDisplay.vue — 面包屑导航

标签详情页顶部的标签路径展示。使用 `useTagUtils()` 获取 `currentTagHierarchy`（当前标签的所有层级路径），渲染为面包屑样式。如果存在子标签，显示 `..` 按钮，点击弹出子标签下拉列表。

### TagTreeNode.vue — 递归树组件

标签首页的核心组件。每个节点展示：
- 标签名（带 LinkUnderline 链接到 `/tags/{fullPath}`）
- 树结构缩进（depth > 0 时显示 `../` 前缀）
- 可展开/折叠的子标签（`..` 按钮，用 Vue Transition 实现动画）
- 文章计数（三位数补齐，带彩色渐变和动画效果）

**计数动画**：当 `displayCount` 变化时，触发 600ms 的计数滚动动画。`animateCount()` 使用 `requestAnimationFrame` 逐帧更新，未锁定的数字位随机滚动，锁定的数字位显示实际值。效果类似老式机械计数器的翻牌动画。

**鼠标跟随分隔线**：`QSeperator` 的不透明度根据鼠标与行中心的距离动态调整（高斯衰减，sigma=56）。这个效果在 `Detail.vue` 的文章列表中也使用了。

### Home.vue — 标签首页

从 flat `tagList` 构建树形结构 `tagTree`：

1. 遍历所有标签，按 `/` 拆分为路径段
2. 用 `ensureNode()` 逐段构建嵌套对象
3. `toArray()` 将嵌套对象转为排序的 `TagNode[]`
4. `applyTotalCount()` 自底向上计算 totalCount

然后渲染为 `TagTreeNode` 森林。

### Detail.vue — 标签详情页

标签详情页的核心筛选逻辑：

- **postsInCurrentTag**：`post.tags.includes(tag)` — 精确匹配
- **postsInExtendedTags**：`post.tagsExtended?.some(t => t === tag && !post.tags.includes(tag))` — 层级匹配但非精确匹配

分为"In This"和"In Extended"两个区块，每个区块渲染文章列表（带来源标识 C/P、状态标识、鼠标跟随分隔线效果）。

## 设计观察

### 优点

1. **层级化标签是自然的分类系统**：`scope/work/corpus` 比平面的 `corpus` 更能表达知识的组织结构。这种设计在个人知识管理中尤其有价值，因为知识天然具有层级关系。

2. **构建时生成 + 运行时消费的分层合理**：全局标签列表是一次性的构建产物，避免在运行时实时计算。每篇文章的标签在 VitePress content loader 中生成，利用其缓存机制。

3. **exact vs extended 的区分**：解决了层级标签的核心矛盾——标记为 `scope/work/corpus` 的文章是否应该出现在 `scope` 标签页？答案不是二元的：用"In This"和"In Extended"两个区块分别呈现，让用户自己判断相关性。

4. **UI 细节精致**：计数动画、鼠标跟随分隔线、树结构的折叠动画，这些微交互让标签浏览从「查询」变成「探索」。

### 潜在改进空间

1. **双份 getTags() 实现的维护负担**：`scripts/generate-tags.mjs` 和 `usePostUtils.ts` 中的标签提取逻辑几乎相同。如果 hashtag 渲染规则变化，两边都要改。可以考虑抽取共享模块，但要注意 Node.js vs ESM 兼容性。

2. **tags.json 在 dev 模式下不会热更新**：新增文章标签后，需要重启 dev server 才能让标签首页反映变化。`scripts/generate-tags.mjs` 只在 `dev` 命令启动时执行一次。

3. **tagsExtended 在 data loader 中重复计算**：`posts.data.ts` 和 `corpus.data.ts` 都调用 `getTags()` 计算 `tagsExtended`，而同样的计算在 `generate-tags.mjs` 中也会发生。虽然上下文不同，但这种重复意味着如果层级展开逻辑变化（如新增多级分隔符），需要修改三处。

4. **从 HTML 提取标签的本质是耦合**：标签提取依赖于 `markdown-it-hashtag` 的渲染格式。如果插件升级改变了 HTML 输出格式，提取 regex 会静默失败。更稳健的做法是在 markdown-it 解析阶段直接访问 token 流提取标签（利用插件暴露的 token type），而非解析渲染后的 HTML。

## 与 Comark、VitePress 的关系

标签系统在 markdown 管线中处于 `markdown-it-hashtag` 插件层（config 中排在 `markdown-it-mark` 之后、`markdown-it-implicit-figures` 之前）。它不属于 Comark 组件系统，是独立的标签层。

在 VitePress 架构中，标签系统利用了两个机制：
1. **createContentLoader** 为每篇文章计算标签（post/corpus data loader）
2. **自定义路由** `/tags/{tag}` 通过 VitePress 的动态路由处理

标签的 `/tags/` 路由在 `docs/tags/` 目录下，`{tag}` 是动态参数。VitePress 的 `useData().params.tag` 捕获该参数，供 `Detail.vue` 使用。

## 关键文件索引

| 文件 | 作用 |
|---|---|
| `scripts/generate-tags.mjs` | 构建时标签生成脚本 |
| `docs/.vitepress/generated/tags.json` | 全局标签列表（构建产物） |
| `docs/.vitepress/theme/src/tags.data.ts` | 运行时标签数据加载 |
| `docs/.vitepress/theme/utils/usePostUtils.ts` | 标签提取和层级展开工具函数 |
| `docs/.vitepress/theme/utils/useTagUtils.ts` | 标签组合式函数（层级、子标签） |
| `docs/.vitepress/theme/components/tags/Home.vue` | 标签首页（森林视图） |
| `docs/.vitepress/theme/components/tags/Detail.vue` | 标签详情页（文章列表） |
| `docs/.vitepress/theme/components/ui/tag/TagDisplay.vue` | 标签面包屑组件 |
| `docs/.vitepress/theme/components/ui/tag/TagTreeNode.vue` | 递归标签树节点组件 |
| `docs/.vitepress/config.mts` | markdown-it-hashtag 插件配置 |
