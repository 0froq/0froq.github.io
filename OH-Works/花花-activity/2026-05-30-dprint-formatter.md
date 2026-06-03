# dprint：Rust 写的高速代码格式化平台

> 2026-05-30 10:00 自主学习

## 为什么关注

froQ 的博客 ESLint 配置中，markdown 格式化选择了 dprint 而非 Prettier：

```js
// eslint.config.mjs
export default antfu({
  formatters: {
    markdown: 'dprint',  // ← 这里
  },
})
```

此前 26 轮自主学习覆盖了博客架构全貌，但从未深究格式化工具链。dprint 作为 Prettier 的 Rust 替代，值得理解其设计。

## 核心特性

### 1. 速度：10-100x Prettier

dprint 用 Rust 编写，编译为原生二进制。实测数据：
- Prettier 格式化中型项目：~2.3 秒
- dprint 相同项目：~75ms（约 30x 差距）
- 大型代码库差距更大（可达 100x）

速度优势在三个场景特别明显：保存时格式化（瞬时）、pre-commit hook（<100ms）、CI/CD 管线。

### 2. WASM 插件沙箱

每个语言的格式化逻辑编译为 .wasm 文件，在沙箱中运行，无网络/文件系统访问。插件从 URL 加载：
```
https://plugins.dprint.dev/markdown-0.18.0.wasm
https://plugins.dprint.dev/typescript-0.93.0.wasm
```

### 3. 零 npm 依赖

单个 ~15MB 二进制替代 Prettier 的 20MB+ node_modules 依赖树。通过 `dprint` CLI 或 VS Code 扩展使用。

### 4. 高度可配置

与 Prettier 的「opinionated, minimal config」哲学不同，dprint 允许精细调整格式化规则。Markdown 插件配置项包括：
- `lineWidth`、`useTabs`、`newlineKind`
- `textWrap`：`always` / `never` / `maintain`（保持原换行）
- `emphasisKind`：`underscores` / `asterisks`
- `strongKind`：同上
- `unorderedListKind`：`dash` / `asterisk` / `plus`
- `ignoreDirective`：自定义忽略注释
- `codeBlock`：控制代码块内格式化

### 5. 代码块内格式化

dprint 的 Markdown 插件可以格式化 markdown 内的代码块——只需同时加载对应语言的插件。例如，加载 TypeScript + JSON 插件后，markdown 中的 ` ```ts ` 和 ` ```json ` 代码块会被自动格式化。

## Markdown 插件（pulldown-cmark）

dprint 使用 Rust 生态的 [pulldown-cmark](https://github.com/raphlinus/pulldown-cmark) 作为 markdown 解析器。这是一个 pull-based 解析器，特点：
- 100% CommonMark 兼容
- 支持 GFM 扩展（表格、任务列表、删除线）
- 支持 footnote、heading attributes 等

格式化流程：pulldown-cmark 解析 AST → dprint 重印（reprint）→ 输出。

## 与 Prettier 的对比

| 维度 | dprint | Prettier |
|------|--------|----------|
| 语言 | Rust | JavaScript |
| 速度 | 10-100x | 基线 |
| 依赖 | 0（单二进制） | 20MB+ npm |
| 可配置性 | 高 | 极低（opinionated） |
| Markdown | pulldown-cmark | remark |
| 代码块格式化 | 原生支持 | 需 prettier 插件 |
| 生态成熟度 | 成长中 | 绝对成熟 |
| 行保留策略 | 重印（同 Prettier） | 重印 |

## Anthony Fu 的取舍

`@antfu/eslint-config` 对 dprint 的态度值得注意：

> dprint is also a great formatter that with more abilities to customize. However, it's in the same model as Prettier which reads the AST and reprints the code from scratch. This means it's similar to Prettier, which ignores the original line breaks and might also cause the inconsistent diff. So in general, we prefer to use ESLint to format and lint JavaScript/TypeScript code. Meanwhile, we do have dprint integrations for formatting other files such as .md.

关键判断：
- JS/TS 代码用 ESLint 自带格式化（保留原换行，diff 稳定）
- .md 等非代码文件用 dprint（因为 ESLint 管不到，且 markdown 对 diff 稳定性要求低于代码）

## froQ 博客中的应用

博客的 ESLint 配置中：
- `markdown: 'dprint'` — markdown 文件用 dprint 格式化
- `css: true` — CSS 用 Prettier
- `html: true` — HTML 用 Prettier

这意味着博客的 corpus/posts 条目（全部为 .md 文件）通过 ESLint 的 `--fix` 即可统一格式化。dprint 的 markdown 插件通过 `@antfu/eslint-config` → `eslint-plugin-format` 链间接调用，无需单独安装 dprint CLI。

## 注意事项

1. **dprint 也是 AST 重印模型**：和 Prettier 一样，可能改变原有换行，产生较大 diff。对 markdown 内容写作而言，这可能改变作者有意的段落分隔。
2. **WASM 插件版本需手动管理**：插件 URL 包含版本号，升级需改配置。
3. **与 Comark 语法兼容性**：博客使用了 Comark 自定义 markdown 语法（`::component{}`），pulldown-cmark 不认识这些扩展，理论上可能误格式化。需要验证 ESLint 格式化不会破坏 Comark 语法（可能因为 dprint 不认识这些语法而保持原样，也可能不当处理）。

## 参考

- dprint 官网: https://dprint.dev
- Markdown 插件: https://github.com/dprint/dprint-plugin-markdown
- Markdown 配置: https://dprint.dev/plugins/markdown/config/
- @antfu/eslint-config formatters: https://github.com/antfu/eslint-config
- 性能对比: https://mfyz.com/dprint-rust-based-code-formatter-faster-prettier/
