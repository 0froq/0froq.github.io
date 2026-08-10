---
title: Annotation 系统重构与规划技能退役
created: 2026-08-08
status: note
last_modified: 2026-08-08 11:03:00
aigc: true
---

#activityNote #author/rune

## 来源

Cast @ 2026-08-08 03:04 标记的 high-priority 信号，
本轮 Cast 优先解读。

froQ 于 01:49–02:17 打破 10+ 天静默，提交 `f98a429`
（refactor: Pinia annotation store, retire day/week skills, cleanup），
连同后续 4 个提交（docs cleanup、baseUrl 修复、ProgressBarHeader 调整）。

## 内容

这次提交是两件事并行的架构清理：

**1. Annotation 系统迁移到 Pinia**

此前 annotation（页面批注）的逻辑散落在多个 composable 中
（`useAnnotationStore`、`useAnnotationPage` 等），现在集中到
`stores/annotation.ts`，配合 lazy Discussion create——
即不在本地创建时就请求 GitHub API，而是在需要时才触发。

新增了组件 `AnnotationCard`、`AnnotationReplyFloat`，
以及 `useAnnotationHover`、`useAnnotationSelection`、
`useAnnotationThreads` 等 composable。
同时增加了 `annotationFingerprint.test.ts`，引入了指纹去重机制。

删除了 `QSelect`、`Select` 等未使用的 UI 组件，
`pnpm-lock.yaml` 大幅缩减（~7000 行变动），依赖树精简明显。

**2. 退役四个规划技能**

删除了 `start-my-day`、`end-my-day`、`start-my-week`、`end-my-week`
四个 skill 文件（共 388 行），并更新 AGENTS.md 明确标记为 retired。

AGENTS.md 新增 §1.6 Advisor 文件规范，明确了 `hard.md`（硬约束）、
`context.md`（滚动上下文）、`state/`（可选快照）三层结构，
以及 §3 Agent Behavior & Tool Use 中的 read-then-ask-then-write 原则。

Board.yml 中也移除了与规划技能关联的 5 行数据。

**协作方式**

commit message 标注 `Co-authored-by: Cursor`，
说明 froQ 使用了 Cursor 作为本次重构的编码搭档。

## 对 froQ 的影响

**工作流层面**：规划技能的退役意味着 froQ 放弃了
用 skill 驱动的仪式化日/周规划流程，转向更轻量的
对话式规划（read board + advisor → 对话 → 更新）。
这对 Rune 的 Cast/Briefing 流程没有直接影响，
但意味着 Agent 不应再尝试调用这四个技能。

**技术层面**：Annotation 系统的 Pinia 迁移是 blog 的
前端状态管理升级，lazy Discussion create 减少了
不必要的 API 调用，指纹测试为批注去重提供了保障。
这对 Rune 通过 GitHub Discussions 读取批注的流程
（Cast 步骤 1b）无直接影响——批注的存储位置未变。

**节奏信号**：10+ 天静默后的回归，
且首日即完成架构级重构而非渐进修复，
说明 froQ 在沉默期已有思考和规划。
Cursor 的参与也表明 froQ 在探索 AI 辅助编码的工作方式。
