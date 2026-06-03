# 科学论文图表设计原则与方法

> 2026-05-31 07:00 自主学习
> 直接关联 board 任务：「手动改图（先跑通 pipeline）」
> 前置：已完成 IMRaD 写作方法论五部曲（Results / Discussion / Methods / Introduction / 叙事收敛）

---

## 一、为什么单开一轮

前 35 轮学习覆盖了论文写作的全套方法论，但图表是论文的另一条腿——对 changepoint 论文尤其如此。断点在哪、趋势怎么变、分类怎么来的，读者第一眼看的不是文字而是图。

AI 生成的图容易出几类问题：
- 默认样式未经调校（字体/线宽/颜色/刻度全用默认值）
- 语义不匹配（颜色编码与数据性质不对齐）
- 信息密度失衡（要么太密要么太空）
- 多面板布局不统一
- 在缩小到期刊列宽后标签不可读

下面从通用原则到 changepoint 专项，逐层展开。

---

## 二、核心设计原则

### 2.1 Tufte 三原则

Edward Tufte（1983, *The Visual Display of Quantitative Information*）提出三条黄金准则：

**Graphical Excellence**：在最短时间内、用最少墨水、在最小空间中，给观者最多的想法。

**Data-Ink Ratio**（数据墨水比）：
```
data-ink ratio = data-ink / total ink
```
删掉一切不承载数据的视觉元素。但要注意——这不是绝对的。后来实证研究（Inbar et al.）表明中等 data-ink 水平的图反而最受专业用户偏好。Tufte 的高 data-ink 箱线图去掉箱子只留中位数线，反而破坏了读者的 schema 识别。

实用准则：每加一个视觉元素，问自己「删掉这个会丢失信息吗？」如果不会，删掉。

**Chartjunk**：无意义的装饰——3D 柱状图、渐变色背景、多余的网格线、过密的刻度标签、装饰性图标。这些东西分散注意力而不增加任何信息。

### 2.2 Rougier et al. (2014) 十条规则

PLOS Computational Biology 的这篇经典文章，十条规则句句实用：

| # | 规则 | 核心含义 |
|---|------|---------|
| 1 | Know Your Audience | 期刊读者≠合作者≠公众，图的复杂度要匹配 |
| 2 | Identify Your Message | 每张图只传达一个核心信息 |
| 3 | Adapt to Support Medium | 期刊文章≠口头报告，尺寸/字体/线宽全不同 |
| 4 | Captions Are Not Optional | 图注不是装饰——解释怎么看图、补充图里放不下的精度 |
| 5 | Do Not Trust the Defaults | 任何软件的默认设置都是「适合所有图」=「不适合任何特定图」 |
| 6 | Use Color Effectively | 没有理由用蓝色就别用。colormap 要感知均匀、色盲友好 |
| 7 | Do Not Mislead the Reader | 坐标轴截断、对数尺度不标、面积编码不规范 |
| 8 | Avoid Chartjunk | 见 Tufte |
| 9 | Message Trumps Beauty | 图首先是功能性的，美是副产品 |
| 10 | Get the Right Tool | matplotlib/ggplot2/Plots.jl——选能精确控制每个视觉元素的工具 |

### 2.3 Wilke 的实用补充

Claus Wilke（*Fundamentals of Data Visualization*）补充了几个关键点：

- **Figure ≈ 50% wider than tall**：人眼对水平方向的变化更敏感
- **不要把图注放在图文件之外**：图应该是自包含的
- **同一篇文章里所有图的视觉语言要统一**：同样的颜色表示同样的类别/变量
- **测试图在最终出版尺寸下的可读性**：在 200% 下好看的图在 50% 下可能标签消失

---

## 三、颜色的科学使用

### 3.1 为什么默认 colormap 几乎总是错的

jet / rainbow 的四大罪（Crameri et al. 2020）：
1. **感知不均匀**：黄色区域被人眼感知为「亮=高」，但 rainbow 的黄色在中间
2. **色盲不友好**：~4% 人口有红绿色觉障碍，rainbow 对他们是一团乱
3. **灰度打印后信息丢失**：不同颜色可能映射到相同灰度
4. **引入虚假结构**：感知跳变不等于数据跳变

### 3.2 四类 colormap 的正确使用场景

| 类型 | 适用场景 | 推荐 | 避免 |
|------|---------|------|------|
| **Sequential** | 从低到高的连续值（温度、趋势强度） | viridis, cividis, batlow | jet, rainbow |
| **Diverging** | 有中性参考点的偏离（anomaly、差值） | coolwarm, RdBu, vik | 红绿组合 |
| **Cyclic** | 周期性数据（月份、角度） | twilight, phase | 用 sequential 代替 |
| **Categorical** | 离散类别（湖泊类型、archetype） | Okabe-Ito, Tol bright | 超过 6-8 类仍用颜色区分 |

