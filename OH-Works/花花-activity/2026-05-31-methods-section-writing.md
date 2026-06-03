# Methods 部分写作方法论

> 巡检自主学习 | 2026-05-31 02:00
> 衔接前两轮：Results 写作（05-30 20:00）+ Discussion 写作（05-31 01:00），完成 IMRaD 三部曲
> 直接支撑 board 活跃任务：「补 methods/data 细节」

---

## 一、Methods 的定位与双重功能

Methods 是 IMRaD 结构中**连接 Introduction 与 Results 的十字路口**（Ghasemi et al. 2019）。它承载两个核心功能：

1. **让读者能够重复工作** — 提供足够的细节使得同等训练水平的科学家可以复现研究
2. **让读者相信工作是以恰当方式完成的** — 展示方法的严谨性，建立对结果的信赖

如果把 Methods 视为一份菜谱，它的配料是 **who, what, when, where, how, why**（Ghasemi et al. 2019）。

一个常被忽略但重要的认识：Methods 被称为「论文的心脏」，却也是最常被写砸的部分。约 **30% 的期刊拒稿与 Methods 部分有关**。这不是因为 Methods 难写，恰恰相反，是因为人们容易轻视它——觉得「只是描述做了什么」而草草了事。

---

## 二、Methods 的三段式 Move 结构

Cotos, Huffman & Link (2017) 对 30 个学科的 IMRaD 论文做了语步分析，将 Methods 部分归纳为三个核心 Move。这不是固定模板，而是帮助理解 Methods 叙事逻辑的框架。

### Move 1: Contextualizing Study Methods（研究方法情境化）

**占 Methods 约 5-15%**

为后续描述铺设背景：
- 交代方法论选择的依据，引用前人研究
- 提供相关的理论或经验信息，展示与研究领域的联系
- 重述研究目的、假设、或研究空白
- **命名方法论路径**（如 "We used a changepoint detection framework..."）
- 描述研究的物理场景（如 "The study covers 92,000 lakes globally..."）
- 介绍研究对象/数据来源
- 为实验前的选择提供理由

**关键作用**：Move 1 不是啰嗦，它告诉读者「为什么是这个方法而不是别的方法」，建立方法论决策的可信度。

### Move 2: Describing the Study（描述研究过程）

**占 Methods 约 55-85%，是 Methods 的主体**

这是「怎么做」的核心：
- 解释数据如何收集、采样或筛选
- 描述数据特征（时间跨度、空间分辨率、缺失情况）
- 明确因变量和自变量
- 按步骤描述研究流程
- 为每个步骤提供理据
- 描述使用的工具（软件、版本、参数）

**操作准则**：每个段落/子标题应与 Results 中对应的段落/子标题对应。读者读完 Methods 的某部分，应该能定位到 Results 中相应的发现。

### Move 3: Analyzing Data（分析数据）

**占 Methods 约 10-30%**

陈述从原始数据到结果的完整推理链：
- 数据预处理的步骤
- 分析方法（含统计方法、模型、参数选择）
- 敏感性分析
- 数据处理/分析选择的理由

**关键陷阱**：Move 2 和 Move 3 的边界是模糊的。区分标准是：**Move 2 描述「拿到的数据什么样」，Move 3 描述「拿数据做了什么推演」**。

---

## 三、气候/地球科学 Methods 的特有考量

### 3.1 数据描述的四层精度

气候科学论文的 Methods 需要一种「俄罗斯套娃」式的数据描述精度，每往内一层要求更高：

| 层级 | 内容 | 示例 |
|------|------|------|
| L1 宏观来源 | 数据产品名称、版本、机构 | ERA5-Land reanalysis (ECMWF, Hersbach et al. 2020) |
| L2 时空参数 | 分辨率、时间跨度、覆盖范围 | 0.1° × 0.1°, hourly 1950-2023, global land surface |
| L3 变量及处理 | 提取了哪些变量、做了什么预处理 | lake skin temperature (skt), monthly means from hourly |
| L4 不确定性 | 已知偏差、验证、质量标记的使用 | bias vs. buoy measurements ~0.1K (Schneider & Hook 2010) |

