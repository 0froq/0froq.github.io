# STL 分解参数调优参考：气候/湖泊时间序列

巡检时搜索整理。froQ 昨天重新跑了 STL 分解（35 年月尺度 LSWT，~1h），之前遇到趋势分量锯齿状残留问题。以下是参数调优的系统性参考。

## 问题诊断

「趋势分量有锯齿状残留」= under-smoothing（平滑不足）。两种可能：

1. **t.window 太小**：趋势窗口过短，季节信号泄漏进趋势分量
2. **s.window 太小**：季节提取不干净，剩余季节变异被归入趋势

## 核心参数速查

STL 三个关键平滑窗口（均需奇数）：

| 参数     | R 名       | Python 名  | 默认值          | 建议范围              |
| -------- | ---------- | ---------- | --------------- | --------------------- |
| 季节窗口 | `s.window` | `seasonal` | 7（R 无默认）   | 7~21，或 `"periodic"` |
| 趋势窗口 | `t.window` | `trend`    | 自动计算        | 1.5×period ~ 2×period |
| 低通窗口 | `l.window` | `low_pass` | nextodd(period) | ≥ period              |

**趋势窗口自动公式**（Cleveland et al., 1990）：

```
t.window = nextodd( ceil( 1.5 × period / (1 - 1.5 / s.window) ) )
```

对于月数据（period=12），s.window=7 时 t.window≈23。

## froQ 场景分析

- 数据：1986–2020，35 年月尺度（420 个时点），~90000 湖泊
- 目标：提取年代际趋势变化，检测 1998–2012 hiatus 前后的断点
- 挑战：趋势窗口太小 → 趋势分量捕获年际波动 → 残留锯齿

### 推荐参数组合

**方案 A：保守（趋势非常平滑，适合检测年代际断点）**

```python
STL(
    endog,
    period=12,
    seasonal=13,      # 适中的季节平滑
    trend=241,        # ≈20 年窗口，只保留年代际信号
    low_pass=13,      # ≥ period
    robust=True       # 处理异常年份
)
```

优点：趋势干净，不会把年际波动当趋势
缺点：边界附近趋势估计可能滞后

**方案 B：折中（趋势保留多年波动，s.window='periodic'）**

```python
STL(
    endog,
    period=12,
    seasonal=255,     # 'periodic' 等效效果：强制季节分量全年一致
    trend=121,        # ≈10 年窗口
    low_pass=13,
    robust=True
)
```

优点：季节分量固定（湖泊年周期确实相对稳定），10 年趋势窗口可检测 hiatus
缺点：如果湖泊季节模式确实变化（如春秋变暖不对称），会漏掉

**方案 C：如果逐月跑太慢，用年度均值降维**
先算年均 LSWT → 35 个点 → 无季节分量 → 直接 LOESS 平滑或简单移动平均
这可能是最务实的方案：90000 个湖泊 × 月尺度 STL 的计算量确实大。

### 加速参数

```python
seasonal_jump = int(0.15 * (period + 1))   # ≈ 2
trend_jump    = int(0.15 * 1.5 * (period + 1))  # ≈ 3
low_pass_jump = int(0.15 * (period + 1))   # ≈ 2
```

线性插值代替全部 LOESS 计算，误差极小但速度提升显著。

## 诊断方法

跑完 STL 后检查：

1. **残差白噪声检验**：残差不应有自相关性。用 ACF/PACF 看，如果有显著滞后相关 → 分解不充分
2. **趋势分量平滑度**：对趋势分量差分，如果一阶差分频繁变号 → 锯齿状、平滑不够
3. **季节分量稳定性**：boxplot 按月看季节分量分布，如果方差过大 → s.window 太小

## R vs Python 差异

R 的 `stl()` 和 Python `statsmodels.tsa.seasonal.STL` 参数对应关系同上表。
R 中 `s.window = "periodic"` 强制季节分量逐年不变（取各月均值），Python 中通过设很大的 `seasonal`（如 255）近似实现。

Python 的 statsmodels 没有 `"periodic"` 选项，但 `seasonal=255`（远大于 420 个数据点）效果近似。

## 参考文献

- Cleveland, R.B., Cleveland, W.S., McRae, J.E., & Terpenning, I. (1990). STL: A Seasonal-Trend Decomposition Procedure Based on Loess. _Journal of Official Statistics_, 6, 3–73.
- Hyndman, R.J. & Athanasopoulos, G. (2021). _Forecasting: Principles and Practice_, 3rd ed. Chapter 3.6.
- Rodionov, S.N. (2004). A sequential algorithm for testing climate regime shifts. _Geophys. Res. Lett._, 31, L09204.

## 与 froQ 论文流程的衔接

当前分析链：原始 LSWT → STL 分解 → 趋势分量 → 三段式断点检测（Rodionov STARS 或类似方法）

如果 STL 趋势分量仍然带锯齿 → 断点检测会产生假阳性（把噪声当 regime shift）。
所以这步参数调优是后续所有分析的基础。
