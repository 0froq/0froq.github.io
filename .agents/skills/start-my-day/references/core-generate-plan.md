---
name: core-generate-plan
description: 基于所有上下文信息生成今日计划草案的核心逻辑
---

# 生成日计划草案

## 输入数据

```typescript
interface PlanInput {
  // 基础信息
  date: string
  weekday: string
  weekId: string
  
  // 长期/中期上下文
  context: {
    fence: FenceConfig
    yearVision: YearVision
    globalVision: GlobalVision
    monthBacklog: MonthBacklog
    weekPlan: WeekInfo | null
  }
  
  // 昨日信息
  yesterday: YesterdayInfo | null
  
  // Corpus 状态信号
  corpusState: SynthesizedState
}
```

## 输出结构

```yaml
# docs/dashboard/dayTodos/2026-03-31.yml

date: "2026-03-31"
weekday: "周二"
theme: "技能系统重构月 - Week 03-31 - 周二"

# 任务列表
tasks:
  - title: 完成代码审查
    priority: high
    dod: 完成所有 PR 审查并提交反馈
    status: notStarted
    carryOverFrom: "2026-03-30"
    links:
      - label: PR 列表
        url: https://github.com/pulls
    tags:
      - mustDo
      
  - title: 实现 start-my-day skill
    priority: high
    dod: 完成 index.ts 和 references
    status: notStarted
    tags:
      - deepWork
      - weekPlan

meta:
  generatedAt: "2026-03-31T08:00:00Z"
  basedOn: ["week-plan", "yesterday-todo", "month-backlog"]
  weekId: "2026-03-31"
  corpusState:
    energy: "high"
    mood: "neutral"
```

## 任务来源优先级

```typescript
function generateDayPlan(
  date: string,
  context: Context,
  yesterday: YesterdayInfo | null,
  weekInfo: WeekInfo | null,
  corpusState: SynthesizedState
): DayPlan {
  const tasks: DayTask[] = []
  
  // 1. 从昨天顺延未完成的任务（最多3个）
  if (yesterday) {
    const carryOver = extractCarryOverTasks(yesterday)
      .sort((a, b) => priorityWeight(b) - priorityWeight(a))
    tasks.push(...carryOver.slice(0, 3))
  }
  
  // 2. 从周计划的高优先级任务中选择（最多3个）
  if (weekInfo?.highPriorityTasks) {
    const weekHighPrio = weekInfo.highPriorityTasks
      .filter(t => !tasks.find(existing => existing.title === t.title))
      .slice(0, 3)
    
    tasks.push(...weekHighPrio.map(t => ({
      ...t,
      source: 'week-plan',
    })))
  }
  
  // 3. 从月度 backlog 补充（最多2个）
  const backlogTasks = context.monthBacklog.tasks || []
  const taskSet = new Set(tasks.map(t => t.title))
  
  const prioritized = backlogTasks
    .filter(t => !taskSet.has(t.title))
    .map(t => ({ 
      ...t, 
      calculatedPriority: calculateTaskPriority(t) 
    }))
    .sort((a, b) => {
      const order = { high: 3, medium: 2, low: 1 }
      return order[b.calculatedPriority] - order[a.calculatedPriority]
    })
    .slice(0, 2)
  
  tasks.push(...prioritized.map(t => ({
    title: t.title,
    priority: t.calculatedPriority,
    dod: t.dod || t.acceptanceCriteria || '完成任务',
    status: 'notStarted' as const,
    links: t.links || [],
    tags: t.tags || [],
    source: 'month-backlog',
  })))
  
  // 生成主题
  const weekTheme = weekInfo?.theme || context.monthBacklog.theme || '今日计划'
  const theme = `${weekTheme} - ${getWeekdayName(date)}`
  
  return {
    date,
    weekday: getWeekdayName(date),
    theme,
    tasks,
    meta: {
      generatedAt: new Date().toISOString(),
      basedOn: [
        'week-plan',
        ...(yesterday ? ['yesterday-todo'] : []),
        'month-backlog',
      ],
      weekId: getWeekId(new Date(date)),
      corpusState: {
        energy: corpusState.overallEnergy,
        mood: corpusState.overallMood,
      },
    },
  }
}
```

