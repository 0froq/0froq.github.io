---
name: core-week-review
description: 生成本周复盘数据结构的逻辑
---

# 周复盘生成

## 复盘数据结构

```typescript
interface WeekReview {
  summary: string           // 整体复盘摘要
  completed: string[]       // 完成的关键任务
  deferred: DeferredTask[]  // 延后任务详情
  cancelled: string[]       // 被取消的任务
  energy: 'low' | 'medium' | 'high' | 'mixed' | 'intense'
  notes: string             // 附加说明
  handoff: string[]         // 建议带入下周的事项
}

interface DeferredTask {
  title: string
  reason: string
  suggestion: 'nextWeek' | 'backlog' | 'drop'
}

interface WeekStats {
  totalTasks: number
  completed: number
  inProgress: number
  deferred: number
  cancelled: number
  notStarted: number
  completionRate: number  // 百分比
}
```

## 生成逻辑

```typescript
function generateWeekReview(
  weekPlan: WeekPlan,
  stats: WeekStats,
  dayTodos: DayTodo[],
  userInput: UserWeekReview,
  corpusState?: SynthesizedState
): WeekReview {
  // 基于用户输入和统计数据生成摘要
  const summary = buildSummary(stats, userInput, corpusState)

  // 识别完成的任务（合并周计划和每日记录）
  const completed = identifyCompletedTasks(weekPlan, dayTodos)

  // 构建延后任务列表
  const deferred = buildDeferredTasks(weekPlan, userInput)

  // 识别取消的任务
  const cancelled = weekPlan.tasks
    .filter(t => t.status === 'cancelled' || 
      userInput.taskDisposition.some(d => d.taskTitle === t.title && d.action === 'drop')
    )
    .map(t => t.title)

  // 识别需要交接的任务
  const handoff = buildHandoffList(weekPlan, userInput)

  // 确定能量状态
  const energy = determineEnergyStatus(stats, userInput, corpusState)

  // 构建备注
  const notes = buildNotes(stats, userInput, corpusState)

  return {
    summary,
    completed,
    deferred,
    cancelled,
    energy,
    notes,
    handoff
  }
}
```

## 摘要构建

```typescript
function buildSummary(
  stats: WeekStats,
  userInput: UserWeekReview,
  corpusState?: SynthesizedState
): string {
  const parts: string[] = []

  // 完成率
  parts.push(`本周完成率 ${stats.completionRate}%。`)

  // 任务统计
  const taskStats = []
  if (stats.completed > 0) taskStats.push(`${stats.completed} 项完成`)
  if (stats.deferred > 0) taskStats.push(`${stats.deferred} 项推迟`)
  if (stats.cancelled > 0) taskStats.push(`${stats.cancelled} 项取消`)
  
  if (taskStats.length > 0) {
    parts.push(taskStats.join('，') + '。')
  }

  // 高亮成就
  if (userInput.highlights.length > 0) {
    parts.push(`核心完成: ${userInput.highlights[0]}。`)
  }

  // 遗憾/阻碍
  if (userInput.regrets.length > 0) {
    parts.push(`主要挑战: ${userInput.regrets[0]}。`)
  }

  // Corpus 信号补充
  if (corpusState?.intensity === 'heavy') {
    parts.push('本周产出强度较高。')
  } else if (corpusState?.intensity === 'light') {
    parts.push('本周记录较少，可能处于恢复期。')
  }

  return parts.join('')
}
```

## 任务识别

```typescript
function identifyCompletedTasks(
  weekPlan: WeekPlan,
  dayTodos: DayTodo[]
): string[] {
  // 从周计划获取已完成的任务
  const weekCompleted = weekPlan.tasks
    .filter(t => t.status === 'done')
    .map(t => t.title)

  // 从每日记录获取完成的任务（可能是临时添加的）
  const dayCompleted = dayTodos.flatMap(d => 
    (d.tasks || [])
      .filter(t => t.status === 'done')
      .map(t => t.title)
  )

  // 合并并去重
  const allCompleted = [...new Set([...weekCompleted, ...dayCompleted])]
  
  // 按优先级排序（high priority 在前）
  const priorityMap = new Map<string, number>()
  
  weekPlan.tasks.forEach(t => {
    if (t.status === 'done') {
      const score = t.priority === 'high' ? 3 : t.priority === 'medium' ? 2 : 1
      priorityMap.set(t.title, score)
    }
  })

  return allCompleted.sort((a, b) => 
    (priorityMap.get(b) || 0) - (priorityMap.get(a) || 0)
  )
}

function buildDeferredTasks(
  weekPlan: WeekPlan,
  userInput: UserWeekReview
): DeferredTask[] {
  const deferred: DeferredTask[] = []

  // 1. 已被标记为 deferred 的任务
  const planDeferred = weekPlan.tasks
    .filter(t => t.status === 'deferred' || t.status === 'blocked')
    .map(t => ({
      title: t.title,
      reason: t.reason || '状态顺延',
      suggestion: 'nextWeek' as const
    }))
  
  deferred.push(...planDeferred)

  // 2. 用户明确指定要推迟的任务
  const userDeferred = userInput.taskDisposition
    .filter(d => d.action === 'nextWeek')
    .map(d => ({
      title: d.taskTitle,
      reason: '用户选择推迟到下周',
      suggestion: 'nextWeek' as const
    }))
  
  // 合并去重
  const seen = new Set(deferred.map(d => d.title))
  for (const d of userDeferred) {
    if (!seen.has(d.title)) {
      deferred.push(d)
      seen.add(d.title)
    }
  }

  return deferred
}

function buildHandoffList(
  weekPlan: WeekPlan,
  userInput: UserWeekReview
): string[] {
  const handoff = new Set<string>()

  // 1. 用户明确选择的交接任务
  userInput.handoffTasks.forEach(t => handoff.add(t))

  // 2. 未完成的 high priority 任务（自动建议）
  weekPlan.tasks
    .filter(t => 
      t.priority === 'high' && 
      t.status !== 'done' && 
      t.status !== 'cancelled'
    )
    .forEach(t => handoff.add(t.title))

  // 3. 进行中的任务
  weekPlan.tasks
    .filter(t => t.status === 'inProgress')
    .forEach(t => handoff.add(t.title))

  return Array.from(handoff)
}
```

