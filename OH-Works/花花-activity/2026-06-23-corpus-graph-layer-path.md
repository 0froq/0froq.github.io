# 从 flat 到 graph：Corpus 系统的轻量级图查询层渐进方案

> 衔接 06-20~06-22 研究链（图可视化→库选型→UI 模式→发现层落地路径），从「如何画图」向上走到「数据模型如何支撑查询」。

## 问题

Corpus 当前是 flat-tag 文件系统架构，tag 作为文件夹和 frontmatter 标签工作得很好。但某些查询方式在纯文件系统中成本很高：

- **共现分析**：要知道 "lake" 和 "warming" 同时出现在哪些笔记中，需要 grep 多个 tag 后手动取交集
- **跨维度查询**：无法回答「与 climate 相关的所有笔记中，哪些属于 modeling 类型」
- **路径发现**：从一篇笔记出发，经由共享标签向外探索可达概念，文件系统只有父子关系，不支持这种遍历

引入传统图数据库（Neo4j/Memgraph）对个人知识管理来说太重了。Corpus 的优势在于「文件即数据」——需要的不是一个替代文件系统的数据库，而是在文件系统之上轻量级的图索引层。

## 近期生态调研

2026 年上半年出现了几个值得关注的方案：

### markedup — 从 Markdown 文件的 frontmatter 构建知识图谱

