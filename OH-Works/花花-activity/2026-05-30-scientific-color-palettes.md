# 科学配色方案：从感知原理到实践选择

> 2026-05-30 自主巡检 · 科学可视化配色体系调研

---

## 一、为什么配色在科学出版中是方法论问题，不是审美问题

Crameri et al. (2020, *Nature Communications*) 的核心论点：**颜色处理是科学方法论的一部分，不是装饰。** 使用不合适的 colormap 会系统性地引入视觉误差，扭曲数据表达。

三个核心维度：

1. **感知均匀性 (perceptual uniformity)**：颜色梯度中相邻颜色的感知差异应该均匀。不满足此条件的 colormap 会产生「感知盲区」（数据变化被隐藏）和「感知跳跃」（虚假特征被引入）。
2. **色觉障碍友好 (CVD-friendly)**：约 4% 人口有色觉缺陷，红绿色盲最常见。如果 colormap 在去饱和后（模拟灰度打印）所有颜色仍有不同的相对亮度值，则普遍可读。
3. **感知有序性 (perceptual order)**：亮度沿梯度单调变化，让读者直观地将「亮/暗」映射到「低/高」。

---

## 二、核心原理：为什么亮度 (lightness) 主宰一切

**Peter Kovesi (2015, arXiv:1509.03700)** 的关键发现：

> 在高空间频率下，感知对比度由**亮度差异**主导，色相和饱和度的贡献相对可忽略。

CIELAB 空间仅在极低空间频率下保持感知均匀。在典型的图形阅读空间频率下，**colormap 的亮度梯度是否均匀**是唯一真正重要的事。

**推论**：
- 如果 colormap 路径有长时间亮度不变的段落，会导致感知盲区
- 亮度斜率符号反转（如 diverging map 的中点）会引入感知不连续——即使数学上平滑
- 对 diverging/cyclic map 这类必须做亮度反转的类型，反转处的「平坦区」是无法完全消除的固有代价

**Kovesi 的 sineramp 测试图像** 是评估 colormap 质量的标准工具：正弦波叠加在线性斜坡上，错误的 colormap 会在此图像上暴露出感知盲区和伪特征。

---

## 三、Colormap 类型与使用场景

### 3.1 Sequential（顺序型）
- **用途**：有序连续数据（温度、浓度、时间）
- **特征**：亮度从低到高单调变化
- **典型选择**：viridis, batlow, cividis, magma
- **注意**：转化为灰度后，每一步必须比上一步更暗——这是最严格的检验

### 3.2 Diverging（发散型）
- **用途**：有明确参考值/零点的数据（异常值、差异）
- **特征**：两端低亮度 → 中点高亮度（或反向），通常使用两种色相
- **典型选择**：vik (Crameri), RdBu (ColorBrewer), coolwarm
- **陷阱**：中点会产生亮度反转，引入感知平坦区；如果数据没有自然零点，使用 diverging map 会在随机位置创造视觉锚点，扭曲数据解读
- **替代方案**：Kovesi 提出的 linear-diverging map（一端恒定色相，另一端变化），避免了中点反转问题

### 3.3 Cyclic（循环型）
- **用途**：角度/相位数据（风向、季节相位）
- **特征**：首尾颜色匹配且一阶连续
- **典型选择**：Kovesi 的四色循环方案（C1-C8 系列）
- **设计挑战**：需要至少两次亮度反转，每个反转点都是感知敏感区

### 3.4 Categorical / Qualitative（分类型）
- **用途**：无序分类数据（国家、类型、分组）
- **特征**：各颜色亮度尽量相近，色相差异最大化
- **典型选择**：Paul Tol 方案、Okabe-Ito palette、ColorBrewer qualitative
- **限制**：6-8 类别为上限，超过后混淆率急剧上升
- **检验**：在 deuteranopia/protanopia 模拟下，任何一对不应变得视觉相同

---

## 四、主要 Colormap 生态与设计哲学

### 4.1 matplotlib 系：viridis 家族
- **作者**：Stéfan van der Walt & Nathaniel Smith (SciPy 2015)
- **成员**：viridis（蓝绿黄）、magma（黑紫橙黄白）、plasma（紫粉黄）、inferno（黑红黄）
- **设计**：在 CIECAM02-UCS 空间中使感知距离均匀，viscm 工具可视化 colormap 路径
- **地位**：matplotlib 2.0 起替代 jet 成为默认，是当前最广泛使用的科学 colormap
- **局限**：未针对色觉缺陷优化

