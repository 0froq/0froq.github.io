# Julia 可视化生态：Plots.jl → Makie.jl 与 hiatus 项目制图现状

## 一、hiatus 项目当前制图栈

### 实际使用：Plots.jl + GR backend

`data-process/scripts/plotting_defaults.jl` 定义了完整的制图模块：

```
apply_publication_theme!(dpi=300)
  → gr() backend
  → DejaVu Sans 字体族
  → 统一字号体系（tick 10pt, guide 12pt, title 14pt, legend 9pt）
  → framestyle=:box
  → 边距标准化

figure_size_single()  = (1050, 750)   # 单栏
figure_size_double()  = (2100, 1200)  # 双栏
figure_size_wide()    = (1400, 800)   # 宽图
figure_size_heatmap() → 自适应

categorical_palette() → okabe_ito / tab20
sequential_palette()  → :viridis
diverging_palette()   → :RdBu

save_plot_pdf_png() → 同时输出 PDF + PNG
```

辅助函数：`annotate_heatmap_cells!`、`symmetric_clims`、`add_slope_segment!`。

### 图表资产

`paper-typst/assets/` 中已有 24 个预生成的 PNG 图（fig-01 至 fig-08 为主图序列，另有 detrended-shifts、three-way-compare 等诊断图）。论文通过 Typst 的 `#image()` 引用这些资产。

### 评估

**优势**：Plots.jl 生态成熟、文档丰富、TTFP（Time To First Plot）优于 Makie（~1.3s vs ~3.6s）、GR backend 渲染稳定。

**劣势**：
- GR backend 对 PDF 透明背景存在已知 bug（opacity 不一致，#4992）
- 字体控制自由度有限（依赖 GR 的 fontconfig 查找路径）
- 布局系统不如 Makie 的 GridLayout 灵活（复杂多面板需要更多手工拼接）
- 不支持交互式缩放/旋转（对诊断性看图不友好）
- 当前输出的是 PNG 而非矢量图（见下文分析）

---

## 二、Makie 生态系统全貌

Makie 是 Julia 原生可视化生态，v0.24.9（2026-03），260+ 贡献者，MIT 协议。核心架构：

```
Makie.jl (核心抽象层)
  ├── CairoMakie.jl    → 矢量输出（PDF/SVG/EPS），出版级质量
  ├── GLMakie.jl       → GPU 加速交互（OpenGL），探索性分析
  ├── WGLMakie.jl      → WebGL 浏览器交互
  ├── RayMakie.jl      → GPU 光追渲染（2026 新），物理光照
  └── RPRMakie.jl      → Radeon ProRender（已逐渐被 RayMakie 取代）
```

### 2.1 CairoMakie：出版级矢量输出

这是对 hiatus 论文最有直接价值的后端。

- 输出格式：PDF、SVG、EPS、PNG
- PDF 版本可控（1.4/1.5/1.6/1.7），可满足期刊 PDF/A 合规要求
- `pt_per_unit` 参数控制矢量图缩放，无需改代码即可调整物理尺寸
- `rasterize` 属性：可将 heatmap 等大数据图层单独栅格化，其余保持矢量
- 与 Typst 集成：直接 `#image("figure.pdf")`，Typst 原生支持 PDF 嵌入

**与 Plots.jl + GR 的 PDF 输出对比**：

| 维度 | Plots.jl + GR | CairoMakie |
|------|-------------|------------|
| 字体嵌入 | 依赖 fontconfig，可能缺失 | FreeType 直接渲染，完整嵌入 |
| 透明背景 | 有已知 bug | 稳定支持 |
| 图层栅格化控制 | 全有或全无 | 逐图层 `rasterize` |
| 数学公式 | 需 LaTeXStrings.jl | 原生 MathTeXEngine + 未来 TypstEngine |
| 布局复杂度 | 有限的 subplot grid | 任意嵌套 GridLayout |

### 2.2 GLMakie：交互式探索

