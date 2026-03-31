---
name: core-interactive-questions
description: 在生成本周复盘前，主动询问用户以收集关键信息
---

# 交互式询问流程

## 流程概述

```
1. 系统初始化 → 读取所有上下文数据
2. 呈现本周总结 → 展示完成统计与未完成任务
3. 呈现每日完成情况 → 展示7天执行趋势
4. 询问用户输入 → 收集复盘关键信息
5. 生成复盘草案 → 结合 AI 分析与用户输入
6. 审核确认 → 用户批准后写入
```

## 阶段 1: 呈现本周总结

```typescript
async function presentWeekSummary(
  weekPlan: WeekPlan,
  stats: WeekStats,
  dayTodos: DayTodo[]
): Promise<void> {
  console.log('═══════════════════════════════════════')
  console.log(`📅 本周总结 (${weekPlan.weekId})`)
  console.log(`   主题: ${weekPlan.theme || '无'}`)
  console.log('═══════════════════════════════════════')

  // 完成情况统计
  console.log(`\n✅ 完成: ${stats.completed}/${stats.totalTasks} (${stats.completionRate}%)`)
  
  if (stats.inProgress > 0) {
    console.log(`🔄 进行中: ${stats.inProgress} 项`)
  }
  if (stats.deferred > 0) {
    console.log(`⏸️  已推迟: ${stats.deferred} 项`)
  }
  if (stats.cancelled > 0) {
    console.log(`❌ 已取消: ${stats.cancelled} 项`)
  }

  // 未完成任务列表
  const unfinished = weekPlan.tasks.filter(t => 
    t.status !== 'done' && t.status !== 'cancelled'
  )
  if (unfinished.length > 0) {
    console.log('\n📋 未完成任务:')
    for (const task of unfinished) {
      const emoji = {
        notStarted: '⬜',
        inProgress: '🔄',
        deferred: '⏸️',
        blocked: '🚫'
      }[task.status] || '⬜'
      const priority = task.priority === 'high' ? '🔴' : 
                      task.priority === 'medium' ? '🟡' : '🟢'
      console.log(`   ${emoji} ${priority} ${task.title}`)
    }
  }

  console.log('\n')
}
```

## 阶段 2: 呈现每日完成情况

```typescript
function presentDayTodosSummary(dayTodos: DayTodo[]): void {
  if (dayTodos.length === 0) {
    console.log('📝 本周日计划: 未找到每日记录')
    return
  }

  console.log('📝 本周每日完成情况:')

  for (const day of dayTodos) {
    const completion = day.totalTasks > 0 
      ? Math.round((day.completedTasks / day.totalTasks) * 100)
      : 0
    const bar = '█'.repeat(Math.round(completion / 10)) + '░'.repeat(10 - Math.round(completion / 10))
    const emoji = completion >= 80 ? '✅' : completion >= 50 ? '🔄' : '⚠️'
    console.log(`   ${emoji} ${day.weekday} ${day.date} [${bar}] ${completion}%`)
  }

  // 识别高产出日
  const highOutputDays = dayTodos.filter(d => 
    d.completedTasks >= 4 && (d.completedTasks / d.totalTasks) >= 0.8
  )
  if (highOutputDays.length > 0) {
    console.log('\n🔥 高产出日:')
    highOutputDays.forEach(d => console.log(`   • ${d.weekday} (${d.completedTasks} 项完成)`))
  }

  // 识别低效日
  const lowDays = dayTodos.filter(d => 
    d.totalTasks > 0 && (d.completedTasks / d.totalTasks) < 0.5
  )
  if (lowDays.length > 0) {
    console.log('\n⚠️  需要关注的日子:')
    lowDays.forEach(d => console.log(`   • ${d.weekday} (${d.completedTasks}/${d.totalTasks} 完成)`))
  }

  console.log('')
}
```

## 阶段 3: 主动询问用户

### 问题 1: 本周最重要的完成

```typescript
function generateQuestion1(weekPlan: WeekPlan, dayTodos: DayTodo[]): string[] {
  const highlights = identifyCompletedHighlights(weekPlan, dayTodos)
  
  const lines = [
    '═══════════════════════════════════════',
    '1️⃣  本周主观上最重要的完成是什么？',
    '═══════════════════════════════════════',
    '建议回答：最有成就感或最关键的事项',
    ''
  ]
  
  if (highlights.length > 0) {
    lines.push('参考（已完成的high优先级任务）:')
    highlights.slice(0, 5).forEach(t => lines.push(`  • ${t}`))
    lines.push('')
  }
  
  return lines
}
```

### 问题 2: 本周最遗憾/最卡住的事情

