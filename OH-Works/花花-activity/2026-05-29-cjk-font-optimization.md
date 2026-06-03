# CJK 网络字体排版与性能优化

> 2026-05-29 01:00 巡检自主学习

## 背景

froQ 的博客有 5 套字体体系，其中 CJK 字体（`LXGW Neo ZhiSong Plus`、`YshiPen-ShutiTC`、`LXGW Bright Code TC`）是内容排版的核心。CJK 字体的体积挑战是拉丁字体的数十倍——单个 Noto Sans CJK SC 完整包约 15-20MB（覆盖 44,806 个字符），不做优化直接加载等同于自毁性能。

## 博客当前字体架构分析

从 `uno.config.mts` 和 `style.css` 可以看到当前的字体加载策略：

| 字体角色 | 字族 | 来源 | 加载方式 |
|---------|------|------|---------|
| 正文（font-sans） | LXGW Neo ZhiSong Plus | 本地 TTF | `@font-face` 本地文件 |
| 手写/标题（font-serif） | YshiPen-ShutiTC | fontsapi.zeoseven.com | 外部 CSS import |
| 代码（font-mono） | LXGW Bright Code TC | 本地 TTF | `@font-face` 本地文件 |
| 装饰（font-stylish） | Caveat | Google Fonts | CSS2 API import |
| 装饰（font-script） | Ephesis | Google Fonts | CSS2 API import |
| 未使用 | Recursive | Google Fonts | CSS2 API import |
| 未使用 | League Script | Google Fonts | CSS2 API import |

### 关键观察

1. **CJK 字体都是完整加载**。LXGW Neo ZhiSong Plus 和 YshiPen-ShutiTC 作为正文和标题字体，未做任何 subsetting，加载了整个字体的所有 glyph。
2. **YshiPen-ShutiTC 走外部 CDN**（fontsapi.zeoseven.com），增加了一次 DNS 解析 + TLS 握手 + 第三方依赖。
3. **Google Fonts 的 CSS2 API** 已经默认做了 unicode-range 分片 + woff2 转换，但 Caveat/Ephesis 是拉丁字体，体积本来就小，问题不大。
4. **Recursive 和 League Script 导入了但未见使用**，属于 dead code。

## 核心技术：cn-font-split + vite-plugin-font

这是当前 CJK 字体分包领域最成熟的工具链。

### 架构

```
cn-font-split (Rust 核心)
├── HarfBuzz (字体子集化引擎)
├── Protobuf (跨语言通信)
└── 多平台 Wrapper
    ├── WASM → 浏览器端运行
    ├── FFI (C API) → Node.js Native
    ├── gRPC → 独立服务
    └── CLI → 命令行

vite-plugin-font (Vite 插件封装)
├── 构建时自动扫描源文件字符集
├── 按 unicode-range 分片（100+ 个小文件）
├── 生成 CSS @font-face + unicode-range 声明
└── 按需加载：浏览器只下载当前页面实际需要的分片
```

### 工作原理

1. **构建时**：扫描项目中所有 `.vue/.ts/.md` 文件，收集实际使用的字符
2. **分包**：将字体按 unicode-range 切成 100+ 个小 woff2 文件（每个 30-60KB）
3. **CSS 生成**：自动生成带 `unicode-range` 的 `@font-face` 规则，浏览器根据页面内容按需加载
4. **首屏优化**：优先打包高频字符（覆盖常用 3500 汉字），首屏只需加载 2-3 个分片

### 性能数据

- 完整 CJK 字体（15MB TTF）→ 分包后单页实际下载 100-500KB
- 构建速度：2MB 字体仅需 50ms（Rust 原生性能）
- 首屏：高频字符分片覆盖 99% 日常用字，约 150-200KB

## CJK 字体 Subsetting 三种策略

### 1. Unicode-range 分片（推荐，cn-font-split 采用）

按 Unicode 区块切分，利用 CSS `@font-face` 的 `unicode-range` 描述符，浏览器自动按需下载。

```
@font-face {
  font-family: 'LXGW Neo ZhiSong Plus';
  src: url('/fonts/lxgw-4.woff2') format('woff2');
  unicode-range: U+4e00-4fff;  /* 一至仍 */
}
/* ... 100+ 条规则 */
```

**优点**：零运行时成本，浏览器原生行为，SSR 友好。
**缺点**：需要构建工具支持，文件数量多（但浏览器只会下载需要的）。

### 2. 频率导向 Subsetting

按语料库统计的字符频率，只打包最常用的 N 个字符（如 3500 常用汉字）。

**优点**：单文件，简单。
**缺点**：遇到生僻字会降级到 fallback 字体，排版不一致。不适合内容型博客（你不知道会写什么字）。

### 3. 内容导向 Subsetting

根据项目实际内容（Markdown 文件、代码中的字符串）提取字符集。

**优点**：最小的文件体积。
**缺点**：后续新增内容可能用到未包含的字符，需要重建；动态内容（如博客标题来自 frontmatter）可能遗漏。

### 推荐策略

对于 froQ 的博客，推荐 **unicode-range 分片（策略 1）+ 高频字符优先** 的组合。这是因为：
- 博客内容会持续增长，频率和内容导向都有遗漏风险
- unicode-range 分片覆盖全字符集，不会有排版降级
- 首屏自动只加载高频分片，兼顾性能与覆盖

## 字体加载策略与 CLS 防治

### font-display 的选择

