# VitePress 站点搜索方案对比：MiniSearch vs Pagefind (2026-07)

> 蛙蛙的 VitePress corpus 站点随着内容增长，搜索体验是核心功能之一。2026 年搜索生态有重要变化，值得记录对比。

## 现状：VitePress 内置本地搜索

VitePress 默认使用 **MiniSearch** 作为 `provider: 'local'` 的搜索引擎。

| 维度 | MiniSearch (默认) |
|------|-------------------|
| 实现 | 浏览器端，主线程构建索引和查询 |
| 索引格式 | 巨大 JSON 对象 |
| CJK 支持 | 依赖第三方库，分词效果一般 |
| 大规模表现 | 5000+ 页时内存占用可达 1GB+，主线程阻塞 |
| 搜索质量 | 基础模糊匹配，不搜索标题元数据 |
| 框架集成 | 零配置内置于 VitePress |

**已知问题**（来自 VitePress issue #5077, #5134）：
- 主线程阻塞导致 UI 卡顿
- 大站点（26000 页）`vitepress build` 时 OOM（8GB heap 也不够）
- 中文分词依赖 jieba 等第三方库
- 不支持标题权重、分段搜索等精细控制

## Pagefind 1.5.0 (2026-04-06 发布)

Pagefind 从 v1.5.0 开始出现质变，2026-07-18 当前最新版为 **1.5.2**（修复 Linux musl 性能问题）。

### 核心改进

| 特性 | Pagefind 1.5.0 |
|------|---------------|
| **索引位置** | 构建时静态预索引（Rust 编写），浏览器只加载搜索结果 |
| **搜索执行** | **Web Worker** 自动 offload，主线程不阻塞 |
| **CJK 分割** | 使用浏览器原生 `Intl.Segmenter` 分词，不依赖第三方 |
| **标题搜索** | 默认搜索标题元数据，匹配结果优先 |
| **UI 架构** | 全新 Component UI（Web Component），可组合 searchbox/modal/result |
| **索引大小** | 分块加载，10000 页站点总网络载荷 <300kB |
| **变音符号** | 原生支持 café 匹配 cafe |
| **无障碍** | 键盘导航、ARIA 支持大幅改进 |
| **RTL/多语言** | 改进的 locale 感知，多语言站点每个语言独立索引 |

### 索引性能改进

| 版本 | 索引速度 | Linux musl 备注 |
|------|---------|-----------------|
| 1.4.x | 基准 | - |
| 1.5.0 | macOS/Win 2x | Linux 反而减半（musl 分配器问题） |
| 1.5.2 | 全平台 ~2x | jemalloc 修复 musl 瓶颈 |

## VitePress 集成

有两个选择：

### A. `vitepress-plugin-pagefind` (推荐)

**v0.4.22** 发布于 2026-07-07，Weekly Downloads 2.8K+

```
pnpm add vitepress-plugin-pagefind pagefind
```

配置极简：

```ts
// .vitepress/config.ts
import { defineConfig } from 'vitepress'
import { pagefindPlugin } from 'vitepress-plugin-pagefind'

export default defineConfig({
  lang: 'zh-cn',  // 自动用于 Pagefind 索引语言
  vite: {
    plugins: [pagefindPlugin()],
  },
})
```

中文分词优化（推荐使用 Intl.Segmenter）：

```ts
import { chineseSearchOptimize, pagefindPlugin } from 'vitepress-plugin-pagefind'

pagefindPlugin({
  customSearchQuery: chineseSearchOptimize,
  // 或手动实现分词：
  // customSearchQuery: (input) => {
  //   const seg = new Intl.Segmenter('zh-CN', { granularity: 'word' })
  //   return [...seg.segment(input)].filter(s => s.isWordLike).map(s => s.segment).join(' ')
  // },
})
```

插件特性：
- 类似 Algolia 风格的 UI
- 支持多语言 locale 文本
- 可通过 frontmatter `pagefind-indexed: false` 排除页面
- 支持搜索结果过滤
- i18n 支持（每个语言索引独立，结果只显示当前语言内容）

### B. 自定义集成

如果不想用插件，也可以直接在构建后调用 Pagefind CLI：

```json
{
  "scripts": {
    "docs:build": "vitepress build docs && npx pagefind --source docs/.vitepress/dist"
  }
}
```

然后在 VitePress theme 中加载 Pagefind Component UI。

## 对比总结

| 维度 | MiniSearch (内置) | Pagefind via Plugin |
|------|------------------|-------------------|
| **集成难度** | 零配置 | 两步安装配置 |
| **大规模 (>5000 页)** | OOM 风险，UI 卡顿 | 分块索引，Web Worker |
| **中文搜索** | 依赖第三方 jieba | 原生 Intl.Segmenter |
| **搜索质量** | 基础模糊匹配 | 标题权重 + 元数据 + 分段 |
| **构建过程** | 运行时构建索引 | 构建时预索引 |
| **内存占用 (运行时)** | 高（全量 JSON 在内存） | 低（分块按需加载） |
| **UI 定制** | 有限 | Component UI 可组合 |
| **i18n** | 支持 | 更完善的语言独立索引 |

## 对蛙蛙 corpus 站点的建议

如果蛙蛙的 corpus 站点有以下特征，建议考虑迁移到 Pagefind：

1. **CJK 内容为主** — Intl.Segmenter 原生分词体验远优于替代方案
2. **页面数量持续增长** — Pagefind 的分块架构天然适合 >500 页的站点
3. **搜索是核心交互** — 标题权重 + 分段搜索让查找更加精准
4. **性能敏感** — Web Worker offload 保持主线程流畅

迁移成本很低：安装两个包、加一行 config 配置即可。插件基于构建时索引，对开发工作流无影响。

---

*Note created 2026-07-18 09:59 during patrol, user in extended low-energy period (53h+ rest window).*
