# VitePress RSS Feed 实现方案分析

## 背景

froQ 的博客目前没有 RSS feed。这是 VitePress 博客一个常见的 feature gap——VitePress 本身不内置 RSS，但提供了 `buildEnd` hook 和 `createContentLoader` 作为基础设施，让 RSS 生成成为可能。

## 三条实现路径

### 路径 1：vitepress-plugin-rss（sugarat）

npm: `vitepress-plugin-rss`，最新 v0.4.4（2026-04），MIT 协议。

**原理**：
- 作为 Vite 插件注入，在 `configResolved` 中劫持 `VPConfig.buildEnd`
- 使用 `createContentLoader` 遍历所有 `.md` 文件
- 底层调用 `feed` 包（jpmonette/feed）生成 RSS 2.0
- 自动在 `socialLinks` 中添加 RSS 图标

**优点**：
- 一行配置即可启用
- 内置 i18n `locales` 支持（按 locale key 分离 feed）
- 支持 `filter`、`limit`、`ignoreHome`、`ignorePublish`
- 活跃维护，社区使用广泛

**缺点**：
- 依赖固定的 frontmatter schema（`date`、`description`、`author` 等）
- froQ 博客用 `created` 而非 `date`，用行内 hashtag 而非 frontmatter tags——需要适配
- 对 `renderExpect` 和 `renderHTML` 的自定义程度有限

### 路径 2：手动 buildEnd + feed 包（vuejs/blog 模式）

