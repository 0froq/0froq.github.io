# oxc / oxlint：JavaScript 工具链 Rust 化的 linter 前沿

> 2026-05-30 15:00 巡检自主学习

前 30 轮覆盖了 froQ 技术栈的几乎所有单体工具（Ghostty / Zellij / Neovim / dprint / bumpp / ESLint / UnoCSS / VitePress / Julia 可视化），唯独漏了 oxc/oxlint 这条线。这是 JavaScript 工具链 Rust 化的核心拼图之一。

## 一、oxc 是什么

**oxc**（The JavaScript Oxidation Compiler）是 VoidZero（Evan You 的公司）开发的 Rust 原生 JavaScript/TypeScript 工具链基础库。它不是面向终端用户的工具，而是一组高性能原语：parser、transformer、linter、minifier、formatter。

面向终端用户的产品：
- **oxlint**：Rust 原生 linter，对标 ESLint
- **oxfmt**：Rust 原生 formatter，对标 Prettier
- **Rolldown**：Rust 原生 bundler（基于 oxc parser），Vite 8 的 bundler 引擎
- **Vite+**：集成 oxlint + oxfmt + Rolldown 的统一工具链（VoidZero 的商业产品）

## 二、oxlint 当前状态（2026 年 5 月）

### 版本与规则覆盖

- **最新版本**：v1.67.0（2026-05-26 发布）
- **内置规则**：813+ 条（v1.0 时 520 条，持续增长中）
- **覆盖插件**：eslint core、typescript-eslint、react、vitest、unicorn、import、jsx-a11y、next 等
- **规则来源**：从 ESLint 生态迁移，持续从 eslint core、typescript-eslint、eslint-plugin-react、eslint-plugin-vitest 等补充

### 性能

- **50-100x 快于 ESLint**（纯 built-in rules 场景）
- Type-aware linting 使用 **tsgo**（TypeScript 7 Go 原生移植），8-12x 快于 typescript-eslint
- 冷启动几乎为零（native binary，无 Node.js 启动开销）

值得注意的是：JS Plugins（alpha）模式下性能会显著下降——实测从 500-700ms 掉到 8s，因为需要回调 JavaScript 运行时。这是过渡方案，不是长期目标。

### 配置与迁移

- **@oxlint/migrate**：自动将 ESLint flat config（eslint.config.mjs）转换为 `.oxlintrc.json`
- **eslint-plugin-oxlint**：在 ESLint 中禁用已被 oxlint 覆盖的规则，实现并行运行
- **零配置模式**：安装即用，适合小中型项目直接替代 ESLint
- **.oxlintrc.json**：类 ESLint flat config 的配置格式（JSON），支持嵌套、overrides、extends

### Q2 2026 路线图

1. 修复 Vite 7→Vite 8 升级阻断 bug
2. 修复阻止 Vite+ 使用的 oxlint/oxfmt 问题
3. **Framework support for Oxlint and Oxfmt**（核心）

## 三、Vue 支持：当前状态与未来路径

这是对 froQ 博客项目最关键的问题。

### 当前能力

- **`<script>` 块**：oxlint 内置 vue 插件可以 lint Vue SFC 中的脚本部分（TypeScript/JavaScript）
- **`<template>` 块**：**不支持**。eslint-plugin-vue 的模板规则无法迁移，因为该插件依赖自己的 Vue compiler 生成修改过的 AST，oxc 的 parser 无法直接消费
- **`<style>` 块**：不支持（但可以用 stylelint 等独立处理）

### 未来路径：Language Plugins RFC

