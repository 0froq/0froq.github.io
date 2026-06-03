# VitePress 2.0 生态与博客增强方案

> 巡检自主学习，2026-05-28 20:00

## 1. VitePress 版本时间线

| 版本 | 日期 | 性质 |
|------|------|------|
| v1.0 | 2024-03-21 | 正式版（Evan You 宣布） |
| v2.0.0-alpha.9 | 2025-07-26 | 首个 v2 alpha 进入 rapid 迭代 |
| v2.0.0-alpha.17 | 2026-03-19 | 最新 alpha（含 breaking change） |

v2 的发布节奏稳定在每月 1~2 个 alpha。目前尚无明确的 stable 时间表，但从 CHANGELOG 看核心架构已趋于稳定，主要在做主题和 a11y 打磨。

## 2. VitePress 2.0 关键变化

### 2.1 构建层面

- **Deterministic local search indexing**（α17）：本地搜索索引生成改为确定性 + 非阻塞初始扫描，修复了 CI 中索引差异导致缓存失效的问题
- **processIncludes 不再静默吞错**（α17 ⚠️ breaking）：`<!-- @include: -->` 语法现在会在文件不存在时报错（之前静默忽略）
- **markdown.cache = false 在 build 时也生效**（α13）
- **git log 解析改进**（α13）：处理空提交历史
- **导出 cacheAllGitTimes**（α13）：可以外部使用 lastUpdated 缓存

### 2.2 CSS / 排版（CJK 相关）

- **text-autospace + text-spacing-trim**（α17）：CJK 与拉丁字符间自动间距，这对中英文混排的中文博客是直接利好
- **line-break: strict for `<li>`**（α17）：中文列表项换行更规范
- **font-family-base 不再包含 system-ui**（α17）：避免系统字体干扰自定义字体栈
- **@layer __vitepress_base**（α16）：所有基础样式包裹在 CSS layer 中，自定义样式优先级不再需要 `!important` 战争

### 2.3 主题增强

- **home-hero-actions-before-actions slot**（α17）：首页 hero 区域更灵活的布局控制
- **DocSearch 4.5 with sidepanel**（α16）：Algolia 搜索升级为侧边栏模式
- **hreflang / rel="alternate"**（α17）：i18n 站点的 SEO 信号
- **codeGroupTabActivate 事件**（α14）：可以监听代码组标签切换
- **首页 features 支持 details 列表**（α17）

### 2.4 a11y

- **focus 处理与滚动行为改进**（α13）
- **clipboard fallback 在非安全上下文**（α17）
- **移动端侧边栏关闭**（α17）

### 2.5 froQ 项目值得关注的迁移点

当前项目使用 `vitepress: "catalog:vitepress"`（pnpm catalog）。如果 catalog 指向的是 v1.x：
- `@layer` 机制是向后兼容的，不需要改动
- 如果升级到 v2 alpha，需注意 `<!-- @include -->` 语法的 breaking change
- `text-autospace` 是默认启用的，可能与 UnoCSS 的排版规则产生交互

## 3. 博客增强插件生态

### 3.1 RSS

**vitepress-plugin-rss**（sugarat，MIT）
- 最新版 0.4.4（2026-04-26），维护活跃
- 使用 `feed` 库生成 RSS/Atom/JSON Feed
- 支持过滤、limit、自定义 render、i18n locales
- 集成方式：Vite plugin，构建时自动生成 `feed.rss`
- 自动在 socialLinks 中添加 RSS 图标

### 3.2 自动侧边栏

**VitePress Sidebar**（cdget.com）
- 最新版 1.33.2（2026-05-06），已 drop Node 20
- 自动根据文件结构生成侧边栏
- 对 corpus 六层目录结构（000~500）可能需要自定义 exclude/include

### 3.3 Sitemap

VitePress 内置 `sitemap` 配置项（`transformItems` 可自定义），无需额外插件。需要设置 `lastUpdated: true` 来生成 `<lastmod>`。

### 3.4 SEO 相关

- **head 配置**：froQ 项目已配置 favicon，可追加 Open Graph / Twitter Card meta
- **cleanUrls**：已启用（`cleanUrls: true`）
- **hreflang**：v2 α17 已支持，若后续扩展 i18n 内容直接可用
- **schema.org**：VitePress 不内置结构化数据，需通过 `transformPageData` 或 layout 注入 JSON-LD

## 4. Comark：Markdown 中的组件语法

### 4.1 是什么

Comark 是一个 **Markdown + Component** 的解析器/渲染器，类似 MDC（Markdown Components）语法。`@comark/markdown-it` 是其 markdown-it 插件版本，froQ 的项目已引入（v0.3.4）。

### 4.2 支持的语法

- Block Component（`:component{prop="value"}`）
- Nesting（组件嵌套）
- YAML Props
- Slots
- Inline Components
- Inline Props
- Span

### 4.3 与 MDC 的关系

Comark 和 MDC 都解决「在 Markdown 中嵌入组件」的问题，语法相似但不完全相同。Comark 更强调 parser/renderer 的独立性（支持 Vue / React / Svelte / HTML / ANSI terminal），而非仅绑定 Vue 生态。

froQ 选择 Comark 而非 Nuxt Content 的 MDC，可能是因为：
- VitePress 而非 Nuxt 作为 SSG
- Comark 的语法更通用，不锁定框架
- 轻量级 markdown-it 插件，不引入额外构建依赖

### 4.4 注意

`@comark/markdown-it` 目前仍是 v0.x（「仍在测试行为兼容性，v1.0 前可能有 breaking changes」）。若博客内容重度依赖 Comark 语法，需要注意升级风险。

## 5. froQ 博客项目架构观察

### 5.1 已具备的亮点

- **字体系统**：UnoCSS 中定义了四层字体栈（sans/serif/mono/script + stylish），中文字体选用 LXGW Neo ZhiSong / YshiPen-ShutiTC / LXGW Bright Code TC，兼顾 CJK 排版与西文 aesthetics
- **markdown-it 插件链完善**：anchor、footnote、hashtag（自定义正则）、figures、mark、mathjax3（数学公式）、ruby（注音）、mdc（MDC 语法兼容）、comark 构成完整的学术/文学写作工具链
- **代码块处理**：Shiki transformers 全家桶（Twoslash、Colorized Brackets、Word Highlight），适合技术博客
- **i18n 就绪**：Vue I18n + 目录结构（`en/` 子目录），架构上已支持多语言
- **corpus 六层体系**：`000-autopsia` ~ `500-vigil`，知识管理结构已建立

### 5.2 可考虑的增强方向（供参考，不做建议）

- RSS feed（vitepress-plugin-rss）
- 结构化数据（JSON-LD for blog posts）
- `lastUpdated` 用于 sitemap `<lastmod>`
- 构建时图片优化（sharp 压缩 cover 图片）
- 暗色模式下的代码块对比度微调
- 搜索：目前未见 `search: { provider: 'local' }` 配置，默认应已启用本地搜索

## 6. 小结

VitePress 2.0 的迭代方向体现了三个趋势：**CJK 排版第一公民**（text-autospace 等特性是中日韩用户的直接利好）、**CSS 架构现代化**（@layer）、**渐进式 breaking**（include 语法的报错而非静默失败）。froQ 的博客项目配置已经相当完备，Comark + markdown-it 工具链选择有明确的技术判断。
