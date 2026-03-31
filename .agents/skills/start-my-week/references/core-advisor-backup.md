---
name: core-advisor-backup
description: 生成 advisor 备份文件，存储完整上下文供后续使用
---

# Advisor 备份系统

## 目的

Advisor 文件存储完整的本周上下文信息，用于：
1. 用户最终采纳方案与 AI 建议的差异记录
2. 供 `end-my-week` skill 进行周末复盘
3. 供下周 `start-my-week` 作为历史参考

## 文件路径

```typescript
const ADVISOR_PATH = (weekId: string) => 
  `docs/dashboard/advisor/${weekId}-start.md`
```

## 文件结构

```markdown
---
weekId: "2026-03-31"
generatedAt: "2026-03-31T08:00:00Z"
type: "week-start-advisor"
---

# Week Advisor: 2026-03-31

## 时间范围

- **周次**: 2026-03-31 至 2026-04-06
- **生成时间**: 2026-03-31 08:00:00

## 上下文摘要

### 约束与偏好 (fence)

- 工作时间: 09:00 - 18:00 (周一至周五)
- 高效时段: 09:00-11:00, 14:00-15:00
- 深度工作容量: 每天最多 4 小时

### 年度目标关联

当前年度主题: "建立稳定的技能输出体系"

相关目标:
- Q2: 完成技能生成平台 ✅
- Q4: 发布 3 个开源项目

### 月度 Backlog 状态

月度主题: "技能系统重构月"

可用任务池 (5 项):
1. [高优先级] 完成技能系统重构 [截止: 2026-03-15]
2. [中优先级] 阅读《思考，快与慢》
3. ...

## 上周执行分析 (2026-03-24)

### 完成情况

- 总任务: 8
- 已完成: 5 (62.5%)
- 进行中: 2
- 已推迟: 1

### 遗留任务

| 任务 | 状态 | 原因 |
|------|------|------|
| 完成技能系统架构设计 | inProgress | 复杂度超预期 |
| 整理笔记库 | deferred | 时间不足 |

### 复盘洞察

- 能量水平: 8/10 🔥
- 关键洞察: "深度工作时段集中在上午"
- 调整建议: "减少并行任务数量"

### 上周每日完成情况

| 日期 | 完成率 | 备注 |
|------|--------|------|
| 周一 | 80% | 高效 |
| 周二 | 60% | 会议较多 |
| ... | ... | ... |

### 频繁未完成任务

- "晨间冥想" - 未完成 3 次（建议重新评估可行性）

## Corpus 信号分析

### 上周产出统计

- 总条目: 6 篇
- 分布:
  - 000_autopsia: 1 篇（元认知反思）
  - 100_ingesta: 2 篇（论文/书摘）
  - 200_neoplasma: 1 篇（主观思考）
  - 300_putredo: 2 篇（项目日志）

### 状态信号

- **能量状态**: high
- **情绪状态**: positive
- **写作强度**: moderate

### 推断建议

- 上周能量较高，本周可适当增加挑战
- 保持当前工作节奏

## AI 生成的原始建议

### 建议主题

"继续推进技能系统核心实现"

### 建议任务列表

| 优先级 | 任务 | 来源 |
|--------|------|------|
| high | 完成技能系统架构设计 | 上周遗留 |
| high | 实现 week-plan 生成器 | 月度 backlog |
| medium | 阅读《思考，快与慢》第4-6章 | 月度 backlog |
| low | 整理笔记库 | 上周遗留 |

### 调整建议

- 基于高能量状态，本周可增加 1-2 个挑战性任务
- 建议安排 2-3 个简单任务（forIdiot 标签）作为缓冲

## 用户最终采纳方案

*将在用户确认后更新此部分*

### 与 AI 建议的差异

| 任务 | AI 建议 | 用户采纳 | 差异原因 |
|------|---------|----------|----------|
| ... | ... | ... | ... |

### 被推迟但仍需安排的任务

*这些任务被用户推迟，但需要在后续周次中安排*

- [ ] 任务名称（原建议优先级: high）

## 供 end-my-week 使用

### 预期本周目标

*供周末复盘时对比*

- [ ] 完成技能系统架构设计
- [ ] 实现 week-plan 生成器
- [ ] ...

### 重点关注指标

- 任务完成率目标: >= 70%
- 能量水平维持: >= 7/10
- 深度工作时间: >= 20 小时/周

### 风险预警

- 架构设计任务存在延期风险（已 inProgress 一周）
- 建议监控能量状态，避免连续高压

---
*此文件由 start-my-week 自动生成，用于完整记录本周初始上下文*
```