## 能量状态推断

```typescript
function determineEnergyStatus(
  stats: WeekStats,
  userInput: UserWeekReview,
  corpusState?: SynthesizedState
): WeekReview['energy'] {
  // 优先使用用户输入
  if (userInput.energyStatus) {
    return userInput.energyStatus
  }

  // 基于统计数据推断
  if (stats.completionRate >= 80) return 'high'
  if (stats.completionRate <= 40) return 'low'
  if (stats.inProgress > stats.completed) return 'mixed'
  
  // 参考 Corpus 信号
  if (corpusState) {
    if (corpusState.overallEnergy === 'high' && stats.completionRate >= 60) {
      return 'high'
    }
    if (corpusState.overallEnergy === 'low' && stats.completionRate <= 50) {
      return 'low'
    }
  }

  return 'medium'
}

// 能量状态说明
const ENERGY_DESCRIPTIONS: Record<WeekReview['energy'], string> = {
  low: '低能量周，建议下周减少任务量',
  medium: '正常能量水平，保持稳定节奏',
  high: '高能量周，完成率优秀',
  mixed: '能量波动较大，注意识别影响因素',
  intense: '高压状态，需要适当减压'
}
```

## 备注构建

```typescript
function buildNotes(
  stats: WeekStats,
  userInput: UserWeekReview,
  corpusState?: SynthesizedState
): string {
  const notes: string[] = []

  // 任务量评价
  if (stats.totalTasks > 15) {
    notes.push('本周任务量较大')
  } else if (stats.totalTasks < 5) {
    notes.push('本周任务量较少')
  } else {
    notes.push('本周任务量适中')
  }

  // 完成率评价
  if (stats.completionRate >= 80) {
    notes.push('完成率优秀')
  } else if (stats.completionRate >= 60) {
    notes.push('完成率良好')
  } else if (stats.completionRate >= 40) {
    notes.push('完成率一般')
  } else {
    notes.push('完成率偏低，建议评估原因')
  }

  // 推迟任务警示
  if (stats.deferred > 2) {
    notes.push('推迟任务较多，建议重新评估优先级')
  }

  // 用户补充
  if (userInput.additionalNotes) {
    notes.push(userInput.additionalNotes)
  }

  return notes.join('；')
}
```

## YAML 生成

```typescript
const CONFIG = {
  markers: {
    weekReviewStart: '# AI-WEEK-REVIEW-START',
    weekReviewEnd: '# AI-WEEK-REVIEW-END'
  }
}

function createWeekReviewYaml(review: WeekReview): string {
  const indent = (s: string, n: number) => ' '.repeat(n) + s

  // 延后任务
  const deferredYaml = review.deferred.length > 0
    ? review.deferred.map(d => [
        `  - title: ${d.title}`,
        indent(`reason: ${d.reason}`, 4),
        indent(`suggestion: ${d.suggestion}`, 4)
      ].join('\n')).join('\n')
    : '  []'

  // 列表项
  const listYaml = (items: string[]) => 
    items.length > 0 
      ? items.map(item => `  - ${item}`).join('\n')
      : '  []'

  const completedYaml = listYaml(review.completed)
  const cancelledYaml = listYaml(review.cancelled)
  const handoffYaml = listYaml(review.handoff)

  return `${CONFIG.markers.weekReviewStart}

review:
  summary: ${review.summary}
  completed:
${completedYaml}
  deferred:
${deferredYaml}
  cancelled:
${cancelledYaml}
  energy: ${review.energy}
  notes: ${review.notes}
  handoff:
${handoffYaml}

${CONFIG.markers.weekReviewEnd}`
}
```

## 使用示例

```typescript
// 完整使用流程
const weekId = getCurrentWeekId()
const weekPlan = await readWeekPlan(weekId)
const dayTodos = await readDayTodos(weekId)
const stats = calculateWeekStats(weekPlan, dayTodos)

// 收集用户输入
const userInput: UserWeekReview = {
  highlights: ['完成技能系统设计'],
  regrets: ['被会议打断较多'],
  handoffTasks: ['实现week-review生成器'],
  taskDisposition: [
    { taskTitle: '整理笔记库', action: 'backlog' },
    { taskTitle: '旧任务', action: 'drop' }
  ],
  energyStatus: 'medium',
  additionalNotes: '下周需要更专注的时段'
}

// 生成复盘
const review = generateWeekReview(weekPlan, stats, dayTodos, userInput)
const reviewYaml = createWeekReviewYaml(review)

console.log(reviewYaml)
```

## 输出示例

```yaml
# AI-WEEK-REVIEW-START

review:
  summary: 本周完成率 60%。6 项任务完成，1 项推迟，1 项取消。核心完成: 完成技能系统设计。
  completed:
    - 完成技能系统设计
    - 设计周计划生成算法
    - 撰写文档更新
    - 代码审查
  deferred:
    - title: 整理笔记库
      reason: 时间不足
      suggestion: backlog
  cancelled:
    - 过时的旧任务
  energy: medium
  notes: 本周任务量适中；完成率良好
  handoff:
    - 实现week-review生成器
    - 集成corpus信号分析

# AI-WEEK-REVIEW-END
```
