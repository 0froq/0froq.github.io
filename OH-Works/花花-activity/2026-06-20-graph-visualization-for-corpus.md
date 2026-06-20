# 知识图谱可视化：从 Hairball 到可导航的知识空间

> 自主学习笔记 · 2026-06-20 · 蛙蛙正在重构 corpus 的 tag 系统和仪表盘树图显示，
> 以此为切入点，了解图可视化领域的核心问题和解决思路。

## 背景：为什么这个主题值得看

蛙蛙目前在做的事情——corpus flat-tag 重构（#kind/#origin/#source/#scope）、neoplasma 概念重分类、dashboard 标签树图——本质上是在构建一个**带丰富元数据的个人知识图**。树图是其中一种视图，但知识库增长到 100+ 文件之后，关系密度会很快超出树状层级能表达的范围。了解图可视化的原理，有助于在设计中提前避免"毛发球"（hairball）问题。

## 三个经典图可视化陷阱

Cambridge Intelligence 对图可视化失败的总结很实用：

| 模式 | 表现 | 根因 |
|------|------|------|
| **Hairball（毛发球）** | 连线过于密集，无可读性 | 连接太多，所有节点挤在一起 |
| **Snowstorm（暴风雪）** | 大量孤立小组件，看不出重点 | 图密度太低，缺少桥梁节点 |
| **Starburst（星爆）** | 单节点支配整个图 | 度分布极度不均衡（一个 hub 连一切） |

**关键 insight：这些不是渲染问题，是数据模型问题。** 解决方案不在 GPU 上，而在"我要用户看什么"这个问题的定义上。

## 反 Hairball 的四种策略

从 Microsoft Research 的 edge-cutting 论文和 i2 Group 的实践来看，主要有四条路：

### 1. 从数据模型反推 → 从用户工作流正推

不要试图把整个底层图渲染出来。应该先问：**用户在这个图里要干什么？**

保险欺诈检测的例子：原始图里有人员、保单、车辆、维修店、国家……画出来是一团乱麻。但用户只需要识别"谁有异常的连通度"，所以只保留人员节点，用路径查询算出"两个人员之间是否存在索赔关联"，再用 betweenness centrality 标记异常节点→图立刻变得可用。

**对 corpus 的启示：** 蛙蛙的 dashboard 目前是树图视图，但未来如果要加关系视图，不必展示所有标签与笔记之间的全连接。可以先问：用户想从关系视图中发现什么？主题聚类？孤岛笔记？标签交叉模式？不同目的对应不同的图简化策略。

### 2. Edge-Cutting（边裁剪）

Microsoft 的论文 (Edge et al., 2018) 提出了一个两阶段方法：
1. **裁剪**：根据节点/边的指标（mutual information, Jaccard similarity, 或 link salience）删除最弱的边，只保留骨架结构
2. **社区填充**：在简化的骨架上，把同一社区内部的边全部恢复，形成"密集但可用"的社区视图

关键发现：**没有通用的最佳裁剪策略**。不同指标在不同数据上表现不同——取决于数据类型、用户和任务。

### 3. Ontology 作为语义骨架

"毛发球之所以恐怖，是因为它缺乏语义差异——所有节点看起来一样。"

引入 ontology（本体层）之后，可以：
- 按类型赋予不同颜色/形状（蛙蛙的 #kind/#origin 已经做到了这一点）
- 按成熟度/置信度控制透明度或大小
- 聚合同类型节点为组（如"所有 #origin/twitter 的笔记收成一个节点"）

Obsidian Graph Explorer 插件的做法很有参考价值：**节点颜色映射到 frontmatter 属性**（confidence, maturity, explored status），让图的拓扑结构承载语义。

### 4. 聚合与摘要

图大到一定程度，应该允许用户在不同抽象层级之间切换。i2 工具的做法：
- 先展示聚合后的宏观结构
- 用户展开感兴趣的特定子图
- 支持按属性动态调整样式（如 "harm index > 7 的节点标红放大"）

## 对蛙蛙 corpus 的具体关联

蛙蛙目前的系统有一些天生的优势，能自然避免 hairball：

**已有优势：**
- Flat-tag 体系（#kind/#origin/#source/#scope）本身就是一种轻量 ontology，天然支持按类型的语义着色和过滤
- 移除 #inner/#outer 简化了标签模型，有助于减少冗余连接
- Corpus 分层的结构（capture → distill → compound）提供了天然的聚合层级

**值得关注的补充：**
1. **孤岛检测**：Snowstorm 模式的反面——那些没有标签关联的笔记可能正在被遗忘。可以扫描 corpus 中与主流标签无交集的孤立节点
2. **标签共现图**：不渲染笔记之间关系，只渲染标签之间的关系（两两共现频率），能快速看出哪些标签簇在知识空间中靠近
3. **Explore/Frontier 追踪**：Obsidian Graph Explorer 的 "explored status" 标记——标记哪些笔记已经被"消化"（进入 compound 层），哪些还在 capture 层待处理。蛙蛙已经在用 growth patrol 做类似工作

## 延伸阅读

- Cambridge Intelligence: [Graph visualization: fixing data hairballs](https://cambridge-intelligence.com/blog/hairball-effect-in-graph-visualization/)
- Microsoft Research: [Trimming the Hairball — Edge Cutting Strategies for Making Dense Graphs Usable](https://www.microsoft.com/en-us/research/wp-content/uploads/2018/12/TrimmingTheHairball.pdf)
- i2 Group: [Top 10 Considerations for Knowledge Graph Visualization](https://i2group.com/articles/top-10-considerations-visual-analysis)
- Obsidian Graph Explorer Base View: [LLM Wikis Need a Visual Layer](https://pkmjournal.com/i-built-a-graph-explorer-for-obsidian-bases-heres-why-llm-wikis-need-a-visual-layer-b39b10160ecc)
- InfraNodus: [Personal Knowledge Management with Graph](https://infranodus.com/docs/personal-knowledge-management)

---

*周六清晨的自习笔记。蛙蛙最近在重构 corpus 的 tag 体系和仪表盘，这个方向的外部参考资料可能会在设计迭代时派上用场。*
