# Shiki Twoslash 深度解析：静态代码的类型魔法

2026-05-29 凌晨巡检学习笔记。

## 背景

froQ 的 blog 项目（VitePress）在 `docs/.vitepress/config.mts` 中配置了完整的 Shiki 生态：

```ts
codeTransformers: [
  transformerTwoslash({
    typesCache: createFileSystemTypesCache(),
  }),
  transformerMetaWordHighlight(),
  transformerNotationWordHighlight(),
  transformerColorizedBrackets(),
],
```

四个 transformer 形成了一条渲染管线。其中 Twoslash 是核心——它让静态代码块展示 TypeScript 编译器级别的类型信息。

---

## Twoslash 是什么

Twoslash 是一种 JavaScript/TypeScript 标记语言。你在代码注释中用特殊的双斜线指令（`// @...`）标记意图，Twoslash 调用真实的 TypeScript 编译器运行这段代码，提取类型信息、错误诊断、自动补全结果，然后嵌入到语法高亮的 HTML 输出中。

它的核心价值：**代码示例不再是死的文本，而是可验证的、携带类型信息的活文档。**

Orta Therox（前 TypeScript 编译器团队成员）创造了它，用来驱动 TypeScript 官网的所有代码示例。

---

## 核心语法

### 类型查询 `^?`

```ts
const abc = 'Hello'
//   ^?
```

Twoslash 会在这行上方显示 `const abc: string`。`^?` 的位置指向上一行你想查询的标识符。

### 自动补全 `^|`

```ts
console.e
//     ^|
```

Twoslash 调用 TypeScript 的自动补全 API，过滤 `console` 上以 `e` 开头的成员（如 `console.error`），最多显示 5 个结果。

### 错误诊断 `// @errors: CODE`

```ts
// @errors: 2339
let x: [string, number]
x = ['hello', 10]
console.log(x[0].substring(1)) // OK
console.log(x[1].substring(1)) // Error: Property 'substring' does not exist on type 'number'
```

在示例中故意展示编译错误，这在教学场景非常有用。

### 代码裁剪 `// ---cut---`

```ts
// 辅助代码在这里
function add(a: number, b: number) {
  return a + b
}
// ---cut---
const result = add(1, 2)
//    ^?
```

`---cut---` 以上的代码参与 TypeScript 编译（提供完整上下文），但不出现在最终渲染中。这是 Twoslash 最精妙的设计——**给编译器看的代码和给读者看的代码是两套**。

### 多文件示例 `// @filename: utils.ts`

```ts
// @filename: utils.ts
// @filename: main.ts
import { add } from './utils'

export function add(a: number, b: number) {
  return a + b
}
const result = add(1, 2)
//    ^?
```

模拟真实的模块解析，跨文件的类型推导完全正确。

### 编译器选项 `// @target: esnext`

```ts
// @target: esnext
// @module: nodenext
// @isolatedModules
```

与 tsconfig.json 相同的语义，精确控制示例的编译环境。

### 抑制错误 `// @noErrors`

当示例故意写不完整的代码（如上面的 `console.e`），但不想展示红色波浪线时使用。

---

## 在 VitePress 中的集成

`@shikijs/vitepress-twoslash` 提供了开箱即用的 VitePress 集成：

```ts
import { transformerTwoslash } from '@shikijs/vitepress-twoslash'
import { createFileSystemTypesCache } from '@shikijs/vitepress-twoslash/cache-fs'

export default defineConfig({
  markdown: {
    codeTransformers: [
      transformerTwoslash({
        typesCache: createFileSystemTypesCache(),
      }),
    ],
  },
})
```

关键配置：

- **`typesCache`**：使用文件系统缓存 TypeScript 类型定义。`createFileSystemTypesCache()` 在 `node_modules/.vitepress/twoslash-cache/` 下缓存 `.d.ts` 文件，避免每次都重新解析。这对构建性能至关重要。
- **`explicitTrigger: true`**（可选）：只在代码块语言标注中包含 `twoslash` 时才运行，例如 `` ```ts twoslash ``。不设置时，所有 TypeScript 代码块都会被 Twoslash 处理。
- **`rendererFloatingVue()`**（可选）：使用 Floating Vue 渲染浮动类型提示，悬停时弹出。不使用则输出纯 CSS 的静态标注。

froQ 的配置**没有设置 `explicitTrigger`**（默认为 false），意味着所有 TypeScript 代码块都会被 Twoslash 处理。这适合全面控制，但要注意没有 `// @noErrors` 的错误代码可能导致构建失败。

---

## 与相邻 Transformer 的协作

配置中的四个 transformer 是顺序执行的：

1. **`transformerTwoslash`** — 首先运行，注入类型信息、错误、高亮
2. **`transformerMetaWordHighlight`** — 根据 meta 中的 `/pattern/` 高亮特定词
3. **`transformerNotationWordHighlight`** — 根据 `// [!code word:Hello]` 注释高亮词
4. **`transformerColorizedBrackets`** — 为配对的括号分配相同色调

这个顺序有意义：Twoslash 先完成重活（类型检查），后续 transformer 做纯粹的 HTML 类名操作。

---

## 构建性能考虑

Twoslash 在每个代码块中启动一个完整的 TypeScript 语言服务，这在高文档量的博客项目中可能成为构建瓶颈：

1. **`typesCache` 至关重要** — froQ 已配置，但要注意缓存目录的大小和失效策略
2. **考虑 `explicitTrigger: true`** — 只在需要类型演示的代码块上用 Twoslash，普通示例用 `ts` 即可
3. **Twoslash CDN 模式** — 对于非 Node.js 环境（如边缘渲染），可以使用 `twoslash-cdn` 在浏览器中运行
4. **已知问题** — Shiki 仓库有内存泄漏的 issue（#796），大项目构建时可能需要留意

---

## Comark 与 Twoslash 的交集

froQ 的 Markdown 管道同时使用了 Comark（组件语法）和 Twoslash。两者在概念上有有趣的互补：

- **Comark**：让 Markdown 嵌入 Vue 组件（`::alert{type="info"}`），是内容层面的扩展
- **Twoslash**：让代码块携带编译器信息（`^?`），是代码层面的扩展

在同一个页面中，可以同时出现：

````md
::tip{title="TypeScript 知识"}
下面的代码展示了泛型约束的用法：
::

```ts twoslash
function identity<T extends { name: string }>(arg: T): T {
  return arg
}
// ---cut---
const result = identity({ name: "froQ", age: 28 })
//    ^?
```

```
```
````

```
Comark 处理 `::tip` 块，Twoslash 处理 `^?` 查询，互不干扰。

---

## 局限与权衡

1. **构建时依赖** — Twoslash 在构建时运行 TypeScript，不能用于纯客户端渲染
2. **Node.js 环境要求** — 依赖本地文件系统和 TypeScript 编译器
3. **类型缓存管理** — `.d.ts` 缓存可能过时，需要清理机制
4. **错误处理的敏感度** — 未标注 `@noErrors` 的错误代码会导致构建失败
5. **CSS 定制工作量** — 默认渲染是无样式的，需要自行编写 CSS（froQ 的 theme 目录应该已有对应样式）

---

## 关键链接

- Shiki Twoslash 文档：https://shikijs.github.io/twoslash/
- Twoslash 标记参考：https://twoslash.netlify.app/refs/notations
- VitePress Twoslash 集成：https://shiki.style/packages/vitepress-twoslash
- Comark 语法：https://comark.dev/syntax/markdown
- Comark 组件语法：https://comark.dev/syntax/components
```
