#!/usr/bin/env node
/**
 * start-my-week Skill
 * 
 * 在周初自动生成周计划草案，基于 dashboard 中的长期目标、月度 backlog、
 * 上周复盘及 corpus 状态信号。
 * 
 * 使用方法:
 *   npx tsx index.ts              # 标准模式（需用户确认）
 *   npx tsx index.ts --dry-run    # 干跑模式（不写入文件）
 *   AUTO_APPROVE=true npx tsx index.ts  # 自动确认模式
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'
import { simpleGit } from 'simple-git'
import YAML from 'yaml'
import { readLatestEnd, hasAcknowledgement, readIssues } from './lib/state.ts'

const CONFIG = {
  paths: {
    dashboard: 'docs/dashboard',
    corpus: 'docs/corpus',
    weekTasks: 'docs/dashboard/weekTasks',
    advisor: 'docs/dashboard/advisor',
    dayTodos: 'docs/dashboard/dayTodos',
    hints: 'docs/dashboard/hints',
    visions: 'docs/dashboard/visions',
    monthBacklogs: 'docs/dashboard/monthBacklogs',
  },
  markers: {
    start: '# AI-WEEK-PLAN-START',
    end: '# AI-WEEK-PLAN-END',
  },
  git: {
    commitPrefix: 'docs(dashboard):',
    remote: 'origin',
  },
}

interface Task {
  title: string
  priority: 'high' | 'medium' | 'low'
  dod: string
  status: 'done' | 'inProgress' | 'notStarted' | 'deferred' | 'cancelled' | 'blocked'
  links?: { label: string; url: string }[]
  tags?: string[]
  carryOverFrom?: string
  reason?: string
}

interface WeekPlan {
  theme: string
  tasks: Task[]
  meta?: {
    generatedAt: string
    basedOn: string[]
    corpusState?: {
      energy: string
      mood: string
    }
  }
}

interface LastWeekInfo {
  weekId: string
  theme?: string
  goals?: string[]
  tasks: Task[]
  review?: {
    energyLevel?: number
    mood?: 'positive' | 'neutral' | 'negative' | 'mixed'
    insights?: string[]
    adjustments?: string[]
  }
  hasReview: boolean
}

interface Context {
  fence: Record<string, unknown>
  yearVision: Record<string, unknown>
  globalVision: Record<string, unknown>
  monthBacklog: {
    theme?: string
    tasks?: Array<MonthBacklogTask>
  }
}

interface MonthBacklogTask {
  title: string
  priority?: string
  deadline?: string
  dod?: string
  acceptanceCriteria?: string
  tags?: string[]
  links?: { label: string; url: string }[]
}

interface SynthesizedState {
  overallEnergy: 'high' | 'neutral' | 'low'
  overallMood: 'positive' | 'neutral' | 'negative' | 'mixed'
  intensity: 'light' | 'moderate' | 'heavy'
  recommendations: string[]
  writingFrequency: number
}

interface GitResult {
  success: boolean
  commitHash?: string
  pushed: boolean
  error?: { type: string; message: string }
}

interface DayTodo {
  date: string
  weekday: string
  tasks: Array<Record<string, unknown>>
  completedTasks: number
  totalTasks: number
}

function readYaml(filePath: string): Record<string, unknown> | null {
  if (!existsSync(filePath)) return null
  try {
    const content = readFileSync(filePath, 'utf-8')
    return (YAML.parse(content) || {}) as Record<string, unknown>
  }
  catch {
    return {}
  }
}

function writeYaml(filePath: string, data: unknown): void {
  const dir = dirname(filePath)
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
  }
  writeFileSync(filePath, YAML.stringify(data, { indent: 2 }), 'utf-8')
}

function ensureDir(dir: string): void {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
  }
}

function getCurrentWeekId(date: Date = new Date()): string {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(d.setDate(diff))
  return monday.toISOString().slice(0, 10)
}

function getLastWeekId(weekId: string): string {
  const d = new Date(weekId)
  d.setDate(d.getDate() - 7)
  return d.toISOString().slice(0, 10)
}

function getWeekRange(weekId: string): { start: Date; end: Date } {
  const start = new Date(weekId)
  const end = new Date(start)
  end.setDate(end.getDate() + 6)
  end.setHours(23, 59, 59, 999)
  return { start, end }
}

async function readContext(weekId: string): Promise<Context> {
  const year = Number.parseInt(weekId.slice(0, 4))
  const monthId = weekId.slice(0, 7)

  const [fence, yearVision, globalVision, monthBacklog] = await Promise.all([
    readYaml(`${CONFIG.paths.hints}/fence.yml`),
    readYaml(`${CONFIG.paths.visions}/year-${year}.yml`),
    readYaml(`${CONFIG.paths.visions}/global.yml`),
    readYaml(`${CONFIG.paths.monthBacklogs}/${monthId}.yml`),
  ])

  return {
    fence: fence || {},
    yearVision: yearVision || {},
    globalVision: globalVision || {},
    monthBacklog: (monthBacklog || {}) as Context['monthBacklog'],
  }
}

async function readLastWeek(weekId: string): Promise<LastWeekInfo | null> {
  const lastWeekId = getLastWeekId(weekId)
  const filePath = `${CONFIG.paths.weekTasks}/${lastWeekId}.yml`

  if (!existsSync(filePath)) return null

  const data = readYaml(filePath) || {}
  const tasks = (data.tasks || []) as Task[]

  return {
    weekId: lastWeekId,
    theme: data.theme as string,
    goals: data.goals as string[],
    tasks,
    review: data.review as LastWeekInfo['review'],
    hasReview: !!data.review,
  }
}

function extractCarryOverTasks(lastWeek: LastWeekInfo): Task[] {
  return lastWeek.tasks.filter((task: Task) => {
    return ['notStarted', 'inProgress', 'deferred', 'deferred', 'blocked'].includes(task.status)
  }).map((task: Task) => ({
    ...task,
    carryOverFrom: lastWeek.weekId,
    reason: task.reason || '从上周顺延',
  }))
}

async function readLastWeekDayTodos(weekId: string): Promise<DayTodo[]> {
  const lastWeekId = getLastWeekId(weekId)
  const { start } = getWeekRange(lastWeekId)
  const dayTodos: DayTodo[] = []

  for (let i = 0; i < 7; i++) {
    const d = new Date(start)
    d.setDate(d.getDate() + i)
    const dateStr = d.toISOString().slice(0, 10)
    const filePath = `${CONFIG.paths.dayTodos}/${dateStr}.yml`

    if (existsSync(filePath)) {
      const data = readYaml(filePath) || {}
      const tasks = (data.tasks || []) as Array<Record<string, unknown>>
      dayTodos.push({
        date: dateStr,
        weekday: d.toLocaleDateString('zh-CN', { weekday: 'long' }),
        tasks,
        completedTasks: tasks.filter((t: Record<string, unknown>) => t.status === 'done').length,
        totalTasks: tasks.length,
      })
    }
  }

  return dayTodos
}

async function readCorpusSignals(weekRange: { start: Date; end: Date }): Promise<SynthesizedState> {
  void weekRange
  return {
    overallEnergy: 'neutral',
    overallMood: 'neutral',
    intensity: 'moderate',
    recommendations: [],
    writingFrequency: 0,
  }
}

function calculateTaskPriority(task: MonthBacklogTask): 'high' | 'medium' | 'low' {
  let score = 0

  if (task.priority === 'high') score += 3
  else if (task.priority === 'medium') score += 2
  else score += 1

  if (task.deadline) {
    const daysUntil = Math.ceil((new Date(task.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    if (daysUntil <= 3) score += 3
    else if (daysUntil <= 7) score += 2
    else if (daysUntil <= 14) score += 1
  }

  if (score >= 5) return 'high'
  if (score >= 3) return 'medium'
  return 'low'
}

function generateWeekPlan(
  weekId: string,
  context: Context,
  lastWeek: LastWeekInfo | null,
  corpusState: SynthesizedState,
): WeekPlan {
  const tasks: Task[] = []

  if (lastWeek) {
    const carryOver = extractCarryOverTasks(lastWeek)
    tasks.push(...carryOver)
  }

  const backlogTasks = context.monthBacklog.tasks || []
  const taskSet = new Set(tasks.map(t => t.title))
  
  const prioritized = backlogTasks
    .filter((t: MonthBacklogTask) => !taskSet.has(t.title))
    .map(t => ({ ...t, calculatedPriority: calculateTaskPriority(t) }))
    .sort((a, b) => {
      const order = { high: 3, medium: 2, low: 1 }
      const priorityA = a.calculatedPriority as keyof typeof order
      const priorityB = b.calculatedPriority as keyof typeof order
      return order[priorityB] - order[priorityA]
    })
    .slice(0, 5)

  tasks.push(...prioritized.map((t: MonthBacklogTask & { calculatedPriority: 'high' | 'medium' | 'low' }) => ({
    title: t.title,
    priority: t.calculatedPriority,
    dod: t.dod || t.acceptanceCriteria || '完成任务',
    status: 'notStarted' as const,
    links: t.links || [],
    tags: t.tags || [],
  })))

  const theme = context.monthBacklog.theme
    ? `${context.monthBacklog.theme} - Week ${weekId.slice(5)}`
    : `Week of ${weekId}`

  return {
    theme,
    tasks,
    meta: {
      generatedAt: new Date().toISOString(),
      basedOn: [
        'year-vision',
        'month-backlog',
        ...(lastWeek ? ['last-week-review'] : []),
      ],
      corpusState: {
        energy: corpusState.overallEnergy,
        mood: corpusState.overallMood,
      },
    },
  }
}

function generateQuestionsForAI(
  weekId: string,
  context: Context,
  lastWeek: LastWeekInfo | null,
  dayTodos: DayTodo[],
  corpusState: SynthesizedState,
): string {
  const lines: string[] = [
    '🎯 请回答以下问题以帮助生成本周计划：',
    '',
    '═══════════════════════════════════════',
    '1️⃣  本周主题/主线目标是什么？',
    '═══════════════════════════════════════',
    `建议: ${context.monthBacklog.theme || '基于年度目标'}`,
    '',
    '═══════════════════════════════════════',
    '2️⃣  本周必须完成的任务有哪些？（逗号分隔）',
    '═══════════════════════════════════════',
    '示例: 完成技能系统重构, 提交论文初稿',
    '',
  ]

  if (lastWeek) {
    const carryOver = extractCarryOverTasks(lastWeek)
    if (carryOver.length > 0) {
      lines.push(
        '═══════════════════════════════════════',
        `3️⃣  上周有 ${carryOver.length} 项遗留任务，建议处理哪些？（输入序号，如: 1,3）`,
        '═══════════════════════════════════════',
      )
      carryOver.forEach((task, i) => {
        const emoji = task.priority === 'high' ? '🔴' : task.priority === 'medium' ? '🟡' : '🟢'
        lines.push(`${i + 1}. ${emoji} ${task.title} (${task.status})`)
      })
      lines.push('')
    }
  }

  const backlogTasks = context.monthBacklog.tasks || []
  if (backlogTasks.length > 0) {
    lines.push(
      '═══════════════════════════════════════',
      '4️⃣  从月度 Backlog 建议选择哪些任务？（输入序号）',
      '═══════════════════════════════════════',
    )
    backlogTasks
      .slice(0, 5)
      .forEach((task, i) => {
        const deadline = task.deadline ? ` [截止: ${task.deadline}]` : ''
        lines.push(`${i + 1}. [${task.priority || 'medium'}] ${task.title}${deadline}`)
      })
    lines.push('')
  }

  void dayTodos
  void corpusState

  lines.push(
    '═══════════════════════════════════════',
    '5️⃣  本周有什么特殊情况需要注意吗？（假期、会议、出差等）',
    '═══════════════════════════════════════',
    '',
  )

  return lines.join('\n')
}

function createWeekPlanYaml(plan: WeekPlan): string {
  const tasksYaml = plan.tasks.map((t: Task) => {
    let taskStr = `  - title: ${t.title}
    priority: ${t.priority}
    dod: ${t.dod}
    status: ${t.status}`
    
    if (t.links?.length) {
      taskStr += `
    links:
${t.links.map(l => `      - label: ${l.label}\n        url: ${l.url}`).join('\n')}`
    }
    
    if (t.tags?.length) {
      taskStr += `
    tags:
${t.tags.map(tag => `      - ${tag}`).join('\n')}`
    }
    
    return taskStr
  }).join('\n')

  const header = `# Week Plan
# Created: ${new Date().toISOString()}

# 在此区域上方添加手动任务

tasks: []

${CONFIG.markers.start}

theme: ${plan.theme}

tasks:
${tasksYaml}

meta:
  generatedAt: "${plan.meta?.generatedAt}"
  basedOn: [${plan.meta?.basedOn.map(b => `"${b}"`).join(', ')}]
${plan.meta?.corpusState ? `  corpusState:
    energy: "${plan.meta.corpusState.energy}"
    mood: "${plan.meta.corpusState.mood}"` : ''}

${CONFIG.markers.end}

# 在此区域下方添加备注和复盘
`
  return header
}

function mergeWithExisting(filePath: string, aiContent: string): string {
  if (!existsSync(filePath)) return aiContent

  const existing = readFileSync(filePath, 'utf-8')
  const startIdx = existing.indexOf(CONFIG.markers.start)
  const endIdx = existing.indexOf(CONFIG.markers.end)

  if (startIdx !== -1 && endIdx !== -1 && startIdx < endIdx) {
    const before = existing.slice(0, startIdx + CONFIG.markers.start.length)
    const after = existing.slice(endIdx)
    const aiBody = aiContent.replace(new RegExp(`.*?${CONFIG.markers.start}\\n`, 's'), '').replace(new RegExp(`${CONFIG.markers.end}.*`, 's'), '')
    return `${before}\n\n${aiBody}\n${after}`
  }

  return aiContent
}

function generateAdvisorContent(
  weekId: string,
  context: Context,
  lastWeek: LastWeekInfo | null,
  dayTodos: DayTodo[],
  plan: WeekPlan,
  corpusState: SynthesizedState,
): string {
  const { end } = getWeekRange(weekId)
  
  const carryOver = lastWeek ? extractCarryOverTasks(lastWeek) : []
  
  const carryOverList = carryOver.length > 0 
    ? carryOver.map(t => `- ${t.title} (${t.status})`).join('\n')
    : '无遗留任务'

  const dayTodoList = dayTodos.length > 0
    ? dayTodos.map(d => `- ${d.date} (${d.weekday}): ${d.completedTasks}/${d.totalTasks} 完成`).join('\n')
    : '无每日记录'

  const taskTable = plan.tasks.map(t => `| ${t.priority} | ${t.title} | ${t.carryOverFrom ? '上周遗留' : '月度 backlog'} |`).join('\n')

  const highPriorityTasks = plan.tasks
    .filter(t => t.priority === 'high')
    .map(t => `- [ ] ${t.title}`)
    .join('\n')

  return `---
weekId: "${weekId}"
generatedAt: "${new Date().toISOString()}"
type: "week-start-advisor"
---

# Week Advisor: ${weekId}

## 时间范围

- **周次**: ${weekId} 至 ${end.toISOString().slice(0, 10)}
- **生成时间**: ${new Date().toLocaleString('zh-CN')}

## 上下文摘要

### 月度主题

${context.monthBacklog.theme || '未设定'}

### 上周执行分析

${lastWeek ? `- 总任务: ${lastWeek.tasks.length}
- 已完成: ${lastWeek.tasks.filter(t => t.status === 'done').length}
- 进行中: ${lastWeek.tasks.filter(t => t.status === 'inProgress').length}
- 已推迟: ${lastWeek.tasks.filter(t => t.status === 'deferred').length}` : '无上周数据'}

### 遗留任务

${carryOverList}

### 每日完成情况

${dayTodoList}

### Corpus 信号

- 能量状态: ${corpusState.overallEnergy}
- 情绪状态: ${corpusState.overallMood}
${corpusState.recommendations.map(r => `- ${r}`).join('\n')}

## AI 建议计划

### 主题

${plan.theme}

### 任务列表

| 优先级 | 任务 | 来源 |
|--------|------|------|
${taskTable}

## 供 end-my-week 使用

### 预期目标

${highPriorityTasks}

### 重点关注

- 任务完成率目标: >= 70%
- 建议记录每日能量水平
- 监控阻碍任务完成的因素

---
*此文件由 start-my-week 自动生成*
`
}

async function executeGitWorkflow(weekId: string, files: string[]): Promise<GitResult> {
  try {
    const git = simpleGit()
    
    const isRepo = await git.checkIsRepo()
    if (!isRepo) {
      return { success: false, pushed: false, error: { type: 'NOT_A_REPO', message: '当前目录不是 git 仓库' } }
    }

    for (const file of files) {
      if (existsSync(file)) {
        await git.add(file)
      }
    }

    const status = await git.status()
    if (status.staged.length === 0) {
      return { success: true, pushed: false, error: { type: 'NO_CHANGES', message: '没有要提交的变更' } }
    }

    const commitMsg = `${CONFIG.git.commitPrefix} add plan for ${weekId}`
    const commitResult = await git.commit(commitMsg)
    
    if (!commitResult.commit) {
      return { success: false, pushed: false, error: { type: 'COMMIT_FAILED', message: '提交失败' } }
    }

    try {
      const remotes = await git.getRemotes(true)
      if (remotes.length === 0) {
        return { success: true, commitHash: commitResult.commit, pushed: false, error: { type: 'NO_REMOTE', message: '没有配置远程仓库' } }
      }

      await git.push(CONFIG.git.remote, 'HEAD')
      return { success: true, commitHash: commitResult.commit, pushed: true }
    }
    catch (pushError) {
      return { 
        success: true, 
        commitHash: commitResult.commit, 
        pushed: false, 
        error: { type: 'PUSH_FAILED', message: `推送失败: ${(pushError as Error).message}` },
      }
    }
  }
  catch (error) {
    return { 
      success: false, 
      pushed: false, 
      error: { type: 'UNKNOWN', message: (error as Error).message },
    }
  }
}

function displayLastWeekSummary(lastWeek: LastWeekInfo | null): void {
  if (!lastWeek) {
    console.log('📅 上周数据: 未找到上周记录，可能是新开始\n')
    return
  }

  const done = lastWeek.tasks.filter(t => t.status === 'done').length
  const inProgress = lastWeek.tasks.filter(t => t.status === 'inProgress').length
  const deferred = lastWeek.tasks.filter(t => t.status === 'deferred').length

  console.log('═══════════════════════════════════════')
  console.log(`📅 上周总结 (${lastWeek.weekId})`)
  console.log('═══════════════════════════════════════')
  console.log(`✅ 已完成: ${done}/${lastWeek.tasks.length}`)
  if (inProgress > 0) console.log(`🔄 进行中: ${inProgress}`)
  if (deferred > 0) console.log(`⏸️  已推迟: ${deferred}`)

  const carryOver = extractCarryOverTasks(lastWeek)
  if (carryOver.length > 0) {
    console.log('\n📋 遗留任务:')
    carryOver.forEach(t => console.log(`   • ${t.title} (${t.status})`))
  }

  if (lastWeek.review?.energyLevel) {
    console.log(`\n💡 上周能量: ${lastWeek.review.energyLevel}/10`)
  }
  console.log('')
}

function displayDayTodosSummary(dayTodos: DayTodo[]): void {
  if (dayTodos.length === 0) return

  console.log('═══════════════════════════════════════')
  console.log('📝 上周每日完成情况')
  console.log('═══════════════════════════════════════')
  dayTodos.forEach(d => {
    const pct = d.totalTasks > 0 ? Math.round((d.completedTasks / d.totalTasks) * 100) : 0
    console.log(`   ${d.date} ${d.weekday}: ${d.completedTasks}/${d.totalTasks} (${pct}%)`)
  })
  console.log('')
}

function displayPlan(plan: WeekPlan): void {
  console.log('═══════════════════════════════════════')
  console.log('📋 AI 生成的周计划草案')
  console.log('═══════════════════════════════════════')
  console.log(`\n主题: ${plan.theme}\n`)
  console.log('任务列表:')
  
  const byPriority = {
    high: plan.tasks.filter(t => t.priority === 'high'),
    medium: plan.tasks.filter(t => t.priority === 'medium'),
    low: plan.tasks.filter(t => t.priority === 'low'),
  }

  for (const [prio, tasks] of Object.entries(byPriority)) {
    if (tasks.length === 0) continue
    const label = { high: '🔴 高优先级', medium: '🟡 中优先级', low: '🟢 低优先级' }[prio as keyof typeof byPriority]
    console.log(`\n${label}:`)
    tasks.forEach(t => console.log(`   • ${t.title}${t.carryOverFrom ? ' (顺延)' : ''}`))
  }
  console.log('')
}

async function main(): Promise<void> {
  const args = process.argv.slice(2)
  const dryRun = args.includes('--dry-run')
  const autoApprove = process.env.AUTO_APPROVE === 'true'

  console.log('🚀 start-my-week 启动\n')

  const weekId = getCurrentWeekId()
  console.log(`📅 当前周: ${weekId}\n`)

  const lastEnd = await readLatestEnd('weekly')
  if (lastEnd && (lastEnd.status === 'fail' || lastEnd.status === 'block')) {
    const hasAck = await hasAcknowledgement(lastEnd.run_id)
    if (!hasAck) {
      console.log('🔒 上周复盘存在未解决的验证问题')
      console.log(`   状态: ${lastEnd.status}`)
      console.log(`   时间: ${lastEnd.window_id}`)
      console.log(`   未解决问题: ${lastEnd.issues_open}\n`)

      const issues = await readIssues(lastEnd.run_id)
      if (issues.length > 0) {
        console.log('问题列表:')
        for (const issue of issues) {
          console.log(`  [${issue.severity.toUpperCase()}] ${issue.message}`)
        }
      }

      console.log('\n处理方式:')
      console.log('  1. 补充缺失的文档或记录')
      console.log('  2. 修改任务状态（如改回 in_progress）')
      console.log(`  3. 提供确认: npx tsx ../verify-task-doc/index.ts --ack "说明" --issue ISSUE-xxx\n`)
      return
    }
  }

  const context = await readContext(weekId)
  
  const lastWeek = await readLastWeek(weekId)
  displayLastWeekSummary(lastWeek)

  const dayTodos = await readLastWeekDayTodos(weekId)
  displayDayTodosSummary(dayTodos)

  const weekRange = getWeekRange(weekId)
  const corpusState = await readCorpusSignals(weekRange)

  const questions = generateQuestionsForAI(weekId, context, lastWeek, dayTodos, corpusState)
  console.log(questions)

  const plan = generateWeekPlan(weekId, context, lastWeek, corpusState)
  displayPlan(plan)

  if (!autoApprove && !dryRun) {
    console.log('═══════════════════════════════════════')
    console.log('⏸️  等待确认')
    console.log('═══════════════════════════════════════')
    console.log('请回答以上问题以完善计划。')
    console.log('设置 AUTO_APPROVE=true 可跳过确认直接写入。')
    console.log('使用 --dry-run 可预览而不写入文件。\n')
    return
  }

  const weekFile = `${CONFIG.paths.weekTasks}/${weekId}.yml`
  const yamlContent = createWeekPlanYaml(plan)
  
  if (dryRun) {
    console.log('🏃 DRY RUN 模式 - 不写入文件')
    console.log(`\n将要写入: ${weekFile}`)
    console.log('\n内容预览:')
    console.log(yamlContent.slice(0, 500) + '...')
  }
  else {
    ensureDir(CONFIG.paths.weekTasks)
    const finalContent = existsSync(weekFile) 
      ? mergeWithExisting(weekFile, yamlContent)
      : yamlContent
    writeFileSync(weekFile, finalContent, 'utf-8')
    console.log(`✅ 周计划已写入: ${weekFile}`)
  }

  const advisorFile = `${CONFIG.paths.advisor}/${weekId}-start.md`
  if (!dryRun) {
    ensureDir(CONFIG.paths.advisor)
    const advisorContent = generateAdvisorContent(weekId, context, lastWeek, dayTodos, plan, corpusState)
    writeFileSync(advisorFile, advisorContent, 'utf-8')
    console.log(`✅ Advisor 文件已写入: ${advisorFile}`)
  }

  if (!dryRun) {
    console.log('\n📦 执行 Git 工作流...')
    const gitResult = await executeGitWorkflow(weekId, [weekFile, advisorFile])
    
    if (gitResult.success) {
      console.log(`✅ 提交成功: ${gitResult.commitHash?.slice(0, 7)}`)
      if (gitResult.pushed) {
        console.log('✅ 推送成功')
      }
      else if (gitResult.error) {
        console.log(`⚠️  推送跳过: ${gitResult.error.message}`)
      }
    }
    else {
      console.log(`❌ Git 操作失败: ${gitResult.error?.message}`)
    }
  }

  console.log('\n🎉 完成!')
}

main().catch(console.error)
