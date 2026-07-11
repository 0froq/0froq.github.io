# VitePress 2.0.0-alpha.18 发布（2026-07-06）

## 概述

VitePress 2.0.0-alpha.18 于 **2026-07-06** 发布，距离上一个 alpha.17（2026-03-19）时隔约 3.5 个月。这是 VitePress 2.0 稳定前的重要里程碑。

> ⚠️ **注意**：此版本在此前所有巡检中被遗漏（巡检日志仍在记录 alpha.17）。实际于 07-06 即可发现。

## Breaking Changes

- **迁移至 Vite 8**：如果使用了自定义 Vite 插件，需参考 Vite 8 迁移指南检查兼容性
- **Node 20 支持被移除**：需要 **Node 22+**
- `scrollOffset` 配置项被移除：改用 CSS `scroll-margin-top` 自定义
- `router.go` 的 `smoothScroll` 支持被移除：改用 CSS `scroll-behavior: smooth`（建议包裹 `@media (prefers-reduced-motion: no-preference)`）

## 主要新功能

- 支持 macOS 本地搜索导航快捷键（#5237）
- Carbon 选项支持 `format` 选项（#5188）
- 允许自定义 i18n 路由（#5239）
- `VPContent` 可接收自定义组件（#5176）
- 本地搜索新增加载态（#5252）
- 支持 `scroll-margin` / `scroll-padding`（#5236）
- 社交链接支持 `target` 选项（#5242）
- Markdown: Shiki 颜色替换暴露在 markdown 选项中（#5153）

## Bug 修复（部分）

- 修复了 base 路径下 download 链接的问题
- 修复了 Windows 下 rewrite 路径大小写规范化问题
- 死链检测现在显示行号
- 修复了 team member 卡片头像对齐问题
- 修复了代码块中混合 LTR/RTL 文本渲染
- 修复了 sub/sup 元素导致行高异常的问题
- 修复了多个 sidebar/sidepanel 合并相关的问题

## 对蛙蛙 blog 的影响

蛙蛙的 blog 使用 VitePress，升级到此版本时需要注意：

1. **Vite 8 兼容性**：检查自定义 Vite 配置/插件是否需要调整
2. **Node 版本**：确认开发环境和 CI 中的 Node 版本 ≥ 22
3. **scrollOffset 移除**：如果使用了自定义 scroll offset，需改为 CSS 方案
4. **本地搜索改进**：新增的加载态和快捷键可以提升体验
5. **可考虑的亮点**：macOS 搜索快捷键、自定义 i18n 路由、social link target 选项

## 关联生态

- Vue 3.6 仍停留在 beta.17（06-24），无推进
- TS 7.0 stable 已于 07-08 发布（详见 07-09 笔记），但 Vue 生态的完整 plugin 支持需等 TS 7.1（缺 programmatic API）
- Neovim 0.13 仍在 nightly（dev-933, 07-07），0.12.4 为最新 stable（07-05）
