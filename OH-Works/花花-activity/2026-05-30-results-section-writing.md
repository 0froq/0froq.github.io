# 科学论文 Results 部分写作方法论

> 巡检自主学习 | 2026-05-30 21:00
> 背景：board 上 active 第一项「Results 初稿审阅优化」（inProgress, high priority）。本轮调研 Results 写作的最佳实践、常见陷阱和叙事结构，为 AI 初稿审阅提供隐性参考框架。

## 一、Results 部分的定位

**核心原则：Results ≠ Data。**

- **Data** = 实验/观测获得的原始事实（数字、测量值、统计量）
- **Results** = 对 data 的概括性陈述，告诉读者这些数据_意味着什么模式_
- 反例：只给数字不给概括 = 「有 data 无 results」；只说「显著增加」不给数值 = 「有 results 无 data」
- 好做法："Mean fasting blood glucose was significantly higher in patients with type 2 diabetes than in non-diabetic subjects [180 (20) vs. 95 (5) mg/dL, P = 0.010]"——一句话中 results（陈述方向+显著性）+ data（具体数值）都在

**Results 不是 Discussion。**这是最高频的错误：在 Results 中解释_为什么_、_与前人研究对比_、_推测机制_。Results 只回答「我们发现了什么」，Discussion 回答「这意味着什么」。混在一起的代价：审稿人无法区分你的客观发现和你的主观解读。

## 二、最常见的五大错误

（来源：Bahadoran et al. 2019, _Int J Endocrinol Metab_ + hcommons.org 2026）

### 错误 1：在 Results 中掺入解读和讨论

- 表现：用因果解释（"this occurred because…"）、与前人比较（"consistent with Smith et al…"）、理论推测
- 排查方法：逐段扫描，找到任何含解释性动词（suggest, indicate, imply, demonstrate, reveal）或评价性形容词（remarkable, interesting, surprisingly）的句子——大概率该移到 Discussion

### 错误 2：缺乏清晰的结构

- 表现：按实验执行顺序无分级地罗列数据，读者不知道哪些是核心发现
- 解决方法：**先规划结构再写。** 四种组织方式：
  1. **按研究问题/假设顺序**（最常见，推荐）
  2. **由总到分**（先全局模式，再局部细节）
  3. **由最重要到最次要**
  4. **按方法/实验分组**（chronological）

### 错误 3：表格和图表使用不当

- 表现：text 里全量重复 table 里的每一个数字，或者反过来只放 figure 不加文字总结
- 原则：text 点出最重要发现并指引读者看图/表，图表承载精确数据和模式。**text 不应逐字重复图表内容，而应概括其核心信息。**

### 错误 4：语言模糊、用词不精确

- 典型问题：用 "significant" 不标注 p 值、"most participants" 不给出比例、"considerable improvement" 不给效应量
- 原则：能量化就量化。报告 exact p-values（不止 p<0.05），给出 effect size 和 confidence interval，保持术语一致性

### 错误 5：选择性报告或塞入无关数据

- 表现：只报支持假设的结果、隐去 null/negative findings；或者反其道行之，把全部分析结果都塞进主文
- 原则：与研究问题直接相关的所有结果（无论方向）都应呈现；次要/探索性分析放入 Supplementary Materials

## 三、Results 写作的 12 条实操要点

（来源：San Francisco Edit 2026 + Bahadoran et al. 2019）

| #  | 要点                       | 说明                                                             |
| -- | -------------------------- | ---------------------------------------------------------------- |
| 1  | 只用过去时                 | "Participants showed improvement"，不是 "show"                   |
| 2  | 只呈现发现，不含解读       | 这是 Results 的宪法                                              |
| 3  | 从最宏观的发现开始         | 先大局后细节，帮助读者建立心理框架                               |
| 4  | 顺序匹配 Methods           | 与方法部分的实验/分析顺序对齐，审稿人最舒服                      |
| 5  | 包含 negative results      | 不利结果同样重要，选择性报告损害研究完整性                       |
| 6  | 次要细节放附录             | 保持主文聚焦于核心研究问题                                       |
| 7  | 善用图表                   | 精确数值→table，趋势/对比/模式→figure                            |
| 8  | 正确报告统计               | exact p-values + effect size + CI + sample size                  |
| 9  | 不要在正文重复表中每个数字 | text 概括关键发现，table 承载全量数据                            |
| 10 | 定性结果按主题组织         | 非定量研究按 emergent themes 分组                                |
| 11 | 使用子标题                 | 长 Results 必须分段，利于导航                                    |
| 12 | 保持精炼                   | 典型篇幅：2-3 页双倍行距（~1000 words），4-9 段，每段 ~130 words |

