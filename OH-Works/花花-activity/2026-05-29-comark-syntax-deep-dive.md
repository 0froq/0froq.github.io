# Comark 语法深度调研

**时间**：2026-05-29 14:00  
**来源**：comark.dev 官方文档 + 源码分析  
**关联**：博客 markdown 管线（config.mts → @comark/markdown-it）

---

## 一、Comark 是什么

Comark = **Co**mponents in **Mark**down。前身是 Anthony Fu 创建的 MDC（Markdown Components），被 Nuxt Content 使用了五年。Comark 是其继任者——更快、支持流式解析、框架无关。Nuxt 已宣布 `@nuxtjs/mdc` 废弃，迁移至 Comark。

核心设计哲学：组件语法保持在纯文本中，解析可选在构建时或运行时执行，跨框架渲染。

---

## 二、语法体系

### 2.1 块级组件（Block）

```
::alert{type="info"}
这是组件内容，支持 **markdown**
::
```

- 使用 `::name{props}` 开启，`::` 闭合
- 占独立行
- 内部可包含 markdown 和其他组件

### 2.2 行内组件（Inline）

```
点击 :button[提交]{type="primary"} 继续。
状态：:badge[Active]{color="green"}
```

- 语法：`:name[content]{props}`
- 可嵌套在段落文本中
- 三种形式：纯组件 `:icon`、带内容 `:badge[text]`、带属性 `:badge[text]{color="blue"}`

### 2.3 属性系统（Props）

**内联属性**（`{...}` 语法）：

```
::component{prop="value"}       # 键值对
::component{bool}               # 布尔（自动转为 true）
::component{#custom-id}         # ID
::component{.class-name}        # CSS 类
::component{.class1 .class2}    # 多个类
::component{obj='{"key":"val"}'}# JSON 对象
```

**YAML 块属性**（两种风格）：

```
::card
```yaml [props]
title: 文章标题
count: 42
enabled: true
items:
  - 项目一
  - 项目二
config:
  theme: dark
```
内容
::
```

或使用 frontmatter 风格 `---` 分隔符。规则：
- 必须在组件内容最开头，slot 之前
- 对象保持对象、数组保持数组、数字/布尔保持类型
- 与内联属性合并时，内联优先

### 2.4 数据绑定

以 `:` 为前缀的 prop 在渲染时进行 JSON 解析或上下文查找：

```
---
theAnswer: 42
user: { name: Ada }
---

::question{:answer="frontmatter.theAnswer"}
::
```

四个命名空间：
| 命名空间 | 来源 |
|----------|------|
| `frontmatter` | 文档 YAML frontmatter |
| `meta` | 插件注入的元数据 |
| `data` | 渲染器传入的运行时数据 |
| `props` | 父组件的 props |

嵌套组件可引用父组件 props：

```
::card{title="Hello" variant="primary"}
  :::badge{:color="props.variant" :text="props.title"}
  :::
::
```

### 2.5 插槽（Slots）

**默认插槽**：直接放在组件内的内容

```
::alert{type="info"}
默认插槽内容
::
```

**命名插槽**：

```
::card
#header
## 卡片标题

#content
主要内容

#footer
页脚文本
::
```

- YAML 块属性必须在所有 slot 之前
- 顺序：`::component{inline}` → YAML props → `#slot` → `::`

### 2.6 嵌套

```
::level-1
  :::level-2
    ::::level-3
    内容
    ::::
  :::
::
```

多余冒号不是必须的，但推荐用于视觉一致性。解析器通过匹配开闭标签层级来处理嵌套。

---

## 三、与 MDC 的区别

| 维度 | MDC (old) | Comark (new) |
|------|-----------|--------------|
| 解析器 | remark 生态 | markdown-exit（自研，更快） |
| 框架绑定 | 强绑定 Nuxt/Vue | Vue / React / Svelte / HTML / ANSI |
| 流式支持 | 无 | 有（auto-close，适合 AI 生成） |
| AST | 复杂嵌套 | 紧凑 `['tag', props, ...children]` |
| 维护状态 | 已废弃 | 活跃开发（0.x → 1.0） |

---

## 四、在 froQ 博客中的角色

博客使用 `@comark/markdown-it`（v0.3.4）作为 markdown-it 插件：

```ts
// docs/.vitepress/config.mts
md.use(comark)
```

管线顺序：`mark → hashtag → figures → ruby → comark → footnote`

这意味着：
1. Comark 组件语法在 markdown-it 渲染阶段被解析
2. 转换为 HTML 标签（构建时，静态输出）
3. 不依赖运行时 `<Comark>` 组件（那是 `@comark/vue` 的用法）
4. 实际使用中发现 `::tip`、`::warning`、`::code-group` 等组件

与 VitePress 内置容器的关系：VitePress 默认支持 `:::tip` / `:::warning` 等容器语法，而 Comark 的 `::tip` 语法与之并行。两者在 markdown-it 层面可能产生冲突或互补——具体取决于插件注册顺序和解析优先级。

### 与其他插件的关系

Comark 在管线的第 5 位（倒数第 2），这意味着：
- `markdown-it-hashtag` 先处理 `#tag` 语法
- `markdown-it-implicit-figures` 处理图片
- `markdown-it-ruby` 处理注音
- Comark 处理组件语法
- `markdown-it-footnote` 最后处理脚注

如果 Comark 组件内部使用了 hashtag 或 ruby 语法，这些会被先前的插件正确处理后再进入 Comark。

---

## 五、值得关注的生态方向

1. **Comark 1.0 路线图**：目前 0.x 阶段，v1.0 稳定后语法可能有调整
2. **流式渲染**：Comark 的 auto-close 特性适合 AI 生成内容，未来博客如果接入 AI 写作辅助，这是一个天然优势
3. **语法高亮**：Comark 内置 Shiki 支持，与博客已有的 Twoslash 生态自然衔接
4. **`@comark/markdown-it` vs `@comark/vue`**：前者是构建时静态转换，后者是运行时动态渲染。博客目前使用前者，如果未来需要动态渲染场景（如评论区预览），可以考虑后者
5. **VS Code 扩展**：`Nuxt.mdc` 扩展已更名为 Comark，提供语法高亮和冒号匹配

---

## 六、残存疑问（#gap）

- 博客中 `::tip` 和 `::warning` 实际是通过 Comark 还是 VitePress 原生容器渲染的？需要运行时测试确认
- `::code-group` 组件的 Vue 实现在哪里？可能通过 VitePress theme 的 `enhanceApp` 注册
- `@comark/markdown-it` 与 VitePress 内置的 markdown 组件系统是否存在重复解析或冲突？需要检查实际构建产物
- `markdown-it-attrs` 被注释掉了（`config.mts` 中 `// .use(markdownItAttrs)`），可能与 Comark 的属性语法冲突
