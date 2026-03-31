---
name: core-interactive-questions
description: 在生成本周计划前，主动询问用户以收集关键信息
---

# 交互式询问流程

## 流程概述

```
1. 系统初始化 → 读取所有上下文数据
2. 呈现上周总结 → 展示完成情况与遗留
3. 询问用户输入 → 收集本周意图
4. 生成计划草案 → 结合 AI 建议与用户输入
5. 审核确认 → 用户批准后写入
```

## 阶段 1: 呈现上周总结

```typescript
async function presentLastWeekSummary(lastWeek: LastWeekInfo | null): Promise<void> {
  if (!lastWeek) {
    console.log('📅 上周数据: 未找到上周记录，可能是新开始')
    return
  }
  
  console.log('═══════════════════════════════════════')
  console.log(`📅 上周总结 (${lastWeek.weekId})`)
  console.log('═══════════════════════════════════════')
  
  // 完成情况统计
  const completion = calculateCompletion(lastWeek.tasks || [])
  console.log(`\n✅ 完成情况: ${completion.done}/${completion.total} 完成`)
  
  if (completion.inProgress > 0) {
    console.log(`🔄 进行中: ${completion.inProgress} 项`)
  }
  if (completion.deferred > 0) {
    console.log(`⏸️  已推迟: ${completion.deferred} 项`)
  }
  
  // 遗留任务
  const carryOver = extractCarryOverTasks(lastWeek)
  if (carryOver.length > 0) {
    console.log('\n📋 上周遗留任务:')
    for (const task of carryOver) {
      const statusIcon = {
        notStarted: '⬜',
        inProgress: '🔄',
        deferred: '⏸️',
        blocked: '🚫'
      }[task.status] || '⬜'
      
      console.log(`   ${statusIcon} ${task.title}`)
      if (task.reason) {
        console.log(`      └─ 原因: ${task.reason}`)
      }
    }
  }
  
  // 复盘洞察
  if (lastWeek.review) {
    console.log('\n💡 上周复盘洞察:')
    if (lastWeek.review.energyLevel) {
      const energyEmoji = lastWeek.review.energyLevel >= 7 ? '🔥' : 
                         lastWeek.review.energyLevel >= 4 ? '⚡' : '😴'
      console.log(`   ${energyEmoji} 能量水平: ${lastWeek.review.energyLevel}/10`)
    }
    if (lastWeek.review.insights?.length) {
      for (const insight of lastWeek.review.insights) {
        console.log(`   💭 ${insight}`)
      }
    }
  }
  
  console.log('\n')
}
```

## 阶段 2: 读取上周每日计划

```typescript
async function readLastWeekDayTodos(weekId: string): Promise<DayTodo[]> {
  const { start, end } = getWeekRange(weekId)
  const lastWeekId = getLastWeekId(weekId)
  const { start: lastWeekStart, end: lastWeekEnd } = getWeekRange(lastWeekId)
  
  const dayTodos: DayTodo[] = []
  const current = new Date(lastWeekStart)
  
  while (current <= lastWeekEnd) {
    const dateStr = format(current, 'yyyy-MM-dd')
    const filePath = `docs/dashboard/dayTodos/${dateStr}.yml`
    
    if (await fileExists(filePath)) {
      const content = await readYaml(filePath)
      dayTodos.push({
        date: dateStr,
        weekday: format(current, 'EEEE', { locale: zhCN }),
        tasks: content.tasks || [],
        notes: content.notes || '',
        completedTasks: (content.tasks || []).filter((t: any) => t.status === 'done').length,
        totalTasks: (content.tasks || []).length
      })
    }
    
    current.setDate(current.getDate() + 1)
  }
  
  return dayTodos
}

function presentDayTodosSummary(dayTodos: DayTodo[]): void {
  if (dayTodos.length === 0) {
    console.log('📝 上周日计划: 未找到每日记录')
    return
  }
  
  console.log('📝 上周每日完成情况:')
  
  for (const day of dayTodos) {
    const completion = day.totalTasks > 0 
      ? Math.round((day.completedTasks / day.totalTasks) * 100)
      : 0
    const bar = '█'.repeat(Math.round(completion / 10)) + '░'.repeat(10 - Math.round(completion / 10))
    console.log(`   ${day.weekday} ${day.date} [${bar}] ${completion}%`)
  }
  
  // 识别未完成频率高的任务
  const uncompletedTasks = new Map<string, number>()
  for (const day of dayTodos) {
    for (const task of day.tasks) {
      if (task.status !== 'done' && task.carryOver) {
        uncompletedTasks.set(task.title, (uncompletedTasks.get(task.title) || 0) + 1)
      }
    }
  }
  
  const recurringUncompleted = Array.from(uncompletedTasks.entries())
    .filter(([_, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
  
  if (recurringUncompleted.length > 0) {
    console.log('\n⚠️  频繁未完成的任务（可能需要重新评估）:')
    for (const [task, count] of recurringUncompleted.slice(0, 3)) {
      console.log(`   • "${task}" - 未完成 ${count} 次`)
    }
  }
  
  console.log('')
}
```

