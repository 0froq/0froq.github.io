# Cahill et al. (2015) 精读与 hiatus 项目方法论整合

续 17:00 项目实地勘探，本轮深入阅读 Cahill et al. (2015, ERL) 全文、Lund et al. (2023, J. Climate) 最佳实践，并精读 `hiatus_archetypes.jl` 和 `hiatus_detection.jl` 源码。

## 1. Cahill et al. (2015) 方法论详解

### 核心方法：Bayesian Change Point Linear Regression

**模型结构**：分段线性回归，段间强制连接（connected segments），不允许温度的水平跳变：

```
y_t = α + β_1(t - γ)    for t ≤ γ
y_t = α + β_2(t - γ)    for t > γ
```

其中 γ 是 change point 位置，α 是 CP 处的期望值，β₁、β₂ 是前后段的斜率。扩展到 m 个 CP 时，每段斜率独立但段间值连续。

**关键方法论选择**：

- **连接 vs 跳变**：明确拒绝 "stairway model"，理由是"thermal inertia of the system makes instantaneous temperature change physically implausible"。这对蛙的项目是核心对比点——湖温系统同样受热惯性约束，但论文论点恰好是斜率-水平解耦（slope-level decoupling），即段间存在水平跳升。
- **Bayesian 框架**：用 JAGS + MCMC，DIC 选择 CP 数量（m=0~5），CP 位置的先验是 uniform on [data range] with chronological ordering。
- **模型选择**：从 m=0~5 中选 DIC 最小的。收敛检查用 coda 包标准方法。

**核心发现**：

- 四条全球温度记录都支持 m=3 个 CP（~1912, ~1940, ~1970）
- 1970年以来没有 detectable warming trend change → "hiatus" cannot be statistically justified
- 强制在 1998 或 2001 加 CP 时，模型拟合几乎无差异，95% CI 重叠

### 与 hiatus 项目的方法论对比

| 维度        | Cahill et al. (2015) | hiatus 项目                                        |
| ----------- | -------------------- | -------------------------------------------------- |
| CP 数量确定 | DIC 自动选择 (m=0~5) | 固定 m=2，在约束窗口内穷举                         |
| 段间连续性  | 强制连续 (connected) | 不强制连续（允许 level jump）                      |
| 推断框架    | Bayesian (MCMC)      | Frequentist (OLS + breakpoint significance t-test) |
| 时间尺度    | 年尺度，1880–2014    | 月尺度 STL trend → 年尺度，1986–2020               |
| 分析单元    | 4 条全球序列         | 92218 个湖泊个体                                   |
| 核心叙事    | "hiatus 不存在"      | "hiatus 存在但被 staircases 掩盖"                  |

**关键启发**：

1. Cahill 的 connected segments 假设与项目的 slope-level decoupling 形成理论对话——湖泊系统内到底允不允许 level jump？论文需要在 Methods 中论证为何对湖温系统 level jump 是合理的（水柱热分层重组？冰盖损失导致秋冬热储量变化？）
2. Cahill 的 DIC 模型选择可直接作为敏感性分析：对所有湖跑 m=0~4 的 connected CP model，看在不受约束时系统是否会自动选择 m=2，以及选出的 CP 位置与约束窗口的重合度

## 2. Lund et al. (2023) 的关键方法论警告

这篇 J. Climate 综述是气候 time series changepoint 方法的权威指南，以下警告直接对应项目中 `#gap()` 标注的敏感性分析需求：

### 警告 1：Changepoint 结论对假设非常敏感

> "changepoint conclusions are not robust to small perturbations in assumptions; for example, allowing for a trend or correlation in the series can drastically change conclusions"

**对应项目**：项目的单段显著性仅依赖 `r2_improvement >= 0.01`（全局 R² 在加两个 CP 后的提升），没有做 per-segment slope significance 检验。这意味着即使某段的斜率没有显著偏离零，只要三段的 pooled R² 比一段高 0.01，分类就会被标记为 significant。这是一种脆弱判定——`#gap()` 中标注的 `slope/level thresholds of 0.005 and 0.01 °C yr⁻¹` 敏感性分析应能暴露这一弱点。

### 警告 2：Trend 和 correlation 会改变结论

> "allowing for a trend or correlation in the series can drastically change conclusions"

**对应项目**：项目的 `full_stl_nonrobust()` 用 non-robust STL 先行提取趋势，然后在趋势上做 CP 检测。STL 趋势的平滑度由 nt=199（即 trend window=199 个月 ≈ 16.6 年）控制。如果趋势的平滑度变了，断点位置和段内斜率也会变——这直接要求对 STL 参数做敏感性分析（`#gap()` 中尚未标注，但同样重要）。

### 警告 3：模型选择准则会影响 CP 数量

> 不同的信息准则（DIC, BIC, AIC, MDL）在同一数据上可能给出不同的 m

**对应项目**：项目固定 m=2 是合理的（基于 1998 和 2012 两个物理锚点），但 Discussion 中应该探讨如果让数据自由选 m，结果会否支持 m=2 的结论。这恰是 Cahill 的 DIC 方法可以用上的地方。

## 3. 源码分析：`classify_archetype()` 的改进空间

### 3.1 `structural_flag` 占位

当前实现：

```julia
# 在 classify_archetype() 函数体内
structural_flag = "unknown"
```

但在 `analyze_lake_series()` 中：

```julia
structural_flag = significant ? "significant" : "non_significant"
```

前者（classify_archetype 的返回值）被后者覆盖，所以运行时不使用占位值。但函数签名上 `structural_flag` 仍然是 12 个返回标签之一（shift/hiatus/acceleration/pulse/sustain/transition × warming/cooling），当此标签为 "structural"时可以区分物理过程，例如 `shift_warming` 与 `hiatus_warming` 都可能是 significant，但前者表示 regime change 而后者表示 temporary slowdown。

