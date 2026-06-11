# 湖泊对 warming hiatus 的响应原型分类：方法与框架

巡检时搜索整理。这是断点检测（见 `2026-05-28-breakpoint-detection-methods.md`）的下一步：在确认三段断点后，如何对每个湖泊的响应模式做系统性分类。

## 背景：Winslow et al. (2018) 的基准做法

Winslow et al. (2018, ERL) 是目前最直接研究「湖泊如何响应 warming hiatus」的文献。

**设计**：

- 155 个全球湖泊，1985–2009，夏季均值
- 使用**预设断点**（1998 年，即已知 hiatus 起始年），而非算法检测
- 对比两段：pre-hiatus (1985–1998) vs hiatus-overlap (1998–2009)
- 趋势用 Sen's slope（非参数 Theil-Sen 估计器），判断每段趋势是否显著
- 核心结论：83% 湖泊 pre-hiatus 升温速率快于 hiatus 期间；hiatus 期间整体趋势不显著

**局限**（对 froQ 的研究而言）：

1. 只有两段（pre vs during hiatus），没有 post-hiatus 段。froQ 的数据可能已覆盖 2012 年后，需要三段分析。
2. 断点是外生给定的（1998），而非从数据中检测。这对全球平均有意义，但对单个湖泊不够精确——不同湖泊的 hiatus 起始时间可能不同。
3. 只分析了「快/慢」二元比较，没有做响应原型的多类型分类。

## froQ 的场景

- 35 年月尺度 LSWT，覆盖 pre-warming → hiatus → post-hiatus
- 三步工作流：STL 分解 → 断点检测（bfast / strucchange）→ 响应分类
- 输出：每个湖泊的响应原型标签 + 三段趋势参数

## 分类方法选择

核心权衡：**可解释性 vs 复杂度**。froQ 的场景中，湖泊数量未知，但推测在数十到数百量级。这个规模下，规则分类和特征聚类都可行。

### 方案 A：规则分类（Rule-based）

基于三段趋势的斜率和显著性做 if-else 决策树。优势是完全可解释，每个类型有明确定义。

**扩展的类型体系**（在 4 型基础上增加混合型）：

| 类型       | pre-hiatus 趋势 | hiatus 趋势    | post-hiatus 趋势 | 物理含义                     |
| ---------- | --------------- | -------------- | ---------------- | ---------------------------- |
| 持续升温   | + 显著          | + 显著         | + 显著           | 全程升温，hiatus 未打断      |
| 典型停滞   | + 显著          | 不显著         | + 显著           | 经典 hiatus 响应：暂停后恢复 |
| 减速未停   | + 显著          | + 显著（减小） | + 显著（恢复）   | 速度下降但未到零             |
| 永久降温   | + 显著          | − 显著         | − 显著           | 持续降温（罕见，需核查数据） |
| 降温后恢复 | + 显著          | − 显著         | + 显著           | hiatus 期间反转，之后恢复    |
| 无响应     | 不显著          | 不显著         | 不显著           | 全程无显著趋势               |
| 延迟响应   | 不显著          | + 显著         | + 显著           | 升温从 hiatus 期间才开始     |
| 加速升温   | + 显著          | + 显著（增大） | + 显著           | 全程加速（罕见，需核查）     |

**实现**：R 中可直接用 `dplyr::case_when()` 或 Python 中用 `np.select()`。先做显著性判断（p < 0.05），再做斜率比较。

**斜率比较的定量化**：不能只看正负。可以用「变化幅度」判断减速/加速：

```
δ₁₂ = (slope_hiatus − slope_pre) / |slope_pre|
δ₂₃ = (slope_post − slope_hiatus) / |slope_hiatus|
```

设定阈值（如 |δ| > 0.3 视为有意义的变化），避免将噪声波动误判为类型转变。

### 方案 B：特征聚类（Feature-based clustering）

从每个湖泊的三段趋势中提取特征向量，然后用聚类算法分组。优势是能发现规则分类遗漏的自然分组。

**特征设计**：

```
[slope_pre, slope_hiatus, slope_post,        # 三段斜率
 δ₁₂, δ₂₃,                                    # 变化幅度
 p_pre, p_hiatus, p_post,                     # 显著性
 breakpoint_1_year, breakpoint_2_year,         # 断点年份
 mean_temp, temp_range,                        # 温度基线
 latitude, elevation, area]                    # 地理协变量（可选）
```

**聚类算法**：

- **k-means**：简单直观，需预先指定 k。用 elbow/silhouette 确定 k。
- **Hierarchical clustering**：不预设 k，输出树状图便于探索。Ward's method + Euclidean distance 是稳妥起点。
- **Gaussian Mixture Model (GMM)**：允许软分类（概率隶属），比 k-means 灵活。

**注意事项**：特征之间尺度差异大（slope 是 10⁻² °C/yr，p 是 0~1），必须先标准化（z-score）。

### 方案 C：轨迹聚类（Trajectory-based clustering）

