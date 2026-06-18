---
title: Autopsia 的 template 以及原子化拆分
created: 2026-06-17
status: form
last_modified: 2026-06-17 14:48:18
---

一些关于 autopsia 的 template 的问题，但根源是记录的原子化拆分。

---

[[toc]]

#inner #scope/meta/corpus

## Observation

在 [这篇 aut](./aut-source-and-origin-202606162349.md) 中，
注意到默认给出的模板有不合适的地方。

具体而言，在那篇的「争议」节中，可以算是提出了一个新的 dissection。
原本的 observation 是 source 和 origin 语义不清晰，
所以自然，dissection 是分析的思路，即为何不清晰、两者是否有合并的可能等。
最后我们给出了 decision，即「融合」。
但在这种融合的设计下，又出现了新的需要 dissection 的地方，
即「corpus 算 inner 还是 outer」。

如果按照「原子化」的构想，
这个「corpus 算 inner 还是 outer」应该作为单独一个记录。
但在这里，其高度依附于「融合 source 和 origin」的上下文，
分出去可能不是一个好的选择。

## Dissection

原因很简单：当前的 template 认为任何记录、想法都可「低代价地」进行原子化拆分。
但实际上，aut 的过程往往是连续的、流动的。
非要拆成原子化记录不是不可，但「表意清晰」和「文件间无冗余上下文」需要权衡：
要么在多个文件中多次重复上下文以使单个文件足够可理解，
要么牺牲可读性来避免重复维护多份高度一致的背景及链路。

花的看法是，上面我的想法是合理的，但在这个系统中，在「原子化」的构想中，
用于判断一条记录是否应该单独存在的依据应该是「其自身是否构成完整命题」，
或「其是否可 / 可能被单独引用」。
根据花的意见，这里的案例是可以拆分的。其上下文确实依赖于「融合」，
但其本身是一个可被独立讨论的话题。
「融合」提供的上下文仅限于澄清新的 observation 的来源，
而不对这个 observation 以及后续的 dissection 和 decision 起到任何的指导作用。

我认可。

## Decision / Mutation

所以在这种考虑下，我们需要解决两个问题：
第一是 template，因为确实多轮认知过程的一次完整记录确实应该被放在一起；
第二是文件切分思路。

我不会再改 [这篇](./aut-source-and-origin-202606162349.md)，
但后续的记录会遵循这里形成的新认识。
