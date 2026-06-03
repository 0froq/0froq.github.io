# 三段式断点检测方法参考：湖泊温度时间序列

巡检时搜索整理。froQ 在 put-20260527 中提到 STL 收敛确认后的下一步：「三段式断点检测和响应原型分类」。这里的「三段」应指 pre-warming → warming hiatus → post-hiatus 三个阶段的断点识别。

## 问题框架

给定 35 年月尺度 LSWT 时间序列（经 STL 分解后取趋势分量），需要自动检测两个断点：
1. **hiatus 起始点**（pre-warming → hiatus）
2. **hiatus 结束点**（hiatus → post-hiatus）

输出：三段各段的趋势斜率和显著性 + 断点置信区间。

---

## 方法候选

### 1. BFAST（Breaks For Additive Season and Trend）⭐⭐⭐⭐

**最推荐**。Verbesselt et al. (2010, Remote Sensing of Environment)。

- R 包 `bfast`，CRAN 维护，Hyndman 参与开发
- 原生集成 STL 分解 + 断点检测，不需要分两步做
- 可从原始数据直接检测 trend 和 seasonal 分量的 structural breaks
- 输出：断点位置 + 分段线性趋势参数 + 置信区间
- `bfastlite()` 变体：单次迭代，更快，适合多湖泊批量运行

**优势**：与 froQ 已有的 STL 工作流直接对接。论文引用量高（>2000），在遥感/气候领域有成熟应用。

**注意事项**：
- 需要指定 `h`（最小分段长度，以时间单位计）。对 35 年月数据，h 至少应为 36~60（3~5 年），避免检出短期波动
- `season="harmonic"` 可降低参数维度，对月数据更稳定

### 2. Pettitt 检验 ⭐⭐⭐

非参数方法，Pettitt (1979)。R 包 `trend` 或 `Kendall`。

- 检测均值突变点，不假设分布
- 在气候/水文文献中引用极高
- 实现简单：`trend::pettitt.test(x)`

**局限**：
- 单断点检测（需分段迭代才能做多断点）
- 对渐变型转变（gradual shift）不敏感，更适合 abrupt shift
- 已知 power 不足问题（arXiv:2411.05233 提供 bootstrap 改进版）

**适用场景**：作为 BFAST 结果的交叉验证/补充，确认断点在非参数框架下也显著。

### 3. STARS（Sequential T-test Analysis of Regime Shifts）⭐⭐⭐

Rodionov (2004)。R 包 `rshift`。

- 基于滑动 t 检验的 regime shift 检测
- 海洋生态/渔业文献中广泛使用（NOAA PMEL 有专门页面）
- 参数：`L`（cut-off length，典型 10~15）+ 显著性 p

**局限**：
- 对自相关敏感（气候时间序列通常有强自相关，需预白化）
- 对参数 L 选择敏感
- 在湖泊温度文献中引用少于 Pettitt 和 BFAST

### 4. strucchange / Bai-Perron ⭐⭐⭐

R 包 `strucchange`（Zeileis et al. 2002），`mbreaks`（Perron 等）。

- 基于 OLS 残差的 structural change 检验
- `breakpoints()` 函数：自动检测最优断点数和位置（BIC 准则）
- `mbreaks`：Bai & Perron (1998, 2003) 的多断点框架正式实现

**优势**：统计理论严谨，置信区间可靠。可对分段线性模型做 F 检验（Chow-type test）。

**局限**：假设残差独立同分布，对季节性时间序列需先做 STL 去季节。

**推荐用法**：对 STL 趋势分量跑 `strucchange::breakpoints(trend ~ 1)` 或对去季节后的原始序列跑带线性趋势的回归。

### 5. Bayesian 变点检测 ⭐⭐

R 包 `bcp`（Barry & Hartigan 1993）或 `mcp`（Lindeløv 2020）。

- 输出断点位置的后验概率分布，比频率主义方法更直观
- `mcp` 支持分段线性模型，可指定段数

**局限**：计算量较大，对 35 年的月度数据（420 点）尚可，但对全球多湖泊批量运行可能偏慢。

---

## 工作流建议

```
原始 LSWT（月尺度，35 年）
    │
    ├─→ STL 分解（t.window/s.window 已调优）
    │       │
    │       ├─→ 趋势分量 → strucchange::breakpoints() → 断点 1, 断点 2
    │       │
    │       └─→ (同时) bfast(original, h=60, season="harmonic") → 验证
    │
    └─→ 分段线性回归（三段各拟合 trend + 显著性检验）
            │
            └─→ 响应原型分类（升温型 / 停滞型 / 降温型 / 无响应型）
```

两步法（STL → strucchange）与一步法（bfast）交叉验证，取一致的结果。

---

## 相关湖泊/气候文献

| 文献 | 方法 | 场景 |
|---|---|---|
| Winslow et al. (2015, Scientific Data) | 趋势分段 | 全球 291 湖 1985–2009 |
| Winslow et al. (2018, ERL) | 两段式对比 | 全球 155 湖 pre-hiatus vs hiatus 趋势差异 |
| Wang et al. (2024, Nature Climate Change) | 极端热事件检测 | 湖热浪频率变化 |
| Tong et al. (2023, Nature Water) | 蒸发机制 | GLAST 数据集 1981–2099 |
| Woolway et al. (2017, GCB) | 趋势分析 | 全球湖温长期趋势 |

---

## 备选：响应原型分类

三段断点确认后可对每个湖泊做分类。一种可能的方案：

- **持续升温型**：三段趋势均为正且显著
- **停滞型**：hiatus 段趋势不显著 → 减速 → 恢复
- **降温型**：hiatus 段趋势显著为负
- **无响应型**：三段趋势均不显著

聚类方法选项：k-means 对三段 trend slope 向量；或直接用 if-else 规则分类（可解释性更强）。

---

*整理于 2026-05-28 15:00 巡检*
