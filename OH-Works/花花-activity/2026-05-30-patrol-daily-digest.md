# 2026-05-30 日终整合：22 轮自主学习知识流

## 时间线全览

```
01:00  Theme architecture         ── 博客架构最后一块拼图
02:00  RSS feed                   ── 分发层起点
03:00  Sitemap/SEO/robots         ── 分发层补全
04:00  MCP ecosystem overview     ── 跳出博客，新领域
05:00  MCP Neovim practice        ── MCP 实践深化
06:00  Julia visualization        ── 回到 hiatus 工具链
07:00  Corpus taxonomy etymology  ── 博客哲学层
08:00  Neovim academic writing    ── 学术写作工具链
09:00  Zellij architecture        ── 终端 multiplexer
10:00  dprint formatter           ── 代码格式化器
11:00  Scientific color palettes  ── 科学配色方法论
12:00  Ghostty terminal           ── 终端模拟器
13:00  Neovim Lua ecosystem       ── Lua 配置与插件开发
14:00  bumpp release ecosystem    ── 版本发布工具
15:00  oxc/oxlint ecosystem       ── Rust 化工具链
16:00  Atomic CSS 2026            ── Tailwind v4 vs UnoCSS
17:00  Type design ecosystem      ── 字体设计工具链
18:00  (漏轮)
19:00  VitePress build perf       ── 构建性能优化
20:00  Open source contribution   ── 长期目标战略
21:00  Results section writing    ── 学术写作方法论
22:00  (漏轮)
23:00  日终整合                   ── 本轮
```

## 四大主题域

### 一、博客架构深潜（01-03, 07, 19）── 5 轮

**Theme 层**（01:00）：补齐了 Layout 三层结构、PageContent 6 路分发、UnoCSS 设计 token 体系、「字体语义倒置」设计哲学。与 corpus 六层拉丁语命名并置，论证了「异质化命名制造认知距离」策略。

**分发层**（02:00 RSS + 03:00 Sitemap/SEO）：从零 SEO 配置现状出发，给出了 RSS（手动 buildEnd + feed 包）和 Sitemap（VP 原生 + i18n hreflang 手动适配）+ SEO meta + robots.txt 的完整分阶段路线图。识别了 frontmatter 缺少 description 字段是两项工作的共同阻塞项。

**哲学层**（07:00）：深挖 corpus 六层拉丁语词源（autopsia→ingesta→neoplasma→putredo→delirium→vigil），发现命名将知识处理映射为病理过程，与 Bloom/DIKW/Luhmann/Matuschak 形成对比，识别了线性生命周期、病理化、终点是警觉、编号预留演化空间四个独特性。

**性能层**（19:00）：系统梳理了 VitePress 构建管线四瓶颈（git timestamp / content loader markdown-it / OOM / chunk warnings），给出了短/中/长期优化建议。核心判断：当前零优化 < 30s；启用 sitemap+lastUpdated+RSS 后 45-60s 仍可接受。

### 二、工具链生态 deep dive（04-06, 08-16）── 12 轮

**MCP 协议**（04:00→05:00）：协议基础（三个核心原语、Streamable HTTP）→ Neovim 实践（mcphub.nvim / mcp-tools.nvim / llama.vim + CodeCompanion 双模型策略）→ Julia MCP 生态。

**终端栈**（09:00→12:00）：Zellij（多进程+多线程架构、WASM 插件沙箱、KDL 配置）→ Ghostty（Zig 核心、SIMD 终端解析器、libghostty-vt 战略意义）。两者与 Neovim 构成 froQ 核心终端三角。

**Neovim 生态**（08:00→13:00）：学术写作（Tinymist LSP / typst-preview.nvim / zotcite / Vale / zen-mode）→ Lua 底层（配置范式、lazy.nvim v11 vs vim.pack 0.12、插件开发工具链、0.12 "Batteries Included" 转向）。

**JS/TS 工具链**（10:00→14:00→15:00）：dprint（Rust 原生格式化器、WASM 插件）→ bumpp（交互式版本发布、--execute 安全钩子）→ oxlint（Rust 化 lint 生态、Vue SFC 支持待 Language Plugin RFC）。三条线索汇成 JavaScript 工具链 Rust 化全景。

**Julia 可视化栈**（06:00→11:00）：Plots.jl vs Makie.jl 对比 → Makie 六大组件 → 科学 colormap 原理（感知均匀性、Kovesi 亮度梯度原则）→ 四类 colormap 使用场景 → 六大 colormap 生态 → 针对 hiatus 论文四种图表类型的具体推荐。

