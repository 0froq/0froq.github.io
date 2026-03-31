---
name: core-advisor-backup
description: 生成完整上下文的 advisor 文件
---

# Advisor 备份

## Advisor 文件用途

- 记录完整的复盘上下文
- 为明日计划提供参考
- 留存历史记录供长期分析

## 文件结构

```typescript
function generateAdvisorContent(
  today: string,
  dayTodo: DayTodo | null,
  weekPlan: WeekPlan | null,
  dayReview: DayTodo,
  corpusState: SynthesizedState,
): string {
  const completedCount = dayReview.review?.completed.length || 0
  const plannedCount = dayTodo?.totalTasks || 0
  const completionRate = plannedCount > 0 
    ? Math.round((completedCount / plannedCount) * 100) 
    : 0

  return `---
date: "${today}"
generatedAt: "${new Date().toISOString()}"
type: "day-end-advisor"
weekId: "${getWeekId(new Date(today))}"
---

# Day Advisor: ${today}

## 时间信息

- **日期**: ${today} (${getWeekday(today)})
- **生成时间**: ${new Date().toLocaleString('zh-CN')}
- **所属周**: ${weekPlan?.weekId || getWeekId(new Date(today))}

## 执行情况摘要

### 完成统计

- **计划任务**: ${plannedCount} 项
- **实际完成**: ${completedCount} 项
- **完成率**: ${completionRate}%
- **延期任务**: ${deferredTasks.length} 项
- **取消任务**: ${cancelledTasks.length} 项

### 能量状态

能量: ${dayReview.review?.energy || 'medium'}
Corpus: ${corpusState.overallEnergy} / ${corpusState.overallMood}

## 任务详情

| 任务 | 优先级 | 状态 |
|------|--------|------|
${taskTable}

## 复盘摘要

${dayReview.review?.summary || '无'}

## 明日建议

### 优先处理（延期到明天）

${deferredTasks.filter(d => d.suggestion === 'tomorrow')
  .map(d => `- [ ] ${d.title}`).join('\n')}

### 本周剩余

${deferredTasks.filter(d => d.suggestion === 'thisWeek')
  .map(d => `- [ ] ${d.title}`).join('\n')}

---
*此文件由 end-my-day 自动生成*
`
}
```

## 输出示例

```markdown
---
date: "2026-03-31"
generatedAt: "2026-03-31T22:30:00Z"
type: "day-end-advisor"
weekId: "2026-03-31"
---

# Day Advisor: 2026-03-31

## 时间信息

- **日期**: 2026-03-31 (星期二)
- **生成时间**: 2026/3/31 22:30:00
- **所属周**: 2026-03-31

## 执行情况摘要

### 完成统计

- **计划任务**: 5 项
- **实际完成**: 3 项
- **完成率**: 60%
- **延期任务**: 1 项
- **取消任务**: 1 项

### 能量状态

⚡ high

## 明日建议

### 优先处理

- [ ] 技能系统设计 (延期自今日)

### 本周剩余

- [ ] 整理笔记库

---
*此文件由 end-my-day 自动生成*
```

## 文件路径

```
docs/dashboard/advisor/
├── {YYYY-MM-DD}-start.md    # 日启 advisor (由 start-my-day 生成)
├── {YYYY-MM-DD}-end.md      # 日复盘 advisor (由 end-my-day 生成)
└── {weekId}-start.md        # 周启 advisor
```
