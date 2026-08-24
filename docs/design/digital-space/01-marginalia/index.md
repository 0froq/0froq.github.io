---
title: 页边 Marginalia
---

原型：[prototype.html](./prototype.html)
（离线打开，切首页 / 文章 / Corpus / Dashboard，可换深浅色。）

## 主张

阅读发生在页心，思考停在页边。
长文、术语、元数据共用同一阅读列；
批注、标签、在场、进行中的任务是第二种阅读，
不是浮层、角标或营销侧栏。

一句话：把现有 800px 纸面扩成「正文 + 页边」，
而不是换一套皮肤。

## 情境

- 访客读成言长文，需要中英混排仍可换行、可检索。
- 作者回看 corpus 短条，密度可以碎，列宽不能碎。
- ghost 在场、AnnotationRail、标签树需要空间，
  但不能抢走正文。
- Dashboard 仍是被盯着的文本，不是 SaaS 看板。

## 结构

桌面两列：页心 `38rem` + 页边 `16rem`，
中间 `2.2rem` gutter。
身份条跨两列。
窄于 900px 时页边落到正文下方，去掉 sticky。

四态共用此壳：

| 页 | 页心 | 页边 |
| --- | --- | --- |
| 首页 | 自我陈述 + 最近落笔 | 在场、进行中、路径 |
| 文章 | 成言正文 / 代码 / 警告 | 批注、标签、在场 |
| Corpus | 六层目录 + 近条 | 前缀规则、层深 |
| Dashboard | active / backlog / archive 文本 | 列语义、空的 weekTheme |

## 排版

正文衬线，约 21px / 1.85 行高；
段后空一段，段首缩两字（lede 不缩）。
页边无衬线 13px。
元数据、代码、状态用等宽。
链接虚线下划线，悬停实线——沿用现站习惯。

落地时应映射已加载字体，
不要另引系统宋体当生产字体：

- 正文 → `font-serif`（EB Garamond + 演示用中文衬线）
- 导航 / 页边 → `font-sans`（Instrument Sans）
- 元数据 → `font-mono`（LXGW Bright Code TC）

## 色彩

纸色 `#f3eee4` / 深色 `#161310`。
墨色、页边略深一档、强调只用一处赭石。
状态绿 / 警告仅出现在板和 callout，不当装饰。
深浅色通过 `data-theme`，并尊重 `prefers-color-scheme`。

## 交互

视图切 hash，`aria-current` 跟页。
主题按钮 `aria-pressed`。
无必需外部网络。
动效可关：`prefers-reduced-motion: reduce`。
页边 sticky，不跟滚动抢焦点。

## 窄屏 / 无障碍

- 跳转链接「跳到正文」。
- `:focus-visible` 2px 强调色描边。
- `lang="zh-Hans"`，ruby 注音保留。
- 900px 以下单列，页边不再 sticky，避免和 TOC 争高。
- 正文字号降到 18px，行长仍按中文计算。

## VitePress 落地路径

最小切片，不换 Layout 路由表：

1. 改 `uno.config.mts` 的 `page-content` shortcut：
   从 `max-w-[800px]` 扩成
   `measure + margin` 网格（失败则改回 800px）。
2. `Layout.vue` 的 `.site-shell` 保留；
   页边列接收现有
   `AnnotationRail`、`GhostPresenceRail`、
   文章标签、`Doing`。
3. `ContentArticle.vue` 不再把 rail 当绝对定位附件，
   改成页边流式内容。
4. `ContentIndexGlobal.vue`、corpus / posts / dashboard 的
   `Layout.vue` 共用同一壳，不各做一套侧栏。
5. 数据仍走 `posts.data.ts` / `corpus.data.ts` /
   `board.yml`。不要为提案造第二份内容源。

## 成本 / 风险

- **成本低。** 现站已经是纸面 + 注解轨，方向同构。
- **页边会空。** 无批注、无 ghost 的页面需要
  标签、层路径或「此刻」来填，否则右边是一条死缝。
- **和 TOC 争高。** 现有
  `TableOfContents` / `ButtonVerticalNavigation`
  要决定：并进页边，或只在极宽屏出现。
- **AnnotationRail 的绝对 top 计算**
  绑在现容器上，改网格后必须重测
  `railContainer`，否则卡片会漂。
- **回滚清楚：** 只改 shortcut 和 rail 挂载点。