对数据分析阶段（非出版输出）有价值：
- GPU 加速渲染大数据集（9.2 万湖泊 × 35 年月尺度）
- 交互式缩放、旋转（3D 地形可视化）
- 实时 slider 参数调整
- 适合诊断性看图（验证断点检测、检查异常值）

### 2.3 GeoMakie.jl：地理空间可视化

hiatus 项目是全球湖泊温度分析，涉及地图投影。GeoMakie 提供：

- `GeoAxis`：支持任意 PROJ 投影字符串
- `source="+proj=longlat +datum=WGS84"` → `dest="+proj=eqearth"` 自动坐标变换
- 与 NaturalEarth.jl 集成，可直接叠加海岸线、国界
- `surface!` / `heatmap!` / `poly!` 等标准 Makie plot 类型在 GeoAxis 上原生支持
- CairoMakie 下推荐 `image!` / `heatmap!`；GLMakie 下推荐 `surface!`

**与 hiatus 当前地图制图的关系**：当前 fig-01、fig-02 是全球湖泊分布/断点地图。如果用 GeoMakie，可以：
- 使用更合理的地图投影（Equal Earth、Robinson）替代简单经纬度网格
- 自动处理经纬度 180° 边界循环（当前可能需手动 circshift）
- 叠加地理参照（海岸线、湖泊边界）

### 2.4 MakiePublication.jl：期刊模板

提供预配置的出版主题，对应主要期刊/出版社：
- `theme_acs`：American Chemical Society
- `theme_aps`：American Physical Society / AIP（四边刻度）
- `theme_rsc`：Royal Society of Chemistry
- 15 种科学配色方案（基于 ColorBrewer 调优排序）
- 空心标记支持（`since v0.3.1`）

使用方式：`with_theme(theme_aps()) do ... end`

### 2.5 MakieTypstEngine.jl：Typst 字符串渲染

PoC 阶段（2025-10 JuliaCon hackathon 产物），但方向极其契合：
- 通过 Typstry.jl 将 Typst 字符串传入 Makie
- 绕过 MathTeXEngine 的 LaTeX 渲染限制
- 直接在图表内使用 Typst 排版（标题、轴标签、注释）
- 实现图表与论文正文的**字体/排版一致性**

目前限制：
- 需要本地 Rust/Cargo 编译 Typst wrapper
- 字体 glyph 索引对齐仍不稳定（NewComputerModern 有乱序问题）
- API 感觉 over-engineered，需重构
- 包注册前需解决 type piracy 和 binary 分发问题

但在 Typst 论文中使用 Typst 渲染的图表——这个闭环足够优雅，值得关注其成熟进度。

### 2.6 v0.24 关键变化：Compute Graphs 替代 Observables

v0.24 将内部响应式系统从 Observables.jl 迁移到 ComputePipeline.jl：
- 多属性同步更新（之前多个 Observables 各自触发 → 中间冗余计算）
- 消除了 "multiple updates conundrum"
- 对用户代码影响小，但大幅提升复杂图表更新性能

### 2.7 即将到来：Complex Recipes

JuliaCon 2026 预告的新功能：
- 现有 `@recipe` 宏定位为低级构建块，不支持多轴场景
- Complex Recipes 将原生支持：自动 legend、colorbars、UI 元素
- 解决 "how do I simply add an axis title to my recipe" 这个经典痛点

---

## 三、Plots.jl → Makie.jl 迁移评估

### 3.1 何时值得迁移

| 信号 | 权重 |
|------|------|
| 需要 PDF 矢量输出且 GR 的透明/字体问题不可接受 | 高 |
| 需要复杂多面板布局（>4 个子图，嵌套 grid） | 高 |
| 需要交互式数据探索（缩放、旋转 3D） | 中 |
| 需要地图投影（非简单经纬度网格） | 中 |
| 需要 Typst 字体一致性（图表 = 论文正文字体） | 低（MakieTypstEngine 尚未成熟） |
| 已有大规模 Plots.jl 代码库且输出质量可接受 | 不迁移 |

### 3.2 迁移成本

