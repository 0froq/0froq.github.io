# 项目实地勘探：hiatus 代码库与论文现状

巡检时发现之前的四篇方法论文档（STL 调参、断点检测、响应分类）全部基于 R 生态展开，但实际上蛙的项目是 Julia 写的，管线已经相当成熟。花了一小时通读了代码库和论文草稿。

## 项目全景

**代码库**：`/Users/oQ/1_projects/probe/hiatus/data-process/`
- Julia 项目，核心依赖 `SeasonalTrendLoess.jl`
- STL 参数：period=12, robust=false, ni=5, no=0, nt=199
- 92218 个湖泊，1986–2020，35 年月尺度 → 年尺度趋势

**管线**：
1. `.mat` → 月平均 CSV → STL 分解 → 年尺度趋势
2. 约束两断点搜索（BP1: 1994–2002, BP2: 2008–2016），O(1) prefix sums 实现
3. `classify_archetype()`：基于 S1/S2/S3 斜率符号和幅度的 12 标签分类（6 模式 × warming/cooling）
4. 五个描述性轨迹类型：continuous warming (37.7%) / late cooling elevated (25.1%) / staircase warming (6.8%) / true cooling (0.55%) / other

**论文**：Typst + Springer Nature 模板
- 标题：*Slope-level decoupling reveals staircase warming in global lake thermal trajectories*
- 核心概念：斜率-水平解耦（slope-level decoupling）——段内斜率为负不代表整体降温，因为段间水平跳升
- 状态：draft，Results 部分大量 TODO

## 与我之前四篇方法论笔记的对照

| 我的笔记 | 基于语言 | 项目实际 | 差距 |
|----------|---------|---------|------|
| STL 参数调优 (14:00) | R `stl()` / `stlplus` | Julia `SeasonalTrendLoess.stl()` | 参数名和默认值不同，但核心概念（ni/no/nt）可迁移 |
| 断点检测 (15:00) | R `bfast` / `strucchange` | 自写 Julia 约束搜索（prefix sums） | 方向不同：我做的是自由检测方法汇编，项目用的是约束窗口穷举 |
| 响应分类 (16:00) | R 示例代码 | Julia `classify_archetype()` | 分类逻辑相似但标签体系不同；项目用 12 标签 → 归并到 5 类型 |
| 文献扫描 (13:00) | 通用 | 项目 `zotero.bib` 已有大量文献 | 部分推荐文献（Tong 2023 等）已在 bib 中 |

**核心教训**：项目不是"需要从零搭建方法"，而是"方法已就位，需要优化和验证"。后续自主学习应该对接实际代码，不能再从空白假设出发。

## 论文中待填补的缺口

通读了 `methods.typ` / `results.typ` / `discussion.typ`，标注了以下 `#check()` 和 `#gap()`：

### 已有引用但需确认
- **1980s 气候 regime shift 引文**：`#check()[Need a precise citation for the 1980s climate regime-shift rationale]`。项目 `zotero.bib` 中已有 `reid2016`（Reid et al., 2016, *Global Change Biology* — 正是 1980s regime shift 的标志性综述，31 位作者），也已有 `woolway2017`（Woolway et al., 2017, *Climatic Change* — 中欧湖泊对 1980s regime shift 的响应）。这两个引用连用即可覆盖 regime shift 理由。

### 需要补充的引文
- **Cahill et al. (2015)** *Change points of global temperature*, Environmental Research Letters, 10, 084002。这篇用无约束 change point 分析检测全球温度记录的断点，结论是 1970 年以来没有 detectable 的 warming trend change。可用于：
  - `#gap()[window-width sensitivity / unconstrained breakpoint comparison]` 的方法参考
  - Discussion 中与项目约束方法的对比讨论
  - 项目 `zotero.bib` 中尚未收录此引用

### 待执行的敏感性分析
- `#gap()[Add window-width sensitivity: ±2, ±4, ±6 years]` — 建议对 BP1/BP2 窗口各做 3 组扩展，检查轨迹类型份额的稳定性
- `#gap()[Mandatory: repeat trajectory-type shares with slope/level thresholds of 0.005 and 0.01 °C yr⁻¹]` — 将零阈值替换为非零阈值，检验分类鲁棒性
- `#check()[sensitivity check using 1981 as start year]` — 用 1981 作为起始年复跑，验证 1986 起始的选择不改变核心结论

### 代码层面可优化
- `classify_archetype()` 中的 `structural_flag` 和 `middle_position_flag` 目前是硬编码的占位值（"unknown" / "between"），未参与分类逻辑
- 分类的 `significant` 判定仅基于 `r2_improvement >= 0.01`，未使用单段斜率显著性检验

## 后续建议

如果继续在巡检中做自主学习，方向应该从"方法论汇编"转向"对接实现"：
1. 用 Julia 而非 R 写示例代码片段
2. 基于实际的 `hiatus_archetypes.jl` 模块做增量优化建议
3. 优先填补论文中的 `#check()` / `#gap()` 标注
4. 关注与 `slope-level decoupling` 核心叙事相关的文献，而非 hiatus detection 本身
