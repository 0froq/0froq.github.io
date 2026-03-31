---
name: core-interactive-questions
description: 交互式询问流程和问题生成
---

# 交互式询问

## 问题列表

### 1. 实际完成情况

```
═══════════════════════════════════════
1️⃣  今天实际完成了哪些任务？（输入序号或任务名，逗号分隔）
═══════════════════════════════════════
示例: 1,3,5 或 完成代码审查,提交PR
```

### 2. 未完成原因

```
═══════════════════════════════════════
2️⃣  哪些计划内任务没有完成？（输入序号或任务名）
═══════════════════════════════════════
请说明未完成的原因...
```

### 3. 临时新增

```
═══════════════════════════════════════
3️⃣  有没有临时新增任务或突发事件？
═══════════════════════════════════════
如果有，请描述任务内容和处理情况...
```

### 4. 状态评价

```
═══════════════════════════════════════
4️⃣  今天状态评价？
═══════════════════════════════════════
- low: 低能量，效率低下
- medium: 正常水平
- high: 高能量，专注高效
- mixed: 波动较大
- anxious: 焦虑/压力大
- scattered: 注意力分散
- stressed: 高压状态
```

### 5. 延期建议

```
═══════════════════════════════════════
5️⃣  未完成任务的处理建议？
═══════════════════════════════════════
对于每个未完成任务，建议：
- tomorrow: 推迟到明天
- thisWeek: 推迟到本周其他时间
- backlog: 退回backlog
- drop: 放弃/取消
```

## 问题生成实现

```typescript
function generateQuestionsForAI(
  today: string,
  dayTodo: DayTodo | null,
  weekPlan: WeekPlan | null,
  corpusState: SynthesizedState,
): string {
  const lines: string[] = [
    '🌙 请回答以下问题以帮助生成今日复盘：',
    '',
    `📅 今日日期: ${today} (${getWeekday(today)})`,
    '',
  ]

  // 显示今日任务概览
  if (dayTodo) {
    lines.push(
      `📋 今日计划任务: ${dayTodo.totalTasks} 项`,
      `✅ 已完成: ${dayTodo.completedTasks}`,
      `⏳ 待完成: ${dayTodo.totalTasks - dayTodo.completedTasks}`,
      '',
    )
    
    // 列出所有任务
    if (dayTodo.tasks.length > 0) {
      lines.push(
        '═══════════════════════════════════════',
        '今日任务列表：',
        '═══════════════════════════════════════',
      )
      dayTodo.tasks.forEach((task, i) => {
        const emoji = task.status === 'done' ? '✅' : 
                      task.status === 'inProgress' ? '🔄' : 
                      task.status === 'blocked' ? '🚫' : '⏳'
        const prio = task.priority === 'high' ? '🔴' : 
                     task.priority === 'medium' ? '🟡' : '🟢'
        lines.push(`${i + 1}. ${emoji} ${prio} ${task.title}`)
      })
      lines.push('')
    }
  }

  // 显示本周上下文
  if (weekPlan) {
    lines.push(
      '═══════════════════════════════════════',
      `📅 本周主题: ${weekPlan.theme}`,
      '═══════════════════════════════════════',
      '',
    )
  }

  // 生成5个问题
  lines.push(
    '═══════════════════════════════════════',
    '1️⃣  今天实际完成了哪些任务？（输入序号或任务名，逗号分隔）',
    '═══════════════════════════════════════',
    '示例: 1,3,5 或 完成代码审查,提交PR',
    '',
    // ... 其他问题
  )

  return lines.join('\n')
}
```

## 答案解析

```typescript
interface InteractiveAnswers {
  completedTasks: string[]           // 实际完成的任务
  incompleteTasks: string[]          // 未完成的任务
  newTasks: string[]                 // 临时新增任务
  energyStatus: EnergyStatus         // 能量状态
  deferredTasks: Array<{
    title: string
    reason: string
    suggestion: 'tomorrow' | 'thisWeek' | 'backlog' | 'drop'
  }>
}

function parseInteractiveAnswers(
  dayTodo: DayTodo | null,
  rawInput: string,
): InteractiveAnswers {
  // 解析用户输入...
  return {
    completedTasks: [],
    incompleteTasks: [],
    newTasks: [],
    energyStatus: 'medium',
    deferredTasks: [],
  }
}
```