## 阶段 3: 主动询问用户

```typescript
interface UserIntent {
  theme?: string              // 本周主题
  mustDoTasks: string[]       // 必须完成的任务
  carryOverSuggestions: string[] // 建议处理的遗留
  fromBacklog: string[]       // 从 backlog 选择的任务
  additionalContext?: string  // 额外上下文
}

async function askUserIntent(
  context: PlanInput,
  carryOverTasks: Task[],
  backlogSuggestions: BacklogTask[]
): Promise<UserIntent> {
  const intent: UserIntent = {
    mustDoTasks: [],
    carryOverSuggestions: [],
    fromBacklog: []
  }
  
  console.log('═══════════════════════════════════════')
  console.log('🎯 本周规划询问')
  console.log('═══════════════════════════════════════')
  console.log('请回答以下问题（直接回车跳过）:\n')
  
  // 问题 1: 本周主题
  console.log('1️⃣  本周主题/主线目标是什么？')
  console.log(`   建议: ${context.monthBacklog.theme || '基于年度目标'}
   > `)
  // 在实际实现中，这里需要等待用户输入
  // intent.theme = await readLine()
  
  // 问题 2: 必须完成的任务
  console.log('\n2️⃣  本周必须完成的任务有哪些？（逗号分隔）')
  console.log('   示例: 完成技能系统重构, 提交论文初稿')
  console.log('   > ')
  // intent.mustDoTasks = (await readLine()).split(',').map(s => s.trim()).filter(Boolean)
  
  // 问题 3: 上周遗留处理建议
  if (carryOverTasks.length > 0) {
    console.log(`\n3️⃣  上周有 ${carryOverTasks.length} 项遗留任务，建议处理哪些？（输入序号，如: 1,3）`)
    for (let i = 0; i < carryOverTasks.length; i++) {
      const task = carryOverTasks[i]
      const priority = task.priority === 'high' ? '🔴' : 
                      task.priority === 'medium' ? '🟡' : '🟢'
      console.log(`   ${i + 1}. ${priority} ${task.title} (${task.status})`)
    }
    console.log('   > ')
    // const selected = (await readLine()).split(',').map(s => parseInt(s.trim()) - 1).filter(n => !isNaN(n))
    // intent.carryOverSuggestions = selected.map(i => carryOverTasks[i]?.title).filter(Boolean)
  }
  
  // 问题 4: 从月度 Backlog 选择
  if (backlogSuggestions.length > 0) {
    console.log(`\n4️⃣  从月度 Backlog 建议选择哪些任务？（输入序号）`)
    console.log('   已根据截止日期和优先级排序')
    for (let i = 0; i < Math.min(backlogSuggestions.length, 5); i++) {
      const task = backlogSuggestions[i]
      const deadline = task.deadline ? ` [截止: ${task.deadline}]` : ''
      console.log(`   ${i + 1}. [${task.calculatedPriority}] ${task.title}${deadline}`)
    }
    console.log('   > ')
    // const selected = (await readLine()).split(',').map(s => parseInt(s.trim()) - 1).filter(n => !isNaN(n))
    // intent.fromBacklog = selected.map(i => backlogSuggestions[i]?.title).filter(Boolean)
  }
  
  // 问题 5: 额外上下文
  console.log('\n5️⃣  本周有什么特殊情况需要注意吗？（假期、会议、出差等）')
  console.log('   > ')
  // intent.additionalContext = await readLine()
  
  console.log('\n')
  return intent
}

// 在 AI 交互场景下的替代方案
function generateQuestionsForAI(context: PlanInput): string {
  const lines: string[] = [
    '基于以上上下文，请回答以下问题以帮助生成本周计划：',
    '',
    '## 本周规划确认',
    '',
    '### 1. 本周主题',
    `当前建议主题: "${context.monthBacklog.theme || '基于年度目标'}"`,
    '是否需要调整？请提供本周主线目标：',
    '',
    '### 2. 必须完成的任务',
    '列出本周必须完成的核心任务（将优先安排）：',
    '- ',
    '- ',
    '',
    '### 3. 上周遗留处理',
  ]
  
  if (context.lastWeek) {
    const carryOver = extractCarryOverTasks(context.lastWeek)
    if (carryOver.length > 0) {
      lines.push('上周遗留任务，请选择需要本周处理的（打勾）：')
      for (const task of carryOver) {
        lines.push(`- [ ] ${task.title} (${task.status})`)
      }
    } else {
      lines.push('上周无遗留任务 ✓')
    }
  } else {
    lines.push('无上周数据')
  }
  
  lines.push('', '### 4. 月度 Backlog 选择')
  lines.push('从以下月度任务中，选择本周要处理的（打勾）：')
  
  const suggestions = getBacklogSuggestions(context.monthBacklog, 5)
  for (const task of suggestions) {
    const deadline = task.deadline ? ` [${task.deadline}]` : ''
    lines.push(`- [ ] ${task.title}${deadline}`)
  }
  
  lines.push(
    '',
    '### 5. 特殊情况',
    '本周是否有特殊情况（假期、重要会议、出差等）？',
    ''
  )
  
  return lines.join('\n')
}
```

