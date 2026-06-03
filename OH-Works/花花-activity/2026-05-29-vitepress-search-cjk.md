# VitePress 博客搜索方案调研：CJK + 双语站点的离线全文搜索

日期：2026-05-29 17:00

## 背景

博客项目目前没有配置任何搜索功能（`config.mts` 中无 search 相关配置，theme 中无搜索组件）。对于一个知识管理型博客，搜索是核心功能。加上博客同时包含中文和英文内容，CJK 分词问题成为搜索方案选择的关键约束。

## 四条可行路径

### 路径 1：VitePress 内置 MiniSearch + Intl.Segmenter 分词器

最简单、零依赖的方案。VitePress 内置基于 MiniSearch 的 local search，通过自定义 `tokenize` 函数解决 CJK 分词。

```ts
// docs/.vitepress/config.mts
export default defineConfig({
  themeConfig: {
    search: {
      provider: 'local',
      options: {
        miniSearch: {
          options: {
            tokenize: (text: string) => {
              const segmenter = new Intl.Segmenter('zh-CN', { granularity: 'word' })
              return Array.from(segmenter.segment(text.replace(/ /g, '')))
                .map(s => s.segment)
            },
          },
          searchOptions: {
            combineWith: 'AND',
            processTerm: (term: string) => {
              const segmenter = new Intl.Segmenter('zh-CN', { granularity: 'word' })
              return Array.from(segmenter.segment(term))
                .filter(s => s.isWordLike)
                .map(s => s.segment)
            },
          },
        },
      },
    },
  },
})
```

**优点：**
- 零额外依赖，`Intl.Segmenter` 是 Baseline 2024 标准，所有现代浏览器原生支持
- MiniSearch 在 Node.js 端构建索引（`Intl.Segmenter` 从 Node 18+ 开始支持）
- 索引在构建时生成，搜索在浏览器端执行
- 对小站点（<500 页），索引体积可控（约 50-100KB），点击搜索框时才加载

**缺点：**
- `Intl.Segmenter` 中文分词质量不如 jieba 等专用分词器（但已基本可用）
- MiniSearch 索引和查询在主线程执行，大规模站点可能造成卡顿
- 需要同时在 `tokenize`（索引侧）和 `processTerm`（查询侧）配置分词
- 双语内容（zh + en）需要处理混合文本的分词逻辑

**适用场景：** 页面数 < 500、追求简单、不想引入额外依赖

### 路径 2：VitePress 内置 MiniSearch + jieba-wasm 分词器

当 `Intl.Segmenter` 分词质量不够时，用 jieba（结巴分词）的 WASM 版本替代。

```ts
// config.mts
import { cut_for_search } from 'jieba-wasm'

function tokenize(term: string): string[] {
  return cut_for_search(term)
    .map((w: string) => w.trim().toLowerCase())
    .filter((w: string) => w.length >= 1)
}

// theme/index.ts
import init, { cut_for_search } from 'jieba-wasm'

export default {
  extends: DefaultTheme,
  async enhanceApp({ app }) {
    if (!import.meta.env.SSR) {
      await init()
      globalThis.cut_for_search = cut_for_search
    }
  }
}
```

**优点：**
- 分词质量显著优于 `Intl.Segmenter`（jieba 是中文 NLP 领域标准工具）
- 词典丰富，对专业术语、人名地名识别更好

**缺点：**
- 需要预加载约 3MB 的 WASM 文件
- 配置更复杂（需要在 theme enhanceApp 中异步初始化）
- 对于内容量不大的博客，3MB 的 overhead 性价比不高

**适用场景：** 中文内容量大、对搜索精准度要求高、可接受 3MB WASM 开销

### 路径 3：vitepress-plugin-pagefind（Pagefind）

基于 Rust 的静态搜索库，构建时生成索引，浏览器端通过 WASM 查询。

```ts
import { chineseSearchOptimize, pagefindPlugin } from 'vitepress-plugin-pagefind'

export default defineConfig({
  vite: {
    plugins: [
      pagefindPlugin({
        customSearchQuery: chineseSearchOptimize,
        forceLanguage: 'zh',
      }),
    ],
  },
})
```

