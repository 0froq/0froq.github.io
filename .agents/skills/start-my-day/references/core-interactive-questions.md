---
name: core-interactive-questions
description: 在生成今日计划前，主动询问用户以收集关键信息
---

# 交互式询问流程

## 流程概述

```
1. 系统初始化 → 读取所有上下文数据
2. 呈现昨日总结 → 展示完成情况与遗留
3. 呈现本周计划 → 展示高优先级任务
4. 询问用户输入 → 收集今日意图
5. 生成计划草案 → 结合 AI 建议与用户输入
6. 审核确认 → 用户批准后写入
```

## 询问问题列表

### 1. 今天必须完成的任务

```
═══════════════════════════════════════
1️⃣  今天必须完成的任务有哪些？（逗号分隔）
═══════════════════════════════════════
示例: 完成代码审查, 提交周报, 回复重要邮件
```

**目的**：识别用户心中的"必须做"任务，确保不遗漏关键事项。

### 2. 昨天遗留处理

```
═══════════════════════════════════════
2️⃣  昨天有 N 项未完成任务，今天需要继续吗？（输入序号，如: 1,3）
═══════════════════════════════════════
1. 🔴 完成代码审查 (inProgress)
2. 🟡 回复邮件 (notStarted)
3. 🟢 整理笔记 (deferred)
```

**目的**：让用户选择哪些遗留任务今天继续，哪些可以推迟或放弃。

### 3. 周计划推进

```
═══════════════════════════════════════
3️⃣  周计划中的高优先级任务，今天最希望推进哪 1-3 件？（输入序号）
═══════════════════════════════════════
1. 🔴 完成技能系统架构设计
2. 🔴 实现 start-my-day skill
3. 🟡 更新文档
4. 🟡 代码重构
5. 🟢 整理笔记库
```

**目的**：确保今天的任务与周计划保持一致，优先推进周计划中的关键任务。

### 4. 月度 Backlog 选择

```
═══════════════════════════════════════
4️⃣  从月度 Backlog 建议今天处理哪些任务？（输入序号）
═══════════════════════════════════════
1. [high] 完成技能系统重构 [截止: 2026-03-15]
2. [medium] 阅读《思考，快与慢》
3. [medium] 学习 Rust 基础
```

**目的**：从更大的任务池中选择今天可以推进的任务。

### 5. 临时约束

```
═══════════════════════════════════════
5️⃣  今天有什么临时安排、外出、会议等约束吗？
═══════════════════════════════════════
示例: 下午2-4点会议, 上午外出办事, 晚上有约会
```

**目的**：了解时间约束，合理安排任务时间和优先级。

### 6. 主观状态

```
═══════════════════════════════════════
6️⃣  当前主观状态如何？（低能量/正常/高能量/焦虑/混乱）
═══════════════════════════════════════
```

**目的**：根据用户主观感受调整任务难度和数量。

## 用户意图整合

```typescript
interface UserIntent {
  mustDoTasks: string[]           // 必须完成的任务
  carryOverSelection: string[]    // 选择的遗留任务
  weekPlanSelection: string[]     // 选择的周计划任务
  backlogSelection: string[]      // 选择的 backlog 任务
  constraints?: string            // 时间约束
  energyState?: 'low' | 'normal' | 'high' | 'anxious' | 'chaotic'
}

function mergeUserIntentWithAI(
  aiPlan: DayPlan,
  userIntent: UserIntent,
  context: Context
): DayPlan {
  const merged = { ...aiPlan }
  
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
  for (const title of userIntent.carryOverSelection) {
    const task = merged.tasks.find(t => t.title === title)
    if (task) {
      task.priority = 'high'
      task.tags = [...(task.tags || []), 'carryOver']
    }
  }
  
  // 根据用户选择的周计划任务调整
  for (const title of userIntent.weekPlanSelection) {
    const task = merged.tasks.find(t => t.title === title)
    if (task) {
      task.priority = 'high'
      task.tags = [...(task.tags || []), 'weekPlan']
    }
  }
  
  // 根据能量状态调整任务数量
  if (userIntent.energyState === 'low') {
    merged.tasks = merged.tasks.slice(0, 3) // 减少任务数
  } else if (userIntent.energyState === 'anxious' || userIntent.energyState === 'chaotic') {
    // 增加简单任务作为缓冲
    merged.tasks.push({
      title: '进行10分钟冥想',
      priority: 'medium',
      dod: '完成冥想',
      status: 'notStarted',
      tags: ['wellness', 'forIdiot']
    })
  }
  
  // 重新排序
  const priorityOrder = { mustDo: 4, high: 3, medium: 2, low: 1 }
  merged.tasks.sort((a, b) => {
    const aScore = a.tags?.includes('mustDo') ? 4 : priorityOrder[a.priority]
    const bScore = b.tags?.includes('mustDo') ? 4 : priorityOrder[b.priority]
    return bScore - aScore
  })
  
  return merged
}
```

## AI 场景下的问题生成

```typescript
function generateQuestionsForAI(
  date: string,
  context: Context,
  yesterday: YesterdayInfo | null,
  weekInfo: WeekInfo | null,
  corpusState: SynthesizedState
): string {
  const lines: string[] = [
    '🎯 请回答以下问题以帮助生成今日计划：',
    '',
  ]
  
  // 问题 1: 必须任务
  lines.push(
    '═══════════════════════════════════════',
    '1️⃣  今天必须完成的任务有哪些？（逗号分隔）',
    '═══════════════════════════════════════',
    '示例: 完成代码审查, 提交周报',
    ''
  )
  
  // 问题 2: 遗留任务（如果有）
  if (yesterday?.incompleteTasks.length) {
    lines.push(
      '═══════════════════════════════════════',
      `2️⃣  昨天有 ${yesterday.incompleteTasks.length} 项未完成任务，今天需要继续吗？`,
      '═══════════════════════════════════════'
    )
    yesterday.incompleteTasks.forEach((task, i) => {
      const emoji = task.priority === 'high' ? '🔴' : 
                   task.priority === 'medium' ? '🟡' : '🟢'
      lines.push(`${i + 1}. ${emoji} ${task.title} (${task.status})`)
    })
    lines.push('')
  }
  
  // 问题 3: 周计划推进
  if (weekInfo?.highPriorityTasks?.length) {
    lines.push(
      '═══════════════════════════════════════',
      '3️⃣  周计划中的高优先级任务，今天最希望推进哪 1-3 件？',
      '═══════════════════════════════════════'
    )
    weekInfo.highPriorityTasks.slice(0, 5).forEach((task, i) => {
      lines.push(`${i + 1}. 🔴 ${task.title}`)
    })
    lines.push('')
  }
  
  // 问题 4-6...
  
  return lines.join('\n')
}
```

## 约束整合

```typescript
function applyConstraints(
  plan: DayPlan,
  constraints: string
): DayPlan {
  // 解析约束字符串，识别时间段
  const timeBlocks = parseConstraints(constraints)
  
  // 为任务分配时间段
  plan.tasks.forEach((task, index) => {
    if (index < timeBlocks.length) {
      task.timeBlock = timeBlocks[index]
    }
  })
  
  return plan
}

function parseConstraints(constraints: string): string[] {
  // 简单实现：提取时间模式
  const timePattern = /(\d{1,2}[点:：]\d{0,2})/g
  const matches = constraints.match(timePattern) || []
  return matches
}
```