常见的 Methods 拒稿原因是只写到 L1-L2，缺了 L3-L4。

### 3.2 可复现性与 Geoscience Paper of the Future

Gil et al. (2016) 提出的 Geoscience Paper of the Future (GPF) 框架为 Methods 写作提供了三个现代标准：

1. **数据可复用** — 公开发布于有持久标识符（DOI）的仓库，含元数据和明确许可
2. **软件可复用** — 代码公开于版本控制平台（GitHub + Zenodo DOI），含文档和许可
3. **计算溯源可查** — 用工作流图或形式化工作流描述从数据到结果的完整链条

实践上，这对应 Methods 部分的新增需求：
- 数据的 **DOI 引用**（不仅是文字描述）
- 代码的**版本号 + DOI**
- 一个**工作流示意图**（flow diagram）比三页文字更直观

EGUsphere (2025) 的近期综述指出地学可复现性的三层障碍：
- **低垂果实**：用开放格式、开源语言和库（容易解决但常被忽略）
- **中度问题**：开放许可、充分文档、完整元数据（知道该做但没做）
- **棘手挑战**：大数据集的版本控制、长运行时间的 CI/CD、环境可移植性

### 3.3 遥感/再分析数据的特殊要求

对于使用卫星遥感和再分析数据的湖泊温度研究，Methods 需要额外说明：

- 传感器的**轨道参数和过境时间**（如 MODIS Aqua ~1:30 PM 升交点）
- **云掩膜**策略及对时间覆盖的影响
- 跨传感器**一致性校正**（如 ATSR→AVHRR→MODIS 的 harmonization）
- **与现场数据的验证** — 偏差、RMSE、趋势一致性
- 重分析数据的**同化方案版本**（如 ERA5 的 IFS cycle）

参考范式：Carrea et al. (2023, *Scientific Data*) 的 Lakes ECV 数据集论文的 Methods 部分，为每个变量（LSWT, LWL, LIC, LWLR）单独描述算法链、不确定性估计和质量标记。

---

## 四、Methods 写作的 12 条实操要点

综合 Ghasemi et al. (2019)、PLOS 写作指南、STROBE 声明和地学可复现性文献：

### 结构层面
1. **逻辑顺序优于时间顺序**：整体按逻辑分组（数据→方法→分析），但段落内按时间顺序
2. **子标题与 Results 对齐**：每个 Methods 子标题应能找到对应的 Results 子标题
3. **先总后分**：先给研究设计的概览，再展开细节。读者需要地图再需要街景
4. **图示优先**：流程图、决策树、检查清单作为视觉锚点，比纯文字更高效

### 精确性层面
5. **以失效为检测标准**：判断「这个细节够不够」的标准是——如果删掉这个细节，研究者能否复现？不能，就写
6. **软件信息三件套**：名称 + 版本 + 关键参数。不是 "we used Python" 而是 "we used Python 3.12 with scipy.stats.theilslopes v1.15.2"
7. **为每个变量定义**：暴露变量、结局变量、协变量、效应修饰因子 —— 全部明确定义
8. **引用方法论文献**：统计方法或分析技术如果不是本领域常识，给引用（也是建立可信度的方式）

### 诚实性层面
9. **不要隐藏约束**：不理想的方法选择、数据限制 —— 坦白比遮掩更能赢取信任
10. **写给你未来的自己**：想象你在不同机构、不同登录权限、不同软件环境下试图复现自己的分析，你会需要记下什么？
11. **敏感性分析单列**：不要埋在统计方法段落里。单独一节列出所有敏感性检验，使方法论的自省结构可见
12. **不要引用没读过的文献**：Methods 部分通常有 5-15 个引用。如果你引用了一个方法论文献，确信你读了它

---

## 五、常见错误与陷阱