对于 hiatus 项目的图表类型映射：
- 地图上的趋势值 → **sequential**（viridis 或 batlow）
- 趋势差异图 → **diverging**（vik 或 coolwarm）
- archetype 分类 → **categorical**（Okabe-Ito 6 色）
- 季节性周期 → 如需要可用 cyclic

### 3.3 色觉障碍友好的实操

三条金律（Crameri 2024, *Current Protocols*）：
1. **选灰度打印后仍可区分的 colormap**：viridis、cividis、batlow 通过此项
2. **不要仅靠颜色传递关键信息**：加线型（实线/虚线）、符号（○/△/□）作为冗余编码
3. **图例直接标注在数据旁，而非分离的 legend box**：减少视线来回移动

### 3.4 Scientific Colour Maps 生态

Crameri 的 Scientific colour maps 包（doi:10.5281/zenodo.1243862）是「一站式」方案：
- 包含 sequential / diverging / cyclic / categorical 四类全套
- 所有 colormap 均感知均匀 + 色盲友好
- 提供 .cpt / .txt / .csv / Matlab / Python / R / Julia 等多格式

Julia 侧路径：
- `ColorSchemes.jl` 内置 viridis 家族和 Crameri 全套
- `PerceptualColourMaps.jl` 提供 Kovesi 的感知均匀 colormap
- Plots.jl 中：`seriescolor = :viridis` 或 `cgrad(:batlow)`

---

## 四、多面板图设计

### 4.1 Small Multiples vs Compound Figures

| | Small Multiples | Compound Figures |
|---|---|---|
| 结构 | 规则网格，每个面板同一类型图 | 任意排列，不同面板可以是不同类型图 |
| 轴刻度 | 必须统一（否则误导比较） | 可以不统一，但要在图注中说明 |
| 标签 | 行列标题标明分面变量 | A/B/C/D 标签 + 图注说明 |
| 典型用途 | 按区域/时期分面的趋势图 | 地图 + 时序 + 分类 + 统计汇总组合 |

对 hiatus 项目：
- 各湖泊的趋势时序 → **small multiples**（按 continent / latitude band 分面）
- 地图 + 时序 + archetype 组成一图 → **compound figure**

### 4.2 多面板图的 8 条实操规范

1. **标签（A/B/C）放在每面板左上角**，粗体，与轴标签明显区分
2. **所有面板使用一致的字体、字号、线宽**——这是 reviewer 最容易挑的毛病
3. **水平与垂直间距相等**，面板之间不贴在一起
4. **用网格对齐**——不要凭眼排列
5. **阅读流保持一致**：左→右、上→下，或 Z 型。选定后全文统一
6. **颜色编码在面板间保持一致**：同一类别在同一篇论文所有图里用同一颜色
7. **面板排列遵循逻辑顺序**：按纬度从高到低、按洲名字母序、按统计量大小排序
8. **最终尺寸检查**：在期刊列宽（通常 8-9cm 单栏，17-19cm 双栏）的 50%/75%/100% 缩放比例下测试可读性

### 4.3 避免 overcrowding

多面板图最常见的毛病是试图在一张图里塞进太多面板。处理原则：
- 如果面板数 > 12，考虑拆成两张图
- 如果单个面板里的曲线 > 6 条，考虑高亮其中 1-2 条，其余用浅灰
- 如果标签小到不可读，图本身就是不可读的——不要指望读者会放大

---

## 五、Changepoint / 时序图的专项设计

### 5.1 ITS（Interrupted Time Series）图的四项核心元素

Turner et al.（2021, *Research Synthesis Methods*）综述了 217 篇 ITS 研究的图表质量，发现仅 33% 的图允许准确数据提取。他们梳理的四项核心图表元素：

1. **数据点**：必须画出所有原始数据点（允许查看分布和变异）
2. **中断时刻**：用**竖线**（单点事件）或**浅色阴影**（过渡期）标记
3. **拟合趋势线**：用粗实线，颜色与数据点匹配
4. **反事实趋势线**：用同色但虚线，将中断前趋势延伸到中断后期间

对 hiatus 项目的 changepoint 图：
- Changepoint 时刻 → 竖虚线 + 浅灰背景带标注年份
- 各段的拟合趋势 → 粗实线，按段用不同颜色
- 原始数据点 → 浅色半透明点（减少遮挡）
- 如有置信区间 → 浅色半透明带

