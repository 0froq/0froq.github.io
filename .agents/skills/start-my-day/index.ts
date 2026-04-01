#!/usr/bin/env node
/**
 * start-my-day Skill
 * 
 * 在每天开始时自动生成日计划草案，基于 dashboard 中的长期目标、周计划、
 * 月度 backlog、昨日复盘及 corpus 状态信号。
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
    start: '# AI-DAY-PLAN-START',
    end: '# AI-DAY-PLAN-END',
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

interface DayTask extends Task {
  timeBlock?: string
  energyLevel?: 'high' | 'medium' | 'low'
}

interface DayPlan {
  date: string
  weekday: string
  theme: string
  tasks: DayTask[]
  meta?: {
    generatedAt: string
    basedOn: string[]
    weekId: string
    corpusState?: {
      energy: string
      mood: string
    }
  }
}

interface WeekInfo {
  weekId: string
  theme?: string
  tasks: Task[]
  highPriorityTasks?: Task[]
}

interface YesterdayInfo {
  date: string
  theme?: string
  tasks: DayTask[]
  completedTasks: number
  totalTasks: number
  completionRate: number
  incompleteTasks: Task[]
}

interface Context {
  fence: Record<string, unknown>
  yearVision: Record<string, unknown>
  globalVision: Record<string, unknown>
  weekPlan: WeekInfo | null
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

function getTodayDate(date: Date = new Date()): string {
  return date.toISOString().slice(0, 10)
}

function getWeekId(date: Date): string {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(d.setDate(diff))
  return monday.toISOString().slice(0, 10)
}

function getYesterdayDate(today: string): string {
  const d = new Date(today)
  d.setDate(d.getDate() - 1)
  return d.toISOString().slice(0, 10)
}

function getDayRange(date: string): { start: Date; end: Date } {
  const start = new Date(date)
  start.setHours(0, 0, 0, 0)
  const end = new Date(date)
  end.setHours(23, 59, 59, 999)
  return { start, end }
}

function getWeekdayName(dateStr: string): string {
  const d = new Date(dateStr)
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return weekdays[d.getDay()]
}

async function readContext(date: string): Promise<Context> {
  const weekId = getWeekId(new Date(date))
  const year = Number.parseInt(date.slice(0, 4))
  const monthId = date.slice(0, 7)

  const [fence, yearVision, globalVision, weekPlanData, monthBacklog] = await Promise.all([
    readYaml(`${CONFIG.paths.hints}/fence.yml`),
    readYaml(`${CONFIG.paths.visions}/year-${year}.yml`),
    readYaml(`${CONFIG.paths.visions}/global.yml`),
    readYaml(`${CONFIG.paths.weekTasks}/${weekId}.yml`),
    readYaml(`${CONFIG.paths.monthBacklogs}/${monthId}.yml`),
  ])

  const weekPlan: WeekInfo | null = weekPlanData ? {
    weekId,
    theme: weekPlanData.theme as string,
    tasks: (weekPlanData.tasks || []) as Task[],
    highPriorityTasks: ((weekPlanData.tasks || []) as Task[]).filter((t: Task) => t.priority === 'high'),
  } : null

  return {
    fence: fence || {},
    yearVision: yearVision || {},
    globalVision: globalVision || {},
    weekPlan,
    monthBacklog: (monthBacklog || {}) as Context['monthBacklog'],
  }
}

async function readYesterday(date: string): Promise<YesterdayInfo | null> {
  const yesterdayDate = getYesterdayDate(date)
  const filePath = `${CONFIG.paths.dayTodos}/${yesterdayDate}.yml`

  if (!existsSync(filePath)) return null

  const data = readYaml(filePath) || {}
  const tasks = (data.tasks || []) as DayTask[]
  const completedTasks = tasks.filter((t: DayTask) => t.status === 'done').length
  const totalTasks = tasks.length

  return {
    date: yesterdayDate,
    theme: data.theme as string,
    tasks,
    completedTasks,
    totalTasks,
    completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
    incompleteTasks: tasks.filter((t: DayTask) => 
      ['notStarted', 'inProgress', 'deferred', 'deffered', 'blocked'].includes(t.status)
    ),
  }
}

function extractCarryOverTasks(yesterday: YesterdayInfo): DayTask[] {
  return yesterday.incompleteTasks.map((task: Task) => ({
    ...task,
    carryOverFrom: yesterday.date,
    reason: task.reason || '从昨天顺延',
  }))
}

async function readWeekPlanForDate(date: string): Promise<WeekInfo | null> {
  const weekId = getWeekId(new Date(date))
  const filePath = `${CONFIG.paths.weekTasks}/${weekId}.yml`

  if (!existsSync(filePath)) return null

  const data = readYaml(filePath) || {}
  const tasks = (data.tasks || []) as Task[]

  return {
    weekId,
    theme: data.theme as string,
    tasks,
    highPriorityTasks: tasks.filter((t: Task) => t.priority === 'high'),
  }
}

async function readAdvisorForWeek(date: string): Promise<Record<string, unknown> | null> {
  const weekId = getWeekId(new Date(date))
  const advisorPath = `${CONFIG.paths.advisor}/${weekId}-start.md`
  
  if (!existsSync(advisorPath)) return null
  
  try {
    const content = readFileSync(advisorPath, 'utf-8')
    // 解析 frontmatter
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/)
    if (frontmatterMatch) {
      return YAML.parse(frontmatterMatch[1]) || {}
    }
  }
  catch {
    // 忽略解析错误
  }
  return {}
}

async function readRecentCorpus(date: string, days: number = 3): Promise<SynthesizedState> {
  const dateObj = new Date(date)
  void dateObj
  void days
  // Corpus 信号读取简化实现
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

function generateDayPlan(
  date: string,
  context: Context,
  yesterday: YesterdayInfo | null,
  weekInfo: WeekInfo | null,
  corpusState: SynthesizedState,
): DayPlan {
  const tasks: DayTask[] = []

  // 1. 从昨天顺延未完成的任务
  if (yesterday) {
    const carryOver = extractCarryOverTasks(yesterday)
    tasks.push(...carryOver.slice(0, 3)) // 最多3个顺延任务
  }

  // 2. 从周计划的高优先级任务中选择
  if (weekInfo?.highPriorityTasks) {
    const weekHighPrio = weekInfo.highPriorityTasks
      .filter((t: Task) => !tasks.find(existing => existing.title === t.title))
      .slice(0, 3)
    
    tasks.push(...weekHighPrio.map((t: Task) => ({
      ...t,
      source: 'week-plan',
    })))
  }

  // 3. 从月度 backlog 补充
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
    .slice(0, 2)

  tasks.push(...prioritized.map((t: MonthBacklogTask & { calculatedPriority: 'high' | 'medium' | 'low' }) => ({
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

function generateQuestionsForAI(
  date: string,
  context: Context,
  yesterday: YesterdayInfo | null,
  weekInfo: WeekInfo | null,
  corpusState: SynthesizedState,
): string {
  const lines: string[] = [
    '🎯 请回答以下问题以帮助生成今日计划：',
    '',
    '═══════════════════════════════════════',
    '1️⃣  今天必须完成的任务有哪些？（逗号分隔）',
    '═══════════════════════════════════════',
    '示例: 完成代码审查, 提交周报',
    '',
  ]

  if (yesterday) {
    const carryOver = extractCarryOverTasks(yesterday)
    if (carryOver.length > 0) {
      lines.push(
        '═══════════════════════════════════════',
        `2️⃣  昨天有 ${carryOver.length} 项未完成任务，今天需要继续吗？（输入序号，如: 1,3）`,
        '═══════════════════════════════════════',
      )
      carryOver.forEach((task, i) => {
        const emoji = task.priority === 'high' ? '🔴' : task.priority === 'medium' ? '🟡' : '🟢'
        lines.push(`${i + 1}. ${emoji} ${task.title} (${task.status})`)
      })
      lines.push('')
    }
  }

  if (weekInfo?.highPriorityTasks && weekInfo.highPriorityTasks.length > 0) {
    lines.push(
      '═══════════════════════════════════════',
      '3️⃣  周计划中的高优先级任务，今天最希望推进哪 1-3 件？（输入序号）',
      '═══════════════════════════════════════',
    )
    weekInfo.highPriorityTasks
      .slice(0, 5)
      .forEach((task, i) => {
        lines.push(`${i + 1}. 🔴 ${task.title}`)
      })
    lines.push('')
  }

  const backlogTasks = context.monthBacklog.tasks || []
  if (backlogTasks.length > 0) {
    lines.push(
      '═══════════════════════════════════════',
      '4️⃣  从月度 Backlog 建议今天处理哪些任务？（输入序号）',
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

  lines.push(
    '═══════════════════════════════════════',
    '5️⃣  今天有什么临时安排、外出、会议等约束吗？',
    '═══════════════════════════════════════',
    '',
  )

  lines.push(
    '═══════════════════════════════════════',
    '6️⃣  当前主观状态如何？（低能量/正常/高能量/焦虑/混乱）',
    '═══════════════════════════════════════',
    '',
  )

  void corpusState

  return lines.join('\n')
}

function createDayPlanYaml(plan: DayPlan): string {
  const tasksYaml = plan.tasks.map((t: DayTask) => {
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
    
    if (t.carryOverFrom) {
      taskStr += `
    carryOverFrom: ${t.carryOverFrom}`
    }
    
    return taskStr
  }).join('\n')

  const header = `# Day Plan: ${plan.date} (${plan.weekday})
# Created: ${new Date().toISOString()}

# 在此区域上方添加手动任务

tasks: []

${CONFIG.markers.start}

date: "${plan.date}"
weekday: "${plan.weekday}"
theme: ${plan.theme}

tasks:
${tasksYaml}

meta:
  generatedAt: "${plan.meta?.generatedAt}"
  basedOn: [${plan.meta?.basedOn.map(b => `"${b}"`).join(', ')}]
  weekId: "${plan.meta?.weekId}"
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
  date: string,
  context: Context,
  yesterday: YesterdayInfo | null,
  weekInfo: WeekInfo | null,
  plan: DayPlan,
  corpusState: SynthesizedState,
): string {
  const weekId = getWeekId(new Date(date))
  
  const carryOver = yesterday ? extractCarryOverTasks(yesterday) : []
  
  const carryOverList = carryOver.length > 0 
    ? carryOver.map(t => `- ${t.title} (${t.status})`).join('\n')
    : '无遗留任务'

  const yesterdaySummary = yesterday
    ? `- 总任务: ${yesterday.totalTasks}
- 已完成: ${yesterday.completedTasks}
- 未完成: ${yesterday.incompleteTasks.length}
- 完成率: ${yesterday.completionRate}%`
    : '无昨日数据'

  const taskTable = plan.tasks.map(t => `| ${t.priority} | ${t.title} | ${t.carryOverFrom ? '昨天遗留' : '周计划/Backlog'} |`).join('\n')

  const highPriorityTasks = plan.tasks
    .filter(t => t.priority === 'high')
    .map(t => `- [ ] ${t.title}`)
    .join('\n')

  return `---
date: "${date}"
weekId: "${weekId}"
generatedAt: "${new Date().toISOString()}"
type: "day-start-advisor"
---

# Day Advisor: ${date} (${plan.weekday})

## 时间信息

- **日期**: ${date} (${plan.weekday})
- **所属周**: ${weekId}
- **生成时间**: ${new Date().toLocaleString('zh-CN')}

## 上下文摘要

### 周计划主题

${weekInfo?.theme || '未设定'}

### 昨日执行分析

${yesterdaySummary}

### 遗留任务

${carryOverList}

### 月度 Backlog 状态

- 月度主题: ${context.monthBacklog.theme || '未设定'}
- 可用任务数: ${(context.monthBacklog.tasks || []).length}

### Corpus 信号

- 能量状态: ${corpusState.overallEnergy}
- 情绪状态: ${corpusState.overallMood}
${corpusState.recommendations.map(r => `- ${r}`).join('\n')}

## AI 建议计划

### 今日主题

${plan.theme}

### 任务列表

| 优先级 | 任务 | 来源 |
|--------|------|------|
${taskTable}

## 供 end-my-day 使用

### 预期目标

${highPriorityTasks}

### 重点关注

- 任务完成率目标: >= 70%
- 建议记录实际能量水平
- 监控阻碍任务完成的因素
- 注意与周计划的协调

---
*此文件由 start-my-day 自动生成*
`
}

async function executeGitWorkflow(date: string, files: string[]): Promise<GitResult> {
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

    const commitMsg = `${CONFIG.git.commitPrefix} add day plan for ${date}`
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

function displayYesterdaySummary(yesterday: YesterdayInfo | null): void {
  if (!yesterday) {
    console.log('📅 昨日数据: 未找到昨日记录，可能是新开始\n')
    return
  }

  console.log('═══════════════════════════════════════')
  console.log(`📅 昨日总结 (${yesterday.date})`)
  console.log('═══════════════════════════════════════')
  console.log(`✅ 完成情况: ${yesterday.completedTasks}/${yesterday.totalTasks} (${yesterday.completionRate}%)`)
  
  if (yesterday.incompleteTasks.length > 0) {
    console.log(`⏸️  未完成: ${yesterday.incompleteTasks.length} 项`)
    console.log('\n📋 遗留任务:')
    yesterday.incompleteTasks.forEach(t => console.log(`   • ${t.title} (${t.status})`))
  }
  console.log('')
}

function displayWeekPlanSummary(weekInfo: WeekInfo | null): void {
  if (!weekInfo) {
    console.log('📊 周计划: 未找到本周周计划，请先运行 start-my-week\n')
    return
  }

  console.log('═══════════════════════════════════════')
  console.log(`📊 本周计划 (${weekInfo.weekId})`)
  console.log('═══════════════════════════════════════')
  console.log(`主题: ${weekInfo.theme || '未设定'}\n`)
  
  if (weekInfo.highPriorityTasks && weekInfo.highPriorityTasks.length > 0) {
    console.log('🔴 高优先级任务:')
    weekInfo.highPriorityTasks.slice(0, 5).forEach(t => console.log(`   • ${t.title}`))
  }
  console.log('')
}

function displayPlan(plan: DayPlan): void {
  console.log('═══════════════════════════════════════')
  console.log('📋 AI 生成的日计划草案')
  console.log('═══════════════════════════════════════')
  console.log(`\n日期: ${plan.date} (${plan.weekday})`)
  console.log(`主题: ${plan.theme}\n`)
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

  console.log('🚀 start-my-day 启动\n')

  const today = getTodayDate()
  console.log(`📅 今天: ${today} (${getWeekdayName(today)})\n`)

  const lastEnd = await readLatestEnd('daily')
  if (lastEnd && (lastEnd.status === 'fail' || lastEnd.status === 'block')) {
    const hasAck = await hasAcknowledgement(lastEnd.run_id)
    if (!hasAck) {
      console.log('🔒 上次复盘存在未解决的验证问题')
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

  const context = await readContext(today)
  
  const yesterday = await readYesterday(today)
  displayYesterdaySummary(yesterday)

  const weekInfo = await readWeekPlanForDate(today)
  displayWeekPlanSummary(weekInfo)

  const { start } = getDayRange(today)
  const corpusState = await readRecentCorpus(today)

  const questions = generateQuestionsForAI(today, context, yesterday, weekInfo, corpusState)
  console.log(questions)

  const plan = generateDayPlan(today, context, yesterday, weekInfo, corpusState)
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

  const dayFile = `${CONFIG.paths.dayTodos}/${today}.yml`
  const yamlContent = createDayPlanYaml(plan)
  
  if (dryRun) {
    console.log('🏃 DRY RUN 模式 - 不写入文件')
    console.log(`\n将要写入: ${dayFile}`)
    console.log('\n内容预览:')
    console.log(yamlContent.slice(0, 500) + '...')
  }
  else {
    ensureDir(CONFIG.paths.dayTodos)
    const finalContent = existsSync(dayFile) 
      ? mergeWithExisting(dayFile, yamlContent)
      : yamlContent
    writeFileSync(dayFile, finalContent, 'utf-8')
    console.log(`✅ 日计划已写入: ${dayFile}`)
  }

  const advisorFile = `${CONFIG.paths.advisor}/${today}-start.md`
  if (!dryRun) {
    ensureDir(CONFIG.paths.advisor)
    const advisorContent = generateAdvisorContent(today, context, yesterday, weekInfo, plan, corpusState)
    writeFileSync(advisorFile, advisorContent, 'utf-8')
    console.log(`✅ Advisor 文件已写入: ${advisorFile}`)
  }

  if (!dryRun) {
    console.log('\n📦 执行 Git 工作流...')
    const gitResult = await executeGitWorkflow(today, [dayFile, advisorFile])
    
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