## 四、科学叙事结构（Scientific Storytelling）

（来源：Anna Clemens, _Scientific Storytelling Framework_）

将 Results 嵌入论文整体的叙事弧：

```
角色 (Character) = 研究对象（湖泊/变暖/断点）
场景 (Setting)  = 研究背景（Introduction）
张力 (Tension)  = 知识缺口（Introduction 后半 + 用 "however/despite/but" 引入）
行动 (Action)   = 你的发现（Results）——逐步解决张力
高潮 (Climax)   = 核心结论（Conclusions）
收尾 (Resolution)= 意义+局限+展望（Discussion/Outlook）
```

三个额外叙事要素：

- **一条主线贯穿始终**：如果不能用一句话总结论文核心信息，说明主线还没找到
- **逻辑顺序 > 时间顺序**：不按你做实验的时序，按论证最有力的逻辑顺序
- **每个元素都有目的**：能被删掉而不损害论证的段落 = 该放 supplementary

## 五、气候/地球科学领域特有考量

（结合 hiatus 论文的实际需求）

### 5.1 地图类结果的呈现

- 每个 figure/facet 只聚焦一个 key message（IPCC 教训： policymakers 对多信息密度图理解困难）
- 地图 caption 必须自包含：变量名、单位、时间范围、色标含义
- 文字中不逐像素描述，而是总结空间模式（"warming was most pronounced in northern latitudes, with 72% of lakes above 50°N showing positive trends"）

### 5.2 时间序列断点检测的特殊叙事

- hiatus 论文的核心叙事是：**continental asymmetry + elevation gradient** 已构成硬骨架
- Results 组织建议：
  1. 先全球模式总览（多少湖泊有断点、断点时间分布）
  2. 再空间分异（continental asymmetry：北美 vs 欧亚、纬度梯度）
  3. 再 elevation 维度
  4. 最后 archetype 分类 / 特殊案例
- 从一般到特殊，从宏观到微观，符合读者认知路径

### 5.3 扩展数据/验证分析的呈现策略

- board 中「扩展数据验证 1994 边界效应」这类验证性分析：
  - 如果验证结果**支持**主要结论 → 可在主文中简要提及（1-2 句），详细放 Supplementary
  - 如果验证结果**动摇**主要结论 → 必须在主文中诚实讨论，不能隐藏
  - 这是 Lund et al. (2023) 的核心警告：**结论对假设敏感**，审稿人会关注稳健性检验

### 5.4 统计报告的学科惯例

- p 值：> 0.01 报告到 2 位小数，< 0.01 到 3 位，极小时 p < 0.001
- 趋势量：除了 p 值，必须报告趋势大小（℃/decade）和 CI
- 多比较校正：92,000 个湖泊的分析，p 值需要校正（Bonferroni 或 FDR），方法需要在 Methods 中声明并在 Results 中注明

## 六、AI 初稿审阅的实用检查清单

对应当前 board 任务「逐节审阅 AI 初稿，修正逻辑和表述问题」：

- [ ] 每个段落是否以一句 topic sentence 开头，概括该段核心发现？
- [ ] 是否存在 interpretation 混入？（"suggest"/"indicate"/"consistent with" 等词出现时应警惕）
- [ ] 是否对每个 figure/table 都有文字指向和概括，而非仅 "see Figure 3"？
- [ ] 数据是否同时出现在 text 和 table 中（重复）？——删掉 text 中的重复数字，保留概括
- [ ] 段落之间逻辑链是否连续？——读每段的末句和下一段的首句，看是否有断裂
- [ ] negative/null results 是否被诚实报告？
- [ ] 统计量（p、effect size、CI、n）是否完整且一致？
- [ ] 子标题是否清晰反映了论文的论证结构？
- [ ] 主线（continental asymmetry + elevation gradient）是否贯穿 Results 全程？
- [ ] 每句话如果删掉，是否会损害论证？如果不是，考虑精简或移入 supplementary

## 七、关键参考资料

- Bahadoran Z et al. (2019). The Principles of Biomedical Scientific Writing: Results. _Int J Endocrinol Metab_, 17(2): e92113. [PMC6635678]
- Lund R et al. (2023). Changepoint detection in climate data. _J. Climate_.
- Clemens A. _Scientific Storytelling Framework_. https://annaclemens.com/blog/story-structure-scientific-paper/
- San Francisco Edit (2026). 12 Key Tips for Writing a Strong Results Section. https://www.sfedit.net/12-key-tips-for-writing-a-strong-results-section/
- Bruine de Bruin W et al. (2024). Improving figures for climate change communications. _Climatic Change_, 177(4).