oxc 团队已发布 [RFC #21936](https://github.com/oxc-project/oxc/discussions/21936)，提出 **Language Plugin** 架构：

```
parse(filePath, sourceText) → { ast, tokens, transform }
load(filePath, parseResult) → LoadedLanguageFile
```

- 语言插件负责将框架文件（.vue/.svelte/.astro）解析为框架原生 AST
- 如果提供 `transform` 函数，将框架代码转换为虚拟 JS/TS 源码，供 Rust rules 和 type-checking 使用
- 虚拟代码生成需要在语义上忠实保留（而非编译输出），以支持 type-aware linting
- Source mapping 将诊断映射回原始框架文件

**Vue 的复杂性**：由于 Vue template 中的 JavaScript 表达式（`{{ count }}`、`v-for`、`v-if`）和 Composition API 的符号定义（`defineProps`、`defineEmits`），生成语义正确的虚拟 TS 源码远比简单的「提取 script 块」复杂。Volar 的经验表明，这需要在 TypeScript program 创建阶段介入。

**当前状态**：Language Plugins 仍在 RFC 阶段，Q2 2026 路线图中「Framework support」是三大目标之一，但 Vue template 完全支持预计要到 Q3 或更晚。

### 社区实践

- 有人已在使用 oxlint 对 Vue 项目的 script 块做第一遍快速 lint，ESLint + eslint-plugin-vue 处理 template
- [vue-oxc-toolkit](https://github.com/liangmiQwQ/vue-oxc-toolkit) 是一个社区 fork，尝试生成 module_record 和 irregular_whitespaces，但距离生产可用还有距离

## 四、Anthony Fu 的立场

antfu/eslint-config 项目 Issue [#767](https://github.com/antfu/eslint-config/issues/767) 专门跟踪 oxlint 集成计划。

**当前结论**：⏳ oxlint is **NOT READY**

两个可能的集成路径：

### 路径 A：oxlint 作为 ESLint 规则运行
- 需要 oxlint 提供细粒度的程序化 JS API
- oxlint 作为 ESLint rules 运行，加速已支持的规则
- 保持 ESLint CLI 和 eslint-config 作为单一配置源

### 路径 B：oxlint 完全替代 ESLint
- 需要 flat config 兼容（目前 `.oxlintrc.json` 不是 flat config）
- 需要 JS Plugin API 完全兼容所有 ESLint 插件
- 理想情况：用户无感知，直接使用现有 eslint-config

关键障碍：
1. **配置格式**：oxlint 用 JSON，ESLint 用 JS/TS flat config。无法共享同一份配置
2. **JS Plugin 完整度**：alpha 阶段，性能损失大，API 覆盖不完整
3. **Embedded languages**：TypeScript in Vue、JavaScript in Markdown、CSS in HTML——这些跨语言规则的配置在 oxlint 中还没有统一方案
4. **eslint-plugin-vue**：无法完全兼容，模板 linting 需要 Language Plugin

Anthony Fu 的态度很务实：**不接受以失去功能为代价换取速度**。在 oxlint 能无缝作为 drop-in 替换之前，他的 config 不会内置支持。

## 五、与 froQ 博客工具链的关系

### 博客 ESLint 现状

```js
// eslint.config.mjs
import antfu from '@antfu/eslint-config'
export default antfu({
  unocss: true,
  vue: true,           // ← 依赖 eslint-plugin-vue
  typescript: true,
  formatters: {
    markdown: 'dprint' // ← 已经 Rust 化！
  }
})
```

### 迁移可行性评估

| 维度 | 现状 | 结论 |
|------|------|------|
| JS/TS rules | oxlint 覆盖 813 条规则，大部分 antfu config 规则已覆盖 | ✅ 可行 |
| Type-aware rules | tsgo 8-12x 快于 typescript-eslint | ✅ 可行 |
| Vue script | 内置 vue 插件支持 | ✅ 可行 |
| Vue template | eslint-plugin-vue 模板规则**无法迁移** | ❌ 阻塞 |
| UnoCSS | oxlint 无对应插件 | ❌ 缺失 |
| Markdown linting | dprint 已处理，不需要 ESLint | ⚪ 无关 |
| 配置格式 | antfu/eslint-config 是 JS flat config，oxlint 是 JSON | ❌ 分裂 |

### 推荐策略

对于博客项目，**当前不建议迁移**。理由：

1. **Vue template linting 是硬阻塞**。博客的 VitePress theme 有大量 .vue SFC，模板规则（`vue/max-attributes-per-line`、`vue/html-indent` 等）不可放弃
2. **antfu/eslint-config 未支持**。强行迁移意味着放弃 Anthony Fu 精心调校的规则集
3. **代码规模不大**。VitePress 博客项目不是 10 万行 monorepo，ESLint 性能差异在日常开发中感知不强
4. **dprint 已经 Rust 化**。格式化层（markdown、CSS、HTML）已由 dprint 接管，ESLint 的负担已减轻

**可以尝试的过渡方案**（不急，等 Language Plugins 稳定后再做）：

```
oxlint (快速初筛) → ESLint + eslint-plugin-vue (模板规则 + 剩余)
```

用 `eslint-plugin-oxlint` 在 ESLint 中禁用已被 oxlint 覆盖的规则，避免重复诊断。

### 值得关注的时间节点

- **2026 Q2 末**：Language Plugins RFC 落地，Vue template 支持进入 alpha
- **2026 Q3-Q4**：Language Plugins 稳定，JS Plugins 脱离 alpha
- **2027**：oxlint 可能具备完全替代 ESLint 的能力（含 Vue）

## 六、更广的图景：JavaScript 工具链 Rust 化

oxc 不是孤立现象。2025-2026 年 JavaScript 工具链正在经历系统性的 Rust 重写：

| 工具 | Rust 替代 | 状态 (2026.05) | froQ 使用情况 |
|------|-----------|----------------|---------------|
| Linter | **oxlint** (oxc) | v1.67, Vue template 待支持 | 使用 ESLint (@antfu/eslint-config) |
| Formatter | **dprint** / **oxfmt** (oxc) | dprint 成熟, oxfmt v0.52 | ✅ 使用 dprint |
| Bundler | **Rolldown** (oxc) | v1.0 beta, Vite 8 引擎 | VitePress → 未来 Vite 8 |
| CSS | **Lightning CSS** | 成熟，已集成 Vite | VitePress 内置 |
| Parser | **oxc_parser** | 成熟，被 Rolldown/oxlint/oxfmt 共用 | 间接使用 |
| Type Checker | **tsgo** (TypeScript 7 Go 移植) | 被 oxlint type-aware 使用 | 间接使用 |
| All-in-one | **Biome** | v2.3, linter+formatter 成熟 | 未使用 |

这个趋势的核心逻辑不是「Rust 更好」，而是 **parser 不应该用 JavaScript 写**——它是整个工具链的瓶颈。oxc 的战略意义在于：**一次解析，所有工具共用 AST**。ESLint 自己 parse 一遍，Prettier 再 parse 一遍，TypeScript 再 parse 一遍——oxc 的愿景是只 parse 一次。

对于 froQ 而言：
- **dprint 已上车**（markdown/HTML/CSS 格式化已 Rust 化）
- **Vite 8 / Rolldown 自动上车**（VitePress 升级后免费获得）
- **oxlint 待 Vue template 支持稳定后迁移**（1-2 年内）

这不是需要主动推动的事，而是等生态成熟后自然发生的迁移。

## 七、来源

- oxc GitHub: https://github.com/oxc-project/oxc（21.3K stars）
- Oxlint 1.0 发布: https://www.infoq.com/news/2025/08/oxlint-v1-released/
- Marvin Hagemeister 博客（oxlint/oxfmt 性能分析）: https://marvinh.dev/blog/speeding-up-javascript-ecosystem-part-13/
- Anthony Fu oxlint 集成 Issue: https://github.com/antfu/eslint-config/issues/767
- Language Plugins RFC: https://github.com/oxc-project/oxc/discussions/21936
- Vue 支持 Issue: https://github.com/oxc-project/oxc/issues/15761
- oxlint v1.67.0 发布: https://github.com/oxc-project/oxc/releases/tag/apps_v1.67.0
- Q2 2026 路线图: https://github.com/oxc-project/oxc/issues/21102
- Oxlint vs ESLint 对比 (PkgPulse): https://www.pkgpulse.com/guides/oxlint-vs-eslint-rust-linting-performance-2026
- Rust 工具链趋势综述 (DEV): https://dev.to/dataformathub/deep-dive-why-rust-based-tooling-is-dominating-javascript-in-2026-3dbl
