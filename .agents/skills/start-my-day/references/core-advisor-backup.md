---
name: core-advisor-backup
description: 生成 advisor 备份文件，存储完整上下文供 end-my-day 复盘使用
---

# Advisor 备份系统

## 目的

Advisor 文件存储完整的当日上下文信息，用于：
1. 用户最终采纳方案与 AI 建议的差异记录
2. 供 `end-my-day` skill 进行每日复盘
3. 供明日 `start-my-day` 作为历史参考
4. 跨天任务追踪和模式识别

## 文件路径

```typescript
const ADVISOR_PATH = (date: string) => 
  `docs/dashboard/advisor/${date}-start.md`
```

## 文件结构

```markdown
---
date: "2026-03-31"
weekId: "2026-03-31"
generatedAt: "2026-03-31T08:00:00Z"
type: "day-start-advisor"
---

# Day Advisor: 2026-03-31 (周二)

## 时间信息

- **日期**: 2026-03-31
- **星期**: 周二
- **所属周**: 2026-03-31 至 2026-04-06
- **生成时间**: 2026-03-31 08:00:00

## 昨日执行分析 (2026-03-30)

### 完成情况

- 总任务: 6
- 已完成: 4 (66.7%)
- 进行中: 1
- 已推迟: 1

### 遗留任务

| 任务 | 状态 | 原因 |
|------|------|------|
| 完成技能系统架构设计 | inProgress | 复杂度超预期 |
| 整理笔记库 | deferred | 时间不足 |

### 昨日能量与状态

- 能量水平: 8/10 🔥
- 情绪状态: positive
- 关键洞察: "上午效率最高，下午容易分心"

## 本周计划上下文

### 本周主题

"技能系统重构月 - Week 03-31"

### 本周高优先级任务

| 优先级 | 任务 | 状态 |
|--------|------|------|
| 🔴 high | 完成技能系统架构设计 | inProgress |
| 🔴 high | 实现 start-my-day skill | notStarted |
| 🟡 medium | 阅读《思考，快与慢》 | notStarted |

### 本周进度概览

- 总任务: 8
- 已完成: 2 (25%)
- 剩余: 6

## 月度 Backlog 状态

月度主题: "技能系统重构月"

可用任务池 (剩余 5 项):
1. [高优先级] 完成技能系统重构 [截止: 2026-03-15]
2. [中优先级] 阅读《思考，快与慢》
3. ...

## Corpus 信号分析

### 最近2-3天产出统计

- 总条目: 4 篇
- 分布:
  - 000_autopsia: 1 篇（元认知反思）
  - 300_putredo: 2 篇（项目日志）
  - 100_ingesta: 1 篇（书摘）

### 状态信号

- **能量状态**: high
- **情绪状态**: positive
- **写作强度**: moderate
- **睡眠评分**: 85

### 推断建议

- 能量状态良好，可适当承担挑战性任务
- 保持当前工作节奏
- 注意昨日遗留任务可能带来的压力

## 用户意图捕获

### 今日必须完成的任务

用户明确指定:
1. 完成代码审查
2. 推进技能系统架构设计

### 临时约束

- 下午 14:00-15:00 有团队会议
- 晚上有家庭聚餐（18:30 后不可用）

### 主观状态

- 能量水平: 高
- 情绪: 积极，期待
- 特殊说明: "希望今天能完成架构设计的核心部分"

## AI 生成的原始建议

### 建议主题

"继续推进技能系统核心实现 - 周二"

### 建议任务列表

| 优先级 | 任务 | 来源 | 预估时长 |
|--------|------|------|----------|
| high | 完成技能系统架构设计 | 昨日遗留 | 4h |
| high | 实现 start-my-day index.ts | 周计划 | 3h |
| medium | 完成代码审查 | 用户指定 | 1h |
| low | 整理昨日笔记 | 维护任务 | 30min |

### 时间安排建议

- 09:00-11:00: 架构设计（深度工作时段）
- 11:00-12:00: 代码审查
- 14:00-15:00: 团队会议（固定）
- 15:00-18:00: index.ts 实现

### 调整建议

- 基于高能量状态，今日可安排 4-5 个任务
- 建议包含 1-2 个简单任务作为缓冲
- 注意控制深度工作总时长不超过 5 小时

## 用户最终采纳方案

*将在用户确认后更新此部分*

### 与 AI 建议的差异

| 任务 | AI 建议 | 用户采纳 | 差异原因 |
|------|---------|----------|----------|
| ... | ... | ... | ... |

### 被推迟但仍需安排的任务

*这些任务被用户推迟，但需要在后续日期中安排*

- [ ] 任务名称（原建议优先级: high）

## 供 end-my-day 使用

### 预期今日目标

*供今晚复盘时对比*

- [ ] 完成技能系统架构设计
- [ ] 实现 start-my-day index.ts
- [ ] 完成代码审查
- [ ] 整理昨日笔记

### 重点关注指标

- 任务完成率目标: >= 70%
- 能量水平维持: >= 7/10
- 深度工作时间: >= 4 小时
- 遗留任务处理: >= 50%

### 风险预警

- 架构设计任务已 inProgress 两天，需关注进度
- 下午会议可能打断深度工作状态
- 建议预留缓冲时间应对突发情况

---
*此文件由 start-my-day 自动生成，用于完整记录今日初始上下文*
```

