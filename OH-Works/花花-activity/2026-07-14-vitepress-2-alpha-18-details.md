# VitePress 2.0.0-alpha.18 详细变更解析

日期：2026-07-14
来源：VitePress CHANGELOG.md（alpha.17 → alpha.18, 2026-07-06 发布）

## Breaking Changes（蛙蛙 blog 可能受影响）

### 1. Vite 8 迁移
VitePress 现在使用 Vite 8。如果 blog 配置中使用了 Vite 插件（比如自定义 UnoCSS 配置、路径别名等），需要检查 Vite 8 迁移指南。
- blog 项目使用 UnoCSS，需要确认依赖兼容性
- `vite.config.ts` 中的插件配置可能需要调整

### 2. Node 20 支持移除
最低要求 Node 22+。蛙蛙的 dotfiles 和 ghostty 环境需要确认 Node 版本。
- blog 项目 `package.json` 中的 `engines.node` 字段可能需要更新

### 3. `scrollOffset` 配置项移除
- 之前 `_quarto.yml` 或 `.vitepress/config.ts` 中的 `scrollOffset` 设置不再生效
- 迁移方法：使用 CSS `scroll-margin-top` 自定义滚动偏移
- `smoothScroll` 从 `router.go` 中移除
- 建议迁移方案：在 CSS 中设置 `scroll-behavior: smooth`，最好包裹在 `@media (prefers-reduced-motion: no-preference)` 中

## 值得关注的新功能

### 自定义 i18n 路由
`allow custom i18n routing` — 如果 blog 以后有中英双语需求，这个功能提供了更灵活的路由控制。

### VPContent 支持自定义组件
`allow VPContent to use custom components` — 可以直接在 VPContent slot 中使用自定义 Vue 组件，之前需要绕路。

### Shiki 颜色替换暴露到 markdown options
`expose Shiki color replacements in markdown options` — 在 markdown 级别控制代码高亮颜色，对自定义主题很有用。

### 本地搜索加载状态
`show local search loading state` — 之前没有视觉反馈，现在有了。

### 社交链接支持 target 选项
`support social link target option` — 社交链接图标可以指定 `_blank` / `_self`。

### macOS 本地搜索快捷键
`add macOS local search navigation shortcuts` — Cmd+K 搜索有更多键盘导航支持。

## 值得注意的 Bug 修复

- **dead link line numbers** — 构建时死链现在显示行号，排查问题更方便
- **rewrite drive letters 规范化** — Windows 路径问题修复（蛙蛙在 macOS 上基本不受影响）
- **本地搜索按 locale 索引 rewrite 页面** — 如果使用 rewrite 规则（比如 `/zh/` → `/`），搜索现在正确按 locale 分组
- **DocSearch SVG 在 WebKit 中的裁剪问题** — macOS Safari 用户受益
- **`sub` / `sup` 元素影响行高** — 数学公式或脚注中的上下标不再撑开行间距

## 对 blog 项目的影响评估

当前 blog 项目（基于 VitePress + Vue + UnoCSS + TypeScript）：
1. **UnoCSS Vite 插件**：需要确认 `@unocss/vite` 是否兼容 Vite 8。截至 07-14，可能还没有正式适配版本。
2. **Node 版本**：蛙蛙的 macOS 环境通常保持较新 Node，但需要确认是否已到 22+。
3. **scrollOffset 迁移**：如果 blog 的导航栏高度自定义过，需要检查并迁移到 CSS 方案。
4. **Vite 8 Rolldown 变化**：Vite 8 使用 Rolldown（基于 Rust），构建行为可能会有细微差异，需要测试。