参考：[vuejs/blog genFeed.ts](https://github.com/vuejs/blog/blob/main/.vitepress/genFeed.ts)、[Paul Laros 文章](https://laros.io/generating-an-rss-feed-with-vitepress)。

**原理**：
- 在 `defineConfig` 的 `buildEnd` 中直接编写逻辑
- `createContentLoader` 加载所有文章
- `Feed` 实例逐个 `addItem`
- `writeFileSync` 输出到 `outDir`

**优点**：
- 完全控制每个 feed item 的字段映射
- 可以适配任何 frontmatter schema
- 零额外依赖（除 `feed` 包本身）
- 可以同时生成 RSS 2.0 + Atom + JSON Feed

**缺点**：
- 需要手写代码（~50 行）
- i18n 需自行处理（按 locale 分别生成 feed）
- 不自动添加 socialLink 图标

### 路径 3：vitepress-plugin-rss 的 fork/自定义配置

用 `vitepress-plugin-rss` 的 `renderExpect` 和 `transform` hooks 做字段映射适配。相当于路径 1 的深度定制版。

## `feed` 包（jpmonette/feed）

三条路径的底层都用了这个包。最新 v5.2.1（2026-04），支持：
- **RSS 2.0**：`feed.rss2()`
- **Atom 1.0**：`feed.atom1()`
- **JSON Feed 1.0**：`feed.json1()`

关键配置项（完整 API 见 [GitHub](https://github.com/jpmonette/feed)）：

```
Feed Options: title*, id*, link*, description, copyright, language, image,
              favicon, author, feedLinks, updated, generator, ttl, hub,
              feed, docs, stylesheet

Item Options: title*, link*, date*, id, guid, description, content,
              author[], category[], published, copyright, image, audio,
              video, enclosure, extensions[]
```

## froQ 博客的适配分析

### 现有 frontmatter schema

```yaml
title: "文章标题"
created: 2025-04-24 21:32    # ← 不是 date
status: form                  # form | probe | ...
last_modified: 2026-04-24
series: blog_site             # 可选
lang: zh                      # i18n 用
locale: zh                    # i18n 用
```

### 需要处理的五个映射问题

1. **日期字段**：`created` → `date`
   - `created` 格式为 `YYYY-MM-DD` 或 `YYYY-MM-DD HH:mm`
   - 需要 `new Date(frontmatter.created)` 转换

2. **摘要生成**：无 `description` 字段
   - 方案 A：使用 `createContentLoader({ excerpt: true })` 自动提取（`<!-- more -->` 或首段）
   - 方案 B：手动截取正文前 N 字
   - froQ 的文章多为中文技术/随笔，excerpt 自动提取效果取决于是否有明确分隔符

3. **标签**：行内 `#tag` 而非 frontmatter
   - RSS 的 `<category>` 字段无法直接从 hashtag 获取
   - 需要额外解析，或直接不暴露 category

4. **i18n 双 feed**：
   - zh 为主语言（clean URL: `/posts/...`）
   - en 为子目录（URL: `/en/posts/...`）
   - 建议生成两个独立 feed：`feed.rss`（zh）和 `feed.en.rss`（en）
   - 或在单个 feed 中通过 `<link rel="alternate" hreflang="..."/>` 标注

5. **内容筛选**：
   - posts 三层（代序/成言/前脩）→ 全部进入 feed，还是只选特定层？
   - corpus 六层 → 暂不入 feed（corpus 是知识管理内部系统，非公开博客内容）
   - `status: form` 是完成态，`status: probe` 是探索态——是否需要过滤？

### i18n RSS 最佳实践

参考 [Route360 的多语言 RSS 方案](https://route360.dev/en/post/rss-feed-multilingual/)：

- 按语言生成独立 feed 文件：`feed.zh.rss`、`feed.en.rss`
- 每个 feed 使用对应语言的 `language` 代码（`zh-CN`、`en`）
- URL 构造需考虑子目录差异：
  - zh: `baseUrl + post.url`
  - en: `baseUrl + '/en' + post.url`
- 可选：添加 `<link rel="alternate" type="application/rss+xml" hreflang="..."/>` 到 HTML head

## 推荐方案

**路径 2（手动 buildEnd）**，理由：

1. froQ 的 frontmatter schema 非标准（`created`/`status`/无 `description`），路径 1 需要大量配置覆盖，不如直接手写
2. i18n 双 feed + URL 构造逻辑较特殊，手写更可控
3. 代码量不大（~60 行），维护成本低
4. 可以同时输出 RSS 2.0 + Atom + JSON Feed，覆盖面更广

### 参考实现骨架

```ts
// .vitepress/genFeed.ts
import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { Feed } from 'feed'
import { createContentLoader, type SiteConfig } from 'vitepress'

const BASE_URL = 'https://froq.dev' // 示例

interface LocaleConfig {
  locale: string
  prefix: string   // URL 前缀，如 '' 或 '/en'
  language: string  // BCP 47，如 'zh-CN' 或 'en'
  title: string
  description: string
}

const LOCALES: LocaleConfig[] = [
  { locale: 'zh', prefix: '', language: 'zh-CN', title: 'froQ', description: '...' },
  { locale: 'en', prefix: '/en', language: 'en', title: 'froQ', description: '...' },
]

export async function genFeed(config: SiteConfig) {
  const posts = await createContentLoader('posts/**/*.md', {
    excerpt: true,
    render: true,
  }).load()

  for (const loc of LOCALES) {
    const feed = new Feed({
      title: loc.title,
      description: loc.description,
      id: `${BASE_URL}${loc.prefix}/`,
      link: `${BASE_URL}${loc.prefix}/`,
      language: loc.language,
      favicon: `${BASE_URL}/favicon.ico`,
      copyright: `Copyright (c) ${new Date().getFullYear()} froQ`,
      author: { name: 'froQ' },
    })

    const localePosts = posts
      .filter(p => {
        // en 文章在 /en/ 子目录下，zh 文章不在
        const isEn = p.url.startsWith('/en/')
        return loc.locale === 'en' ? isEn : !isEn
      })
      .filter(p => p.frontmatter.created) // 有日期才入 feed
      .sort((a, b) =>
        +new Date(b.frontmatter.created) - +new Date(a.frontmatter.created)
      )

    for (const post of localePosts) {
      feed.addItem({
        title: post.frontmatter.title,
        id: `${BASE_URL}${post.url}`,
        link: `${BASE_URL}${post.url}`,
        description: post.excerpt || '',
        content: post.html || '',
        date: new Date(post.frontmatter.created),
      })
    }

    const filename = loc.locale === 'zh' ? 'feed.rss' : `feed.${loc.locale}.rss`
    writeFileSync(join(config.outDir, filename), feed.rss2())

    // 可选：同时输出 Atom 和 JSON Feed
    // writeFileSync(join(config.outDir, 'feed.atom'), feed.atom1())
    // writeFileSync(join(config.outDir, 'feed.json'), feed.json1())
  }
}
```

在 `config.ts` 中调用：

```ts
import { genFeed } from './genFeed'

export default defineConfig({
  buildEnd: async (config) => {
    await genFeed(config)
  }
})
```

## 额外考虑

### WebSub（PubSubHubbub）
`feed` 包支持 `hub` 选项。如果希望 RSS 阅读器能实时获取更新（而非轮询），可以配置 WebSub hub。这对小型个人博客的实际价值有限，但可以作为未来的增强项。

### RSS 自动发现
在 HTML `<head>` 中添加：
```html
<link rel="alternate" type="application/rss+xml" title="froQ (中文)" href="/feed.rss">
<link rel="alternate" type="application/rss+xml" title="froQ (English)" href="/feed.en.rss">
```
vitepress-plugin-rss 会自动处理，手动方案需在 theme 中自行添加。

### JSON Feed
JSON Feed 1.1 是较新的格式，对程序化消费更友好（如 feed reader bot、cross-posting 工具）。`feed` 包已支持，只需额外输出 `feed.json1()`。

### 与现有 data layer 的关系
博客已有 `posts.data.ts` 和 `corpus.data.ts` 两个 data loader。RSS feed 生成逻辑可以复用 `createContentLoader`，但不应依赖运行时 data loader（那是在客户端 bundle 中的）。`buildEnd` 阶段独立调用 `createContentLoader` 是正确做法。

## 总结

| 维度 | vitepress-plugin-rss | 手动 buildEnd |
|------|---------------------|---------------|
| 配置复杂度 | 低 | 中 |
| frontmatter 适配 | 需配置覆盖 | 完全自由 |
| i18n 支持 | 内置 locales | 需手写 |
| 多格式输出 | 仅 RSS 2.0 | RSS+Atom+JSON |
| 代码量 | ~5 行配置 | ~60 行 |
| long-term 维护 | 依赖插件更新 | 自控 |
| 推荐场景 | 标准 VitePress 博客 | froQ 博客（非标准 schema） |