[Clarit-AI/markedup](https://github.com/Clarit-AI/markedup) 是一个 Go 库，核心理念是「文件系统即数据库」：

```yaml
---
id: distributed-consensus
title: Distributed Consensus Protocols
tags: [distributed-systems, algorithms]
relationships:
  - target: paxos
    type: derived-from
    strength: 0.8
  - target: etcd
    type: implemented-by
    strength: 0.9
temporal:
  last-verified: "2024-06-15"
  decay-rate: 0.05
---
```

- YAML frontmatter 携带实体、关系、置信度、时间元数据
- 解析后构建内存图索引，暴露为 CLI / TUI / MCP server / Go library
- 多信号搜索管线：关键词 + 图信号（关系密度、链接结构）+ 时间衰减 + 语义嵌入 + 交叉编码重排
- 与 Obsidian、静态站点生成器兼容
- **增量采用**：逐个文件添加 frontmatter，不影响已有工具对文件的读取
- 局限性：Go 实现，不适合直接嵌入前端；但其设计理念和 frontmatter schema 值得独立于语言借鉴

### GrafeoDB — WASM 图数据库完全在浏览器中运行

[GrafeoDB](https://grafeo.dev/)（Rust 编写，`@grafeo-db/web` npm 包）让图数据库在浏览器中零后端运行：

- 支持 Cypher、GQL、SPARQL、SQL、Gremlin、GraphQL
- IndexedDB 持久化，Web Worker 支持不阻塞主线程
- **原生 Vue 集成**：`useGrafeo` + `useQuery` composables

```vue
<script setup lang="ts">
import { useGrafeo, useQuery } from '@grafeo-db/web/vue'

const { db, loading } = useGrafeo({ persist: 'corpus-graph' })
const { data } = useQuery(db, `
  MATCH (n:Note)-[r:TAGS]->(t:Tag)
  WHERE t.name IN ['climate', 'lake']
  RETURN n.title, collect(t.name) as tags
`)
</script>
```

- 2026 年 2 月发布（v0.5.x），活跃迭代，作者是 Graphistry（GPU 图可视化公司）
- 浏览器支持 Chrome 89+ / Firefox 89+ / Safari 15+，需要 WASM + IndexedDB + Web Workers
- 纯文本 corpus 的体积远小于 IndexedDB 配额限制（~500MB），足够用

类似的还有 LadybugDB/Kuzu-WASM（280K 节点查询 8-20ms），但 GrafeoDB 的 Vue 集成和 TypeScript-first 设计更契合当前技术栈。

## 三条渐进路径

### 路径 A：文件内关系元数据

在 frontmatter 中以结构化方式声明笔记间关系。借鉴 markedup 的 schema，但用 corpus 已有的 frontmatter 格式承载。

```yaml
---
tags: [distributed-systems, consensus]
relations:
  - target: paxos
    type: influenced-by
  - target: raft-impl
    type: references
---
```

**优势**：零额外基础设施，文件仍然是单一事实来源，即使在 GitHub 或纯文本编辑器中也可读。
**成本**：手动维护关系需要心智负担。可借助 LLM 分析内容后自动建议关系（"从这篇笔记中提取 3-5 个核心关系"）。
**适用**：核心节点之间的显式关系，而非所有笔记。

### 路径 B：构建时图索引

在构建流程（VitePress build）中插入图索引生成步骤：

1. 扫描所有 Markdown 文件，提取 frontmatter 中的 `tags`、`relations`、`[[wikilinks]]`
2. 生成静态 JSON 图数据文件（`nodes.json` + `edges.json`）
3. 前端加载后供 `d3-force` / `Cytoscape.js` / `Sigma.js` 消费

```ts
// 构建脚本大致逻辑
const nodes = files.map(f => ({
  id: f.path,
  title: f.frontmatter.title,
  tags: f.frontmatter.tags,
  type: f.frontmatter.type ?? 'note',
}))
const edges = [
  ...files.flatMap(f => (f.frontmatter.relations ?? []).map(r => ({
    source: f.path, target: r.target, type: r.type,
  }))),
  ...cooccurrenceEdges(files), // 基于共享 tag 计算共现边
]
```

可实现为 Vite 插件，在 `build:end` hook 中运行。输出 JSON 文件放入 `public/` 目录或作为构建产物。

**优势**：全静态，无运行时开销，CDN 友好，可用任何图库渲染。
**局限**：图数据在构建时固定，不支持运行时交互式过滤。

### 路径 C：运行时 WASM 图数据库

GrafeoDB 将完整的图查询能力带到浏览器。数据从文件系统（或构建时的初始导入）进入 IndexedDB 后，所有查询在浏览器内完成。

**适合 GrafeoDB 的场景**：
- 标签组合过滤：用户点选多个 tag，实时显示符合条件的笔记子图
- 共现推荐：从当前笔记出发，查询最常与它的 tag 共现的其他 tag
- 路径探索：A → C → E 的多跳路径发现
- 全文 + 图混合搜索：BM25 全文搜索与 Cypher 图查询结合

**与 Nuxt/Vite 集成**：
- `@grafeo-db/web` 依赖 WASM + Workers，Vite 天然支持
- 在 Nuxt 中做 client-only 组件包装，SSR 时跳过
- 从构建产物（路径 B 的静态 JSON）中做初始数据灌入后，后续走 IndexedDB 持久化

## 统一架构：文件即图

```
┌──────────────────────────────────────────────────┐
│                   用户浏览器                       │
│                                                    │
│  ┌──────────────────────────────────────────┐     │
│  │         Corpus 发现层 (UI)                │     │
│  │  标签云 · 共现图 · 路径探索 · 过滤器       │     │
│  └──────────────────┬───────────────────────┘     │
│                     │ 图数据消费                   │
│  ┌──────────────────▼───────────────────────┐     │
│  │           GraphAdapter 抽象层             │     │
│  │   (统一接口，可切实现)                     │     │
│  │   ├─ StaticJsonAdapter (路径 B 产物)      │     │
│  │   └─ GrafeoAdapter     (路径 C 产物)      │     │
│  └──────────────────┬───────────────────────┘     │
│                     │ 数据管线                     │
│  ┌──────────────────▼───────────────────────┐     │
│  │  构建时索引生成 / 运行时图数据导入          │     │
│  │  Markdown → frontmatter解析 → graph index │     │
│  └──────────────────────────────────────────┘     │
└──────────────────────────────────────────────────┘
         ▲                        ▲
         │ git push               │ IndexedDB
         │ (SSOT)                 │ (衍生缓存)
    ┌────┴──────┐          ┌──────┴──────┐
    │  Flat      │          │  GrafeoDB   │
    │  Files     │          │  (运行时)   │
    │ (原始数据) │          │  (查询缓存) │
    └───────────┘          └─────────────┘
```

核心原则：**文件系统是单一事实来源（SSOT），图是衍生视图（Derived View）**。
- `git push` 触发构建，构建重新生成图索引
- 运行时 GrafeoDB 作为查询缓存层，数据从 SSOT 导入后保持同步
- 用户始终可以回到文件系统直接编辑，不受图数据库锁定

## 路径对比

| 维度 | 路径 A (关系元数据) | 路径 B (构建时索引) | 路径 C (WASM 图 DB) |
|------|---------------|---------------|----------------|
| 基础设施 | 无 | Vite 插件 | `@grafeo-db/web` |
| 查询能力 | 手动 / grep | 预定义的静态查询 | 完整 Cypher |
| 交互性 | 无 | 静态图浏览 | 动态过滤/探索 |
| 实现复杂度 | 极低 | 低-中 | 中 |
| 实时性 | 文件编辑后即时 | 需下次构建 | 运行时 |
| 对现有系统影响 | 无 | 无（纯新增） | 需要前端集成 |
| 数据量限制 | 无 | 无 | IndexedDB ~500MB |
| 渐进可逆性 | 随时可开始 | 随时可移除 | 需要评估稳定性 |

## 建议的渐进路线

1. **当前即可开始**：在核心笔记（高频引用/跨领域衔接点）的 frontmatter 中试验 `relations` 字段。结构可简化为 `target + type`，类型用动词或介词：「influenced-by」「references」「extends」「opposes」「example-of」。零成本，随时可停止。

2. **近期**：实现构建时图索引生成脚本（路径 B）。输出 JSON 在 `dev` 阶段即可预览 corpus 全量标签图，帮助发现结构问题。以 `d3-force` 或 `Cytoscape.js` 做基础图浏览。

3. **评估 GrafeoDB 成熟度**：跟踪 `@grafeo-db/web` 版本稳定度和 Vue 集成的 API 变化。当 corpus 的发现层交互需求明确（标签组合过滤、路径探索等），再做路径 C 的引入决策。

4. **维持「文件即 SSOT」原则**：无论选择哪条路径，确保图索引始终可以从文件系统完整重建。不要出现「数据在 GraphDB 里但找不回来」的情况。

## 参考

- [markedup](https://github.com/Clarit-AI/markedup) — Go 实现，从 Markdown frontmatter 构建可查询知识图谱
- [GrafeoDB](https://grafeo.dev/) — Rust 编写，WASM 浏览器内图数据库，支持 Vue 集成
- [LadybugDB/Kuzu-WASM](https://zenn.dev/toyb0x/articles/d9288185baecdc) — 280K 节点浏览器内 Cypher 查询 8-20ms
- [LoraDB](https://loradb.com/) — 嵌入式图引擎，进程内 Cypher
- Foam ([foam.md](https://foam.md/)) — VS Code 内 Markdown 知识图谱，MCP 接口
