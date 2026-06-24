# Zettelkasten 原子笔记原则与 Corpus 蒸馏

蛙蛙当前在做 corpus 层蒸馏——把 Notion 条目转化为结构化的知识层条目。这个过程的本质，和 Zettelkasten 的永久笔记处理高度同构。

## 核心对照

| Corpus 蒸馏 | Zettelkasten 永久笔记 |
|---|---|
| 从原始条目提取可复用的知识块 | 从 fleeting/literature note 提炼为原子笔记 |
| 每一条目只有一个核心主张 | 一条笔记 = 一个 Idea |
| flat-tag 体系代替层级分类 | 链接（而不是文件夹）建立关联 |
| 层（layer）作为组织单元 | 索引笔记 / Map of Content |

## 原则：原子性

一篇好的 corpus 条目，不应包含两个可以独立复用的事实。

> 好的例子：
> - 「Partial indexes reduce write overhead when queries target a small subset」
> - 「Retries are safe only when the operation is idempotent」

> 太宽泛：
> - 「PostgreSQL 笔记」
> - 「关于 retry 的一切」

蛙蛙的 corpus 蒸馏中，如果一个 Notion 原始条目包含多个独立的 insight，就应该拆成多条，每条保留指向原始来源的链接。

## 原则：链接优先于分类

flat-tag 体系的哲学和 Zettelkasten 一致：链接让知识属于多个上下文，文件夹强迫你提前决定归属。

每条 corpus 条目链接的方向：
- 解释了什么概念
- 依赖了什么概念
- 在哪段代码/系统/场景中实际出现过
- 相反/补充的观点

## 原则：涌现优于设计

Zettelkasten 真正的力量不在于结构设计，而在于：**诚实连接，等待簇群出现**。

对蛙蛙的 corpus 而言，这意味着：不需要先设计完美的标签层级或图模型。先以 flat-tag + 充分链接的方式积累条目，几个月后观察哪些主题自然形成簇群，再用 map of content 或 graph layer 去增强。

## 对蛙蛙当前工作的映射

1. **蒸馏粒度判断**：如果一条 Notion 笔记包含多个独立可复用的 insight，拆成多条 corpus entry
2. **标题即主张**：用陈述句（而非名词短语）做条目标题，让标题本身就传达核心判断
3. **链接的意图性**：每一条链接应该回答「为什么这两个条目有关系」，而不是机械的双向关联
4. **分离来源与理解**：原始 Notion 条目作为 literature note 保留，corpus 条目是「用我自己的话理解了这个 idea」

## 参考

- [Zettelkasten for Developers: A Practical Method](https://dev.to/rosgluk/zettelkasten-for-developers-a-practical-method-that-works-3ij) — 这篇对开发者最实用，已提炼核心框架
- [The Complete Guide to Atomic Note-Taking](https://zettelkasten.de/atomicity/guide/) — Zettelkasten.de 官方指南
- 蛙蛙已有的笔记：[knowledge-management-philosophies](../2026-05-31-knowledge-management-philosophies.md) 从另一角度覆盖了 KM 哲学
