---
name: core-day-review
description: 生成日复盘的结构和内容
---

# 日复盘生成

## Review 字段结构

```typescript
interface DayReview {
  summary: string                    // 复盘摘要
  completed: string[]               // 已完成任务标题
  deferred: Array<{                 // 延期任务
    title: string
    reason: string
    suggestion: 'tomorrow' | 'thisWeek' | 'backlog' | 'drop'
  }>
  cancelled: string[]               // 取消任务
  energy: EnergyStatus              // 能量状态
  notes: string[]                   // 其他说明
}

type EnergyStatus = 'low' | 'medium' | 'high' | 'mixed' | 'anxious' | 'scattered' | 'stressed'
```

## 生成逻辑

```typescript
function generateDayReview(
  today: string,
  dayTodo: DayTodo | null,
  answers: InteractiveAnswers,
): DayTodo {
  // 更新任务状态
  const updatedTasks = dayTodo 
    ? updateTaskStatuses(dayTodo.tasks, answers)
    : []
  
  const completedTasks = updatedTasks.filter(t => t.status === 'done')
  const deferredTasksList = answers.deferredTasks
  const cancelledTasks = updatedTasks.filter(t => t.status === 'cancelled')

  // 生成摘要
  const summary = completedTasks.length > 0
    ? `今日完成 ${completedTasks.length} 项任务${deferredTasksList.length > 0 ? `，${deferredTasksList.length} 项延期` : ''}`
    : '今日未有明确完成记录'

  return {
    date: today,
    weekday: getWeekday(today),
    tasks: updatedTasks,
    completedTasks: completedTasks.length,
    totalTasks: updatedTasks.length,
    theme: dayTodo?.theme,
    review: {
      summary,
      completed: completedTasks.map(t => t.title),
      deferred: deferredTasksList,
      cancelled: cancelledTasks.map(t => t.title),
      energy: answers.energyStatus,
      notes: [
        ...(answers.newTasks.length > 0 ? [`临时新增: ${answers.newTasks.join(', ')}`] : []),
      ],
    },
    meta: {
      generatedAt: new Date().toISOString(),
      basedOn: ['day-todo', 'interactive-answers'],
    },
  }
}
```

## YAML 输出格式

```yaml
review:
  summary: "今日完成 3 项任务，1 项延期"
  completed:
    - "完成代码审查"
    - "撰写文档更新"
    - "回复邮件"
  deferred:
    - title: "技能系统设计"
      reason: "需要更多时间思考架构"
      suggestion: tomorrow
  cancelled:
    - "整理笔记库"
  energy: high
  notes:
    - "临时新增: 紧急修复生产问题"
```

## 能量状态说明

| 状态 | 含义 | 建议 |
|------|------|------|
| low | 低能量，效率低下 | 考虑减少明日任务量 |
| medium | 正常水平 | 保持当前节奏 |
| high | 高能量，专注高效 | 可适当增加挑战性任务 |
| mixed | 波动较大 | 记录能量波动规律 |
| anxious | 焦虑/压力大 | 需要调整或休息 |
| scattered | 注意力分散 | 检查干扰源 |
| stressed | 高压状态 | 必须减压 |
