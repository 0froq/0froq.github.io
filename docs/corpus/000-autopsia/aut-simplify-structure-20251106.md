---
title: Corpus 结构简化
created: 2025-11-06
status: form
last_modified: 2026-06-16 03:39:24
---

Corpus 结构进行了简化。

---

[[toc]]

#kind/practice #origin/endogenous #scope/meta/corpus

## 大修

### 结构

所以，根据 [这里](aut-20251105.md) 的讨论，Corpus 存在过度分化的问题。
这里采用了其中提出的方案，仅保留顶层分类，即六大层级，
子分类通过标签实现。

`corpus.zsh` 等脚本完全重写，删除了所有子分类的处理逻辑。

新增 `--insta` flag，用于快速创建并打开 headless nvim 实例进行编辑。

### 模板

模板系统在 [这里](aut-template-change-20251105212955.md) 已经进行修改，
把英文和拉丁文的引导改为繁体中文以增强（对于我的）可读性（惭愧）。
但是在层级合并后，一套模板必然不适用于一个层级下的所有条目，
所以干脆取消了模板中的引导内容，
仅保留 YAML 头部，所有内容均由用户自行编辑。

---

会更合理吗？Let's see.

::: details 花花的重构意见

本篇当前层级：`Autopsia`；状态：`form`；约 235 个词元，2 个链接。 首个主题段为“大修”。

建议：
- 保留为系统自省，但建议把具体行动项拆到 `300 Putredo` 或 dashboard，避免 000 变成任务池。

:::