### 4.2 cividis
- **作者**：Nuñez, Anderton & Renslow (2018, *PLOS ONE*)
- **设计**：以 viridis 为输入，经 cmaputil 管道重新优化——在 CVD 色彩空间中强制感知均匀，线性化并最大化 J′（亮度）范围
- **特性**：对正常视觉和红绿色盲**几乎完全相同的视觉解读**
- **权衡**：覆盖的色相范围比 viridis 窄，色彩辨识度略低

### 4.3 Crameri 的 Scientific Colour Maps
- **作者**：Fabio Crameri (2018, Zenodo; 2020, *Nature Communications*)
- **定位**：科学配色的「一站式商店」——包含所有类型（sequential / diverging / multi-sequential / cyclic / categorical）
- **代表**：batlow（sequential）、vik（diverging）、roma（diverging）、oleron（topographic）
- **许可**：MIT，多格式提供
- **v8.0.1 (2023)**：222 个配色方案，持续维护
- **配套**：Current Protocols (Crameri, 2024) 的完整使用指南

### 4.4 Kovesi 的 PerceptualColourMaps
- **作者**：Peter Kovesi (2015)
- **特点**：基于「恒定亮度梯度幅度」的设计原则，提供 L1-L15（linear）、D1-D12（diverging）、C1-C8（cyclic）、R1-R3（rainbow）、I1-I3（isoluminant）
- **工具**：`equalisecolourmap()` 函数可对任意 colormap 进行感知对比度均匀化
- **诊断**：`cmap()` 函数支持 `diagnostics=true` 输出诊断图

### 4.5 ColorBrewer
- **作者**：Cynthia Brewer (2002)
- **定位**：最早的科学配色系统，原为地图设计
- **特色**：提供色觉障碍安全筛选选项，支持 sequential / diverging / qualitative
- **局限**：颜色数量有限（sequential 3-9, diverging 3-11, qualitative max 8-12）

### 4.6 其他值得关注的
- **cmocean** (Thyng et al., 2016)：海洋学专用，perceptually uniform
- **Paul Tol 方案**：精简的色觉障碍安全集合，广泛应用于 NKI 等机构的指南中
- **Turbo** (Google, 2019)：对 jet 的改进版 rainbow map，感知均匀性比 jet 好但仍不如 viridis，应谨慎使用
- **Colorcet** (Holoviz)：Kovesi 的 colormap 集合的 Python 封装

---

## 五、Julia 生态中的可用资源

### 5.1 ColorSchemes.jl
- 汇集了 ColorBrewer、CMOcean、ScientificColorMaps (Crameri)、ColorCet (Kovesi)、Seaborn、matplotlib 等来源的 colormap
- 同时包含大量非科学用途的配色（如 leonardo, vermeer, picasso）
- 在 Plots.jl 中通过 `cgrad(:scheme_name)` 使用；在 Makie.jl 中通过 `colormap=ColorSchemes.scheme_name.colors` 使用
- **注意**：该包包含的 scheme 质量参差不齐——有高标准的感知均匀 colormap，也有主题性的装饰配色。选择时需自行判断。

### 5.2 PerceptualColourMaps.jl (Peter Kovesi)
- Kovesi 原始 colormap 集合的 Julia 实现
- `cmap("L4")` 获取 linear heat map，`cmap("D1")` 获取 diverging map，`cmap("C1")` 获取 cyclic map
- 支持参数调优：`chromaK`（色度缩放）、`N`（采样数）、`shift`（循环偏移）、`reverse`（反转）
- `equalisecolourmap()` 可对任意 colormap 做感知均匀化

### 5.3 ColorBrewer.jl
- ColorBrewer 配色方案的 Julia 封装
- `ColorBrewer.palette("RdYlBu", 9)` 获取 9 级红-黄-蓝 diverging palette

### 5.4 Makie 默认
- Makie 默认 continuous colormap 为 `:viridis`
- 内置支持 ColorSchemes.jl 的所有 scheme

---

## 六、针对 hiatus 论文的实践建议

基于当前项目（湖泊热力学、空间异质性、regime shift 检测）的特点：

