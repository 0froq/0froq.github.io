# VitePress 构建性能优化 — 管线、瓶颈与优化策略

## 一、当前状态：博客零优化基线

实测数据：

- **markdown 文件数**：186（含 corpus 六层 + posts 三层 + dashboard）
- **docs 目录体积**：162 MB（平均每文件 ~870KB，说明含大量图片/图表等重资源）
- **当前构建命令**：`node scripts/generate-tags.mjs && vitepress build docs`
- **已有配置**：`ignoreDeadLinks: true`（仅此一项）
- **未启用**：sitemap / lastUpdated / RSS / search

这意味着当前构建时间应该很快（推测 < 30s），但一旦按前几轮 patrol 建议启用 sitemap + lastUpdated + RSS + search 四件套，构建时间可能翻倍甚至更多。

---

## 二、VitePress 构建管线架构

### 2.1 核心流程

```
resolveConfig (配置解析 + page discovery)
  → git timestamp 预取 (configResolved hook, 仅当 lastUpdated 启用)
  → 双 pass 构建 (SSR pass → Client pass)
    → SSR pass: .md → Vue SFC → SSR JS → .temp/
    → Client pass: .md → Vue SFC → 优化 bundle → outDir/
  → 静态 HTML 渲染 (renderPage, 逐页 SSR)
  → sitemap 生成 (如果启用)
  → 清理临时文件
```

### 2.2 双 Pass 策略

- **SSR Pass**：每个 .md 文件作为 Rollup entry，生成可执行的 Node.js 代码放在 `.temp/`。用于 `renderPage()` 渲染静态 HTML。
- **Client Pass**：同样以所有 .md 为 entry，但打包为浏览器可执行的 JS bundle。通过 `manualChunks` 将核心依赖分入 `framework` chunk，主题代码分入 `theme` chunk。
- **SPA 模式**：client JS 包含 router 和 hydration 逻辑，页面作为 lean chunk 只含动态部分（静态 HTML 已预渲染）。

### 2.3 插件生命周期与性能关键点

| Hook             | 职能                                           | 性能影响                                                           |
| ---------------- | ---------------------------------------------- | ------------------------------------------------------------------ |
| `configResolved` | 预取 git timestamps（`cacheAllGitTimestamps`） | **高**：单次 `git log` 批处理所有文件，启用 lastUpdated 时耗时显著 |
| `transform`      | `.md` → Vue SFC 源码                           | **中**：每文件经 markdown-it 管线完整渲染                          |
| `load`           | 虚拟模块 `/@siteData`                          | 低：简单序列化                                                     |
| `resolveId`      | `@theme` 别名解析                              | 低                                                                 |

---

## 三、已知性能瓶颈

### 3.1 Git Timestamp（lastUpdated / sitemap）

**Issue #4954**：启用 lastUpdated 或 sitemap 后，构建时间从 30s 飙升至 110s（Mac Intel，500+ 页）。原因是 `getGitTimestamp.ts` 需要为每个文件调用 git 获取最后修改时间。

**PR #4958 优化**：改为单次 `git log --name-only` 批处理所有文件时间戳（一次 git 调用 ≈ 183ms for 552 files），替代逐文件查询。但存在一些边界 case（已删除/重命名的文件在 git log 中丢失）。

**当前 v2.x 状态**：`configResolved` hook 中 `cacheAllGitTimestamps()` 已实现批处理。主要剩余问题：

- 无持久化文件缓存：每次构建都重新查询 git
- sitemap 内部也调用 `getGitTimestamp`，且无法被用户侧 plugin 覆盖

### 3.2 Content Loader 的处理成本

`createContentLoader` 对每个 markdown 文件执行：

1. `fs.statSync` — 获取文件修改时间
2. **缓存检查** — 对比内部 `Map<cache>` 的时间戳，跳过未变更文件
3. `fs.readFileSync` — 读取原始内容
4. `gray-matter` — 解析 YAML frontmatter
5. `md.renderAsync` — markdown → HTML 渲染（**最重的一步**）
6. `transform` 回调 — 用户自定义转换

其中第 5 步是核心开销——博客的 markdown-it 管线包含多个插件（hashtag→figures→ruby→comark→footnote），每个插件都会增加渲染时间。

**当前缓存策略**：基于文件 mtime 的内存缓存，不支持持久化（重启构建冷启动）。

### 3.3 静态 HTML 渲染（renderPage）

**PR #3386**（多线程渲染）：将 `renderPage()` 移入 worker threads，利用多核并行渲染。使用 `pMap` 做并发池。这在内容复杂（含大量 Vue 组件、代码高亮）时效果显著。

**Issue #5134**（OOM with 26K pages）：极端场景下所有页面被加载到内存导致 OOM。对于 186 页的博客不构成问题，但 corpus 体系会持续增长。

### 3.4 大 Chunk 警告

**Issue #4227**：某些 chunk 超过 500KB 触发 Rollup 警告。解决方案：

- `build.rollupOptions.output.manualChunks` 手动拆分
- 或提高 `build.chunkSizeWarningLimit` 阈值
- Vue/VitePress 自身的 framework chunk 通常 ~200KB，加上自定义组件可能更大

---

## 四、优化策略体系

### 4.1 VitePress 级别