## 任务优先级算法

```typescript
function calculateTaskPriority(
  task: BacklogTask
): 'high' | 'medium' | 'low' {
  let score = 0
  
  // 基于月度 backlog 优先级
  if (task.priority === 'high') score += 3
  else if (task.priority === 'medium') score += 2
  else score += 1
  
  // 基于截止日期紧急程度
  if (task.deadline) {
    const daysUntil = Math.ceil(
      (new Date(task.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    )
    if (daysUntil <= 1) score += 5      // 今天截止
    else if (daysUntil <= 3) score += 3 // 3天内
    else if (daysUntil <= 7) score += 2 // 本周内
    else if (daysUntil <= 14) score += 1
  }
  
  // 映射到优先级
  if (score >= 5) return 'high'
  if (score >= 3) return 'medium'
  return 'low'
}

function priorityWeight(task: Task): number {
  const weights = {
    high: 3,
    medium: 2,
    low: 1
  }
  
  let weight = weights[task.priority]
  
  // inProgress 任务优先
  if (task.status === 'inProgress') weight += 2
  // blocked 任务优先级降低
  if (task.status === 'blocked') weight -= 1
  
  return weight
}
```

## 主题生成

```typescript
function generateTheme(input: PlanInput): string {
  const { weekInfo, context, date } = input
  
  // 优先使用周计划主题
  if (weekInfo?.theme) {
    return `${weekInfo.theme} - ${getWeekdayName(date)}`
  }
  
  // 其次使用月度主题
  if (context.monthBacklog.theme) {
    return `${context.monthBacklog.theme} - ${getWeekdayName(date)}`
  }
  
  // 默认
  return `${date} (${getWeekdayName(date)}) 计划`
}
```

## 任务数量控制

```typescript
function estimateDayCapacity(
  fence: FenceConfig,
  corpusState: SynthesizedState,
  constraints?: string
): number {
  // 基础：每天可用任务数
  let capacity = 5
  
  // 根据能量状态调整
  if (corpusState.overallEnergy === 'low') {
    capacity = 3
  } else if (corpusState.overallEnergy === 'high') {
    capacity = 7
  }
  
  // 根据情绪状态调整
  if (corpusState.overallMood === 'negative') {
    capacity = Math.max(3, capacity - 1)
  }
  
  // 根据约束调整
  if (constraints) {
    // 检测会议/外出数量
    const constraintCount = (constraints.match(/会议|外出|约会/g) || []).length
    capacity = Math.max(2, capacity - constraintCount)
  }
  
  return capacity
}
```

## 任务多样性

```typescript
function ensureTaskDiversity(tasks: DayTask[]): DayTask[] {
  const result = [...tasks]
  
  // 确保有至少 1 个简单任务（forIdiot）
  const hasEasyTask = result.some(t => t.tags?.includes('forIdiot'))
  if (!hasEasyTask && result.length >= 4) {
    result.push({
      title: '整理工作区',
      priority: 'low',
      dod: '清理桌面，整理文件',
      status: 'notStarted',
      tags: ['forIdiot', 'maintenance']
    })
  }
  
  // 确保不过多高难度任务
  const deepWorkCount = result.filter(t => 
    t.tags?.includes('deepWork')
  ).length
  if (deepWorkCount > 3) {
    // 将部分 deepWork 降级
    let downgraded = 0
    for (const task of result) {
      if (task.tags?.includes('deepWork') && downgraded < deepWorkCount - 3) {
        task.tags = task.tags.filter(t => t !== 'deepWork')
        downgraded++
      }
    }
  }
  
  return result
}
```