### 6.1 地图类图表（全球湖泊分布、空间模式）
- **推荐**：batlow (Crameri) 或 viridis
- **理由**：连续温度数据 → sequential map；batlow 色觉障碍友好，viridis 生态最成熟
- **避免**：jet / rainbow —— 会产生虚假的感知边界，高海拔冷却区可能被 misrepresent
- **注意**：如果使用地形底图，考虑 Crameri 的 oleron（topographic-specific）或 Kovesi 的 isoluminant map + relief shading 方案

### 6.2 差异/对比类图表（大陆不对称、海拔梯度）
- **推荐**：vik (Crameri) 或 RdBu (ColorBrewer)
- **理由**：发散型适合编码正负偏差（变暖 vs 冷却）
- **检验**：零点必须对齐 colormap 的中点；灰度转换后两端亮度应对称

### 6.3 分类/分组图表（archetype 分类、regime 类型）
- **推荐**：Paul Tol bright 方案（7 色）或 Okabe-Ito palette（8 色）
- **限制**：如果 archetype 超过 6-8 类，考虑合并或使用形状 + 颜色双重编码
- **检验**：在 CVD 模拟中不应有任何两个类别混淆

### 6.4 时序图（断点检测、STL 分解）
- **推荐**：viridis 或 cividis 用于多条线，或直接使用 ColorBrewer qualitative（≤ 6 组）
- **技巧**：多面板时序图用直接标注代替图例（Kaspar & Crameri, 2022 建议），减少对颜色区分力的依赖

### 6.5 通用原则
1. **先转灰度**：任何 sequential/diverging colormap 在灰度转换后必须是单调的——这是第一步筛选
2. **CVD 模拟**：使用 Color Oracle 或 CVDSimulator 检查所有关键图表
3. **直接标注 > 图例**：连接线、文字标注直接指向图形元素，减少读者在图例和图形之间来回对照
4. **文中避免引用颜色**：用「虚线/实线」「左面板/右面板」代替「蓝线/红线」
5. **背景色一致**：浅色 colormap 在白色背景上可能对比度不足，深色 colormap 在深色背景上可能丢失细节

---

## 七、jet/rainbow 的问题总结

jet（及其改进版 turbo）的问题不是审美，是方法论：

| 问题 | 具体表现 |
|------|---------|
| 感知不均匀 | 黄-青段有大范围近等亮度区，隐藏数据变化；青-蓝段有陡峭亮度变化，创造伪特征 |
| 无感知顺序 | 灰度转换后亮暗顺序紊乱，读者无法直观判断「哪个值更大」 |
| 色觉障碍不友好 | 红绿段对 deuteranopia/protanopia 用户几乎不可区分 |
| 色相主导感知 | 读者会基于色相划分「黄色区/蓝色区」，创造数据中不存在的分类边界 |

**如果一定要用 rainbow**：Kovesi 的 R1-R3 是「最小危害」的 rainbow 实现，但即使如此，仍应优先考虑 sequential map。

---

## 八、关键文献

- Crameri, F., Shephard, G.E., & Heron, P.J. (2020). The misuse of colour in science communication. *Nature Communications*, 11, 5444.
- Crameri, F. (2024). Choosing Suitable Color Palettes for Accessible and Accurate Science Figures. *Current Protocols*, 4, e1126.
- Kovesi, P. (2015). Good Colour Maps: How to Design Them. arXiv:1509.03700.
- Nuñez, J.R., Anderton, C.R., & Renslow, R.S. (2018). Optimizing colormaps with consideration for color vision deficiency. *PLOS ONE*, 13(7), e0199239.
- Thyng, K.M., Greene, C.A., Hetland, R.D., Zimmerle, H.M., & DiMarco, S.F. (2016). True colors of oceanography. *Oceanography*, 29(3), 9-13.
- Kaspar, F. & Crameri, F. (2022). Accessible science graphics. https://s-ink.org/accessible-science-graphics

---

## 九、在线工具

- **ColorBrewer 2.0**: https://colorbrewer2.org/ — 交互式选择 colormap，支持 CVD-safe 筛选
- **Crameri Scientific Colour Maps**: https://www.fabiocrameri.ch/colourmaps/ — 完整 colormap 集下载
- **s-ink.org**: https://s-ink.org/ — Crameri 团队的开放科学图形集合
- **Color Oracle**: https://colororacle.org/ — 免费 CVD 模拟器
- **Viz Palette**: https://projects.susielu.com/viz-palette — 多色 palette 评估工具
- **Kenneth Moreland 的 Color Advice**: https://www.kennethmoreland.com/color-advice/ — colormap 选择决策支持
