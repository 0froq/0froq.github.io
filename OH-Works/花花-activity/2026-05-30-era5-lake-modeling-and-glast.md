# ERA5 Lake Modeling & GLAST — hiatus 项目数据来源溯源

## 一、两个"湖温"数据源的区分

hiatus 项目实际使用的是 **GLAST v1.0**（Global Lake Surface Water Temperature），而非 ERA5 直接输出的湖温变量。但两者共享同一个核心物理模型 FLake，因此理解 ERA5 的湖泊建模框架有助于理解 GLAST 的构造逻辑与局限性。

---

## 二、ERA5 中的 FLake 湖泊模型

### 2.1 FLake 是什么

FLake（Fresh-water Lake model）是 ECMWF 集成预报系统（IFS）中内嵌的一维湖泊参数化方案，用于计算内陆水体的热通量、水汽通量和动量通量。

**核心假设**：湖泊温度剖面采用预设形状：

- **混合层**（mixed layer）：温度均匀分布
- **温跃层**（thermocline）：上边界在混合层底部，下边界在湖底

### 2.2 七个预报变量

| 变量                         | 含义                    |
| ---------------------------- | ----------------------- |
| lake_mix_layer_temperature   | 混合层温度（≈表层水温） |
| lake_mix_layer_depth         | 混合层深度              |
| lake_bottom_temperature      | 湖底温度                |
| lake_total_layer_temperature | 全水柱平均温度          |
| lake_shape_factor            | 温跃层温度剖面形状因子  |
| lake_ice_temperature         | 冰面温度                |
| lake_ice_depth               | 冰厚                    |

### 2.3 关键设计限制

1. **湖深依赖**：FLake 对湖深（bathymetry）高度敏感。默认值 25m，若实际深度偏差大会导致夏季冷偏差或冰况错误
2. **深度上限**：设计目标为中等深度（<50m）淡水湖，不适用于咸水湖、冰川补给湖、极深湖
3. **水平衡缺失**：湖面积和深度保持恒定，无水量收支方程
4. **网格覆盖**：每个网格点只要水面覆盖 ≥1% 即启用 FLake 计算（约 2km²）
5. **空间分辨率**：ERA5 ~31km（0.25°），ERA5-Land ~9km（0.1°）

### 2.4 ERA5 vs ERA5-Land 湖温表现

- ERA5-Land 在 27 个芬兰湖泊的日平均 MAE 为 2.68°C（vs ERA5 的 2.71°C）
- 对于深度在提高分辨率后更准确的湖泊，MAE 降低 23.8%
- 对咸水湖、冰川湖等"异常湖泊"，误差可达 10°C 以上
- 夏季可能出现混合层深度突变导致水温异常飙升（单小时内升高 20°C）

---

## 三、GLAST v1.0 数据集

### 3.1 基本参数

| 属性       | 值                                    |
| ---------- | ------------------------------------- |
| 全称       | Global LAke Surface water Temperature |
| 来源论文   | Tong et al. (2023), _Nature Water_    |
| 湖泊数量   | 92,245                                |
| 时间跨度   | 1981–2020（40 年）                    |
| 时间分辨率 | 日（daily max / min / mean）          |
| 数据格式   | MATLAB .mat                           |
| 数据体积   | daily_LSWT_data.mat ≈ 2.3 GB          |
| DOI        | 10.5281/zenodo.8322038                |

### 3.2 构造方法

GLAST 并非直接从 ERA5 提取——它是通过 **Landsat 热红外卫星影像** 反演湖面温度，再结合 **FLake 物理模型** 进行校准和插补：

1. **Landsat 反演**：利用 Landsat 5/7/8 的 thermal infrared bands（TIRS），1982–2020 共四十年观测
2. **FLake 校准**：用 FLake 模型填补云覆盖和卫星重访周期造成的缺失值
3. **日值合成**：输出每日最高、最低、平均水温

### 3.3 与 ERA5 原生 FLake 的区别

| 维度       | ERA5 FLake              | GLAST                         |
| ---------- | ----------------------- | ----------------------------- |
| 数据来源   | 气象再分析 + FLake 模拟 | Landsat 卫星观测 + FLake 插补 |
| 湖泊覆盖   | 所有 ≥1% 水面网格       | 92,245 个单独湖泊             |
| 空间性质   | 网格化（grid box）      | 逐湖（per-lake）              |
| 时间分辨率 | 小时                    | 日                            |
| 准确性     | 受湖深输入偏差影响大    | Landsat 实测约束，更接近真实  |
| 适用场景   | 大气-湖泊耦合模拟       | 湖泊气候变化研究              |

