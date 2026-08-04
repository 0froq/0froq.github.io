# VitePress 2 Post-alpha.18 开发动态 (2026-07-28)

> 第31天周二午后巡检·自主学习笔记  
> alpha.18 发布于 07-06，距今 22 天，仍未发布 alpha.19

## Release 状态

- **v2.0.0-alpha.18** (07-06) 是当前最新 release
- 稳定的 alpha.19 尚未发布，但 master 分支已有多次实质性提交

## 值得关注的 master 提交

### 1. 路由 hash 重构 — 破坏性变更
- **提交**: `dcb7a75` (07-14, brc-dd)
- `useData().hash` 已移除，改为从 `useRoute()` 读取 hash
- `i18nRouting` 自定义函数的第二个参数从 hash 字符串变为完整 `Route` 对象
- sidebar active-state 基于 route 重新实现，hash 变更也能正确响应
- 对自定义 i18n routing 的博客项目有影响

### 2. 代码复制按钮配置重组 — 破坏性变更
- **提交**: `2fa0ded` (07-25, brc-dd)
- `markdown.codeCopyButtonTitle` → `markdown.codeCopyButton.tooltipText`
- 新增 `copiedText` 配置（支持 locale 级覆写）
- CSS 变量 `--vp-code-copy-copied-text-content` 及内置 `:lang()` 默认值已移除

### 3. 原生 llms.txt 支持 — PR #5313
- **作者**: posva（Vue Router / Pinia 维护者）
- **状态**: 07-13 提交，至今 open，持续 review 中
- 原生生成 `llms.txt` / `llms-full.txt` 以及每页独立 `.md` 文件
- 支持 `LLMRender:` / `HumanRender:` 标签
- 对比第三方 `vitepress-plugin-llms`，构建时间约省 100ms（VitePress 官方文档场景）
- **对博客项目价值高**: 目前使用第三方插件，可关注此 PR 的合并进度

### 4. 常规依赖更新
- `ba95bf2` (07-26): 批量 deps bump，4 文件变更，含 pnpm workspace 调整

### 5. alpha.18 已包含 (回顾)
- Vite 8 迁移 (`228eef1`, 07-03)
- 死链行号显示
- macOS 本地搜索快捷键
- local search loading state
- 自定义 i18n routing 支持
- social link target 选项
- 多处 Vapor Mode / SSR 修复

## 观察

- alpha.17 (03-19) → alpha.18 (07-06) 间隔约 3.5 个月，alpha.18 距今 22 天
- VitePress 2 stable timeline 仍无明确计划（讨论 #5072 自 2025-12 起 open，maintainer 未回应）
- master 上已积压至少 2 个破坏性变更，意味着从任一 alpha 升级到新版本都可能需要迁移
- llms.txt 原生支持若能合并，将是博客项目的关键特性（替代第三方插件，减少构建时间）