```typescript
function generateQuestion2(weekPlan: WeekPlan): string[] {
  const deferredTasks = weekPlan.tasks.filter(t => 
    t.status === 'deferred' || t.status === 'blocked'
  )
  const stuckTasks = weekPlan.tasks.filter(t => 
    t.status === 'inProgress' && t.carryOverFrom
  )
  
  const lines = [
    '═══════════════════════════════════════',
    '2️⃣  本周最遗憾或最卡住的事情是什么？',
    '═══════════════════════════════════════',
    '建议回答：未完成的重要事项、遇到的阻碍、或意外中断',
    ''
  ]
  
  if (deferredTasks.length > 0) {
    lines.push('参考（被推迟/阻塞的任务）:')
    deferredTasks.forEach(t => lines.push(`  • ${t.title} (${t.status})`))
    lines.push('')
  }
  
  if (stuckTasks.length > 0) {
    lines.push('⚠️  持续多日的任务（可能遇到困难）:')
    stuckTasks.forEach(t => lines.push(`  • ${t.title}`))
    lines.push('')
  }
  
  return lines
}
```

### 问题 3: 下周仍需继续的任务

```typescript
function generateQuestion3(weekPlan: WeekPlan): string[] {
  const unfinishedTasks = weekPlan.tasks.filter(t => 
    t.status === 'notStarted' || 
    t.status === 'inProgress' || 
    t.status === 'deferred'
  )
  
  const lines = [
    '═══════════════════════════════════════',
    '3️⃣  哪些未完成任务下周仍必须继续？',
    '═══════════════════════════════════════',
    ''
  ]
  
  if (unfinishedTasks.length > 0) {
    lines.push('未完成任务列表:')
    unfinishedTasks.forEach((t, i) => {
      const emoji = t.priority === 'high' ? '🔴' : 
                    t.priority === 'medium' ? '🟡' : '🟢'
      const statusEmoji = {
        notStarted: '⬜',
        inProgress: '🔄',
        deferred: '⏸️'
      }[t.status] || '⬜'
      lines.push(`  ${i + 1}. ${statusEmoji} ${emoji} ${t.title}`)
    })
    lines.push('')
    lines.push('请输入序号（如: 1,3,5），或直接回车跳过:')
  } else {
    lines.push('✅ 本周所有任务已处理完毕')
  }
  
  lines.push('')
  return lines
}
```

### 问题 4: 任务回收/放弃决策

```typescript
function generateQuestion4(): string[] {
  return [
    '═══════════════════════════════════════',
    '4️⃣  哪些任务应回收到 monthBacklogs 或直接放弃？',
    '═══════════════════════════════════════',
    '建议格式: 任务序号-处理方式',
    '处理方式:',
    '  • nextWeek - 推迟到下周继续',
    '  • backlog  - 退回月度backlog',
    '  • drop     - 直接放弃/取消',
    '',
    '示例: 2-backlog, 3-drop',
    ''
  ]
}
```

### 问题 5: 整体状态评价

```typescript
function generateQuestion5(stats: WeekStats): string[] {
  const corpusHints = stats.completionRate >= 80 
    ? 'Corpus信号显示高产出'
    : stats.completionRate <= 40
    ? 'Corpus信号可能需要关注'
    : ''
  
  return [
    '═══════════════════════════════════════',
    '5️⃣  本周整体状态评价？',
    '═══════════════════════════════════════',
    '请选择:',
    '  • low     - 低能量，效率低下',
    '  • medium  - 正常水平',
    '  • high    - 高能量，专注高效',
    '  • mixed   - 波动较大',
    '  • intense - 高压状态',
    '',
    `参考数据: 完成率 ${stats.completionRate}%, 完成任务 ${stats.completed}/${stats.totalTasks}`,
    corpusHints,
    ''
  ]
}

function generateQuestion6(): string[] {
  return [
    '═══════════════════════════════════════',
    '6️⃣  还有什么想补充的吗？（可选）',
    '═══════════════════════════════════════',
    '例如：',
    '  • 本周学到的东西',
    '  • 下周想调整的地方',
    '  • 任何值得记录的观察',
    '',
    '直接回车跳过',
    ''
  ]
}
```

## 完整问题生成函数

