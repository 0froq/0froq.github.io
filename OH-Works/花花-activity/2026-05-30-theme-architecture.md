# 博客 Theme 层架构分析

> 2026-05-30 01:00 自主学习

此前 17 轮学习覆盖了博客的数据层、标签系统、i18n、搜索方案、CJK 字体、Comark 语法、Shiki Twoslash 等基础设施层，Theme 层是最后一块未被系统分析的拼图。本轮补上。

---

## 1. 整体架构：自定义 VitePress Theme

博客没有使用 VitePress Default Theme，而是通过 `index.ts` 导出了一个完整的自定义 Theme：

```
export default {
  Layout,
  enhanceApp({ app }) {
    app.use(TwoslashFloatingVue)
       .use(GesturePlugin)
       .use(MotionPlugin)
       .use(i18n)
  },
} satisfies Theme
```

`enhanceApp` 注入了四个插件：

- **TwoslashFloatingVue**：Shiki Twoslash 的浮动类型弹窗
- **GesturePlugin**（@vueuse/gesture）：拖拽、捏合等手势支持
- **MotionPlugin**（@vueuse/motion）：声明式动画
- **vue-i18n**：运行时国际化（配合 @intlify/unplugin-vue-i18n 构建时编译）

---

## 2. Layout 三层结构

Layout.vue 采用经典的三段式垂直布局：

```
PageHeader    → 顶部导航（Logo + Doing + Layer 面包屑 + 语言切换 + 暗色切换）
PageContent   → 路由驱动的动态内容区（:key="route.path" 强制重渲染）
PageFooter    → 版权声明
ButtonVerticalNavigation → 固定侧边导航（md 断点以上显示）
```

关键设计：

- 根元素使用 `un-font-serif`（实际映射到 `YshiPen-ShutiTC` 手写体），这是 **语义倒置** 的体现
- `min-h-100vh` 保证全高，`text-stone-700 dark:stone-300` 统一文字色
- `PageContent` 的 `:key="route.path"` 确保路由切换时完整重建 DOM，避免跨页状态污染

---

## 3. PageContent 的路由分发

PageContent 是内容层的核心路由器，根据 `route.path` 分发到六个区域：

```vue
<ContentIndexGlobal v-if="['/', '/en/'].includes(route.path)" />

<Corpus v-else-if="route.path.startsWith('/corpus/')" />

<Posts v-else-if="route.path.startsWith('/posts/')" />

<Dashboard v-else-if="route.path.startsWith('/dashboard/')" />

<Tags v-else-if="route.path.startsWith('/tags/')" />

<ContentArticle v-else-if="!page.isNotFound" />

<ContentNotFound v-else />
```

这个设计非常干净——六个并行分支，互不重叠。每个区域内部又有自己的子路由（Layout → Home / Layer / Article 三层）。

---

## 4. 各区域的子路由模式

### Posts

```
/posts/                    → Home（文章列表 + 三级分类）
/posts/610-log/            → Layer（代序层索引）
/posts/610-log/some-post   → Article（单篇文章）
```

Posts Layout 同时承载了 `ContentNav` 全局导航（Corpus 六层 + Dashboard 子页 + Tags），内容区通过 `useRouteI18n().currentBasePath` 判断渲染哪个子组件。

### Corpus

```
/corpus/                       → Home（Corpus 总览页）
/corpus/000-autopsia/          → Layer（层索引）
/corpus/000-autopsia/some-file → Article（具体条目）
```

Corpus Home 使用 `ProgressBarHeader` + `Content`（markdown 渲染）模式，六层各自独立。

### Dashboard

```
/dashboard/          → Home（Board 看板）
/dashboard/visions/  → Visions（愿景）
/dashboard/hints/    → Hints（提示）
```

Dashboard Home 直接用 `ProgressBarHeader` + `Board` 组件，Board 内部从 `board.data.ts` 读取 YAML 驱动的三列任务看板。

### Tags

