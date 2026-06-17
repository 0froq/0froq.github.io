---
title: A Syntax Lightlight Design
created: 2025-12-10
status: form
last_modified: 2026-06-16 04:14:49
---

---

[[toc]]

#kind/design #origin/endogenous #scope/work/theme

## 设计

设计语法高亮，完全乱掉。

行为（action）没得说，语法上的函数（function），语义上的调用（call）。

结构（struc）和参考（ref）需要再详细定义。

## 理念

理念是，只有不影响具体逻辑的才是 ref。类型（type）的本质是加以约束，
（字面）量（number、boolean）也只是特定的「参量」，不干涉逻辑。

所以变量（variable）属于 struc 还是 ref？如果在函数的参数（param）中，应为结构；
但后续使用时呢？ref？常量（const）是否应该和 var 区分开？
之前 const 是算 struc 的。

还有，本来是把几乎所有的「定义」都算作 struc 了，比如包括函数的定义。

## 难

很难做出语义的区分，各个 treesitter parser 实现得天差地别，
而且和 textmate 差别过大。

::: details 花花的重构意见

本篇当前层级：`Neoplasma`；状态：`form`；约 209 个词元，0 个链接。 首个主题段为“设计”。

建议：
- 确认它是否能用一句声明式命题概括；如果不能，先保留 `#kind/fragment`。
- 建议至少补一个来源、实践或相邻概念链接；200 的价值来自复用和连接。

:::