| 陷阱 | 表现 | 后果 |
|------|------|------|
| 方法摘要化 | 只写概要，细节放附录且不可检索 | 审稿人和读者无法判断方法有效性 |
| 过度依赖记忆 | 认为「自己以后肯定记得怎么做」 | 论文发表 2 年后连自己都无法复现 |
| 方法与结果脱节 | Results 出现 Methods 未描述的分析 | 审稿人质疑分析的事后选择性 |
| 变量选择无解释 | 加了协变量但不说明为什么选这些 | 让人怀疑是 p-hacking 后补的 |
| 软件版本缺失 | 只说「用 R 分析」无版本号 | 无法复现，包的行为可能随版本变化 |
| 时间覆盖模糊 | 说「1985-2020 年数据」但不提缺失年份 | 读者误以为有完整连续的时间序列 |
| 缺少不确定性讨论 | 给出数据来源但不提已知偏差 | 审稿人质疑结果的可靠性 |
| Methods 变体套娃 | 每一段都「如 2.1 所述」引用自己 | 读者需要来回翻页才能理解一个方法 |

---

## 六、STROBE 作为自查清单

虽然 STROBE 是为流行病学观察性研究设计的，但它的 Methods 相关条目（Items 4-12）对任何观察性研究都有参考价值。针对湖泊温度 changepoint 检测论文，改编版自查如下：

| STROBE Item | 对应 hiatus 论文需要回答的问题 |
|-------------|-------------------------------|
| **4. Study design** | 研究设计是什么？（全球尺度观察性研究 + changepoint detection framework） |
| **5. Setting** | 时间范围、空间覆盖、数据时段？为什么选 1995-2020？ |
| **6. Participants** | 湖泊纳入/排除标准？（面积阈值、数据完整性要求）最终样本量多少？ |
| **7. Variables** | LSWT 趋势如何定义？changepoint 如何定义？archetype 分类标准？ |
| **8. Data sources** | ERA5-Land / satellite 的具体版本？每个变量的测量/提取方法？ |
| **9. Bias** | 云覆盖偏差如何处理？传感器间偏差如何纠正？湖泊选择偏差？ |
| **10. Study size** | 为什么是 92,000 个湖泊？样本量是否足够检测特定效应量？ |
| **11. Quantitative variables** | 连续变量如何分组？（纬度带、面积等级、海拔带）为什么这样分？ |
| **12. Statistical methods** | 所有统计方法的完整描述？缺失数据处理？敏感性分析？ |

---

## 七、映射到 hiatus 论文的 Methods 蓝图

基于以上框架，hiatus 论文的 Methods 部分建议结构：

### 7.1 建议子章节

```
2. Methods
  2.1 Study design and overview
      - 全球尺度观察性研究
      - changepoint detection + archetype classification 双步框架
      - 附工作流总图（data → LST extraction → STL → CP → archetype）
  
  2.2 Lake surface temperature data
      2.2.1 ERA5-Land reanalysis
             - 产品描述、版本、时空分辨率
             - 变量提取：lake skin temperature (skt)
             - 已知偏差与验证（引用 Schneider & Hook 2010 等）
      2.2.2 Lake selection and filtering
             - 面积阈值（如 >1 km²）
             - 数据完整性要求（如至少 20 年有效数据）
             - 排除标准与最终样本量
  
  2.3 Trend decomposition
      - STL 分解方法及原理简述
      - 参数选择及理由（trend window / seasonal window / low-pass）
      - 长期趋势的提取与不确定性
  
  2.4 Changepoint detection
      - 约束断点搜索方法描述
      - 参数：最大断点数、最小段长、显著性阈值
      - 1994 边界效应的处理策略（扩展数据验证）
  
  2.5 Archetype classification
      - 分类标准：slope-level 解耦
      - 四类/八类原型定义
      - 分类后的验证策略
  
  2.6 Sensitivity analyses
      - 断点数量敏感性
      - 参数窗口大小敏感性
      - 时间范围敏感性（含 1994 边界效应验证）
      - 湖泊面积/纬度分层敏感性
  
  2.7 Code and data availability
      - 代码仓库 + DOI（Zenodo）
      - 数据来源及获取方式（ERA5-Land 公开可获取）
      - 分析语言与关键包（Julia + 版本号 + 关键依赖）
```

### 7.2 关键写作策略

1. **2.1 节放工作流图**：一张涵盖「数据→STL→CP→分类→敏感性分析」的总图，后续各节是这张图的逐项展开。审稿人翻到 Methods 第一页就能理解整个管线。