```
/tags/             → Home（标签树）
/tags/some-tag/    → Detail（标签详情）
```

---

## 5. 设计 Token 体系：UnoCSS 配置

### 5.1 字体语义倒置

这是整个设计系统最有趣的设计决策。在 UnoCSS rules 中，标准语义名被映射到了「反直觉」的字体：

| CSS class      | 映射字体                      | 实际用途    |
| -------------- | ----------------------------- | ----------- |
| `font-sans`    | LXGW Neo ZhiSong Plus（宋体） | 标题、强调  |
| `font-serif`   | YshiPen-ShutiTC（手写）       | 正文        |
| `font-mono`    | LXGW Bright Code TC           | 仪表盘      |
| `font-stylish` | Caveat（英文手写）            | Corpus 标题 |
| `font-script`  | Ephesis（英文花体）           | Posts 标题  |

**设计哲学**：在中文语境下，宋体是「正式、端庄」的，更适合标题定位；手写体是「亲近、流动」的，更适合正文阅读。这突破了「sans = 无衬线 = 现代 = 正文 / serif = 衬线 = 传统 = 标题」的西文排版惯例，按中文阅读体验重新定义了语义层。

这与博客的 corpus 六层命名（拉丁语生僻词）一样，属于「用异质化命名制造认知距离 → 迫使使用者重新审视」的策略。

### 5.2 图标生态

8 套图标集通过 presetIcons 动态加载：

| 前缀       | 来源          | 用途            |
| ---------- | ------------- | --------------- |
| `i-carbon` | Carbon（IBM） | 通用 UI         |
| `i-ph`     | Phosphor      | 通用 UI（主力） |
| `i-solar`  | Solar         | 通用 UI         |
| `i-duo`    | Duo Icons     | 装饰            |
| `i-simple` | Simple Icons  | 品牌 Logo       |
| `i-skill`  | Skill Icons   | 技术栈图标      |
| `i-twe`    | Twemoji       | Emoji           |
| `i-openmj` | OpenMoji      | Emoji           |

其中 `ph` 和 `solar` 在代码中出现频率最高。图标通过 `safeIcon.json` 的 safelist 机制确保构建时不丢失。

### 5.3 Attributify 模式

使用 `presetAttributify({ strict: true, prefixedOnly: true, prefix: 'un-' })`：

- `strict`：只解析显式属性值
- `prefixedOnly`：只有 `un-` 前缀的属性才被解析为 UnoCSS 规则
- 这避免了与原生 HTML 属性的命名冲突

同时 `presetTagify({ prefix: 'un-' })` 允许 `<un-page-content>` 这样的标签语法自动展开为 class。

---

## 6. UI 组件体系

组件按功能域组织为五层：

```
components/
├── ui/base/      # 基础组件（LinkUnderline, FloatWindow, QCheckbox, QSelect, ProgressBarHeader...）
├── ui/nav/       # 导航组件（ContentNav, ButtonVerticalNavigation）
├── ui/tag/       # 标签组件（TagDisplay, TagTreeNode）
├── ui/icon/      # 图标组件（IconApp, IconLoading, SvgFroqLogo）
├── ui/chart/     # 图表组件（PlotlyChart）
├── ui/article/   # 文章组件（ArticleNavigation, PostListSection, TooltipArticleInfo）
├── header/       # 顶部组件（Logo, Doing, Layer）
├── corpus/       # Corpus 区域（Layout, Home, Layer, Article）
├── posts/        # Posts 区域
├── dashboard/    # Dashboard 区域（Board, TaskList, TaskListItem, DayTodos...）
├── tags/         # Tags 区域
```

### LinkUnderline 的巧思

这是最常用的基础组件之一。核心设计：

- 使用 `::after` 伪元素做下划线动画（`hover:before:w-full` 展开）
- 通过 `v-bind` 透传 UnoCSS 属性，允许调用方自定义颜色和样式
- 内置 `FloatWindow` tooltip 支持（hover 跟随鼠标 / click 切换两种模式）
- `renderMdInline()` 渲染 markdown 内联语法到链接文字

