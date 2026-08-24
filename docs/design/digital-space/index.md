---
title: Digital Space 五案
---

OQ-3 的五份可运行原型，加上各案设计说明。
本目录只放提案。未改生产主题、内容或配置。
HTML 请用文件系统打开；VitePress 可能会把各案
`index.md` 收成站点页，那不是发布。

## 打开原型

| 案 | 主张 | 原型 | 说明 |
| --- | --- | --- | --- |
| 01 页边 Marginalia | 阅读在页心，思考在页边 | [prototype.html](./01-marginalia/prototype.html) | [设计文档](./01-marginalia/) |
| 02 岩芯 Strata | 知识是沉积，站点是剖面 | [prototype.html](./02-strata/prototype.html) | [设计文档](./02-strata/) |
| 03 分屏 Workbench | 站点即工作台 | [prototype.html](./03-workbench/prototype.html) | [设计文档](./03-workbench/) |
| 04 地籍 Cadastre | 花园是可丈量的地 | [prototype.html](./04-cadastre/prototype.html) | [设计文档](./04-cadastre/) |
| 05 字谷 Foundry | 先排字，再排空间 | [prototype.html](./05-foundry/prototype.html) | [设计文档](./05-foundry/) |

每份原型可切首页 / 文章 / Corpus / Dashboard，并有深浅色。
代表内容沿用现有自我陈述、成言
《从零开始搭建博客网站（一）》、
六层真实量级、`board.yml`。

## 横向比较

五案的差别在结构、阅读节奏、材料、交互，
不是同一布局换皮。

|  | 页边 | 岩芯 | 分屏 | 地籍 | 字谷 |
| --- | --- | --- | --- | --- | --- |
| 结构 | 正文 + 页边 | 垂直七层剖面 | 树 / 缓冲 / 检查器 | 总图 → 地块 → 文书 | 单列字样 |
| 阅读节奏 | 长文优先，旁注并行 | 先下钻，再取芯阅读 | 作者扫文件 | 先定位，再进地块 | 字阶带路 |
| 材料 | 纸 + 页边略深 | 沉积色带 + 样芯纸 | 深色工作台 | 图则网格 + 文书纸 | 墨、纸、一处朱 |
| 交互 | sticky 页边、少铬 | 点地层 | ⌘K、三列 | 点地块（无缩放） | 几乎无铬 |
| 六层怎么出现 | 页边规则 / 目录 | **主视觉** | 左树目录 | 地块编号 000–500 | 六行目录 |
| 注解 / ghost | 页边正位 | 气候条附带 | 右栏检查器 | 地籍簿附带 | 底栏只读 |
| 落地成本 | 低 | 中高 | 高 | 中 | 低（更像约束） |
| 失败形态 | 页边空、与 TOC 争高 | 展览化、色块上排正文 | 像 admin、无 JS 中列空 | 假 GIS、邻接表腐烂 | display 套长标题 |

## 主推 / 冒险

**主推：页边。**
和现站同构：已经是 800px 纸面 + AnnotationRail + ghost。
扩成页心 / 页边之后，批注、标签、在场、Doing
有地方可去。失败回得去。

**冒险：岩芯。**
唯一把六层本体论做成主视觉的方案。
别人会记住「这座站是剖面」。
代价是首页要新壳；长文必须换到样芯纸上。

**不论选谁，吸收字谷的减法：**
结构字体不超过三族，强调色一处。
现站 `font-script` / `font-stylish` 只许当点缀，
不许当结构。

**分屏**更像写作模式开关，不是访客默认。
**地籍**可以做首页 atlas，但不要引入地图库；
粒度锁在域 / 层。

## 选择后的最小实施切片

选定后不要先改生产主题。
做一页可切换壳，喂真实数据：

1. 读 `posts.data.ts`、`corpus.data.ts`、`board.yml`
   （active 可有 status；backlog / archive 无）。
2. 核：中英混排、corpus 前缀必须对齐目录、
   论文 `ing-@`、窄屏、`prefers-reduced-motion`、
   无注解时的空态。
3. 按所选方案只动下列挂载点之一：

**若选页边**

- 改 `page-content` shortcut（现 `max-w-[800px]`）。
- 把 `AnnotationRail`、标签、ghost 迁入页边列。
- `Layout.vue` 路由表不动。
- 验收：一篇成言 + 一篇无批注的短 corpus + board。
- 失败：shortcut 改回 800px。

**若选岩芯**

- 新首页壳替换 `ContentIndexGlobal` 主列。
- 层计数从 `corpus.data.ts` 聚合。
- 文章背景切样芯纸，禁止正文叠地层色。
- 旧首页整页可切回。

**若选分屏（不推荐作默认）**

- `?mode=work` 或本机开关。
- 中列 = 现有页面 SSR；树和检查器可后挂。
- 补窄屏面板开关（原型里 CSS 有、脚本无）。

**若选地籍**

- 仅首页 atlas；地块链到已有路由。
- 邻接表手写、域级。
- 文书页不改。

**字谷不单独开切。**
把它的 type scale 和「一处朱」写进所选方案的验收清单。

## 验证

```sh
open docs/design/digital-space/01-marginalia/prototype.html
open docs/design/digital-space/02-strata/prototype.html
open docs/design/digital-space/03-workbench/prototype.html
open docs/design/digital-space/04-cadastre/prototype.html
open docs/design/digital-space/05-foundry/prototype.html
find docs/design/digital-space -name '*.html' | wc -l
git diff --check -- docs/design
```

HTML 无外部 http(s) 依赖。请在本机拖到 <900px 比较。
本环境不代替你做视觉选择。

## 来源与边界

- 原型字节来自 OQ-3 评论附件，未改内容。
- 只新增 `docs/design/digital-space/`。
- 不提交、不发布、不改
  `docs/.vitepress/theme/` 生产文件。