不对原始序列做特征提取，直接用序列形状相似性做聚类。适合发现「形状相似但数值不同」的响应模式。

**距力度量**：

- **DTW (Dynamic Time Warping)**：允许时间轴伸缩，对断点位置略有差异的湖泊很友好。R 包 `dtwclust`。
- **k-Shape**：专门为时间序列聚类设计的算法，基于互相关（cross-correlation）距离。在 `dtwclust` 中也可用（设置 `distance="sbd"`, `centroid="shape"`）。
- **Euclidean**：最简单，但要求序列长度和相位严格对齐。

**适用场景**：如果 froQ 的湖泊断点年份差异很大（比如有些湖 hiatus 始于 1998，有些始于 2002），DTW 可以通过 warping 对齐这些偏移，聚类出「响应形状相似」的组。如果断点年份差异小，直接用对齐后的三段斜率做特征聚类更简单。

### 方案 D：功能数据分析（Functional Data Analysis, FDA）

将离散时间序列转化为连续函数（B-spline 或 Fourier 基展开），然后对函数做聚类或主成分分析。R 包 `fda`、`funHDDC`。

**优势**：处理不规则采样天然优雅；可以同时分析一阶导数（趋势速度）和二阶导数（加速度）。

**局限**：概念门槛高，解释难度大。对月尺度规则数据优势有限（因为已经有很好的离散方法）。

## 推荐工作流

考虑到 froQ 需要的是**可解释、可发表**的结果，推荐分两层：

### Layer 1：规则分类（发表用）

用方案 A 的扩展 8 类型体系，给每个湖泊一个明确的响应标签。这是论文的主分类。

### Layer 2：特征聚类（探索用）

用方案 B 做 k-means（k=4~6），对比规则分类的结果，检查：

- 是否有规则分类遗漏的自然分组？
- 规则分类的边界是否合理？
- 哪些特征对分组贡献最大？

Layer 2 的结果可以放在 supplementary material 中，增强结论的稳健性。

### Layer 3（可选）：轨迹聚类可视化

用 DTW 距离做层次聚类并画树状图，直观展示湖泊响应模式的整体结构。

## 实施细节

### R 实现（规则分类）

```r
lake_types <- lakes %>%
  mutate(
    type = case_when(
      # 持续升温
      p_pre < 0.05 & p_hiatus < 0.05 & p_post < 0.05 &
        slope_pre > 0 & slope_hiatus > 0 & slope_post > 0 ~ "持续升温",
      # 典型停滞
      p_pre < 0.05 & p_hiatus >= 0.05 & p_post < 0.05 &
        slope_pre > 0 & slope_post > 0 ~ "典型停滞",
      # ... 依次定义其他类型
      TRUE ~ "未分类"
    )
  )
```

### R 实现（特征聚类）

```r
library(factoextra)

features <- lakes %>%
  select(slope_pre, slope_hiatus, slope_post, delta_12, delta_23) %>%
  scale()  # z-score 标准化

# 确定最优 k
fviz_nbclust(features, kmeans, method = "silhouette")

# k-means
km <- kmeans(features, centers = 4, nstart = 25)
lakes$cluster <- km$cluster
```

### R 实现（DTW 聚类）

```r
library(dtwclust)

# series_list: list of time series, each element is a lake's detrended series
pc_dtw <- tsclust(
  series_list,
  type = "hierarchical",
  k = 6,
  distance = "dtw_basic",
  control = hierarchical_control(method = "ward.D2")
)

plot(pc_dtw)
```

## 相关文献

| 文献                                | 方法                   | 场景                            |
| ----------------------------------- | ---------------------- | ------------------------------- |
| Winslow et al. (2018, ERL)          | 两段对比 + Sen's slope | 全球 155 湖，预设断点           |
| Maberly et al. (2020, Nature Comms) | k-means 聚类 9 热区    | 全球 732 湖，季节性温度模式分类 |
| Sullivan et al. (2025, L&O)         | 层级聚类 6 类型        | 全球湖热状态转移分类            |
| Hegg et al. (2021, Ecosphere)       | DTW 时间序列匹配       | 生态序列聚类综述                |
| Sardá-Espinosa (2019, R Journal)    | dtwclust 包            | 时间序列聚类方法综述 + R 实现   |

## 与断点检测的衔接

断点检测（`2026-05-28-breakpoint-detection-methods.md`）的输出应包含：

- `breakpoint_1`, `breakpoint_2`（年份或索引）
- 三段各自的 Theil-Sen slope + p-value + confidence interval

这些直接作为分类的输入。如果使用 `strucchange::breakpoints()`，三段参数可从 `breakfactor()` 的分段回归中提取。如果使用 `bfast`，`bfastpp()` 的 `breakpoints` 输出可直接使用。

单独拎一个点：**断点检测失败了怎么办？** 有些湖泊可能根本检测不到显著断点（三段趋势无显著差异）。这种情况本身就是一个有意义的类别（"无断点" 或 "单调趋势"），不应丢弃，而应纳入分类体系。

---

_整理于 2026-05-28 16:00 巡检_