```vue
<LinkUnderline
  href="https://..."
  text="CC BY-NC-SA 4.0"
  un-text="stone-600"
  un-before="bg-stone-800 h-px"
/>
```

### Dashboard 组件系统

Board 是仪表盘的核心，采用了结构化设计：

- 从 `board.data.ts` 读取 YAML 数据
- 按 status 分组（active / done / backlog），每列用 TaskList 渲染
- 三列分别用 amber / emerald / sky 色彩主题
- `deffered` 兼容拼写错误（typst → deffered），体现了防御性编程
- 底部有用于生成 UnoCSS safelist 的隐藏 div（动态拼接的 class 名需要显式声明）

---

## 7. Plotly 图表系统

`utils/chartTheme.ts` 实现了一个完整的响应式图表主题系统：

```
useChartTheme() → { isDark, colors, layout, mergeLayout }
```

特性：

- **响应式暗色模式**：`computed(() => useDark().value)` 自动切换 light/dark 主题色
- **主题色覆盖**：背景、文字、网格线、零线、tooltip 全部可配置
- **mergeLayout**：`deepMerge(baseLayout, userLayout)` 允许组件层覆盖默认布局
- **Mann-Kendall**：`utils/statistics/mannKendall.ts` 提供趋势检验

---

## 8. style.css 的滚动条与排版细节

全局 CSS 中几个值得注意的设计：

- **极细滚动条**：`w-1px`，视觉上几乎消失
- **基础字号响应式**：`text-12px sm:text-16px md:text-20px`
- **medium-zoom 背景**：通过 CSS 变量 `--image-mask-bg` 同步明暗主题
- **标题装饰**：`::before` 显示章节编号（opacity-5，hover 时提亮到 40%），`::after` 下划线动画
- **分隔线**：`border-dashed` + `w-80% mx-auto`，不是全宽实线
- **外部字体**：5 个外部 CDN 字体导入（fontsapi.zeoseven.com 的繁体中文 + Google Fonts 的 4 个英文字体）+ 2 个本地 @font-face

---

## 9. 架构特征总结

| 特征       | 实现方式                                | 评价                        |
| ---------- | --------------------------------------- | --------------------------- |
| 主题定制   | 完全自定义 Layout，不依赖 Default Theme | 灵活但维护成本高            |
| 路由分发   | PageContent 的 v-if 链                  | 简单直观，适合当前规模      |
| 设计 token | UnoCSS rules + presets                  | 统一、可扩展                |
| 组件复用   | 领域分层（ui/ → 业务组件）              | 清晰                        |
| 暗色模式   | VueUse useDark + CSS 变量               | 标准方案                    |
| 图表主题   | computed + deepMerge                    | 优雅                        |
| 字体策略   | 语义倒置 + 5 套字体 + 本地/外部混合     | 有设计主张但 CDN 依赖需关注 |

---

## 10. 残存问题与关注点

1. **外部字体 CDN 依赖**：4 个 Google Fonts + 1 个 zeoseven CDN。如果任何 CDN 宕机，页面会出现 FOIT/FOUT。之前 CJK 字体分析中已建议了 subsetting 本地化方案。
2. **SafeIcon 维护**：`safeIcon.json` 需要手动维护，新增图标使用时如果忘记添加会被 tree-shaking 掉。
3. **Dashboard UnoCSS safelist hack**：Board.vue 底部的隐藏 div 用于生成动态 class，是 UnoCSS 静态提取的典型 workaround，但不够优雅。
4. **PageContent :key 策略**：`route.path` 作为 key 意味着任何路由切换都会完整重建 DOM。这在 SPA 内是安全的，但丢失了过渡动画的可能性（@vueuse/motion 未在此层面利用）。
5. **字体语义倒置的可维护性**：新加入的开发者会困惑为什么 `font-sans` 显示宋体。这个设计决定需要在文档中明确说明，否则是认知陷阱。
