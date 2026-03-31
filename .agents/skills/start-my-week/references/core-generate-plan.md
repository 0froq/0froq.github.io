---
name: core-generate-plan
description: 基于所有上下文信息生成本周计划草案的核心逻辑
---

# 生成周计划草案

## 输入数据

```typescript
interface PlanInput {
  // 基础信息
  weekId: string
  weekRange: { start: Date; end: Date }
  
  // 长期/中期上下文
  context: {
    fence: FenceConfig
    yearVision: YearVision
    globalVision: GlobalVision
    monthBacklog: MonthBacklog
  }
  
  // 上周信息
  lastWeek: LastWeekInfo | null
  
  // Corpus 状态信号
  corpusState: SynthesizedState
}
```

## 输出结构

```yaml
# docs/dashboard/weekTasks/2026-03-31.yml

theme: 本周主题/主线目标

# 任务列表
tasks:
  - title: 任务标题
    priority: high           # high | medium | low
    dod: 完成定义            # Definition of Done
    status: notStarted       # done | inProgress | notStarted | deferred | deffered | cancelled | blocked
    links:                   # 相关资源
      - label: 设计文档
        url: ./docs/design.md
      - label: 外部参考
        url: https://example.com
    tags:
      - forIdiot             # 简单任务标签
      - deepWork             # 需要深度工作
      - meeting              # 涉及会议
      - creative             # 创造性工作
```

## 任务优先级算法

```typescript
function calculateTaskPriority(
  task: BacklogTask,
  context: PlanInput
): 'high' | 'medium' | 'low' {
  let score = 0
  
  // 基于月度 backlog 优先级
  if (task.priority === 'high') score += 3
  else if (task.priority === 'medium') score += 2
  else score += 1
  
  // 基于截止日期紧急程度
  if (task.deadline) {
    const daysUntilDeadline = diffInDays(new Date(task.deadline), new Date())
    if (daysUntilDeadline <= 3) score += 3
    else if (daysUntilDeadline <= 7) score += 2
    else if (daysUntilDeadline <= 14) score += 1
  }
  
  // 基于年度目标关联度
  if (task.alignsWithYearGoal) score += 2
  
  // 基于上周顺延（应优先处理）
  if (task.carryOverFrom) score += 1
  
  // 基于能量状态调整
  if (context.corpusState.overallEnergy === 'low') {
    // 低能量时，降低高难度任务优先级
    if (task.tags?.includes('deepWork')) score -= 1
  }
  
  // 映射到优先级
  if (score >= 5) return 'high'
  if (score >= 3) return 'medium'
  return 'low'
}
```

## 任务选择策略

```typescript
function selectTasksForWeek(input: PlanInput): Task[] {
  const selected: Task[] = []
  const { fence, monthBacklog, lastWeek, corpusState } = input
  
  // 1. 必须包含上周顺延的任务
  if (lastWeek) {
    const carryOver = extractCarryOverTasks(lastWeek)
    selected.push(...carryOver)
  }
  
  // 2. 从月度 backlog 选择本周任务
  const availableSlots = estimateAvailableSlots(fence, corpusState)
  const backlogTasks = monthBacklog.tasks || []
  
  // 按优先级排序
  const prioritizedBacklog = backlogTasks
    .filter(t => !selected.find(s => s.title === t.title)) // 去重
    .map(t => ({ ...t, calculatedPriority: calculateTaskPriority(t, input) }))
    .sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      return priorityOrder[b.calculatedPriority] - priorityOrder[a.calculatedPriority]
    })
  
  // 选择合适数量的任务
  const slotsToFill = Math.max(0, availableSlots - selected.length)
  const selectedFromBacklog = prioritizedBacklog.slice(0, slotsToFill)
  
  selected.push(...selectedFromBacklog.map(t => ({
    title: t.title,
    priority: t.calculatedPriority,
    dod: t.dod || t.acceptanceCriteria || '完成任务描述',
    status: 'notStarted',
    links: t.links || [],
    tags: t.tags || [],
    source: '月度 backlog'
  })))
  
  // 3. 基于能量状态调整任务类型
  if (corpusState.overallEnergy === 'low') {
    // 增加简单任务（forIdiot 标签）
    const easyTasks = generateEasyTasks(input)
    selected.push(...easyTasks.slice(0, 2))
  }
  
  return selected
}

function estimateAvailableSlots(
  fence: FenceConfig,
  state: SynthesizedState
): number {
  // 基础：每周可用工作天数
  let slots = fence.constraints?.workHours?.days?.length || 5
  
  // 根据能量状态调整
  if (state.overallEnergy === 'low') {
    slots = Math.floor(slots * 0.7) // 减少 30%
  } else if (state.overallEnergy === 'high') {
    slots = Math.ceil(slots * 1.1) // 增加 10%
  }
  
  // 根据情绪状态调整
  if (state.overallMood === 'negative') {
    slots = Math.floor(slots * 0.8)
  }
  
  return Math.max(3, slots) // 最少 3 个任务槽位
}
```

