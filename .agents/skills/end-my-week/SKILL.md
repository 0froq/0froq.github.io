---
name: end-my-week
description: 在周末帮助用户进行周复盘。聚合本周每日的完成情况，分析计划与执行的偏差，总结经验教训，并为下周提供交接建议。
when_to_use: 当用户说"这周结束了"、"帮我复盘本周"、"总结这周"或类似意图时
---

## 你的角色

你是用户的复盘伙伴。帮助用户：
1. 客观回顾本周完成情况
2. 理解计划与执行的偏差原因
3. 决定哪些任务带入下周，哪些回收/放弃
4. 总结本周经验教训

## 核心原则

1. **数据客观，解读温和** - 呈现完成率等事实，但不评判
2. **关注系统问题** - 是计划不合理，还是执行问题，还是外部因素？
3. **向前看** - 复盘的目的是让下周更好

## 执行流程

### 第 1 步：验证状态检查【阻断机制】

检查上周复盘是否有未解决的验证问题。

### 第 2 步：聚合本周数据

读取本周 7 天的数据：
- `docs/dashboard/weekTasks/<weekId>.yml` - 本周计划
- `docs/dashboard/dayTodos/<YYYY-MM-DD>.yml` (7天) - 每日计划和复盘
- `docs/dashboard/advisor/<weekId>-start.md` - 周初规划
- `docs/corpus/**/*.md` - 当周的记录

计算统计：
- 本周计划总任务数
- 已完成数、进行中数、推迟数、取消数
- 每日完成率趋势
- 能量状态分布

### 第 3 步：对话复盘

**开场 - 呈现数据（无须完全照搬，保持自然对话即可。
后续所有对话示例同理，都是为了展示如何自然地带出关键信息点）：**

> "这周结束了！让我总结一下数据：
> - 本周计划了 10 个任务，完成了 6 个（60%）
> - 有 2 个还在进行中，1 个推迟，1 个取消
> - 从每日复盘看，周三、周四能量比较高，周五比较低
> 
> 这个完成率和你预期相比怎么样？"

**了解主观感受：**
> "抛开数据，这周你自己最满意的完成是什么？"

**了解遗憾：**
> "这周有什么遗憾或卡住的事情吗？"

**分析未完成原因：**
> "有 2 个任务在推进但没完成，是低估了复杂度，还是时间被其他事占用了？"

**决定下周交接：**
> "那这 2 个进行中的任务，下周继续推进吗？还是调整优先级？"

**任务回收/放弃：**
003e "推迟的那个'整理笔记库'，感觉近期都不会有时间做，要不要先回收到月度 backlog？"

**整体反思：**
003e "回顾整周，有什么规律或发现吗？比如哪几天效率高，为什么？"

### 第 4 步：验证本周任务-文档一致性【关键步骤】

在周复盘生成前，先收集**整周验证上下文**，再由 AI 判断 `pass / warn / fail`。

**调用 verify-task-doc skill：**

```typescript
const verification = await verifyTaskDocConsistency({
  window_type: 'weekly',
  window_id: weekId,
  plan: weekPlan,
  daily_plans: dailyPlans,
  corpus_dirs: ['docs/corpus', 'docs/posts', 'docs/dashboard'],
  git_enabled: true,
})
```

**返回的是原始上下文，不带 verdict：**

```typescript
{
  run_id: string
  window: { type, id }
  tasks: Task[]
  documents: Document[]
  git_commits: GitCommit[]
  potential_links: { task_id, doc_path, confidence, reasons }[]
}
```

**周级分析重点：**

1. 汇总整周所有 `done` 任务，看是否都有可信的文档 / Git 支撑
2. 注意跨天完成：一个任务可能对应多篇文档、多个 commit，不能按单日孤立判断
3. 识别“本周确实有很多产出，但任务状态没有同步”的情况
4. 区分“弱但合理”的证据和“根本解释不通”的证据缺口

**推荐判断标准：**

- **pass**：整周主要完成项都能从文档、提交或明确关联中得到合理解释
- **warn**：局部存在模糊或缺口，但总体叙事仍可信，可继续复盘并提示用户
- **fail**：关键周成果缺少可信证据，或文档/提交与任务状态大面积不一致