---

## 四、hiatus 项目数据管线

### 4.1 数据流

```
GLAST .mat (2.3 GB)
    │
    ▼
rebuild-monthly-average-excluding-ice.jl
    │  排除结冰月份，按月平均
    ▼
processed/to-monthly-average/C data-monthly-average.csv (423 MB)
    │
    ├──► from-raw-to-lake-attributes.jl
    │        │  合并 HydroLAKES v10 Shapefile 属性
    │        ▼
    │    processed/lake-attributes/data-lake-attributes.csv (22 MB)
    │
    └──► compute-stl.jl
             │  STL 时间序列分解（SeasonalTrendLoess.jl）
             ▼
         processed/stl-decomposition/period12_robustfalse_ni5_no0/
             ├── trend.jld2      (299 MB)
             ├── seasonal.jld2   (299 MB)
             ├── remainder.jld2  (299 MB)
             ├── lake_ids.jld2   (3.5 MB)
             └── metadata.jld2   (12 KB)
                  │
                  ▼
         analysis/01-hiatus-prototypes/
              │  约束断点搜索 + prototype 分类
              ▼
         data-01-archetypes.csv
              │
              ├──► 02-archetype-story/   (叙事分析)
              └──► 03-bloom-relationship/ (藻华关系)
```

### 4.2 关键依赖

| 工具                  | 作用                       |
| --------------------- | -------------------------- |
| MAT.jl                | 读取 GLAST .mat 文件       |
| SeasonalTrendLoess.jl | STL 分解（Julia 原生实现） |
| DataFrames.jl         | 表格操作                   |
| Clustering.jl         | 聚类分析                   |
| Plots.jl + GR         | 可视化                     |
| HDF5.jl / JLD2        | STL 结果存储               |

### 4.3 设计决策

1. **排除结冰月份**：`rebuild-monthly-average-excluding-ice.jl` 脚本名已暗示，冰覆盖月份的水温数据在月平均时被排除，以避免 0°C 截断偏差
2. **STL 参数**：周期 12（月度），`robust=false`，`ni=5`（内循环 5 次），`no=0`（外循环 0 次即不进行鲁棒性加权）
3. **HydroLAKES 属性**：湖泊面积、深度、高程、流域等空间属性来自 HydroLAKES v10 全球湖泊矢量数据库（~1 GB Shapefile）

---

## 五、对 hiatus 方法论的意义

### 5.1 数据质量的已知问题

- GLAST 使用 Landsat 热红外，空间分辨率 100m（重采样到 30m），但对小湖泊（<1km²）反演精度下降
- FLake 插补对深湖 (>50m) 和咸水湖有系统性偏差
- 北极湖泊（占数据集 36%）的冰覆盖期长，有效水温观测窗口短

### 5.2 与 ERA5 的互补可能性

hiatus 项目目前仅使用 GLAST 作为湖温数据源。ERA5-Land 提供的额外变量（混合层深度、湖底温度、冰厚等）可补充分析维度：

- 混合层深度变化是否与 hiatus 信号同步？
- 冰厚变化是否影响趋势检测的断点位置？
- 全水柱热含量 vs 表层温度的趋势差异？

### 5.3 论文中的引用关系

Tong et al. (2023) 已被项目 zotero.bib 收录，作为数据来源和方法论基础。论文核心发现（continental asymmetry + elevation gradient）建立在 GLAST 数据之上，数据质量评估（特别是北极湖泊和深湖偏差）应在 Methods 或 Discussion 中明确讨论。

---

## 六、延伸阅读

- **Tong et al. (2023)**: Global lakes are warming slower than surface air temperature due to accelerated evaporation. _Nature Water_. — GLAST 构造论文
- **Balsamo et al. (2012)**: On the contribution of lakes in predicting near-surface temperature in NWP. — FLake 在 IFS 中的引入
- **Mironov et al. (2010)**: Parameterization of lakes in numerical weather prediction. — FLake 核心模型
- **Munoz-Sabater et al. (2021)**: ERA5-Land: a state-of-the-art global reanalysis dataset for land applications. _ESSD_. — ERA5-Land 完整描述
- **Winslow et al. (2018)**: Small lakes show muted seasonal temperature trends. — GLAST 前身，小湖泊温度响应