## 生成逻辑

```typescript
async function generateAdvisorFile(
  weekId: string,
  context: PlanInput,
  aiPlan: WeekPlan,
  userIntent?: UserIntent
): Promise<string> {
  const { start, end } = getWeekRange(weekId)
  
  const sections: string[] = [
    generateFrontmatter(weekId),
    generateHeader(weekId, start, end),
    generateContextSummary(context),
    generateLastWeekAnalysis(context.lastWeek),
    generateCorpusAnalysis(context.corpusState),
    generateAIRecommendations(aiPlan),
    generateUserAdoptionSection(userIntent),
    generateEndMyWeekSection(aiPlan)
  ]
  
  return sections.join('\n\n')
}

function generateFrontmatter(weekId: string): string {
  return `---
weekId: "${weekId}"
generatedAt: "${new Date().toISOString()}"
type: "week-start-advisor"
---`
}

function generateCorpusAnalysis(signals: SynthesizedState): string {
  const lines = [
    '## Corpus 信号分析',
    '',
    '### 状态信号',
    '',
    `- **能量状态**: ${signals.overallEnergy}`,
    `- **情绪状态**: ${signals.overallMood}`,
    `- **写作强度**: ${signals.intensity}`,
    ''
  ]
  
  if (signals.recommendations.length > 0) {
    lines.push('### 推断建议', '')
    for (const rec of signals.recommendations) {
      lines.push(`- ${rec}`)
    }
  }
  
  return lines.join('\n')
}

function generateAIRecommendations(plan: WeekPlan): string {
  const lines = [
    '## AI 生成的原始建议',
    '',
    '### 建议主题',
    '',
    plan.theme,
    '',
    '### 建议任务列表',
    '',
    '| 优先级 | 任务 |',
    '|--------|------|'
  ]
  
  for (const task of plan.tasks) {
    const priorityEmoji = { high: '🔴', medium: '🟡', low: '🟢' }[task.priority]
    lines.push(`| ${priorityEmoji} ${task.priority} | ${task.title} |`)
  }
  
  return lines.join('\n')
}

function generateEndMyWeekSection(plan: WeekPlan): string {
  const taskList = plan.tasks
    .filter(t => t.priority === 'high')
    .map(t => `- [ ] ${t.title}`)
    .join('\n')
  
  return `## 供 end-my-week 使用

### 预期本周目标

*供周末复盘时对比*

${taskList}

### 重点关注指标

- 任务完成率目标: >= 70%
- 建议记录每日能量水平（1-10）
- 记录任何阻碍任务完成的因素

---
*此文件由 start-my-week 自动生成，用于完整记录本周初始上下文*`
}
```

## 写入策略

```typescript
async function writeAdvisorFile(
  weekId: string,
  content: string
): Promise<void> {
  const filePath = ADVISOR_PATH(weekId)
  
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
  weekId: string,
  userPlan: WeekPlan,
  aiPlan: WeekPlan
): Promise<void> {
  const filePath = ADVISOR_PATH(weekId)
  
  if (!await fileExists(filePath)) {
    console.warn('Advisor 文件不存在，无法更新')
    return
  }
  
  const existing = await readFile(filePath, 'utf-8')
  
  // 计算差异
  const differences = calculatePlanDifferences(aiPlan, userPlan)
  
  // 生成用户采纳章节
  const adoptionSection = `
## 用户最终采纳方案

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
    /## 用户最终采纳方案[\s\S]*?(?=## 供 end-my-week|$)/,
    adoptionSection + '\n\n'
  )
  
  await writeFile(filePath, updated, 'utf-8')
}
```