## 主题生成

```typescript
function generateTheme(input: PlanInput): string {
  const { monthBacklog, yearVision, lastWeek } = input
  
  // 优先使用月度主题
  if (monthBacklog.theme) {
    return `${monthBacklog.theme} - Week ${getWeekNumber(input.weekId)}`
  }
  
  // 其次使用年度目标主题
  if (yearVision.theme) {
    const relevantGoal = yearVision.categories?.[0]?.goals?.[0]
    if (relevantGoal) {
      return `推进: ${relevantGoal.goal}`
    }
  }
  
  // 基于上周主题延续
  if (lastWeek?.theme) {
    return `延续: ${lastWeek.theme}`
  }
  
  // 默认
  return `Week of ${input.weekId}`
}
```

## 完整 YAML 生成

```typescript
interface WeekPlan {
  theme: string
  tasks: Task[]
  meta: {
    generatedAt: string
    basedOn: string[]
    corpusState: {
      energy: string
      mood: string
    }
  }
}

function generateWeekPlanYaml(input: PlanInput): string {
  const theme = generateTheme(input)
  const tasks = selectTasksForWeek(input)
  
  const plan: WeekPlan = {
    theme,
    tasks: tasks.map(t => ({
      title: t.title,
      priority: t.priority,
      dod: t.dod,
      status: t.status,
      links: t.links?.length ? t.links : undefined,
      tags: t.tags?.length ? t.tags : undefined
    })),
    meta: {
      generatedAt: new Date().toISOString(),
      basedOn: [
        'year-vision',
        'month-backlog',
        ...(input.lastWeek ? ['last-week-review'] : []),
        ...(input.corpusState.writingFrequency > 0 ? ['corpus-signals'] : [])
      ],
      corpusState: {
        energy: input.corpusState.overallEnergy,
        mood: input.corpusState.overallMood
      }
    }
  }
  
  return stringifyYaml(plan)
}
```

## 自然语言版本

```typescript
function generateNaturalLanguageVersion(
  plan: WeekPlan,
  input: PlanInput
): string {
  const lines: string[] = [
    `# 周计划草案: ${plan.theme}`,
    '',
    `**周次**: ${input.weekId}`,
    `**生成时间**: ${new Date().toLocaleString('zh-CN')}`,
    '',
    '## 本周主题',
    '',
    plan.theme,
    '',
    '## 本周任务',
    ''
  ]
  
  // 按优先级分组
  const byPriority = {
    high: plan.tasks.filter(t => t.priority === 'high'),
    medium: plan.tasks.filter(t => t.priority === 'medium'),
    low: plan.tasks.filter(t => t.priority === 'low')
  }
  
  for (const [priority, tasks] of Object.entries(byPriority)) {
    if (tasks.length === 0) continue
    
    const priorityLabel = { high: '高优先级', medium: '中优先级', low: '低优先级' }[priority]
    lines.push(`### ${priorityLabel}`, '')
    
    for (const task of tasks) {
      lines.push(`- [ ] **${task.title}**`)
      lines.push(`  - 完成定义: ${task.dod}`)
      if (task.tags?.includes('forIdiot')) {
        lines.push(`  - 标签: 简单任务 ✓`)
      }
      if (task.carryOverFrom) {
        lines.push(`  - 备注: 从上周顺延`)
      }
      lines.push('')
    }
  }
  
  // 添加上下文洞察
  lines.push('## 上下文洞察', '')
  
  if (input.lastWeek?.review) {
    lines.push(`- 上周能量水平: ${input.lastWeek.review.energyLevel}/10`)
  }
  
  if (input.corpusState.recommendations.length > 0) {
    lines.push('- Corpus 信号建议:')
    for (const rec of input.corpusState.recommendations) {
      lines.push(`  - ${rec}`)
    }
  }
  
  lines.push('')
  lines.push('---')
  lines.push('')
  lines.push('**请审核此计划草案。如需修改，请直接编辑。确认后，我将写入 YAML 文件。**')
  
  return lines.join('\n')
}
```