`chineseSearchOptimize` 的实现本质就是 `Intl.Segmenter` 前端分词：

```ts
function chineseSearchOptimize(input: string) {
  const segmenter = new Intl.Segmenter('zh-CN', { granularity: 'word' })
  const result: string[] = []
  for (const it of segmenter.segment(input)) {
    if (it.isWordLike) result.push(it.segment)
  }
  return result.join(' ')
}
```

**Pagefind 架构要点：**
- 构建时：Rust 二进制遍历静态 HTML → 提取文本 → 分词索引 → 输出 `/_pagefind/` 静态文件
- 运行时：首次打开搜索时加载 WASM（~30KB）+ manifest → 按需懒加载分片索引 → 浏览器端查询
- Pagefind v1.5.0（2026-04）新增 CJK 搜索端分词（`Intl.Segmenter`），解决了之前「索引分词但搜索不分词」的问题
- 分片机制：索引被切割为多个 chunk，仅在查询需要时加载对应 chunk，不会一次性加载全部索引

**优点：**
- 初始 JS 载荷极小（约 30KB WASM + manifest）
- 索引分片懒加载，对站点规模不敏感
- 提供完整的预构建 UI（Modal 搜索框），也可自定义
- 纯静态文件，无后端依赖，Cloudflare Pages 边缘缓存友好
- 2016 年 4 月已解决 CJK 搜索端分词

**缺点：**
- 额外的构建步骤（需在 `vite build` 后运行 `pagefind`）
- 比 MiniSearch 方案多一个依赖
- Pagefind UI 与 VitePress 原生搜索 UI 不同，自定义需要额外工作
- 对极小的站点（<50 页），收益不明显

**适用场景：** 页面数 > 500、关注性能与可扩展性、愿意接受额外构建步骤

### 路径 4：vitepress-plugin-search（FlexSearch）

社区维护的插件，底层使用 FlexSearch 引擎。

```ts
import { SearchPlugin } from 'vitepress-plugin-search'

export default defineConfig({
  vite: {
    plugins: [
      SearchPlugin({
        tokenize: 'full',  // 对 CJK 使用 full tokenization
        encode: str => str.replace(/[\x00-\x7F]/g, '').split(''),
      }),
    ],
  },
})
```

**优点：**
- FlexSearch 性能优异，有内置的 CJK 语言包
- 社区使用较多，有中文搜索的配置参考

**缺点：**
- 非 VitePress 官方方案，插件维护活跃度不确定
- 中文配置依赖 `tokenize: 'full'`（逐字索引），索引体积大
- FlexSearch 的 CJK 支持本质上是逐字匹配 + bigram 策略，不如 jieba 精确

**适用场景：** 已有 FlexSearch 使用经验、需要快速集成中文搜索

## 路径对比矩阵

| 维度 | MiniSearch + Intl.Segmenter | MiniSearch + jieba-wasm | Pagefind | FlexSearch plugin |
|------|---------------------------|------------------------|----------|-------------------|
| 额外依赖 | 0 | jieba-wasm | pagefind + plugin | flexsearch + plugin |
| 初始 JS 体积 | 0（内置于 VitePress） | ~3MB WASM | ~30KB WASM | 取决于 FlexSearch 包 |
| CJK 分词质量 | 中等（原生 API） | 高（专业分词器） | 中等（同 Intl.Segmenter） | 中低（逐字+bigram） |
| 索引构建 | 构建时（Node.js） | 构建时（Node.js） | 构建后（Rust CLI） | 构建时（Node.js） |
| 双语支持 | 需自行处理 | 需自行处理 | 自动识别 lang 属性 | 需自行处理 |
| 可扩展性 | 小站点 | 小站点 | 大站点 | 中等站点 |
| 维护风险 | 低（官方方案） | 中（社区包） | 中低（活跃维护） | 中（社区插件） |
| 适合博客规模 | <500 页 | <500 页 | 任意规模 | <1000 页 |

## 双语搜索的额外考量

