# 博客 i18n 架构分析

## 概述

博客采用了一种**非标准的 i18n 方案**：不使用 VitePress 内置的 `locales` 配置，而是在应用层用 vue-i18n v11 配合内容级的文件分离实现双语支持。这是一个有意识的设计选择。

## 依赖层

```
vue-i18n: ^11.2.8           # 运行时 i18n 库
@intlify/unplugin-vue-i18n: ^11.0.3  # Vite 插件，构建时编译 i18n 消息
```

`@intlify/unplugin-vue-i18n` 的作用：

- 构建时静态分析 i18n 消息，tree-shaking 未使用的 locale
- SSR 兼容（`ssr: true`）
- 减少运行时开销

## 为什么不使用 VitePress 内置 i18n？

VitePress 内置 i18n 的设计假设是：每个 locale 有独立的配置（`themeConfig`、`title`、`description` 等），通过 URL 前缀（`/zh/`、`/en/`）区分。这带来了几个约束：

1. **URL 结构被更改**：所有中文页面都要带 `/zh/` 前缀，破坏了已有链接
2. **Sidebar/Nav 需要按 locale 分别配置**：增加维护负担
3. **Search 行为变化**：内置搜索按 locale 隔离

而 froQ 的方案保留了：

- 中文作为默认语言，使用 clean URLs（无前缀）
- 英文作为次要语言，文件在 `en/` 子目录，URL 追加 `/en/`
- 单套 Nav/Sidebar 配置，通过 `useRouteI18n` 动态调整链接

这是一种**渐进式 i18n**：基础设施在，但不强制所有内容都有双语版本。

## 内容层的分离

### 文件结构

```
posts/
  610-log/
    speaking-english.md      # lang: en
    speaking-english-zh.md   # lang: zh (translated: true)
    index.md                 # locale: zh
    en/
      index.md               # locale: en
corpus/
  100-ingesta/
    ing-@cohen2014.md        # (无 lang 字段，默认为 zh 上下文)
    index.md                 # locale: zh
    en/
      index.md               # locale: en
```

### Frontmatter 约定

| 字段               | 位置               | 语义               |
| ------------------ | ------------------ | ------------------ |
| `lang: zh`         | 文章 frontmatter   | 文章主语言为中文   |
| `lang: en`         | 文章 frontmatter   | 文章主语言为英文   |
| `translated: true` | 文章 frontmatter   | 标记为翻译版本     |
| `locale: zh`       | 索引页 frontmatter | 该索引页的中文入口 |
| `locale: en`       | 索引页 frontmatter | 该索引页的英文入口 |

注意 `lang`（文章级）和 `locale`（索引页级）是两个不同的约定：

- `lang` 描述内容本身的语言属性
- `locale` 用于语言切换逻辑（PageHeader 的 `handleChangeLocale` 检查 `frontmatter.value.locale`）

### 翻译关系

翻译通过**独立文件 + `translated: true` 标记**建立关联：

- `speaking-english.md`（原版，`lang: en`）
- `speaking-english-zh.md`（翻译版，`lang: zh`, `translated: true`）

文件名通过后缀 `-zh` 约定关联。没有使用 VitePress 的 `localeLinks` 或 `prev/next` 机制。

## URL 方案

```
# 中文（默认）
/corpus/                    → locale: zh
/corpus/100-ingesta/        → locale: zh
/posts/610-log/some-post    → lang: zh（或未标注，默认 zh）

# 英文
/corpus/en/                 → locale: en
/corpus/100-ingesta/en/     → locale: en
/posts/610-log/en/          → locale: en
```

语言切换逻辑（`PageHeader.vue`）：

```ts
function handleChangeLocale(newVal: string) {
  if (frontmatter.value.locale) {
    if (newVal === 'zh' && locale.value !== 'zh') {
      // en → zh: 移除路径中的 /en/ 后缀
      const newPath = route.path.replace(`/${locale.value}/`, '/')
      router.go(newPath)
    }
    else {
      // zh → en: 追加 /en/ 后缀
      const newPath = `${route.path}${newVal}/`
      router.go(newPath)
    }
  }
  locale.value = newVal
  localStorage.setItem('locale', newVal)
}
```

**限制**：只有带有 `locale` frontmatter 的页面支持语言切换。普通文章页（如 `speaking-english.md`）没有 `locale` 字段，切换按钮会更新 UI 语言但不会跳转到对应翻译。这意味着**文章之间的翻译关联没有通过 URL 机制处理**，需要读者手动在 index 页找到对应版本。

## 路由层：useRouteI18n

```ts
// useRouteI18n.ts
export function useRouteI18n(path?, locale?) {
  const currentBasePath = computed(() => {
    const langPath = `/${locale}/`
    if (path.endsWith(langPath)) {
      return path.slice(0, -langPath.length + 1)
    }
    return path
  })

  function getLocaledPath(basePath?) {
    return `${basePath}${locale === 'zh' ? '' : `${locale}/`}`
  }
}
```