2. **2.4 与 2.5 是方法论创新点**：这两个子章节需要额外篇幅和引用密度。不仅要描述怎么做，还要解释为什么这个框架比其他框架（如 Bayesian CP regression、BFAST）更适合本研究的科学问题。

3. **2.6 敏感性分析单列一节**：这是现代气候科学研究论文的标志。Lund et al. (2023) 特别警告「结论对假设敏感」是审稿人最常攻击的点。敏感性分析提前回应了这些潜在质疑。

4. **每个子章节末尾给一句过渡**：Methods 不是零件清单。每节结尾用一句将当前方法连接到它服务的科学问题（例如 "This decomposition isolates the secular warming signal from seasonal and interannual variability, enabling robust changepoint detection in Section 2.4"）。

---

## 八、AI 初稿审阅的 10 项 Methods 检查清单

针对「补 methods/data 细节」这个活跃任务，从 AI 产出的现有初稿出发：

1. [ ] 数据来源是否给出了精确的产品名称和版本号（不是 "ERA5" 而是 "ERA5-Land, ECMWF, Hersbach et al. 2020"）？
2. [ ] 湖泊筛选标准是否可复现？（面积、数据年限、缺失值容忍度）
3. [ ] 每个关键变量是否有完整定义？（什么是「趋势」、什么是「断点」、什么是「原型」）
4. [ ] STL 的三个窗口参数是否给出了具体值和选择理由？
5. [ ] Changepoint 检测的显著性阈值和约束条件是否明确？
6. [ ] Archetype 分类的每个类别是否有明确的操作性定义（不只是文字描述，而是可以被 Julia 代码执行的规则）？
7. [ ] 敏感性分析是否覆盖了所有关键的方法论选择？
8. [ ] 是否区分了「数据描述」和「分析方法」两个不同目的的段落？
9. [ ] 每个软件的版本号和关键依赖是否给出？
10. [ ] 数据和代码的可用性声明是否完整？（URL + DOI）

---

## 九、与 Results / Discussion 的衔接

Methods 不是孤岛。它与 IMRaD 其他部分的接口：

- **Methods → Introduction**：Introduction 提出了研究问题，Methods 回答「用什么手段回答这个问题」。Methods 的 Move 1（情境化）是 Introduction 的自然延续。
- **Methods → Results**：每个 Methods 子章节应对应 Results 的一个子章节。Methods 描述了「测量了什么、怎么分析的」，Results 呈现「测量和分析产出了什么」。
- **Methods → Discussion**：Methods 中描述的局限性（数据质量、方法假设、参数选择）是 Discussion 中 Limitations 节的素材来源。如果 Methods 诚实记录了约束，Discussion 就有坚实的限定基础。

---

## 主要参考文献

- Ghasemi, A., Bahadoran, Z., Zadeh-Vakili, A., Montazeri, S. A., & Hosseinpanah, F. (2019). The Principles of Biomedical Scientific Writing: Materials and Methods. *International Journal of Endocrinology and Metabolism*, 17(1), e88155. — 最全面的 M&M 写作综述
- Cotos, E., Huffman, S., & Link, S. (2017). A move/step model for methods sections: Demonstrating rigour and credibility. *English for Specific Purposes*, 46, 90–106. — 30 学科的语步分析
- Gil, Y. et al. (2016). Toward the Geoscience Paper of the Future: Best practices for documenting and sharing research from data to software to provenance. *Earth and Space Science*, 3(10), 388–415. — 地学可复现性标准
- EGUsphere (2025). Overcoming barriers to reproducibility in geoscientific data analysis. *EGUsphere Preprints*, 2025-5210. — 地学可复现性的最新综合
- STROBE Statement (Vandenbroucke et al., 2007/2014). — 观察性研究报告标准
- Lund, R. et al. (2023). Changepoint detection in climate and weather data. *Journal of Climate*, 36(14), 4725–4744. — 气候 changepoint Methods 的敏感性问题
- Carrea, L. et al. (2023). Satellite-derived multivariate world-wide lake physical variable timeseries for climate studies. *Scientific Data*, 10, 73. — 湖泊 ECV 数据集的 Methods 参考范式