**原子 CSS**（16:00）：Tailwind v4 Oxide Rust 引擎已追平 UnoCSS 构建速度，UnoCSS 护城河转向灵活性、bundle 体积和 Vue/Nuxt 生态深度集成。对博客而言 UnoCSS 仍是最自然选择。

### 三、创意与战略（17, 20, 21）── 3 轮

**字体设计**（17:00）：专业工具五层金字塔、fontTools Python 基础设施、avar2+VARC 可变字体 2026 进展、CJK 字体设计挑战、中文开源字体生态。

**开源贡献战略**（20:00）：基于 Anthony Fu 渐进路径哲学和 2i2c 贡献框架，构建了 Adopter→Contributor→Maintainer→Creator 四层金字塔，针对 froQ 技能组合（Vue/TS + GIS + 双语 + 系统构建者思维）给出了 5 年路线图。

**学术写作**（21:00）：Results 部分写作方法论——定位（Results ≠ Data）、五大常见错误、科学叙事结构（角色→场景→张力→行动→高潮→收尾）、AI 初稿审阅 10 项检查清单。

## 跨领域连接点

### 1. 工具链 Rust 化浪潮
dprint（Rust 格式化）→ oxlint（Rust lint）→ Rolldown（Rust bundler，Vite 8 内建）→ Lightning CSS（Rust CSS）→ tsgo（Rust type-checking）。这是整个 JavaScript 生态的结构性迁移，froQ 已通过 dprint 和 Vite 8 自动上车。

### 2. 终端三角的分工哲学
Ghostty（终端模拟，Zig 核心，专注渲染）→ Zellij（multiplexer，Rust 多进程，专注会话管理）→ Neovim（编辑器，Lua 配置，专注编辑）。三者在 froQ 工作流中边界清晰，各司其职。Ghostty 的 libghostty-vt 可能成为基础设施层标准。

### 3. 「异质化命名制造认知距离」
这是贯穿 froQ 系统的设计原则：
- corpus 六层拉丁语命名：用病理过程隐喻知识处理
- UnoCSS 字体语义倒置：宋体→sans，手写→serif，打破西文排版惯例
- 本质相同：用陌生化制造认知张力，防止滑入无意识的默认思维

### 4. 博客技术栈完整性
经过 5 月 28-30 日的分析，博客的技术栈分析已覆盖全部层次：
- 内容层（corpus 六层 + posts 三层 + frontmatter schema）
- 渲染层（Comark + markdown-it 插件链 + Shiki Twoslash）
- 数据层（9 个 data loader + Dashboard YAML 体系 + 标签系统）
- 主题层（自定义 VitePress Theme + UnoCSS + 字体语义倒置）
- 分发层（RSS + Sitemap + SEO + robots.txt）
- i18n 层（vue-i18n v11 非标准架构）
- 搜索层（MiniSearch + Intl.Segmenter 推荐方案）
- 性能层（VitePress 构建优化四策略）
- 国际化层（字体 subsetting 策略）

## 残存关注点

1. **frontmatter description 字段缺失**：RSS 和 SEO 共同的阻塞项，需 froQ 决策是否扩展 schema
2. **Comark 与 VitePress 容器渲染重叠**：待实际构建验证
3. **Ghostty + Zellij 键位冲突**：Option+Arrow→Alt 陷阱，需在配置层解决
4. **18:00 / 22:00 漏轮**：连续两轮未触发，可能与定时任务调度有关
5. **博客构建性能**：当前 < 30s 可接受，但启用搜索索引后需重新评估

## 与前日的对比

| 维度 | 5月28日 | 5月30日 |
|------|---------|---------|
| 轮次 | 10 轮 | 22 轮 |
| 主题域 | 3 域（hiatus 方法论→Typst→博客） | 4 域（博客→工具链→创意→学术写作） |
| hiatus 占比 | 60% | 5%（仅 Julia 可视化+科学配色+学术写作） |
| 博客占比 | 30% | 40% |
| 新领域 | Typst | MCP、Zellij、Ghostty、dprint、bumpp、oxlint、字体设计 |
| 深度最高 | Cahill 方法论逐段对比论文 #gap() | 博客架构六层全栈分析 |

今日覆盖广度远超 28 日——从 MCP 协议到字体设计，从终端模拟器到开源贡献战略，形成了 froQ 完整技术栈的知识地图。