## 阶段 4: 整合用户意图

```typescript
function mergeUserIntentWithAI(
  aiPlan: WeekPlan,
  userIntent: UserIntent,
  context: PlanInput
): WeekPlan {
  const merged = { ...aiPlan }
  
  // 使用用户指定的主题
  if (userIntent.theme) {
    merged.theme = userIntent.theme
  }
  
  // 标记 must-do 任务
  if (userIntent.mustDoTasks.length > 0) {
    for (const mustDo of userIntent.mustDoTasks) {
      const existingTask = merged.tasks.find(t => 
        t.title.toLowerCase().includes(mustDo.toLowerCase())
      )
      
      if (existingTask) {
        existingTask.priority = 'high'
        existingTask.tags = [...(existingTask.tags || []), 'mustDo']
      } else {
        // 添加新任务
        merged.tasks.unshift({
          title: mustDo,
          priority: 'high',
          dod: '完成任务',
          status: 'notStarted',
          tags: ['mustDo', 'userAdded']
        })
      }
    }
  }
  
  // 根据用户选择的遗留任务调整
  for (const suggestion of userIntent.carryOverSuggestions) {
    const task = merged.tasks.find(t => t.title === suggestion)
    if (task) {
      task.priority = 'high'
      task.tags = [...(task.tags || []), 'carryOver']
    }
  }
  
  // 根据用户选择的 backlog 任务调整
  for (const backlogTitle of userIntent.fromBacklog) {
    const task = merged.tasks.find(t => t.title === backlogTitle)
    if (task) {
      task.priority = 'high'
    }
  }
  
  // 重新排序：mustDo > high > medium > low
  const priorityOrder = { mustDo: 4, high: 3, medium: 2, low: 1 }
  merged.tasks.sort((a, b) => {
    const aScore = a.tags?.includes('mustDo') ? 4 : priorityOrder[a.priority]
    const bScore = b.tags?.includes('mustDo') ? 4 : priorityOrder[b.priority]
    return bScore - aScore
  })
  
  return merged
}
```

## 完整流程

```typescript
async function interactivePlanningWorkflow(): Promise<void> {
  // 1. 初始化
  const weekId = getCurrentWeekId()
  console.log(`🚀 启动周计划生成: ${weekId}\n`)
  
  // 2. 读取上下文
  const context = await readContext(weekId)
  
  // 3. 读取并展示上周数据
  const lastWeek = await readLastWeek(weekId)
  await presentLastWeekSummary(lastWeek)
  
  // 4. 读取并展示上周每日计划
  const dayTodos = await readLastWeekDayTodos(weekId)
  presentDayTodosSummary(dayTodos)
  
  // 5. 读取 corpus 信号
  const weekRange = getWeekRange(weekId)
  const corpusSignals = await readRecentCorpus(weekRange)
  const corpusState = synthesizeSignals(corpusSignals)
  
  if (corpusState.recommendations.length > 0) {
    console.log('📊 Corpus 信号分析:')
    for (const rec of corpusState.recommendations) {
      console.log(`   • ${rec}`)
    }
    console.log('')
  }
  
  // 6. 准备询问数据
  const carryOverTasks = lastWeek ? extractCarryOverTasks(lastWeek) : []
  const backlogSuggestions = getPrioritizedBacklog(context.monthBacklog)
  
  // 7. 询问用户（在 AI 场景下生成问题）
  const questions = generateQuestionsForAI({
    ...context,
    lastWeek,
    corpusState
  })
  
  console.log(questions)
  
  // 注意：在非交互式环境中，这里暂停等待用户输入
  // 在 Claude/AI 场景中，这里会输出问题并等待下一轮对话
}
```
