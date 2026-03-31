---
name: core-day-rollup
description: 遍历本周7天，聚合每日任务、主题、复盘数据
---

# 每日数据聚合

## 文件路径

```typescript
const DAY_TODO_PATH = (date: string) => 
  `docs/dashboard/dayTodos/${date}.yml`
```

## 每日文件结构

```yaml
date: "2026-03-31"
theme: 今日主题

# 任务列表
tasks:
  - title: 任务标题
    priority: high
    status: done
    
# 日复盘（可选）
review:
  completed: 3
  partial: 1
  failed: 0
  notes: 今天的特别收获
```

## 读取逻辑

```typescript
async function readDayTodos(weekId: string): Promise<DayTodo[]> {
  const dates = getWeekDates(weekId)
  const dayTodos: DayTodo[] = []

  for (const dateStr of dates) {
    const filePath = `${CONFIG.paths.dayTodos}/${dateStr}.yml`

    if (existsSync(filePath)) {
      const data = readYaml(filePath) || {}
      const tasks = (data.tasks || []) as Task[]
      dayTodos.push({
        date: dateStr,
        weekday: new Date(dateStr).toLocaleDateString('zh-CN', { weekday: 'long' }),
        theme: data.theme as string,
        tasks,
        review: data.review as DayTodo['review'],
        completedTasks: tasks.filter((t: Task) => t.status === 'done').length,
        totalTasks: tasks.length,
      })
    }
  }

  return dayTodos
}
```

## 统计计算

```typescript
function calculateWeekStats(weekPlan: WeekPlan, dayTodos: DayTodo[]): WeekStats {
  const allTasks = [...weekPlan.tasks]
  const dayTaskTitles = new Set(weekPlan.tasks.map(t => t.title))

  for (const day of dayTodos) {
    for (const task of day.tasks) {
      if (!dayTaskTitles.has(task.title)) {
        allTasks.push({ ...task, source: 'dayAdded' })
        dayTaskTitles.add(task.title)
      }
    }
  }

  const total = allTasks.length
  const completed = allTasks.filter(t => t.status === 'done').length
  const inProgress = allTasks.filter(t => t.status === 'inProgress').length
  const deferred = allTasks.filter(t => 
    t.status === 'deferred' || t.status === 'deffered'
  ).length
  const cancelled = allTasks.filter(t => t.status === 'cancelled').length
  const notStarted = allTasks.filter(t => t.status === 'notStarted').length

  return {
    totalTasks: total,
    completed,
    inProgress,
    deferred,
    cancelled,
    notStarted,
    completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
  }
}
```

## 重复未完成任务识别

```typescript
function identifyRecurringUncompleted(
  dayTodos: DayTodo[]
): Array<{ title: string; count: number }> {
  const uncompletedMap = new Map<string, number>()

  for (const day of dayTodos) {
    for (const task of day.tasks) {
      if (task.status !== 'done' && task.carryOverFrom) {
        uncompletedMap.set(
          task.title, 
          (uncompletedMap.get(task.title) || 0) + 1
        )
      }
    }
  }

  return Array.from(uncompletedMap.entries())
    .filter(([_, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .map(([title, count]) => ({ title, count }))
}
```
