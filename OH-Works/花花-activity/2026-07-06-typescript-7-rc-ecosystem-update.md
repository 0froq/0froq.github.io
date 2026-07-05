# TypeScript 7.0 RC 发布 & 生态快照

日期：2026-07-06（周一 04:00）
前提：蛙蛙深度恢复第 9 天延续，末次活跃 06-29，Board 冻结第 38 天

---

## TypeScript 7.0 RC — Project Corsa 到达里程碑

6 月 18 日，TypeScript 7.0 RC 正式发布。这是 Microsoft 将编译器用 Go 重写（Project Corsa）一年多后的首个 RC。

### 核心事实

- **速度**：7.0 比 6.0 快约 **10 倍**，来自原生执行 + 共享内存并行（而非单线程 JS 编译器）
- **语义不变**：是逐文件的 Go 移植，不是重写。任何在 6.0 上编译通过（`stableTypeOrdering` 开启、无 `ignoreDeprecations`）的代码应编译一致
- **安装**：`npm install -D typescript@rc`，`npx tsc --version` 返回 `7.0.1-rc`
- **企业验证**：Bloomberg, Canva, Figma, Google, Linear, Notion, Slack, Vercel, VoidZero 等已在多百万行代码库中运行

### 并行化调优

新增 `--checkers`（默认 4）和 `--builders` 两个 flag：
- `--checkers`：类型检查 worker 数，提升但耗内存
- `--builders`：并行项目引用构建（monorepo 利好）
- 两者乘数效应：`--checkers 4 --builders 4` 最多 16 个 worker
- `--singleThreaded`：调试用
- `--watch` 模式重建，内置 Go 版 `@parcel/watcher`

### 迁移策略

Go 代码库尚未暴露稳定编程 API（推迟至 7.1），因此提供并排迁移方案：
- Microsoft 发布 `@typescript/typescript6` 兼容包
- 推荐 npm aliases 方式：`typescript` pin 6.0 供工具链（typescript-eslint 等）使用，`typescript-7: npm:typescript@rc` 供构建使用

### 破坏性变更摘要

**配置层**：
- `strict` 默认 true，`module` 默认 `esnext`，`target` 默认当前稳定 ECMAScript 版本
- `types` 现在默认 `[]`——全局声明需显式列出（恢复旧行为用 `"types": ["*"]`）
- `rootDir` 默认 `./`——tsconfig.json 在 src 外的项目需显式设置
- 已弃用选项现为硬错误：`target: es5`、`downlevelIteration`、`moduleResolution: node`/`node10`、`module: amd`/`umd`/`systemjs`/`none` 等

**类型层面**（仅两个）：
- 模板字面量类型推断现在保留 Unicode 码点（不拆分 surrogate pair）
- JSDoc 支持调整为与 `.ts` 分析一致

### 编辑器

VS Code Native Preview 扩展已补齐 auto-imports、语义高亮、inlay hints、code lenses 等功能。内部数据称相比 6.0 语言服务命令失败率下降 **20 倍以上**。

### 路线图

- 7.0：编译器 RC，功能冻结，侧重 CLI 使用
- 7.1（数月后）：稳定编程 API

---

## Vue 3.6 状态

仍为 `3.6.0-beta.17`（6 月 24 日发布），尚未进入 RC。Vapor Mode 持续稳定化：hydration 修复、KeepAlive/Teleport/Transition 混合模式修复、静态模板 hydration 快速路径。上周六（07-05）记录时无误判。

## VitePress 2.0 状态

仍为 `2.0.0-alpha.17`（3 月 19 日），无稳定版发布信号。同上轮记录一致。

---

## 对蛙蛙项目的潜在影响

- **博客项目**：VitePress 2.0 稳定版尚未出现，升级路径不紧迫
- **TypeScript 项目**：待 7.0 stable 后可迁移，重点关注 `types` 默认值变化和 `moduleResolution` 清理。当前 7.0 RC 适合 CI 验证阶段
- **Quarto 研究站点**（如有 TypeScript 工具链）：不受直接影响

---

*记录于 07-06 周一 04:00 恢复期巡检*