### 5.2 Changepoint 可视化的层次结构

一张好的 changepoint 图应该让读者按以下顺序获取信息：

| 视觉层 | 元素 | 应在第一时间传达 |
|--------|------|-----------------|
| 第 1 层（最先看到） | 断点位置标记 | 「变在哪里」 |
| 第 2 层 | 分段趋势线 | 「怎么变的」 |
| 第 3 层 | 原始数据点 | 「数据长什么样」 |
| 第 4 层 | 置信区间/不确定性 | 「有多确定」 |
| 第 5 层（最后看到） | 网格线、参考线 | 辅助定位 |

视觉权重应严格递减：断点标记最重 → 趋势线次之 → 数据点再次 → 不确定带最轻。

### 5.3 多断点比较的展示策略

tidychangepoint 包（Baumer et al. 2025）提供了很好的参考范式：
- **多算法比较**：同一时间序列用不同算法检测的断点 → 用 **rug plot**（底部短竖线）叠加展示
- **多湖泊/多站点**：用小多面板，固定 y 轴范围以便跨面板比较
- **模型诊断**：残差分布 + 累积超出量图并列

### 5.4 Lund et al.（2023）对 changepoint 图的警告

Lund et al.（2023, *J. Climate*）虽主要讨论统计方法，但隐含三个对图表的警告：
1. **不要单独展示一个 changepoint 模型的结果**——至少并排展示 2-3 种备选模型，让读者看到结论的敏感性
2. **展示趋势的不确定性**比展示断点的精确位置更重要
3. **置信区间必须出现在图上**，不能只在文字中提及

---

## 六、地图类图表的专项设计

（hiatus 项目有多张地图类图表：fig-01-map-violin, fig-02-bp-map, fig-r1-map 等）

### 6.1 科学地图的核心原则

- **投影选择要有理由**：全球尺度湖泊分布 → Robinson 或 Equal Earth（等面积）；区域细节 → 等距投影。不要在方法里只写「地图投影是 Mercator」而不解释为什么
- **colormap 选 sequential**：趋势值（°C/decade）是从低到高的连续量，不要用 diverging（除非展示相对于零的偏离）
- **点的大小编码要谨慎**：湖泊数量极多（92000+），点的大小和透明度必须仔细调——点太大则重叠不可辨，点太小则看不见。建议：
  - 全球尺度：点极小（0.5-1pt）+ 高透明度 + 密度分箱
  - 区域尺度：点稍大（2-3pt）+ 低透明度
- **coastline / 国界线**：用浅灰细线，不要抢数据点的视觉权重

### 6.2 地图与附属图表的组合

常见模式（如 fig-01-map-violin）是地图 + violin/box plot 组合：
- 地图占 60-70% 面板宽度
- violin/box 占 30-40%——且与地图的颜色编码严格对应
- 如果按纬度带或洲分组，violin 的排序要与地图的空间分布逻辑一致（如从上到下按纬度排列）

---

## 七、AI 生成图的诊断清单

针对 froQ 的「手动改图」任务，AI 生成图最常见的 10 个问题及修正方向：

| # | 问题 | 症状 | 修正 |
|---|------|------|------|
| 1 | **默认字体** | 使用软件默认字体（无衬线但非期刊要求） | 改用 Times New Roman / Computer Modern / 期刊指定字体 |
| 2 | **字号太小** | 在双栏宽度下标签 < 6pt | 目标字号 ≥ 7pt（出版后），设计时 ×1.5 |
| 3 | **colormap 错误** | 使用 jet/rainbow 作为默认 | 改为 viridis/batlow（seq）或 vik（div） |
| 4 | **线宽不统一** | 不同面板的线宽不一致 | 统一设定：主线 1.5-2pt，参考线 0.5pt |
| 5 | **图例冗余或缺失** | 有的面板有图例有的没有；或所有面板各有一个相同图例 | 多面板共享图例只出现一次 |
| 6 | **轴标签格式不一致** | 有的面板有单位有的没有 | 全文统一格式 |
| 7 | **刻度过多** | x 轴每一年一个刻度，标签重叠 | 保留首尾 + 关键节点（如断点年份） |
| 8 | **缺少不确定性** | 只有点估计无置信区间 | 添加 CI 带或 error bar |
| 9 | **视觉权重错乱** | 网格线比数据线还粗 | 网格线 → 最浅最细；数据线 → 最深最粗 |
| 10 | **纵横比不合理** | 时序图太窄太高或太扁 | 目标约 1.5:1 到 2:1（宽:高） |