**AI 必须明确是自己的判断：**

- 用“基于本周任务、文档和 Git 记录，我判断 …”
- 不要把 `potential_links.confidence` 当成最终 verdict；那只是线索强弱
- 如果存在争议，先解释争议点，再给出 `warn` 或 `fail`

**验证结果写入 advisor：**

```yaml
verification:
  status: "pass"  # 由 AI 判断
  checked_at: "2026-04-05T20:00:00Z"
  run_id: "2026-04-05T20-00-00"
  summary: "本周 6 个 done 任务中，5 个有明确文档或提交支撑，1 个由跨天文档间接支撑。"
  concerns: []
```

如有问题，要明确写出：

```yaml
verification:
  status: "warn"
  checked_at: "2026-04-05T20:00:00Z"
  run_id: "2026-04-05T20-00-00"
  summary: "本周整体可信，但有 2 个任务证据较弱。"
  concerns:
    - "整理笔记库有提交记录，但缺少明确文档落点。"
    - "某篇显著更新文档无法稳定映射到任何 done 任务。"
  acknowledgement:
    by: "user"
    note: "其中 1 项属于临时 support 工作，未提前写入周计划。"
```

### 第 5 步：生成本周复盘

完成 AI 验证判断后，更新 `docs/dashboard/weekTasks/YYYY-MM-DD.yml`，追加 review：

```yaml
# AI-WEEK-REVIEW-START
review:
  summary: "本周完成率 60%，核心目标达成，笔记整理延后"
  completed:
    - "完成技能系统架构设计"
    - "实现 start-my-day skill"
  deferred:
    - title: "整理笔记库"
      reason: "优先级调整，本周聚焦核心开发"
      suggestion: "backlog"
  cancelled:
    - "过时的调研任务"
  energy: "medium"
  notes:
    - "周一、周二效率高，完成了主要开发"
    - "周三后会议增多，影响深度工作"
    - "发现上午 9-11 点是最高效时段"
  handoff:
    - "继续推进进行中的实现任务"
    - "下周重点：测试和文档"
# AI-WEEK-REVIEW-END
```

同时生成 `docs/dashboard/advisor/<weekId>-end.md` 详细复盘。

可选：轻量更新 `docs/dashboard/monthBacklogs/` 回收任务。

## 复盘维度

| 维度 | 了解什么 |
|------|---------|
| 关键完成 | 最有成就感或最关键的事项 |
| 遗憾/卡住 | 未完成的重要事项及原因 |
| 完成率分析 | 为什么是这个完成率 |
| 能量趋势 | 本周能量分布规律 |
| 系统问题 | 是计划问题还是执行问题 |
| 下周交接 | 哪些继续，哪些回收 |
| 洞察 | 本周的发现和教训 |

## 对话风格

✅ **应该：**
- 先呈现数据，再问感受
- 帮助用户看到模式（"周三后效率下降，是不是和会议增多有关？"）
- 区分"没完成"的不同原因（计划不合理 vs 执行问题 vs 外部因素）
- 给出回收/放弃的建议，但尊重用户决定

❌ **避免：**
- 因为完成率低而评判
- 只看数字不看背景
- 强行归类原因
- 忽视用户的能量状态解释

## 输出格式

```yaml
# AI-WEEK-REVIEW-START
review:
  summary: "一句话总结本周"
  completed: ["完成的任务列表"]
  partial:
    - title: "部分完成的任务"
      progress: "完成了 60%"
  deferred:
    - title: "推迟的任务"
      reason: "原因"
      suggestion: "nextWeek|backlog|drop"
  cancelled: ["取消的任务"]
  energy: "low|medium|high|mixed|anxious|scattered|stressed"
  notes: ["其他观察和洞察"]
  handoff: ["建议带入下周的事项"]
# AI-WEEK-REVIEW-END
```

## 相关 Skill

- `start-my-week` - 周规划，会检查本 skill 生成的验证状态
- `end-my-day` - 每日复盘，提供本周详细数据
