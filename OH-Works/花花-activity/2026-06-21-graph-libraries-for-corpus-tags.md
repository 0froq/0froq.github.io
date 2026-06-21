# 图可视化库选型：为 Corpus 标签系统做技术储备

> 2026-06-21 周日清晨 · 自主调研
>
> 基于 06-20 图可视化笔记的深入选型对比，聚焦可嵌入 Vitepress / 独立页面的交互式标签图。

## 为什么值得深究

蛙蛙的 corpus flat-tag 体系（400+ 活动笔记）天然是一张图——标签是节点，共现/层级/引用是边。纯列表/树状视图在规模上去后，浏览和发现成本会非线性增长。一个交互式标签图可以：

- **发现隐性聚类**：哪些标签总是一起出现，形成知识域
- **支持导航**：从「corpus」出发，看它连接了哪些子标签，再抵达具体笔记
- **辅助重构**：视觉上看到孤岛标签、过度连接的枢纽标签、不合理的长尾

## 选型全景（2026 年 6 月）

以下库均为 MIT 开源，按「从速原型」到「规模化方案」排列。

| 库 | 渲染方式 | 最大平滑节点 | 布局算法 | 交互 | 周下载 | 适合场景 |
|---|---|---|---|---|---|---|
| **vis-network** | Canvas | ~5K | 力导向 + 层级 | 拖拽/缩放/聚类/物理模拟 | ~200K | 最快原型，可交互网络图 |
| **Cytoscape.js** | Canvas | ~5K | 10+ 内置（含层级） | 拖拽/缩放/事件钩子 | ~500K | 图分析（最短路径/中心性/社区检测） |
| **G6 (AntV)** | Canvas/SVG/WebGL/3D | ~10K (Canvas) / ~50K (WebGL) | 15+ 内置（Dagre/层级/力导向/圆形/辐射） | 全套（拖/选/缩/框选/时间轴/小地图） | ~100K | **最全能的单库方案** |
| **Sigma.js + graphology** | WebGL | 100K+ | 通过 graphology 接入 | 基础交互（拖/滚） | ~50K | 超大规模图（>10K 节点） |
| **react-force-graph** | WebGL (Three.js) | ~50K | 仅力导向 | 基础交互，可 3D/VR | ~40K | 可视化展示但分析能力弱 |
| **Selma** | SVG (D3) | ~1K | 树/辐射/Miller Columns | 切换分类/标签过滤/导出 | — | **专门为层级分类法设计的应用** |

## 深度解读

### 直觉第一：vis-network

蛙蛙的风格是「先跑通再完善」。vis-network 是上手最快的：50 行代码出一个可交互的网络图，带物理模拟（节点自动排开、拖拽弹性、缩放平滑），DataSets 支持动态增删。

```js
import { Network, DataSet } from 'vis-network/standalone'

const nodes = new DataSet(tags.map(t => ({ id: t.name, label: t.name, group: t.domain })))
const edges = new DataSet(relations.map(r => ({ from: r.a, to: r.b })))

const network = new Network(container, { nodes, edges }, {
  physics: { solver: 'forceAtlas2Based', forceAtlas2Based: { gravitationalConstant: -40 } },
  groups: { corpus: { color: '#6ee7b7' }, dev: { color: '#60a5fa' }, writing: { color: '#f472b6' } },
})
```

适合：快速把 corpus 标签数据挂上去看看整体形状，找出明显的问题区域。

### 分析导向：Cytoscape.js

如果蛙蛙想从图结构中提取洞察——比如「哪些标签连接了最多不同领域」（介数中心性）、「从 corpus 到 specific 笔记的最短路径」、「标签的社区结构」——Cytoscape.js 有最丰富的内置算法。

```js
// 社区检测
const clusters = cy.elements().markovClustering()
// 中心性
const centrality = cy.elements().betweennessCentrality()
// 最短路径
cy.elements().dijkstra({ root: cy.getElementById('corpus') })
```

适合：重构前的图结构分析，量化标签体系健康度。

### 规模化方案：G6

如果这个标签图要变成 blog 的一个永久功能页面，G6 是目前最平衡的选择：

- **渲染灵活**：小图用 Canvas，大图切 WebGL，同一切换
- **布局丰富**：Dagre（有向层级图）、辐射树（mindmap 风格）、力导向、圆形——corpus 的层级 + 连接混合结构有对应方案
- **交互完整**：悬停提示、节点选中高亮、框选、交互式布局切换，全内置
- **React 生态**：有 Graphin（React 封装），未来如果需要嵌入 Nuxt/Vitepress 组件页，接入成本可控
- **文档好**：AntV 团队的中英文文档质量在国产库中属第一梯队

```js
import G6 from '@antv/g6'

const graph = new G6.Graph({
  container: 'mountNode',
  width: 1200, height: 800,
  layout: { type: 'dagre', rankdir: 'LR', nodesep: 30, ranksep: 100 },
  defaultNode: { type: 'rect', size: [120, 40] },
  modes: { default: ['drag-canvas', 'zoom-canvas', 'click-select'] },
})
graph.data({ nodes: tags, edges: relations })
graph.render()
```

### 专门工具：Selma

Selma 值得单独关注——它不是通用图库，而是为「做分类法浏览器」这个单一目标设计的。Miller Columns + 多分类切换 + Markdown 笔记预览 + DAG 支持，几乎就是蛙蛙 corpus 的另一种呈现形态。

```
┌──────────────────────────────────────────┐
│  corpus     │  dev          │  writing    │
│  ┌────────┐ │  ┌──────────┐ │  ┌────────┐ │
│  │ 湖泊   │ │  │ vue      │ │  │ blog   │ │
│  │ corpus │ │  │ typescript│ │  │ 翻译   │ │
│  │ ...    │ │  │ ...      │ │  │ ...    │ │
│  └────────┘ │  └──────────┘ │  └────────┘ │
└──────────────────────────────────────────┘
```

数据格式是 JSON（nodes.json + taxonomies/*.json），可以独立部署。如果蛙蛙考虑给 corpus 做一个独立的浏览界面而非嵌入 blog，Selma 可能是改造成本最低的方案。

## 工程建议

如果现在要落地，按这个优先级：

1. **vis-network 做原型**——把 tags 和共现关系扔进去，半天能看到 corpus 图的全貌，帮蛙蛙判断什么布局/交互模式适合
2. **根据原型结果选方案**：
   - 如果图分析需求强（标签聚类/异常检测）→ **Cytoscape.js**
   - 如果需要高性能 + 丰富交互 → **G6**
   - 如果只需要一个纯浏览界面 → **Selma 改数据源**
3. 技术约束：无需后端，纯前端 + JSON 数据源即可跑。corpus 的 tag 数据已结构化（label/group/weight 等字段），直接映射到库的数据模型。

## 关联资源

- [06-20 图可视化基础笔记](./2026-06-20-graph-visualization-for-corpus.md) — corpus 图的三种典型模式（hairball / snowstorm / starburst）
- [PkgPulse 2026 三库对比](https://www.pkgpulse.com/guides/cytoscape-vs-vis-network-vs-sigma-graph-visualization-2026)
- [Selma — Taxonomy Viewer](https://github.com/berangerthomas/Selma) (MIT, React + Vite)
- [G6 — AntV Graph Visualization Engine](https://g6.antv.antgroup.com/en) (MIT, 11K+ stars)
