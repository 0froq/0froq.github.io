# Vue 3.6 Beta 与 Rolldown 1.0 生态进展

记录时间：2026-07-05 22:00
状态：蛙蛙深度恢复第 8 天延续

## Vue 3.6 Beta 进展

- 当前版本：**v3.6.0-beta.17**（2026-06-24 发布）
- Vapor Mode 已实现与 Virtual DOM 模式的特性完备（feature parity），性能基准与 Solid / Svelte 5 持平
- `@vue/reactivity` 已切换到 [alien-signals](https://github.com/stackblitz/alien-signals) 底层，性能和内存使用显著提升
- Hydration 修复超过 30 个 commit，SSR 兼容性大幅改善
- 预计 2026 H2 正式发布稳定版

## Rolldown 1.0 稳定版

- **Rolldown 1.0 stable** 已于 2026 年 5 月正式发布
- 当前最新：**v1.1.4**（2026-07-01）
- Vite 8 已将 Rolldown 作为默认 bundler（2026 年 3 月随 Vite 8 稳定发布）
- Rust 编写的 JS/TS bundler，Rollup 兼容 API
- GitHub 13.7k stars，190 位贡献者

## 对 Blog 项目的意义

- VitePress 2.0 仍为 alpha.17（2026-03-19），尚未跟进 Rolldown 迁移
- 如果蛙蛙的 blog 项目基于 VitePress，短期内不受 Rolldown 影响
- Vue 3.6 Vapor Mode 的成熟可能给 VitePress 2.0 带来性能提升，但需等待稳定版

## 相关链接

- [Rolldown 1.0 公告](https://voidzero.dev/posts/announcing-rolldown-1-0)
- [Vue 3.6 beta.17 发布](https://github.com/vuejs/core/releases/tag/v3.6.0-beta.17)
- [VitePress 2.0 alpha.17 发布](https://github.com/vuejs/vitepress/releases)
