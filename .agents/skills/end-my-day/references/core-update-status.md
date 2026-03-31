---
name: core-update-status
description: 更新任务状态的逻辑和规则
---

# 任务状态更新

## 状态流转

```
notStarted/inProgress/blocked
        ↓
    [用户确认完成]
        ↓
      done
        
    [用户确认延期]
        ↓
   deferred
        
    [用户确认取消]
        ↓
  cancelled
```

## 状态定义

| 状态 | 含义 | 场景 |
|------|------|------|
| done | 已完成 | 任务实际完成 |
| inProgress | 进行中 | 部分完成，明日继续 |
| notStarted | 未开始 | 完全未动 |
| deferred | 已延期 | 推迟到未来 |
| blocked | 阻塞中 | 有阻碍无法继续 |
| cancelled | 已取消 | 放弃执行 |

## 状态更新逻辑

```typescript
function updateTaskStatuses(
  tasks: Task[],
  answers: InteractiveAnswers,
): Task[] {
  return tasks.map((task) => {
    // 检查是否标记为完成
    const isCompleted = answers.completedTasks.some(
      ct => ct === task.title || task.title.includes(ct)
    )
    
    // 检查是否标记为延期
    const isDeferred = answers.deferredTasks.some(
      dt => dt.title === task.title || task.title.includes(dt.title)
    )
    
    // 检查是否标记为取消（未完成且未延期）
    const isCancelled = answers.incompleteTasks.some(
      it => it === task.title || task.title.includes(it)
    ) && !isDeferred

    // 更新状态
    if (isCompleted) {
      return { ...task, status: 'done' as const }
    }
    if (isCancelled) {
      return { ...task, status: 'cancelled' as const }
    }
    if (isDeferred) {
      const deferredInfo = answers.deferredTasks.find(
        dt => dt.title === task.title || task.title.includes(dt.title)
      )
      return { 
        ...task, 
        status: 'deferred' as const,
        reason: deferredInfo?.reason,
      }
    }
    
    // 保持原状态
    return task
  })
}
```

## 延期建议处理

```typescript
interface DeferredTask {
  title: string
  reason: string
  suggestion: 'tomorrow' | 'thisWeek' | 'backlog' | 'drop'
}

// 延期建议影响
const suggestionImpact: Record<string, string> = {
  tomorrow: '自动加入明日计划',
  thisWeek: '留在周计划中稍后处理',
  backlog: '退回月度 backlog',
  drop: '彻底放弃，不再追踪',
}
```

## 状态统计

```typescript
function calculateStats(tasks: Task[]) {
  return {
    completed: tasks.filter(t => t.status === 'done').length,
    inProgress: tasks.filter(t => t.status === 'inProgress').length,
    deferred: tasks.filter(t => t.status === 'deferred' || t.status === 'deffered').length,
    cancelled: tasks.filter(t => t.status === 'cancelled').length,
    blocked: tasks.filter(t => t.status === 'blocked').length,
    notStarted: tasks.filter(t => t.status === 'notStarted').length,
  }
}
```