- **API 差异**：Plots.jl 的 `plot(x, y)` → Makie 的 `lines(x, y)` 或 `scatter(x, y)`。属性名有变（`linewidth` → `linewidth` 保持一致，但 `framestyle` 等不存在）
- **颜色映射**：Plots.jl 的 `cgrad(:viridis)` ≅ Makie 的 `:viridis`，但 `clims` → `colorrange`
- **布局系统**：Plots.jl 的 `layout` → Makie 的 `Figure` + `GridLayout`，需要重写布局代码
- **导出**：Plots.jl 的 `savefig` → Makie 的 `save`（接口类似但参数名不同）
- **TTFP**：Makie 首次加载 ~3.6s vs Plots.jl ~1.3s（非交互式批处理场景影响不大）

### 3.3 混合策略

不一定要全量迁移。可以：
- **探索性分析**：GLMakie（交互式看图，验证断点检测）
- **出版图表**：CairoMakie（矢量 PDF 输出）
- **快速原型**：保留 Plots.jl（TTFP 优势）
- **地图可视化**：GeoMakie（替代当前的手工经纬度 plot）

---

## 四、针对 hiatus 项目的具体建议

### 4.1 短期（当前轮次可做）

1. **检查 PDF 输出质量**：当前 `save_plot_pdf_png` 同时输出 PDF，确认 PDF 中字体是否完整嵌入、透明背景是否有 artifacts。如果有 GR #4992 问题，考虑 CairoMakie 替代。

2. **确认图表在 Typst 中的渲染效果**：`paper-typst/assets/` 中只有 PNG 文件。如果原始 PDF 可用，应优先在 Typst 中引用 PDF（矢量，缩放无损）。确认 Typst 对 PDF 嵌入的支持情况。

3. **色觉无障碍检查**：当前 sequential palette 是 viridis（色盲友好 ✓），diverging 是 RdBu（红绿色盲不友好 ✗）。考虑替换 diverging 为 `:vik`（ColorBrewer 色盲安全 diverging）或 `:batlow`（Scientific Colour Maps）。

### 4.2 中期（论文修改轮次）

4. **地图类图表迁移到 GeoMakie**：fig-01（map-violin）、fig-02（bp-map）涉及全球空间分布。GeoMakie + Equal Earth 投影会更专业。

5. **多面板布局优化**：fig-04（continent-regime）、fig-07（lat-regime）、fig-08（elev-regime）可能是多面板对比图。Makie 的 GridLayout 可以实现更精确的子图对齐、共享轴、嵌套布局。

6. **探索 MakieTypstEngine 成熟度**：如果论文修改时 MakieTypstEngine 已可用，可尝试让图表字体与 Typst 正文一致（这对排版偏执狂来说是个高价值特性）。

### 4.3 长期（后续项目）

7. **建立可复用的 Makie 制图模板**：类似当前 `plotting_defaults.jl`，但用 CairoMakie，输出纯矢量 PDF。为后续论文建立资产。

8. **GLMakie 用于数据诊断**：在断点检测、STL 分解验证阶段，交互式缩放/平移可以更快发现问题（如 1994 边界效应的视觉检查）。

---

## 五、关键资源

- Makie 官方文档：https://docs.makie.org/stable
- GeoMakie 文档：https://geo.makie.org
- MakiePublication.jl：https://github.com/liuyxpp/MakiePublication.jl
- MakieTypstEngine.jl：https://github.com/henrik-wolf/MakieTypstEngine.jl
- CairoMakie PDF/save 选项：https://docs.makie.org/stable/explanations/backends/cairomakie
- Plots.jl GR PDF 透明 bug：https://github.com/JuliaPlots/Plots.jl/issues/4992
- JuliaCon 2026 Makie talk（RayMakie + Compute Graphs + Complex Recipes）：https://pretalx.com/juliacon-2026/talk/3NCWH3/
- Scientific Colour Maps（色盲安全替代方案）：https://www.fabiocrameri.ch/colourmaps/