**建议**：在 `classify_archetype()` 内部直接根据斜率模式设定 `structural_flag`，而不是留占位符。例如：

- `shift_*` → "structural"
- `hiatus_*` → "temporary"
- `acceleration_*` → "structural"
- `pulse_*` → "temporary"
- `sustain_*` → "continuous"
- `transition_*` → "ambiguous"

### 3.2 `middle_position_flag` 占位

当前永远是 `"between"`。这应该是为后续分析的占位——可能是要区分 S2 段相对于 S1 和 S3 的水平位置（中间段温度在两端温度的水平面之上、之间、还是之下）。这对于 slope-level decoupling 叙事非常关键：一个 `hiatus_warming` 湖如果 middle_position 是 "elevated"（S2 水平高于 S1 末端但低于 S3 起点），那就是 staircase warming 的直接证据。

**建议**：实现 middle_position 的计算逻辑：

```julia
# 用段末/段初的水平面判断
S1_end_level = α₁ + β₁ * t_bp1  # S1 段在 BP1 处的值
S2_start_level = α₂ + β₂ * t_bp1  # S2 段在 BP1 处的值
S3_start_level = α₃ + β₃ * t_bp2  # S3 段在 BP2 处的值

if S2_start_level > S1_end_level + level_eps
    middle_position_flag = "elevated"
elseif S2_start_level < S1_end_level - level_eps
    middle_position_flag = "depressed"
else
    middle_position_flag = "continuous"
end
```

这个需要 `analyze_lake_series()` 或 `analyze_lake_trend()` 传入段拟合结果，不能仅在 `classify_archetype()` 内部完成。

### 3.3 `significant` 判定的单一性

当前：

```julia
significant = isfinite(bp_result.r2_improvement) && bp_result.r2_improvement >= 0.01
```

这仅检查了全局模型改进，未检验各段斜率是否显著非零。风险：

- 一个斜率全都不显著的三段模型，如果 pooled R² 刚好比一段高 0.01，也会被标为 significant
- 反之，一个真正有意义的 hiatus（S1 显著暖化，S2 斜率接近零，S3 显著暖化），如果一段模型的 R² 已经很高，r2_improvement 可能不到 0.01

**建议**：增加 per-segment significance 检验：

```julia
# 对 S1, S2, S3 各段做 t-test: slope/SE
s1_t = s1_fit.slope / s1_fit.se_slope
s1_sig = 2 * (1 - cdf(Normal(), abs(s1_t))) < 0.05
# ... similar for s2, s3
# significant = r2_improve >= 0.01 AND (s1_sig OR s3_sig)
```

## 4. 两个模块的架构差异

代码库中存在两个相互独立的中断检测模块：

1. **`hiatus_archetypes.jl`**（`HiatusPrototypes`）：约束两断点搜索 + 斜率分类，用于论文主体
2. **`hiatus_detection.jl`**（`HiatusDetection`）：25 组合穷举（5 start × 5 end），最小绝对斜率选择，输出的是 hiatus 段本身的斜率

两者的方法逻辑完全不同：

- 前者问"整个 35 年怎么分成三段"，用 R² improvement 选最佳分割
- 后者问"哪 15 年窗口内湖温变化最平"，用 min abs slope 选最佳窗口

目前不清楚两者是否在论文中有分工（例如前者做分类、后者做 hiatus 强度量化）。如果 hiatus_detection 已被 hiatus_archetypes 取代，建议标注 deprecated。

## 5. 对论文 `#gap()` 项目的具体映射

| `#gap()` 标注                                   | 本次分析的建议                                                                              | 方法来源                                            |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| window-width sensitivity (±2, ±4, ±6 years)     | 对 BP1/BP2 窗口各做 3 组扩展，检查 archetype 分布的稳定性和 individual lake label flip rate | —                                                   |
| slope/level threshold sensitivity (0.005, 0.01) | 同时建议做 per-segment significance 检验，不只是改 slope_eps                                | Lund et al. (2023) 警告 1                           |
| 1981 start year sensitivity                     | 增加 STL nt 参数的敏感性分析（当前 nt=199 ≈16.6 年），变化 nt 看断点位置漂移                | Lund et al. (2023) 警告 2                           |
| unconstrained breakpoint comparison             | 实现 connected CP model（DIC 选 m），对比与约束方案的 CP 位置重合度                         | Cahill et al. (2015)                                |
| connected vs jump segments                      | 在 Methods 中论证 level jump 在湖温系统中的物理可行性                                       | Cahill et al. (2015) 的 rejection of stairway model |

## 6. 待追踪

- Lund et al. (2023) 全文（arXiv PDF 抓取失败，raw PDF 无法解析，建议通过 SSH 到有权限的机构网络下载）
- `hiatus_detection.jl` 与 `hiatus_archetypes.jl` 的责任边界——是否有 `analysis/` 下的编排脚本说明两者关系？
- 论文 `discussion.typ` 中是否有已预订的 Cahill et al. 引用位置？

## 参考文献

- Cahill, N., Rahmstorf, S., & Parnell, A. C. (2015). Change points of global temperature. _Environmental Research Letters_, 10(8), 084002. https://doi.org/10.1088/1748-9326/10/8/084002
- Lund, R. B., Beaulieu, C., Killick, R., Lu, Q., & Shi, X. (2023). Good Practices and Common Pitfalls in Climate Time Series Changepoint Techniques: A Review. _Journal of Climate_, 36(23), 8041–8058. https://doi.org/10.1175/JCLI-D-22-0954.1
