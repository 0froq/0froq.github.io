---
name: core-yesterday-analysis
description: 读取并分析昨日日计划，识别遗留任务和执行情况
---

# 昨日计划分析

## 目的

1. 识别昨天未完成的任务（顺延到今天）
2. 分析昨日完成情况，评估执行效率
3. 识别频繁未完成的模式

## 文件路径

```typescript
const YESTERDAY_PATH = (date: string) => 
  `docs/dashboard/dayTodos/${getYesterdayDate(date)}.yml`
```

## 数据结构

```typescript
interface YesterdayInfo {
  date: string                    // 昨天日期 YYYY-MM-DD
  theme?: string                  // 昨日主题
  tasks: DayTask[]               // 昨日任务列表
  completedTasks: number         // 已完成任务数
  totalTasks: number             // 总任务数
  completionRate: number         // 完成率百分比
  incompleteTasks: Task[]        // 未完成任务列表
}

interface DayTask {
  title: string
  priority: 'high' | 'medium' | 'low'
  dod: string
  status: 'done' | 'inProgress' | 'notStarted' | 'deferred' | 'blocked'
  links?: { label: string; url: string }[]
  tags?: string[]
  timeBlock?: string           // 时间段（可选）
  energyLevel?: 'high' | 'medium' | 'low'  // 能量水平（可选）
}
```

## 读取逻辑

```typescript
async function readYesterday(date: string): Promise<YesterdayInfo | null> {
  const yesterdayDate = getYesterdayDate(date)
  const filePath = `${CONFIG.paths.dayTodos}/${yesterdayDate}.yml`

  if (!existsSync(filePath)) return null

  const data = readYaml(filePath) || {}
  const tasks = (data.tasks || []) as DayTask[]
  const completedTasks = tasks.filter(t => t.status === 'done').length
  const totalTasks = tasks.length

  return {
    date: yesterdayDate,
    theme: data.theme as string,
    tasks,
    completedTasks,
    totalTasks,
    completionRate: totalTasks > 0 
      ? Math.round((completedTasks / totalTasks) * 100) 
      : 0,
    incompleteTasks: tasks.filter(t => 
      ['notStarted', 'inProgress', 'deferred', 'deffered', 'blocked']
        .includes(t.status)
    ),
  }
}
```

## 遗留任务提取

```typescript
function extractCarryOverTasks(yesterday: YesterdayInfo): DayTask[] {
  return yesterday.incompleteTasks.map(task => ({
    ...task,
    carryOverFrom: yesterday.date,
    reason: task.reason || '从昨天顺延',
  }))
}
```

## 分析维度

### 1. 完成率分析

```typescript
function analyzeCompletion(yesterday: YesterdayInfo): string {
  const rate = yesterday.completionRate
  
  if (rate >= 80) return '优秀 ✅'
  if (rate >= 60) return '良好 👍'
  if (rate >= 40) return '一般 ⚠️'
  return '需改进 ❌'
}
```

### 2. 任务状态分布

```typescript
function getStatusDistribution(tasks: DayTask[]): Record<string, number> {
  return tasks.reduce((acc, task) => {
    acc[task.status] = (acc[task.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)
}
```

### 3. 优先级完成情况

```typescript
function getPriorityStats(tasks: DayTask[]) {
  const highPrio = tasks.filter(t => t.priority === 'high')
  const highDone = highPrio.filter(t => t.status === 'done').length
  
  return {
    highTotal: highPrio.length,
    highCompleted: highDone,
    highRate: highPrio.length > 0 
      ? Math.round((highDone / highPrio.length) * 100) 
      : 0
  }
}
```

## 展示格式

```
═══════════════════════════════════════
📅 昨日总结 (2026-03-30)
═══════════════════════════════════════
✅ 完成情况: 5/8 (62%)
⏸️  未完成: 3 项

📋 遗留任务:
   • 完成代码审查 (inProgress)
   • 回复邮件 (notStarted)
   • 整理笔记 (deferred)
```

## 顺延策略

1. **最多顺延 3 个任务** - 避免今天负担过重
2. **优先级排序** - 优先顺延高优先级任务
3. **状态考量** - `inProgress` 任务优先顺延
4. **自动标记** - 添加 `carryOverFrom: yesterday` 标记
