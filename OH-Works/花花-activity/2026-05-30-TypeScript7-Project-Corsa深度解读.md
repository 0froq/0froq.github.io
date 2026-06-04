# TypeScript 7 Project Corsa 深度解读

> 2026-05-30 整理

## 一句话

Microsoft 用 Go 从头重写了 TypeScript 编译器（Project Corsa），10x 类型检查速度、4x 内存减少。TS 6.0 是最后一个 JS 版本，TS 7.0 预览版已可用。

---

## 核心数据

| 指标 | TS 5.x (JS) | TS 7.0 (Go) | 提升 |
|------|------------|-------------|------|
| VS Code 冷类型检查 (1.5M 行) | 77s | 7.5s | **10.3x** |
| 增量构建 | 4-8s | 0.4-0.8s | **10x** |
| 内存占用 | 1.2GB | ~300MB | **4x** |
| CI 类型检查 (中型项目) | 45s | 5s | **9x** |

Monorepo 场景叠加效应更显著：原本 5 分钟的类型检查可降至 30 秒。

---

## 为什么是 Go 而不是 Rust

这是社区问得最多的问题。答案在于 TypeScript 编译器的内部架构：

- **共享可变状态**：编译器大量使用可变共享数据结构，复杂递归类型推断、12 年积累的代码逻辑深度依赖 mutation
- **Rust 所有权模型不匹配**：要移植到 Rust 需要从根本上重写逻辑，等于做一个新编译器而非移植
- **Go 的 GC 内存模型**天然匹配编译器的工作方式

C# 也被评估过，但 .NET runtime 作为 JS 构建工具的依赖会增加工具链复杂度，非 Windows 环境分发也有摩擦。

---

## 时间线

- **2025 年 3 月**：Anders Hejlsberg 亲自宣布 Project Corsa
- **2026 年 3 月 23 日**：TypeScript 6.0 发布（最后一个 JS 版本）
- **2026 年 5 月**：TS 7.0 预览版可用，功能完成度 >95%
- **TS 7.0 稳定版**：尚未公布具体日期，进度超前于原计划

---

## TypeScript 6.0：桥接版本

6.0 不只是过渡，自身也包含语言改进：

- 改进的 discriminated unions narrowing
- 更好的复杂泛型模式推断
- 新的 strictness 选项（opt-in，7.0 可能变默认）
- 标记将在 7.0 移除的遗留行为：`--out` 标志（非 `--outDir`）、部分 decorator metadata 选项、少量编译器 API
- 提供 `tsc --migration` 诊断命令，输出项目迁移到 7.0 的兼容性报告

**规则很简单**：如果你的项目在 TS 6.0 上零废弃警告通过，就做好了 7.0 的准备。

---

## 对开发者的实际影响

### 1. LSP / 编辑器体验
tsserver → tsgo LSP，大型代码库中自动补全、跳转定义、内联错误诊断全部 10x 响应。Monorepo 里不再有 2 秒等待补全的体验。

### 2. CI 类型检查
原本次分钟级的类型检查步骤变成秒级。对强制类型检查通过才能合并的团队，迭代成本大幅降低。

### 3. Watch mode
`tsc --watch` 反馈循环近乎即时，即使几十万行代码的项目。

### 4. 内存
1.2GB → 300MB，对资源受限环境（CI worker、低配开发机）友好很多。

---

## 生态兼容性

**不受影响**（只消费 tsserver/LSP）：
- VS Code、WebStorm、Neovim 等编辑器
- 你的 `.ts` / `.tsx` 代码、`tsconfig.json` 配置全部照旧
- TypeScript 仍然编译为 JavaScript，Go 重写的是编译器而非输出

**需要迁移**（直接导入 `typescript` 编译器包）：
- `typescript-eslint`：团队从 day 1 开始跟踪，将在 7.0 稳定版同步发布兼容版本
- `ts-morph`、`ts-node` 等工具需要更新
- 一般规则：如果工具**发布** TypeScript 就没问题；如果工具**分析或转换** TypeScript 且导入 `typescript` 包，需要迁移

---

## Neovim 中的 tsgo 支持

nvim-lspconfig 已内置 `lsp/tsgo.lua` 配置（master 分支），Neovim 0.11+ 可直接启用：

```lua
-- 使用 nvim-lspconfig 内置配置
vim.lsp.enable("tsgo")
```

tsgo 原生支持 monorepo，自动发现各 package 对应的 `tsconfig.json`，无需启动多个实例。

安装方式：
```bash
npm install @typescript/native-preview
npx tsgo --lsp --stdio
```

或从源码构建（需要 Go 工具链）：
```bash
git clone --recurse-submodules https://github.com/microsoft/typescript-go.git
cd typescript-go
hereby install-tools && hereby build
```

---

## 迁移路径

1. **立即升级到 TS 6.0**：`npm install typescript@6`，修复所有废弃警告
2. **运行兼容性诊断**：`npx tsc --migration`
3. **检查工具链依赖**：查找依赖中直接导入 `typescript` 包的工具，确认 7.0 兼容状态
4. **在分支中测试 7.0 beta**：`npm install typescript@beta`，对比类型检查输出
5. **7.0 稳定后更新 CI**：类型检查步骤从瓶颈变可忽略

---

## 参考

- [TypeScript Native Port 公告](https://devblogs.microsoft.com/typescript/typescript-native-port/)
- [microsoft/typescript-go GitHub](https://github.com/microsoft/typescript-go)（25.5k stars）
- [Anders Hejlsberg: A 10x Faster TypeScript](https://www.youtube.com/watch?v=pNlq-EVldXw)
- [FullStackEvolved: TS 6.0 & Project Corsa 详解](https://www.fullstackevolved.com/blog/typescript-6-project-corsa-go-compiler-2026-05-02/)