博客同时有 zh 和 en 内容，搜索方案需要考虑：

1. **语言检测：** 需要对搜索词和文档内容进行语言检测，选择合适的 tokenizer
2. **索引分离 vs 合并：** 可以把 zh 和 en 分别建索引（Pagefind 支持），也可以在 tokenize 中根据字符集自动切换
3. **简繁体：** `Intl.Segmenter` 对 zh-CN 和 zh-TW 的分词可能不同
4. **混合查询：** 用户可能用中文搜英文内容或反之（中英混杂查询）

**推荐策略：** 在 `tokenize` 函数中做字符集检测——CJK 字符走 `Intl.Segmenter`，Latin 字符走默认空格分词，两套结果合并。

```ts
function bilingualTokenizer(text: string): string[] {
  const tokens: string[] = []
  const cjkSegmenter = new Intl.Segmenter('zh-CN', { granularity: 'word' })
  
  // 简单启发式：按语言边界分割后分别处理
  // CJK 段落走 Intl.Segmenter，其他走空格分词
  let buffer = ''
  let isCJK = false
  
  for (const char of text) {
    const charIsCJK = /[\u4e00-\u9fff\u3400-\u4dbf]/.test(char)
    if (charIsCJK !== isCJK && buffer) {
      if (isCJK) {
        for (const seg of cjkSegmenter.segment(buffer)) {
          if (seg.isWordLike) tokens.push(seg.segment)
        }
      } else {
        tokens.push(...buffer.split(/\s+/).filter(Boolean))
      }
      buffer = ''
    }
    isCJK = charIsCJK
    buffer += char
  }
  // 处理最后一段...
  return tokens
}
```

## 对博客的推荐

考虑到博客的实际情况：
- 页面数目前不大（< 200 页），但 corpus 体系会持续增长
- 已有较多依赖（Comark、UnoCSS、Vue I18n 等），不希望引入过重的新依赖
- 前端性能敏感（已有 CJK 字体优化等考虑）

**推荐方案：路径 1（MiniSearch + Intl.Segmenter），分两阶段实施：**

1. **Phase 1（立即可做）：** 启用 `provider: 'local'` + `Intl.Segmenter` 分词器 + 双语检测。零依赖，改动量小（仅 config.mts）。
2. **Phase 2（当页面数 > 500 或索引体积 > 200KB 时）：** 评估迁移到 Pagefind。

**不推荐 jieba-wasm：** 博客内容量不大时，3MB WASM 开销不值得。`Intl.Segmenter` 的分词质量对搜索场景已足够——搜索不要求 NLP 级别的分词，召回率比精确率更重要，宁可多返回一些结果也不漏掉。

**不推荐立即上 Pagefind：** 当前规模下，MiniSearch 的索引体积不会是瓶颈。Pagefind 的构建步骤和 UI 定制成本相对较高，不值得为小站点付出这些代价。

## 参考来源

- VitePress issue #5077: [Scalable Local Search Architecture](https://github.com/vuejs/vitepress/issues/5077)（2026-01，含 Intl.Segmenter CJK 分词建议）
- VitePress issue #4049: [Better default minisearch tokenizer for Chinese](https://github.com/vuejs/vitepress/issues/4049)（2024-07 至今未解决）
- MiniSearch issue #201: [How to support Chinese](https://github.com/lucaong/minisearch/issues/201)（社区方案汇总）
- vitepress-plugin-pagefind: [NPM](https://www.npmjs.com/package/vitepress-plugin-pagefind)（v0.4.20, 2026-04）
- Pagefind issue #987: [CJK fuzzy substring search](https://github.com/Pagefind/pagefind/issues/987)（已在 v1.5.0 解决）
- [Static site search for Astro in 2026: Pagefind vs Algolia vs Lunr](https://dev.to/morinaga/static-site-search-for-astro-in-2026-why-i-picked-pagefind-over-algolia-and-lunr-pg1)（2026 实践对比）
- [vitepress 添加搜索使用 Intl.Segmenter 优化中文分词](https://blog.goagix.com/vitepress-search)（社区实践）