## 生成逻辑

```typescript
async function generateAdvisorFile(
  date: string,
  context: PlanInput,
  aiPlan: DayPlan,
  userIntent?: UserIntent
): Promise<string> {
  const weekId = getWeekId(new Date(date))
  
  const sections: string[] = [
    generateFrontmatter(date, weekId),
    generateHeader(date),
    generateYesterdayAnalysis(context.yesterday),
    generateWeekContext(context.weekPlan),
    generateMonthContext(context.monthBacklog),
    generateCorpusAnalysis(context.corpusState),
    generateUserIntentSection(userIntent),
    generateAIRecommendations(aiPlan),
    generateUserAdoptionSection(),
    generateEndMyDaySection(aiPlan)
  ]
  
  return sections.join('\n\n')
}

function generateFrontmatter(date: string, weekId: string): string {
  return `---
date: "${date}"
weekId: "${weekId}"
generatedAt: "${new Date().toISOString()}"
type: "day-start-advisor"
---`
}

function generateHeader(date: string): string {
  const weekday = getWeekdayName(date)
  const weekId = getWeekId(new Date(date))
  const weekEnd = getWeekEnd(weekId)
  
  return `# Day Advisor: ${date} (${weekday})

## 时间信息

- **日期**: ${date}
- **星期**: ${weekday}
- **所属周**: ${weekId} 至 ${weekEnd}
- **生成时间**: ${new Date().toLocaleString('zh-CN')}`
}

function generateYesterdayAnalysis(yesterday: YesterdayInfo | null): string {
  if (!yesterday) {
    return `## 昨日执行分析

*无昨日数据（可能是周一或新用户）*`
  }
  
  const total = yesterday.tasks.length
  const completed = yesterday.tasks.filter(t => t.status === 'done').length
  const inProgress = yesterday.tasks.filter(t => t.status === 'inProgress').length
  const deferred = yesterday.tasks.filter(t => t.status === 'deferred').length
  
  const incompleteTasks = yesterday.tasks.filter(t => t.status !== 'done')
  
  let incompleteTable = ''
  if (incompleteTasks.length > 0) {
    incompleteTable = '\n\n### 遗留任务\n\n| 任务 | 状态 | 原因 |\n|------|------|------|\n'
    incompleteTable += incompleteTasks.map(t => 
      `| ${t.title} | ${t.status} | ${t.notes || '-'} |`
    ).join('\n')
  }
  
  return `## 昨日执行分析 (${yesterday.date})

### 完成情况

- 总任务: ${total}
- 已完成: ${completed} (${((completed/total)*100).toFixed(1)}%)
- 进行中: ${inProgress}
- 已推迟: ${deferred}${incompleteTable}

### 昨日能量与状态

- 能量水平: ${yesterday.energyLevel || '-'}/10
- 情绪状态: ${yesterday.mood || '-'}
- 关键洞察: "${yesterday.keyInsight || '无记录'}"`
}

function generateWeekContext(weekInfo: WeekInfo | null): string {
  if (!weekInfo) {
    return `## 本周计划上下文

*未找到本周计划（请先运行 start-my-week）*`
  }
  
  const tasks = weekInfo.tasks || []
  const completed = tasks.filter(t => t.status === 'done').length
  
  const highPriorityTasks = tasks.filter(t => t.priority === 'high')
  const taskTable = highPriorityTasks.map(t => {
    const emoji = { high: '🔴', medium: '🟡', low: '🟢' }[t.priority]
    return `| ${emoji} ${t.priority} | ${t.title} | ${t.status} |`
  }).join('\n')
  
  return `## 本周计划上下文

### 本周主题

"${weekInfo.theme}"

### 本周高优先级任务

| 优先级 | 任务 | 状态 |
|--------|------|------|
${taskTable}

### 本周进度概览

