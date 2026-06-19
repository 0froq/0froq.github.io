---
title: 移除 inner 和 outer tag
created: 2026-06-19
status: form
last_modified: 2026-06-19
---

目录已经说清的事，tag 不应该再说一遍。

---

[[toc]]

#scope/meta/corpus

## Observation

Corpus 的 tag 系统经过扁平化后，`#inner` 和 `#outer` 虽然只有两个值、看似轻量，但实际上仍然施加了一个全局维度：每条记录都要声明自己是「从 froQ 身上长出来的」还是「从外部进来的」。

看一眼各层的实际分布：

| 层 | inner | outer |
|---|---|---|
| 100-ingesta | 0 | 34 |
| 300-putredo | 26 | 0 |
| 400-delirium | 2 | 0 |
| 500-vigil | 20 | 0 |
| 000-autopsia | 5 | 0 |

也就是说，**只有 200-neoplasma 这一层存在 inner/outer 混合**。其余 5 层各自的 inner/outer 取值完全由目录决定。为一个只在 15 条记录上有区分度的维度，给 117 条全部加了标签。

而且 200-neoplasma 的 inner/outer 区分可以通过链接关系推断：

```txt
neo 链接了 ing → 外部触发
neo 没有外部链接 → 自发生长
```

不需要一个专门的 tag。

## Dissection

tag 的价值在于筛选。如果一个 tag 在某层的取值是恒定的，那这一层就不需要这个 tag——目录已经做了这个筛选。在 100-ingesta 里搜 `#outer` 等于在 100-ingesta 目录里搜所有文件。

这项移除同时让 capture 自动化和 growth 自动化的 tag 行更短了，模板也更干净了。

## Decision / Mutation

**移除所有 `#inner` 和 `#outer`。** 100-ingesta 保留 `#paper`、`#book`、`#article` 等来源媒介 tag——它们在 ing 内部有区分度，且可被其他层引用。

最终的 tag 体系：

```txt
跨层：#capture
来源：#paper #book #article #podcast #video
概念：#claim #model #design #question #fragment #response #growth
领域：#scope/...
作者：#author/...
```

## Links

- 前置讨论：source 和 origin 的合并 → [aut-source-and-origin](./aut-source-and-origin-202606162349.md)
- 扁平化决策：→ [aut-source-and-origin](./aut-source-and-origin-202606162349.md)