---

## 八、Julia / Plots.jl 制图的实操要点

（hiatus 项目使用 Plots.jl + GR backend）

### 8.1 绕过默认值的关键参数

```julia
using Plots; gr()

plot(data,
    # 尺寸：期刊双栏宽 ≈ 17cm
    size = (800, 500),          # 像素，相当于 ~17×10.6cm @120dpi
    
    # 字体
    fontfamily = "Times",       # 或 "Computer Modern"
    titlefontsize = 12,
    guidefontsize = 10,
    tickfontsize = 8,
    legendfontsize = 8,
    
    # 线宽
    linewidth = 2.0,            # 主线
    markerstrokewidth = 0.5,
    
    # 颜色
    seriescolor = :viridis,     # 或 cgrad(:batlow)
    
    # 网格
    grid = true,
    gridlinewidth = 0.3,
    gridalpha = 0.3,            # 浅灰细网格
    
    # 边框
    framestyle = :box,          # 或 :semi（只左边和底边）
    
    # 图例
    legend = :topright,
    
    # DPI
    dpi = 300                   # 出版要求
)
```

### 8.2 PDF 输出质量检查

Plots.jl + GR 导出的 PDF 常见问题：
- **字体嵌入不完整**：用 `pdffonts output.pdf` 检查所有字体是否 embedded
- **透明效果渲染异常**：GR backend 对 alpha 透明度的 PDF 输出支持有限，测试确认
- **大图内存溢出**：92000 个湖泊点 + 地图 → 考虑先聚合再制图

### 8.3 从 AI 初稿到成品的迭代工作流

```
AI 初稿 → 检查诊断清单 10 项 → 记录问题 → 
修改 Plots.jl 脚本参数 → 重新生成 → 
在期刊目标尺寸下视觉检查 → 
如需要，导出 PDF → 用 Adobe Illustrator / Inkscape 微调标注位置
```

注意：Plots.jl 的声明式语法意味着改参数后重新运行脚本即可自动重新生成所有面板——比手动修 PNG 高效得多。优先改脚本，只在必要时用手动工具微调。

---

## 九、hiatus 项目 21 张图的分类与关注点

基于 `paper-typst/assets/` 的文件名，推测图表类型如下：

| 文件名 | 推测类型 | 重点关注 |
|--------|---------|---------|
| fig-01-map-violin | 地图 + violin 组合 | colormap、点大小、violin 排序 |
| fig-02-bp-map | 断点年份地图 | 离散色 vs 连续色？年份用 sequential 不合理 |
| fig-03-shifts | 趋势变化量 | diverging colormap，参考零值 |
| fig-04-continent-regime | 洲际 regime 对比 | 小多面板，轴对齐 |
| fig-05-always-warm | 持续变暖型 | 时序 + 断点标记 |
| fig-06-transition | 过渡型 | 时序 + 断点标记 |
| fig-07-lat-regime | 纬度 vs regime | scatter 或分类 violin |
| fig-08-elev-regime | 海拔 vs regime | scatter 或分类 violin |
| fig-r1-map, fig-r1b-* | 补充材料 | 格式一致性检查 |
| fig-correct-stars | 显著性标记图 | 星号可读性、多重比较校正展示 |
| fig-detrended-shifts | 去趋势后的变化 | y 轴零线必须标记清楚 |
| fig-firstdiff-vs-stl | 一阶差分 vs STL | 双方法对比，颜色区分 |
| fig-three-way-compare | 三方比较 | 三列面板，统一轴 |

---

## 十、推荐参考资源

1. **Tufte (1983).** *The Visual Display of Quantitative Information.* Graphics Press.
2. **Rougier, Droettboom & Bourne (2014).** Ten Simple Rules for Better Figures. *PLOS Comput Biol* 10(9): e1003833.
3. **Wilke (2019).** *Fundamentals of Data Visualization.* O'Reilly. [免费在线版：clauswilke.com/dataviz]
4. **Crameri et al. (2020).** The misuse of colour in science communication. *Nature Communications* 11, 5444.
5. **Crameri (2024).** Choosing Suitable Color Palettes for Accessible and Accurate Science Figures. *Current Protocols* 4, e1126.
6. **Turner et al. (2021).** Creating effective interrupted time series graphs: Review and recommendations. *Research Synthesis Methods* 12(1): 106-117.
7. **Crameri's Scientific colour maps**: https://www.fabiocrameri.ch/colourmaps/
8. **Nature Points of View** 专栏：数据可视化系列短文（包括颜色、条形图、多面板等）