| 值 | 行为 | 适用 |
|----|------|------|
| `swap` | 先用 fallback，字体加载后替换 | **正文**：内容可读性优先 |
| `block` | 短暂隐藏文字，等字体加载 | 不推荐：CJK 字体大，FOIT 时间长 |
| `fallback` | 极短 block 期后 swap | 标题/装饰性文字 |
| `optional` | 100ms 内未加载则放弃，不替换 | 装饰性字体，非核心 |

对于 CJK 正文，`font-display: swap` 几乎是最优选。但 swap 的问题是 CLS——fallback 字体与 web font 的 metrics 不一致时，文字会发生位移。

### CJK 特有问题

CJK 字体的 CLS 比拉丁字体更严重，原因：
1. **字符框（em-box）比例不同**：中文是方形的，拉丁 fallback 字体的中文字符可能使用不同的 advance width
2. **行高差异**：CJK 字体的默认行高通常比拉丁字体大
3. **基线偏移**：不同于拉丁 baseline，CJK 的字符居中于 em-box

### 缓解方案

1. **`size-adjust` CSS 属性**：调整 fallback 字体的 metrics 匹配 web font
   ```css
   @font-face {
     font-family: 'LXGW Neo ZhiSong Plus';
     src: url('/fonts/lxgw.woff2') format('woff2');
   }
   @font-face {
     font-family: 'LXGW Fallback';
     src: local('PingFang SC'), local('Microsoft YaHei');
     size-adjust: 105%;  /* 精细调校 */
     ascent-override: 90%;
   }
   ```

2. **`f-mods` 工具**：自动计算 CJK fallback 字体的 metrics override 值

3. **vite-plugin-font 的 CLS 支持**：该插件声称自动减少中文 CLS 偏移，原理是在生成的分片 CSS 中包含 `size-adjust` 声明

## 具体建议（针对 froQ 博客）

### 短期（零成本）

1. **移除未使用的字体导入**：`League Script` 和 `Recursive` 未见使用，移除 import 减少请求
2. **为本地 CJK 字体添加 `font-display: swap`**：LXGW Bright Code TC 和 LXGW Neo ZhiSong Plus 的 `@font-face` 声明中未见此属性
3. **预加载关键字体**：在 HTML head 中添加 `<link rel="preload">` 指向 LXGW Neo ZhiSong Plus，因为它是正文字体，阻断渲染

### 中期（需要构建配置）

4. **接入 vite-plugin-font**：对 `YshiPen-ShutiTC`（走外部 CDN 的那个）做分包处理。当前这个字体从 fontsapi.zeoseven.com 完整加载，是最大瓶颈。方案：
   - 下载字体文件到本地
   - 配置 `vite-plugin-font` 自动分包
   - 移除外部 CDN import
   
   这样同时解决了第三方依赖和体积问题。

5. **对 LXGW 系列本地字体也做分包**：虽然是本地文件，但仍是完整 TTF。可以同样接入 cn-font-split 分包。

### 长期（架构层面）

6. **字体加载优先级策略**：

   ```
   第一优先级（阻塞渲染）：font-sans 的高频分片
   第二优先级（首屏）：font-mono 的分片（代码块）
   第三优先级（延迟加载）：font-serif / font-stylish / font-script
   ```

7. **Fallback 字体栈优化**：
   ```css
   --font-sans: 'LXGW Neo ZhiSong Plus', 'PingFang SC', 'Hiragino Sans GB', 
                'Microsoft YaHei', 'Noto Sans SC', sans-serif;
   --font-serif: 'YshiPen-ShutiTC', 'STKaiti', 'KaiTi', 'Noto Serif SC', serif;
   --font-mono: 'LXGW Bright Code TC', 'Cascadia Code', 'Fira Code', 
                'JetBrains Mono', 'Source Code Pro', monospace;
   ```
   PingFang SC 作为 macOS/iOS 上最接近宋体的系统字体，是 LXGW Neo ZhiSong Plus 的最佳 fallback。

## 参考资源

- **cn-font-split**：https://github.com/KonghaYao/cn-font-split（Rust 字体分包引擎）
- **vite-plugin-font**：https://www.npmjs.com/package/vite-plugin-font（Vite 插件封装）
- **中文网字计划**：https://chinese-font.netlify.app（项目主页，在线分包演示）
- **Fontsource Noto Sans SC Variable**：https://fontsource.org/fonts/noto-sans-sc（自托管方案）
- **Noto Sans CJK Variable**：https://github.com/notofonts/noto-cjk（5 语言 + Variable OTC）
- **Web Font Optimization Guide 2026**：https://webperfclinic.com/article/web-font-optimization-complete-guide-faster-loading-zero-layout-shift

## 与博客项目的关系

这篇笔记和 `2026-05-28-vitepress-ecosystem-blog.md` 形成互补——那一篇覆盖了 VitePress 2.0 的构建和插件体系，这一篇深入到排版层。后续如果 froQ 需要，可以基于这两篇制定博客的 font/bundle 联合优化方案。

另外注意：`vite-plugin-font` 需要 Vite 插件层的支持。VitePress 通过 `vite.config.ts` 或 `config.ts` 中的 `vite.plugins` 可以注入自定义 Vite 插件，理论上兼容。但 cn-font-split 的 WASM/FFI 依赖是否与 VitePress 2.0 的 Rolldown 构建链完全兼容，需要实测验证。