- 总任务: ${tasks.length}
- 已完成: ${completed} (${((completed/tasks.length)*100).toFixed(0)}%)
- 剩余: ${tasks.length - completed}`
}

function generateCorpusAnalysis(signals: SynthesizedState): string {
  const lines = [
    '## Corpus 信号分析',
    '',
    '### 最近2-3天产出统计',
    '',
    `- 总条目: ${signals.entries.length} 篇`,
    '- 分布:'
  ]
  
  // 按类别统计
  const byCategory: Record<string, number> = {}
  for (const entry of signals.entries) {
    byCategory[entry.category] = (byCategory[entry.category] || 0) + 1
  }
  
  for (const [cat, count] of Object.entries(byCategory)) {
    lines.push(`  - ${cat}: ${count} 篇`)
  }
  
  lines.push(
    '',
    '### 状态信号',
    '',
    `- **能量状态**: ${signals.overallEnergy}`,
    `- **情绪状态**: ${signals.overallMood}`,
    `- **写作强度**: ${signals.intensity}`,
    ''
  )
  
  if (signals.recommendations.length > 0) {
    lines.push('### 推断建议', '')
    for (const rec of signals.recommendations) {
      lines.push(`- ${rec}`)
    }
  }
  
  return lines.join('\n')
}

function generateUserIntentSection(intent?: UserIntent): string {
  if (!intent) {
    return `## 用户意图捕获

*未捕获用户意图（可能是非交互模式）*`
  }
  
  const mustDoList = intent.mustDoTasks?.map(t => `- ${t}`).join('\n') || '- 无'
  const constraints = intent.constraints || '- 无特殊约束'
  
  return `## 用户意图捕获

### 今日必须完成的任务

用户明确指定:
${mustDoList}

### 临时约束

${constraints}

### 主观状态

- 能量水平: ${intent.energyLevel || '未指定'}
- 情绪: ${intent.mood || '未指定'}
- 特殊说明: "${intent.notes || '无'}"`
}

function generateAIRecommendations(plan: DayPlan): string {
  const lines = [
    '## AI 生成的原始建议',
    '',
    '### 建议主题',
    '',
    plan.theme,
    '',
    '### 建议任务列表',
    '',
    '| 优先级 | 任务 | 来源 |',
    '|--------|------|------|'
  ]
  
  for (const task of plan.tasks) {
    const priorityEmoji = { high: '🔴', medium: '🟡', low: '🟢' }[task.priority]
    const source = task.carryOverFrom ? '昨日遗留' : '今日生成'
    lines.push(`| ${priorityEmoji} ${task.priority} | ${task.title} | ${source} |`)
  }
  
  return lines.join('\n')
}

function generateEndMyDaySection(plan: DayPlan): string {
  const taskList = plan.tasks
    .map(t => `- [ ] ${t.title}`)
    .join('\n')
  
  return `## 供 end-my-day 使用

### 预期今日目标

*供今晚复盘时对比*

${taskList}

### 重点关注指标

- 任务完成率目标: >= 70%
- 能量水平维持: >= 7/10
- 深度工作时间: >= 4 小时
- 遗留任务处理: >= 50%

### 风险预警

- 关注高优先级任务的实际进度
- 记录任何打断深度工作的因素
- 注意能量水平波动

---
*此文件由 start-my-day 自动生成，用于完整记录今日初始上下文*`
}
```

## 写入策略

```typescript
async function writeAdvisorFile(
  date: string,
  content: string
): Promise<void> {
  const filePath = ADVISOR_PATH(date)
  
  // 确保目录存在
  await ensureDir(dirname(filePath))
  
  // 直接写入（不需要非破坏性更新，因为这是完整上下文快照）
  await writeFile(filePath, content, 'utf-8')
  
  console.log(`📄 Advisor 文件已生成: ${filePath}`)
}
```

## 更新策略

当用户在审核后修改了计划，应更新 advisor 文件：

```typescript
async function updateAdvisorWithUserAdoption(
  date: string,
  userPlan: DayPlan,
  aiPlan: DayPlan
): Promise<void> {
  const filePath = ADVISOR_PATH(date)
  
  if (!await fileExists(filePath)) {
    console.warn('Advisor 文件不存在，无法更新')
    return
  }
  
  const existing = await readFile(filePath, 'utf-8')
  
  // 计算差异
  const differences = calculatePlanDifferences(aiPlan, userPlan)
  
  // 生成用户采纳章节
  const adoptionSection = `## 用户最终采纳方案

*更新于: ${new Date().toISOString()}*

### 与 AI 建议的差异

| 任务 | AI 建议 | 用户采纳 | 差异原因 |
|------|---------|----------|----------|
${differences.map(d => `| ${d.task} | ${d.aiSuggestion} | ${d.userChoice} | ${d.reason} |`).join('\n')}

### 被推迟但仍需安排的任务

${differences
  .filter(d => d.outcome === 'postponed')
  .map(d => `- [ ] ${d.task}（原建议优先级: ${d.aiPriority}）`)
  .join('\n')}
`
  
  // 替换或追加到文件
  const updated = existing.replace(
    /## 用户最终采纳方案[\s\S]*?(?=## 供 end-my-day|$)/,
    adoptionSection + '\n\n'
  )
  
  await writeFile(filePath, updated, 'utf-8')
}
```
