# VitePress Sitemap / SEO / robots.txt 实现方案

> 2026-05-30 03:00 巡检自主学习
>
> 与上一轮 RSS feed 分析互补——RSS 喂给读者，sitemap+SEO meta 喂给搜索引擎。合在一起是博客完整的「出版分发层」。

---

## 1. 当前状态：缺失清单

审阅了 `docs/.vitepress/config.mts`，博客目前处于**零 SEO 配置**状态：

| 项                            | 状态      | 说明                                                                                                          |
| ----------------------------- | --------- | ------------------------------------------------------------------------------------------------------------- |
| **sitemap.xml**               | ❌ 未配置 | VitePress 内置支持 `sitemap: { hostname }`，目前未启用                                                        |
| **og:title / og:description** | ❌ 缺失   | `description: '于此。'` 是全局静态值，没有逐页动态 og meta                                                    |
| **og:image**                  | ❌ 缺失   | 无社交分享卡片图                                                                                              |
| **twitter:card**              | ❌ 缺失   | 同上                                                                                                          |
| **canonical URL**             | ❌ 缺失   | 没有 `<link rel="canonical">` 标签                                                                            |
| **robots.txt**                | ❌ 缺失   | 无文件，无法提供 sitemap 引用 + crawl 指令                                                                    |
| **frontmatter description**   | ❌ 非标准 | 现有 frontmatter 字段：`title`, `created`, `status`, `last_modified`, `locale`, `series` — 缺少 `description` |
| **`<title>` 模板**            | ⚠️ 默认    | `title: 'froQ'` + 默认 `:title                                                                                |

---

## 2. Sitemap：VitePress 原生方案

VitePress 自 1.x 起内置 sitemap 生成（由 `sitemap` npm 包驱动），比 RSS 那轮分析的手动 `buildEnd` 方案简单得多：

### 2.1 基础启用

```ts
// docs/.vitepress/config.mts
export default defineConfig({
  sitemap: {
    hostname: 'https://froq.dev' // 需确认实际域名
  }
})
```

启用 `cleanUrls: true` 时 VitePress 自动处理 URL 后缀（去掉 `.html`）。

### 2.2 lastmod 时间戳

```ts
export default defineConfig({
  lastUpdated: true, // 基于 git 时间戳
  sitemap: {
    hostname: 'https://froq.dev',
    lastmodDateOnly: false // 包含时分秒（默认只含日期）
  }
})
```

博客 frontmatter 已有 `last_modified: 2026-04-24 16:48:58` 字段，但 VitePress 的 `lastUpdated` 基于 git timestamp。若想用 frontmatter 的 `last_modified`，需要 `transformItems` 覆盖。

### 2.3 transformItems：自定义条目

```ts
sitemap: {
  hostname: 'https://froq.dev',
  transformItems: (items) => {
    return items
      // 排除不需要索引的页面
      .filter(item => !item.url.includes('/drafts/'))
      .filter(item => !item.url.includes('/OH-Works/'))
      // 为 posts 类页面设置更高 priority
      .map(item => ({
        ...item,
        changefreq: item.url.startsWith('/posts/') ? 'weekly' : 'monthly',
        priority: item.url === '/' ? 1.0
          : item.url.startsWith('/posts/') ? 0.8
          : 0.5
      }))
  }
}
```

### 2.4 i18n hreflang 的复杂情况

这是关键矛盾点。VitePress 内置 sitemap 的 i18n hreflang 支持（[PR #2708](https://github.com/vuejs/vitepress/commit/7778187f2dc31554fa7541da9648235c994d4ae8)，2023-07）**依赖 VitePress 标准 locales 配置**。当 `locales.root.lang` + `locales.fr.lang` 等标准结构存在时，VP 自动在 sitemap 中为同一页面生成多个 `<url>` 条目并标记 `<xhtml:link rel="alternate" hreflang="...">`。

但 froQ 博客**弃用了 VitePress 标准 locales 方案**，改用 vue-i18n v11 + 文件级 `/en/` 子目录分离（详见 2026-05-29 的 i18n 分析）。这意味着：

- VP 不会自动识别 zh/en 页面的 alternates 关系
- `sitemap` 配置本身找不到 `locales` 配置来生成 hreflang
- 需要**手动在 `transformItems` 中注入 hreflang links**

**手动 hreflang 实现思路：**

```ts
sitemap: {
  hostname: 'https://froq.dev',
  transformItems: (items) => {
    // 构建 URL → locale 映射
    const urlMap = new Map<string, { zh?: string; en?: string }>()
    for (const item of items) {
      let normalized = item.url
      const isEn = normalized.startsWith('/en/')
      if (isEn) normalized = normalized.replace(/^\/en/, '')

      if (!urlMap.has(normalized)) urlMap.set(normalized, {})
      const entry = urlMap.get(normalized)!
      if (isEn) entry.en = item.url
      else entry.zh = item.url
    }

    // 注入 hreflang links
    return items.map(item => {
      let normalized = item.url.replace(/^\/en/, '')
      const alts = urlMap.get(normalized)
      if (!alts) return item

      const links: { lang: string; url: string }[] = []
      if (alts.zh) links.push({ lang: 'zh-CN', url: alts.zh })
      if (alts.en) links.push({ lang: 'en', url: alts.en })

      return { ...item, links: links.length > 1 ? links : undefined }
    })
  }
}
```

> 注意：`sitemap` 包的 `SitemapItem.links` 字段用于 hreflang。VP 的 `transformItems` 传入的 items 直接对应 `SitemapStream.write()` 参数，因此 `links` 字段会被正确序列化。

---

## 3. 动态 Meta 标签：Open Graph + Twitter + Canonical

### 3.1 方案选型：transformPageData vs transformHead

VitePress 提供两个 build hook：

| Hook                | 时机                          | 性能           | 适用场景                                            |
| ------------------- | ----------------------------- | -------------- | --------------------------------------------------- |
| `transformPageData` | 构建时 + dev 时 + client 导航 | 每次导航都执行 | 简单字段拼接（og:title, og:description, canonical） |
| `transformHead`     | 仅构建时                      | 跳过 dev 开销  | 计算密集型（og:image 生成、外部 API 查询）          |

**推荐**：og:title / og:description / canonical / twitter:card 用 `transformPageData`，og:image 生成留到 Phase 2 用 `transformHead`。

### 3.2 基础实现

```ts
// docs/.vitepress/config.mts
export default defineConfig({
  transformPageData(pageData) {
    const siteUrl = 'https://froq.dev'
    const canonicalUrl = `${siteUrl}/${pageData.relativePath}`
      .replace(/index\.md$/, '')
      .replace(/\.md$/, '.html')
      .replace(/\/en\//, '/en/') // 保留 /en/ 前缀

    pageData.frontmatter.head ??= []
    const head = pageData.frontmatter.head

    // og:title — 使用 frontmatter.title 或 h1 内容
    const pageTitle = pageData.frontmatter.title || pageData.title
    head.push(['meta', { property: 'og:title', content: pageTitle }])

    // og:description — 使用 frontmatter.description 或回退到全局
    const description = pageData.frontmatter.description || pageData.description
    head.push(['meta', { property: 'og:description', content: description }])

    // og:type
    head.push(['meta', { property: 'og:type', content: 'article' }])

    // og:url
    head.push(['meta', { property: 'og:url', content: canonicalUrl }])

    // twitter:card
    head.push(['meta', { name: 'twitter:card', content: 'summary_large_image' }])
    head.push(['meta', { name: 'twitter:title', content: pageTitle }])
    head.push(['meta', { name: 'twitter:description', content: description }])

    // canonical URL
    head.push(['link', { rel: 'canonical', href: canonicalUrl }])
  }
})
```

### 3.3 og:image 的三种生成策略

| 策略                    | 实现复杂度 | 视觉效果             | 性能                    |
| ----------------------- | ---------- | -------------------- | ----------------------- |
| **静态默认图**          | 最低       | 所有页面同一张图     | 零成本                  |
| **构建时 SVG→PNG 转换** | 中         | 每页标题渲染为图片   | 增加构建时间（秒级/页） |
| **运行时 API 动态生成** | 高         | 实时渲染，可定制参数 | 需要服务端部署          |

**推荐 Phase 1 方案**：静态默认 og:image + 可选 frontmatter `ogImage` 字段覆盖。

```ts
head.push(['meta', {
  property: 'og:image',
  content: pageData.frontmatter.ogImage || `${siteUrl}/og-default.png`
}])
```

Phase 2 可考虑 `satori`（Vercel 的 JSX→SVG 库，Ver 0.10+ 稳定）在 `transformHead` 中生成。

---

## 4. robots.txt：buildEnd 生成

VitePress 不内置 robots.txt 生成，但 `buildEnd` hook 是最干净的插入点。

```ts
// docs/.vitepress/config.mts
import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

export default defineConfig({
  async buildEnd({ outDir }) {
    const sitemapUrl = 'https://froq.dev/sitemap.xml'
    const robots = [
      'User-agent: *',
      'Allow: /',
      '',
      `Sitemap: ${sitemapUrl}`,
      '',
    ].join('\n')
    writeFileSync(resolve(outDir, 'robots.txt'), robots)
  }
})
```

**额外考虑**：

- 若有不想被索引的目录（如 `/OH-Works/`、`/drafts/`），添加 `Disallow` 规则
- 若未来引入 AI crawler 控制，可添加 `GPTBot` / `CCBot` 的独立规则段
- 可选添加 `Crawl-delay` 但 Google 不遵守此指令

---

## 5. Frontmatter Schema 扩展

当前博客 frontmatter 缺少 `description` 字段，而这是 SEO 的基础输入。建议扩展为：

```yaml
---
title: 从零开始搭建博客网站（八）
description: 文章大纲与代码块配置的完整流程 # 新增
created: 2025-04-24 21:32
status: form
last_modified: 2026-04-24 16:48:58
locale: zh
ogImage: /og-images/build-blog-8.png # 可选，Phase 2
---
```

对于未提供 `description` 的文章，可以自动回退到页面第一段纯文本（`transformPageData` 中从 `pageData` 提取）。

---

## 6. 分阶段实施建议

### Phase 1（零依赖，即时可用）

- [ ] 启用 `sitemap: { hostname }`
- [ ] `transformPageData` 增加 og:title / og:description / og:url / canonical / twitter:card
- [ ] `buildEnd` 生成 robots.txt
- [ ] 静态默认 og:image（一张 1200×630 PNG 放 public/ 目录）
- [ ] `transformItems` 过滤 OH-Works / drafts 等内部页面

### Phase 2（引入依赖，提升品质）

- [ ] `satori` 生成逐页动态 og:image（`transformHead` 中）
- [ ] 手动 hreflang 映射（zh ↔ en alternate links）
- [ ] frontmatter `description` 字段推广到全部文章
- [ ] `changefreq` / `priority` 按内容类型区分

### Phase 3（运维级）

- [ ] Google Search Console 提交 sitemap
- [ ] Bing Webmaster Tools 提交
- [ ] 结构化数据（JSON-LD Article / BreadcrumbList schema）
- [ ] 监控 indexed pages 覆盖率

---

## 7. 与 RSS 的对比

| 维度             | RSS                                       | Sitemap                                      |
| ---------------- | ----------------------------------------- | -------------------------------------------- |
| **受众**         | 人类读者（feed reader）                   | 搜索引擎爬虫                                 |
| **生成方式**     | 手动 `buildEnd` + `feed` 包               | VitePress 内置（`sitemap` 包）               |
| **更新频率**     | 每次构建重新生成完整 feed                 | 每次构建重新生成完整 sitemap                 |
| **i18n 处理**    | 双语言独立 feed 文件                      | hreflang alternates 内联                     |
| **内容字段**     | title, description, content, date, author | url, lastmod, changefreq, priority, hreflang |
| **博客适配难度** | 中等（需处理非标准 frontmatter 映射）     | 低（VP 原生支持，transformItems 微调）       |

两者共同缺失的输入：**frontmatter `description` 字段**。目前 RSS 和 SEO meta 都缺少每页的描述文本，这是最基础的阻塞项。

---

## 8. 附：VP 2.0 alpha 关注

博客使用 VitePress 2.0.0-alpha.17，需注意：

- `sitemap` 配置在 2.0 alpha 中行为与 1.x 一致（尚未收到 breaking change 报告）
- `buildEnd` / `transformPageData` / `transformHead` 三个 hook 在 2.0 中均保留
- 未来升级到 2.0 stable 时应重新验证 sitemap 输出格式