| 策略                 | 配置                                                  | 适用场景                          |
| -------------------- | ----------------------------------------------------- | --------------------------------- |
| **buildConcurrency** | `buildConcurrency: 32`（默认 64）                     | 低内存 CI 环境，降低并发换取稳定  |
| **MPA 模式**         | `mpa: true`                                           | 纯静态内容、不需要 SPA 导航的页面 |
| **ignoreDeadLinks**  | `ignoreDeadLinks: true`                               | 已启用，跳过死链检查              |
| **lastUpdated 按需** | 仅在需要时启用，或使用自定义 `lastUpdated` 函数做缓存 | 减少 git 调用                     |
| **sitemap 选择性**   | `sitemap` 配置 `transformItems` 过滤不需要的页面      | 减少 sitemap 体积                 |

### 4.2 Vite / Rollup 级别

| 策略             | 配置                                                   |
| ---------------- | ------------------------------------------------------ |
| **manualChunks** | `build.rollupOptions.output.manualChunks` 拆分大 chunk |
| **minify**       | `build.minify: 'esbuild'`（默认，比 terser 快 20-40x） |
| **sourcemap**    | 生产构建关闭 `build.sourcemap: false`                  |
| **target**       | `build.target` 设为目标浏览器范围，减少 polyfill       |
| **cssCodeSplit** | `build.cssCodeSplit: true` 按需加载 CSS                |

### 4.3 内容级别

| 策略                  | 说明                                                                                            |
| --------------------- | ----------------------------------------------------------------------------------------------- |
| **Markdown 图片优化** | 162MB/186 文件 ≈ 870KB/文件，大量体积来自图片。使用 WebP/AVIF、懒加载、响应式图片               |
| **代码块**            | Twoslash 已启用 `createFileSystemTypesCache`（文件系统缓存），但 `explicitTrigger` 策略仍需评估 |
| **excerpt 控制**      | `createContentLoader` 的 `excerpt` 选项可减少内存占用                                           |
| **render: false**     | 不需要 HTML 内容的 data loader 设置 `render: false`，跳过最重的 markdown-it 渲染                |

### 4.4 构建环境级别

| 策略             | 说明                                                                                 |
| ---------------- | ------------------------------------------------------------------------------------ |
| **NODE_OPTIONS** | `--max-old-space-size=4096` 增加堆内存上限                                           |
| **CI 缓存**      | GitHub Actions 等 CI 中缓存 `node_modules`、`.vitepress/cache`、`.vitepress/dist`    |
| **增量构建**     | 目前 VitePress 不原生支持生产增量构建，需外部脚本（如对比 git diff 只 build 变更页） |

---

## 五、博客现状与分阶段建议

### 5.1 短期（已有计划实施前）

当前 186 文件、零优化状态下构建应该 < 30s，无需紧急行动。但如果启用 sitemap + lastUpdated + RSS：

1. **先启用 sitemap**：成本最低（仅需 `sitemap: { hostname }`），git 时间戳批处理已在 v2 中优化，对 186 文件影响应在秒级。
2. **lastUpdated 按需**：如果 sitemap 已包含 `lastmod`，`lastUpdated` 的 git 成本已被分摊。
3. **RSS feed**：`buildEnd` hook 中的 `feed` 包生成是纯 CPU 操作，毫秒级，不成瓶颈。

综合评估：启用 sitemap + lastUpdated + RSS 后，186 文件的构建时间预计从 ~30s 增长到 45-60s（增量），仍在可接受范围。

### 5.2 中期（搜索功能上线后）

搜索索引生成是重量级操作：

- **本地搜索**（MiniSearch）：需要在 `buildEnd` 中遍历所有页面、分词、建索引。对于 CJK 内容，分词成本尤其高（Intl.Segmenter 比 jieba-wasm 轻但精度低）。
- **建议**：`buildConcurrency: 16` 给索引生成留足内存，避免与页面渲染竞争。

### 5.3 长期（corpus 增长至 500+ 文件）

- 考虑 **MPA 模式** 用于纯阅读性页面（corpus 内容页、posts 文章页），避免 SPA router + hydration JS
- 图片迁移至 CDN / 按需加载（162MB → 估计 80%+ 是图片）
- 评估增量构建脚本（git diff based）
- 监控 `buildConcurrency` 与可用内存的平衡

### 5.4 立即可做的低成本优化

| 优化项                                            | 预期收益              | 实施成本           |
| ------------------------------------------------- | --------------------- | ------------------ |
| `buildConcurrency: 32`（显式声明）                | 稳定性，避免 CI OOM   | 一行配置           |
| `build.cssCodeSplit: true`（确认默认）            | JS 按需加载           | 零成本（默认行为） |
| 图片格式检查                                      | 构建体积可能减半      | 一次性审计         |
| contentLoader 中 `render: false` 用于纯元数据场景 | 跳过 markdown-it 渲染 | 审视现有 loader    |

---

## 六、关键监控指标

当博客上线后，建议在 CI 中记录：

1. **构建总时间**（`time vitepress build`）
2. **各阶段耗时**（git timestamp → bundling → rendering → sitemap/RSS）
3. **内存峰值**（CI runner 的 `max-old-space-size` 使用情况）
4. **dist 体积**（`du -sh docs/.vitepress/dist/`）

这些指标可以尽早发现瓶颈，避免突然的构建失败。

---

## 七、参考文献

- VitePress #4954 — git timestamp file caching feature request
- VitePress PR #4958 — batch git timestamp fetching optimization
- VitePress PR #3386 — multi-threaded renderPage via worker threads
- VitePress #5134 — OOM with 26K dynamic route pages
- VitePress #3183 — concurrent build discussion
- VitePress DeepWiki: Core Build Pipeline, Content Loaders
- Vite build options: https://vite.dev/config/build-options
