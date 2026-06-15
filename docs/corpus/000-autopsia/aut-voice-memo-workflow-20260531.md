---
title: 语音备忘录工作流改造
created: 2026-05-31
status: form
last_modified: 2026-06-16
---

把语音备忘录从「准备直接发布的播客」降级为「低摩擦素材库」。这不是内容形式上的退让，而是整个知识管理系统的输入层重构。

---

[[toc]]

#kind/reflection #origin/practice #scope/meta/corpus #scope/meta/workflow

## 决策

语音备忘录不再直接作为播客录制，而是作为所有层的原始原料入口。

## 触发点

之前设想过把播客做成日更，但尝试后发现原始表达被过早绑定到发布形式，造成三重压力。同时 6 月 1 日的自主录音暴露了单人叙述难以唤起深层记忆的问题。

## 新工作流

```txt
语音备忘录
  → 转写
  → agent 分流
  → 必要时追问
  → 写入 corpus / 生成 board 候选 / 发展成 post 或 podcast
```

核心原则：**降低输入摩擦是系统的第一原则。** 只有原料持续进入，后面的整理、写作、播客、知识管理才有东西可用。

## 系统级影响

这个决策改变了 Corpus 的输入层设计：

- 语音成为全层通用原料，不再被播客路径独占
- agent 获得新的角色：分流、追问、生成候选
- board 与语音输入之间有了明确的候选-确认机制
- 低摩擦输入的第一原则被确立

## 已提炼的 200 节点

这篇原始反思中嵌入了以下可复用概念，已拆分为独立节点：

- [低摩擦输入第一原则](../200-neoplasma/neo-low-friction-input-first.md) — 降低输入摩擦是系统的第一原则
- [提问作为记忆牵引器](../200-neoplasma/neo-interview-as-memory-trigger.md) — 提问是记忆和叙事的牵引器
- [发布品压力三层结构](../200-neoplasma/neo-publishing-pressure-three-layer.md) — 发布品压力的三层结构
- [多路径消费模型](../200-neoplasma/neo-multi-path-consumption-model.md) — 语音素材的多路径消费模型

## Links

- related: 语音转写 agent 设计、board 候选机制
- grows into: 语音工作流协议、输入层协议、agent 追问规范

::: details 花花的重构意见

本篇当前层级：`Autopsia`；状态：`form`；约 507 个词元，4 个链接。 首个主题段为“决策”。

建议：
- 保留为系统自省，但建议把具体行动项拆到 `300 Putredo` 或 dashboard，避免 000 变成任务池。

:::
