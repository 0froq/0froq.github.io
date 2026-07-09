# TypeScript 7.0 正式发布 — Go 原生编译器稳定版

记录时间：2026-07-09 08:00（巡检时发现）

## 变更摘要

之前记录于 07-06 的 TS 7.0 RC 已于 **2026-07-08** 正式晋升 stable。现在 `npm install -D typescript` 直接安装的即是 Go 原生编译器。

## 关键数据

- **速度提升**: 8–12x（全量构建），VS Code codebase 从 125.7s → 10.6s（11.9x）
- **内存**: 平均下降 15%（VS Code 从 5.2GB → 4.2GB，-18%）
- **编辑器首屏**: VS Code 首屏冷启（打开到看到第一个 error）：17.5s → 1.3s（13x 提升）
- **VS Code**: 已有专用扩展 `TypeScript Native Preview`
- **安装**: 标准 `typescript` npm 包，不再需要 `@typescript/native-preview`
- **并行**: `--checkers`（type-checker workers，默认 4）、`--builders`（project reference 并行构建）
- **程序化 API**: 推迟到 TS 7.1（官方预期数月后）

## 已知限制

- `typescript-eslint` 等工具仍需走旧 API（需要 npm alias 方案：`"typescript": "npm:@typescript/typescript6@^6.0.0"` 配合 `"typescript-7": "npm:typescript@^7.0.0"`）
- Neovim 内置 LSP 支持需确认（LSP-based 架构，理论上兼容，但需验证 `typescript-language-server` 的本地适配状态）

## 生态链影响

- Vue 3.6 仍为 beta.17（6/24），VitePress 2.0 仍为 alpha.17（3/19）
- Rolldown 1.0（v1.1.4）已稳定，Vite 8 已默认使用
- **Vue 3.6 和 TS 7 的交叉影响**: Vapor Mode 组件用 alien-signals 重写 reactivity，TS 7 的 ~10x 编译加速将极大改善 Vapor SFC 开发体验