这个 composable 被 `Layer.vue`（顶栏导航）使用，通过 `pathSuffix` prop 传递当前 locale 后缀：

```vue
<Layer :path-suffix="$i18n.locale === 'zh' ? '' : `${$i18n.locale}/`" />
```

所有导航链接（Corpus、Posts、Dashboard、Tags）通过此机制自动附加 locale 前缀，保持当前语言上下文。

## 消息层：vue-i18n

当前消息目录极其精简：

```ts
messages: {
  en: {
    localeUrlSuffix: 'en/',
    localeUrl: '{url}@:localeUrlSuffix',
    localeName: 'English',
  },
  zh: {
    localeUrlSuffix: '',
    localeUrl: '{url}@:localeUrlSuffix',
    localeName: '中文',
  },
}
```

只有 locale 元信息。日期格式配置了但内容相同（`short`/`long`/`withoutYear`，zh 和 en 使用相同格式）。这说明当前阶段 i18n 的重心在**内容路由**而非 UI 文案翻译。

## 设计评估

### 优点

1. **URL 优雅**：中文不牺牲 clean URLs，避免 `/zh/` 这种对中文读者无意义的前缀
2. **渐进式兼容**：无需一次性翻译所有内容。新内容默认 zh，有精力时补充 en
3. **构建性能**：不使用 VitePress 内置 i18n 的多实例构建（每个 locale 是一个独立 VitePress 实例），构建更快
4. **单套配置**：Nav/Sidebar/Theme 只需维护一份，`useRouteI18n` 在运行时调整链接

### 缺点和风险

1. **文章翻译关联弱**：`speaking-english.md` 和 `speaking-english-zh.md` 之间没有显式的 URL 级关联。读者在英文页点「中文」按钮不会跳转到 `-zh` 版本
   - 可能需要一个 `canonical` frontmatter 字段或翻译映射表
2. **VitePress 搜索不支持跨语言**：内置搜索按当前路径索引，`/en/` 子目录的内容和主目录内容不在同一搜索域（但当前用 `ignoreDeadLinks: true`，搜索配置未见，可能未启用）
3. **数据 loader 未过滤 locale**：`posts.data.ts` 和 `corpus.data.ts` 加载所有 markdown 文件，不区分语言。列表页会同时显示 zh 和 en 版本的同一篇文章
   - 当前因为 en 内容极少，问题不明显，但未来需要 `filter: (page) => page.frontmatter.lang === currentLocale` 或类似逻辑
4. **SPA 导航不感知 locale**：`router.go()` 是全页刷新而非 SPA 内导航，因为 locale 切换需要加载完全不同路径的资源。用户体验上会有闪烁
5. **Layer 导航的 pathSuffix 传递是 prop drilling**：从 PageHeader 传到 Layer，没有 provide/inject 或 composable 封装

### 与 VitePress 内置 i18n 的对比

| 维度        | VitePress 内置                 | froQ 方案                          |
| ----------- | ------------------------------ | ---------------------------------- |
| URL 结构    | `/zh/xxx/`, `/en/xxx/`         | 默认 zh clean URL，en 在 `/en/` 下 |
| 构建方式    | 多实例（每个 locale 独立构建） | 单实例                             |
| Nav/Sidebar | 按 locale 独立配置             | 单套配置，运行时动态调整           |
| 翻译链接    | `localeLinks` frontmatter      | 文件命名约定（`-zh` 后缀）         |
| 搜索        | 按 locale 隔离                 | 混合（如启用搜索）                 |
| UI 文案翻译 | themeConfig 分离               | vue-i18n 消息文件                  |
| 扩展性      | 新增 locale = 新增一套配置     | 新增 locale = 新增目录 + 消息      |

## 当前状态

- en 内容极其稀疏：所有 `en/` 目录下只有 `index.md` 占位文件
- 活跃的翻译只有一对：`speaking-english.md` ↔ `speaking-english-zh.md`
- 消息目录是最小实现，无 UI 文案翻译
- 基础设施就绪，等待内容填充

## 未来关注点

1. **数据 loader 的 locale 过滤**：当 en 内容增多时，列表页会出现双语混杂问题
2. **文章翻译关联机制**：需要比文件名约定更强的关联方式
3. **搜索集成**：如果启用 VitePress 搜索，需要决定是按 locale 隔离还是混合索引
4. **UI 文案翻译**：当前 Nav 标签（Corpus/Posts/Dashboard）是硬编码的英文，对中文用户可能不太直观
5. **`@intlify/unplugin-vue-i18n` 的 bundle 分析**：确认 tree-shaking 是否生效