```typescript
interface UserWeekReview {
  highlights: string[]              // 最重要的完成
  regrets: string[]                 // 遗憾/卡住的事情
  handoffTasks: string[]            // 下周继续的任务
  taskDisposition: Array<{          // 任务处理方式
    taskTitle: string
    action: 'nextWeek' | 'backlog' | 'drop'
  }>
  energyStatus: EnergyStatus        // 整体状态
  additionalNotes?: string          // 补充说明
}

type EnergyStatus = 'low' | 'medium' | 'high' | 'mixed' | 'intense'

function generateQuestionsForAI(
  weekId: string,
  weekPlan: WeekPlan,
  stats: WeekStats,
  dayTodos: DayTodo[],
  corpusState?: SynthesizedState
): string {
  const lines: string[] = [
    '🎯 请回答以下问题以帮助完成本周复盘：',
    '',
    `📅 本周: ${weekId} 至 ${getWeekEnd(weekId)}`,
    `📊 完成率: ${stats.completionRate}% (${stats.completed}/${stats.totalTasks})`,
    ''
  ]

  // 添加 Corpus 信号提示
  if (corpusState) {
    lines.push(
      '📊 Corpus 信号分析:',
      `   能量状态: ${corpusState.overallEnergy}`,
      `   情绪状态: ${corpusState.overallMood}`,
      `   写作强度: ${corpusState.intensity}`,
      ''
    )
    
    if (corpusState.recommendations.length > 0) {
      lines.push('   建议:')
      corpusState.recommendations.forEach(r => lines.push(`   • ${r}`))
      lines.push('')
    }
  }

  // 合并所有问题
  lines.push(
    ...generateQuestion1(weekPlan, dayTodos),
    ...generateQuestion2(weekPlan),
    ...generateQuestion3(weekPlan),
    ...generateQuestion4(),
    ...generateQuestion5(stats),
    ...generateQuestion6()
  )

  return lines.join('\n')
}

function identifyCompletedHighlights(
  weekPlan: WeekPlan, 
  dayTodos: DayTodo[]
): string[] {
  // 完成的high priority任务
  const highPriorityCompleted = weekPlan.tasks
    .filter(t => t.status === 'done' && t.priority === 'high')
    .map(t => t.title)
  
  // 从每日记录中识别完成的复杂任务
  const dayCompleted = dayTodos.flatMap(d => 
    (d.tasks || [])
      .filter(t => t.status === 'done' && t.priority === 'high')
      .map(t => t.title)
  )
  
  // 去重
  return [...new Set([...highPriorityCompleted, ...dayCompleted])]
}
```

## 答案解析

```typescript
function parseWeekReviewAnswers(
  rawInput: string,
  weekPlan: WeekPlan
): UserWeekReview {
  const lines = rawInput.split('\n').filter(l => l.trim())
  
  // 解析第3题（handoff tasks）
  const handoffLine = lines.find(l => /^[\d,\s]+$/.test(l.trim()))
  const handoffIndices = handoffLine 
    ? handoffLine.split(',').map(s => parseInt(s.trim()) - 1).filter(n => !isNaN(n))
    : []
  const unfinishedTasks = weekPlan.tasks.filter(t => 
    t.status !== 'done' && t.status !== 'cancelled'
  )
  const handoffTasks = handoffIndices
    .map(i => unfinishedTasks[i]?.title)
    .filter(Boolean) as string[]

  // 解析第4题（task disposition）
  const dispositionLine = lines.find(l => l.includes('-'))
  const taskDisposition: UserWeekReview['taskDisposition'] = []
  if (dispositionLine) {
    const parts = dispositionLine.split(',').map(s => s.trim())
    for (const part of parts) {
      const [idx, action] = part.split('-').map(s => s.trim())
      const taskIdx = parseInt(idx) - 1
      if (!isNaN(taskIdx) && unfinishedTasks[taskIdx]) {
        taskDisposition.push({
          taskTitle: unfinishedTasks[taskIdx].title,
          action: action as 'nextWeek' | 'backlog' | 'drop'
        })
      }
    }
  }

  // 解析第5题（energy status）
  const energyLine = lines.find(l => 
    ['low', 'medium', 'high', 'mixed', 'intense'].includes(l.trim().toLowerCase())
  )
  const energyStatus = (energyLine?.trim().toLowerCase() || 'medium') as EnergyStatus

  return {
    highlights: [],  // 需要单独解析
    regrets: [],     // 需要单独解析
    handoffTasks,
    taskDisposition,
    energyStatus,
    additionalNotes: lines[lines.length - 1]  // 最后一行作为补充
  }
}
```

## 用户确认流程

```typescript
async function waitForUserConfirmation(
  dryRun: boolean,
  autoApprove: boolean
): Promise<boolean> {
  if (dryRun) {
    console.log('🏃 DRY RUN 模式 - 不写入文件')
    return false
  }

  if (!autoApprove) {
    console.log('═══════════════════════════════════════')
    console.log('⏸️  等待确认')
    console.log('═══════════════════════════════════════')
    console.log('请回答以上问题以完善复盘。')
    console.log('设置 AUTO_APPROVE=true 可跳过确认直接写入。')
    console.log('使用 --dry-run 可预览而不写入文件。\n')
    return false
  }

  return true
}
```
