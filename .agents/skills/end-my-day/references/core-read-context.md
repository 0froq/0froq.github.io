---
name: core-read-context
description: 读取日计划、周计划、fence、advisor 等上下文数据
---

# 上下文读取

## 读取的数据源

### 1. 日计划 (Day Todo)

```typescript
interface DayTodo {
  date: string
  weekday: string
  tasks: Task[]
  completedTasks: number
  totalTasks: number
  theme?: string
  review?: DayReview
  meta?: {
    generatedAt: string
    basedOn: string[]
  }
}

async function readDayTodo(today: string): Promise<DayTodo | null> {
  const filePath = `docs/dashboard/dayTodos/${today}.yml`
  if (!existsSync(filePath)) return null
  
  const data = readYaml(filePath) || {}
  const tasks = (data.tasks || []) as Task[]
  
  return {
    date: today,
    weekday: getWeekday(today),
    tasks,
    completedTasks: tasks.filter(t => t.status === 'done').length,
    totalTasks: tasks.length,
    theme: data.theme as string,
    review: data.review as DayTodo['review'],
    meta: data.meta as DayTodo['meta'],
  }
}
```

### 2. 周计划 (Week Plan)

```typescript
interface WeekPlan {
  weekId: string
  theme: string
  tasks: Task[]
  review?: WeekReview
}

async function readWeekPlan(weekId: string): Promise<WeekPlan | null> {
  const filePath = `docs/dashboard/weekTasks/${weekId}.yml`
  if (!existsSync(filePath)) return null
  
  const data = readYaml(filePath) || {}
  return {
    weekId,
    theme: (data.theme as string) || '本周计划',
    tasks: (data.tasks || []) as Task[],
    review: data.review as WeekPlan['review'],
  }
}
```

### 3. Fence 配置

```typescript
interface Fence {
  dailyCapacity?: number
  energyPatterns?: Record<string, unknown>
}

async function readFence(): Promise<Fence> {
  return (readYaml('docs/dashboard/hints/fence.yml') || {}) as Fence
}
```

### 4. Advisor 文件

```typescript
async function readAdvisorFiles(
  today: string, 
  weekId: string
): Promise<{ dayAdvisor?: string; weekAdvisor?: string }> {
  const result: { dayAdvisor?: string; weekAdvisor?: string } = {}
  
  const dayPath = `docs/dashboard/advisor/${today}-start.md`
  const weekPath = `docs/dashboard/advisor/${weekId}-start.md`
  
  if (existsSync(dayPath)) {
    result.dayAdvisor = readFileSync(dayPath, 'utf-8')
  }
  
  if (existsSync(weekPath)) {
    result.weekAdvisor = readFileSync(weekPath, 'utf-8')
  }
  
  return result
}
```

## 文件路径汇总

| 数据类型 | 路径 | 用途 |
|----------|------|------|
| 日计划 | `docs/dashboard/dayTodos/{today}.yml` | 今日计划与实际对比 |
| 周计划 | `docs/dashboard/weekTasks/{weekId}.yml` | 周目标对齐 |
| Fence | `docs/dashboard/hints/fence.yml` | 容量与模式配置 |
| 日启Advisor | `docs/dashboard/advisor/{today}-start.md` | 预期目标参考 |
| 周启Advisor | `docs/dashboard/advisor/{weekId}-start.md` | 周重点参考 |
