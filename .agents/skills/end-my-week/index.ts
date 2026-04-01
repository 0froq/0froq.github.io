#!/usr/bin/env node
/**
 * end-my-week Skill
 * 
 * 在周末自动生成本周复盘，基于本周周计划、每日完成情况、corpus 信号
 * 生成分结构化的复盘 YAML 文件，并自动 git 提交推送。
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
import { verifyTaskDocConsistency } from '../lib/verification.ts'

type VerificationContext = Awaited<ReturnType<typeof verifyTaskDocConsistency>>

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
    weekReviewStart: '# AI-WEEK-REVIEW-START',
    weekReviewEnd: '# AI-WEEK-REVIEW-END',
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
  source?: 'weekPlan' | 'dayAdded'
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
  review?: WeekReview
}

interface WeekReview {
  summary: string
  completed: string[]
  deferred: DeferredTask[]
  cancelled: string[]
  energy: 'low' | 'medium' | 'high' | 'mixed'
  notes: string
  handoff: string[]
}

interface DeferredTask {
  title: string
  reason: string
  suggestion: 'nextWeek' | 'backlog' | 'drop'
}

interface DayTodo {
  date: string
  weekday: string
  theme?: string
  tasks: Task[]
  review?: {
    completed: number
    partial: number
    failed: number
    notes?: string
  }
  completedTasks: number
  totalTasks: number
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

interface WeekStats {
  totalTasks: number
  completed: number
  inProgress: number
  deferred: number
  cancelled: number
  notStarted: number
  completionRate: number
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

function getCurrentWeekId(date: Date = new Date()): string {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(d.setDate(diff))
  return monday.toISOString().slice(0, 10)
}

function getWeekRange(weekId: string): { start: Date; end: Date } {
  const start = new Date(weekId)
  const end = new Date(start)
  end.setDate(end.getDate() + 6)
  end.setHours(23, 59, 59, 999)
  return { start, end }
}

function getWeekDates(weekId: string): string[] {
  const { start } = getWeekRange(weekId)
  const dates: string[] = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(start)
    d.setDate(d.getDate() + i)
    dates.push(d.toISOString().slice(0, 10))
  }
  return dates
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

async function readCurrentWeekPlan(weekId: string): Promise<WeekPlan | null> {
  const filePath = `${CONFIG.paths.weekTasks}/${weekId}.yml`

  if (!existsSync(filePath)) return null

  const data = readYaml(filePath) || {}
  const tasks = (data.tasks || []) as Task[]

  return {
    theme: data.theme as string,
    tasks,
    meta: data.meta as WeekPlan['meta'],
    review: data.review as WeekReview,
  }
}

async function readDayTodos(weekId: string): Promise<DayTodo[]> {
  const dates = getWeekDates(weekId)
  const dayTodos: DayTodo[] = []

  for (const dateStr of dates) {
    const filePath = `${CONFIG.paths.dayTodos}/${dateStr}.yml`

    if (existsSync(filePath)) {
      const data = readYaml(filePath) || {}
      const tasks = (data.tasks || []) as Task[]
      dayTodos.push({
        date: dateStr,
        weekday: new Date(dateStr).toLocaleDateString('zh-CN', { weekday: 'long' }),
        theme: data.theme as string,
        tasks,
        review: data.review as DayTodo['review'],
        completedTasks: tasks.filter((t: Task) => t.status === 'done').length,
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

function calculateWeekStats(weekPlan: WeekPlan, dayTodos: DayTodo[]): WeekStats {
  // 合并周计划任务和每日任务
  const allTasks = [...weekPlan.tasks]
  const dayTaskTitles = new Set(weekPlan.tasks.map(t => t.title))

  for (const day of dayTodos) {
    for (const task of day.tasks) {
      if (!dayTaskTitles.has(task.title)) {
        allTasks.push({ ...task, source: 'dayAdded' })
        dayTaskTitles.add(task.title)
      }
    }
  }

  const total = allTasks.length
  const completed = allTasks.filter(t => t.status === 'done').length
  const inProgress = allTasks.filter(t => t.status === 'inProgress').length
  const deferred = allTasks.filter(t => t.status === 'deferred').length
  const cancelled = allTasks.filter(t => t.status === 'cancelled').length
  const notStarted = allTasks.filter(t => t.status === 'notStarted').length

  return {
    totalTasks: total,
    completed,
    inProgress,
    deferred,
    cancelled,
    notStarted,
    completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
  }
}

function identifyRecurringUncompleted(dayTodos: DayTodo[]): Array<{ title: string; count: number }> {
  const uncompletedMap = new Map<string, number>()

  for (const day of dayTodos) {
    for (const task of day.tasks) {
      if (task.status !== 'done' && task.carryOverFrom) {
        uncompletedMap.set(task.title, (uncompletedMap.get(task.title) || 0) + 1)
      }
    }
  }

  return Array.from(uncompletedMap.entries())
    .filter(([_, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .map(([title, count]) => ({ title, count }))
}

function identifyCompletedHighlights(weekPlan: WeekPlan, dayTodos: DayTodo[]): string[] {
  const highlights: string[] = []

  // 从周计划中找出已完成的high priority任务
  const completedHighPriority = weekPlan.tasks
    .filter(t => t.status === 'done' && t.priority === 'high')
    .map(t => t.title)

  highlights.push(...completedHighPriority)

  // 从每日记录中找出有正面评价的任务
  for (const day of dayTodos) {
    if (day.review?.notes) {
      const notes = day.review.notes.toLowerCase()
      if (notes.includes('突破') || notes.includes('里程碑') || notes.includes('重要')) {
        highlights.push(`${day.date} 关键进展`)
      }
    }
  }

  return highlights
}

function generateQuestionsForAI(
  weekId: string,
  weekPlan: WeekPlan,
  stats: WeekStats,
  dayTodos: DayTodo[],
): string {
  const lines: string[] = [
    '🎯 请回答以下问题以帮助完成本周复盘：',
    '',
    '═══════════════════════════════════════',
    '1️⃣  本周主观上最重要的完成是什么？',
    '═══════════════════════════════════════',
    '建议回答：最有成就感或最关键的事项',
    '',
  ]

  // 显示建议的高亮任务
  const highlights = identifyCompletedHighlights(weekPlan, dayTodos)
  if (highlights.length > 0) {
    lines.push('参考（已完成的high优先级任务）:')
    highlights.slice(0, 5).forEach(t => lines.push(`  • ${t}`))
    lines.push('')
  }

  lines.push(
    '═══════════════════════════════════════',
    '2️⃣  本周最遗憾/最卡住的事情是什么？',
    '═══════════════════════════════════════',
    '建议回答：未完成的重要事项或遇到的阻碍',
    '',
  )

  // 显示遗留任务
  const deferredTasks = weekPlan.tasks.filter(t => 
    t.status === 'deferred' || t.status === 'blocked'
  )
  if (deferredTasks.length > 0) {
    lines.push('参考（被推迟/阻塞的任务）:')
    deferredTasks.forEach(t => lines.push(`  • ${t.title} (${t.status})`))
    lines.push('')
  }

  lines.push(
    '═══════════════════════════════════════',
    '3️⃣  哪些未完成任务下周仍必须继续？',
    '═══════════════════════════════════════',
  )

  const unfinishedTasks = weekPlan.tasks.filter(t => 
    t.status === 'notStarted' || t.status === 'inProgress' || t.status === 'deferred'
  )
  if (unfinishedTasks.length > 0) {
    lines.push('未完成任务列表:')
    unfinishedTasks.forEach((t, i) => {
      const emoji = t.priority === 'high' ? '🔴' : t.priority === 'medium' ? '🟡' : '🟢'
      lines.push(`  ${i + 1}. ${emoji} ${t.title} (${t.status})`)
    })
    lines.push('请输入序号（如: 1,3,5）')
  }
  else {
    lines.push('本周所有任务已完成 ✓')
  }
  lines.push('')

  lines.push(
    '═══════════════════════════════════════',
    '4️⃣  哪些任务应回收到 monthBacklogs 或直接放弃？',
    '═══════════════════════════════════════',
    '建议格式: 任务序号-处理方式 (如: 2-backlog, 3-drop)',
    '处理方式: nextWeek / backlog / drop',
    '',
  )

  lines.push(
    '═══════════════════════════════════════',
    '5️⃣  本周整体状态评价？',
    '═══════════════════════════════════════',
    '请选择: low(低能量) / medium(稳定) / high(高能量) / mixed(波动大) / intense(高压)',
    `参考数据: 完成率 ${stats.completionRate}%, 完成任务 ${stats.completed}/${stats.totalTasks}`,
    '',
  )

  return lines.join('\n')
}

function generateWeekReview(
  weekPlan: WeekPlan,
  stats: WeekStats,
  dayTodos: DayTodo[],
  highlights: string[],
): WeekReview {
  // 默认复盘的摘要
  const summary = `本周完成率 ${stats.completionRate}%。${stats.completed} 项任务完成，${stats.deferred} 项推迟，${stats.cancelled} 项取消。`

  // 识别完成的任务
  const completed = weekPlan.tasks
    .filter(t => t.status === 'done')
    .map(t => t.title)

  // 识别需要延后的任务
  const deferred: DeferredTask[] = weekPlan.tasks
    .filter(t => t.status === 'deferred' || t.status === 'blocked')
    .map(t => ({
      title: t.title,
      reason: t.reason || '状态顺延',
      suggestion: 'nextWeek',
    }))

  // 识别取消的任务
  const cancelled = weekPlan.tasks
    .filter(t => t.status === 'cancelled')
    .map(t => t.title)

  // 识别需要交接的任务（未完成的high priority任务）
  const handoff = weekPlan.tasks
    .filter(t => 
      (t.status === 'notStarted' || t.status === 'inProgress') && 
      t.priority === 'high'
    )
    .map(t => t.title)

  // 能量状态推断
  let energy: WeekReview['energy'] = 'medium'
  if (stats.completionRate >= 80) energy = 'high'
  else if (stats.completionRate <= 40) energy = 'low'
  else if (stats.inProgress > stats.completed) energy = 'mixed'

  // 备注
  const notes = `本周任务${stats.totalTasks > 10 ? '较多' : '适中'}，完成率${stats.completionRate}%。${stats.deferred > 2 ? '推迟任务较多，建议评估任务量是否合理。' : ''}`

  return {
    summary,
    completed,
    deferred,
    cancelled,
    energy,
    notes,
    handoff,
  }
}

function createWeekReviewYaml(review: WeekReview): string {
  const deferredYaml = review.deferred.map(d => 
    `  - title: ${d.title}
    reason: ${d.reason}
    suggestion: ${d.suggestion}`
  ).join('\n')

  const completedYaml = review.completed.map(c => `  - ${c}`).join('\n')
  const cancelledYaml = review.cancelled.map(c => `  - ${c}`).join('\n')
  const handoffYaml = review.handoff.map(h => `  - ${h}`).join('\n')

  return `${CONFIG.markers.weekReviewStart}

review:
  summary: ${review.summary}
  completed:
${completedYaml || '  []'}
  deferred:
${deferredYaml || '  []'}
  cancelled:
${cancelledYaml || '  []'}
  energy: ${review.energy}
  notes: ${review.notes}
  handoff:
${handoffYaml || '  []'}

${CONFIG.markers.weekReviewEnd}`
}

function mergeWeekReviewWithExisting(filePath: string, reviewYaml: string): string {
  if (!existsSync(filePath)) return reviewYaml

  const existing = readFileSync(filePath, 'utf-8')
  const startIdx = existing.indexOf(CONFIG.markers.weekReviewStart)
  const endIdx = existing.indexOf(CONFIG.markers.weekReviewEnd)

  if (startIdx !== -1 && endIdx !== -1 && startIdx < endIdx) {
    const before = existing.slice(0, startIdx)
    const after = existing.slice(endIdx + CONFIG.markers.weekReviewEnd.length)
    return `${before}${reviewYaml}${after}`
  }

  // 如果没有标记，追加到文件末尾
  return `${existing}\n\n${reviewYaml}\n`
}

function generateAdvisorContent(
  weekId: string,
  context: Context,
  weekPlan: WeekPlan,
  dayTodos: DayTodo[],
  stats: WeekStats,
  review: WeekReview,
  corpusState: SynthesizedState,
): string {
  const { end } = getWeekRange(weekId)

  const taskTable = weekPlan.tasks.map(t => {
    const statusEmoji = {
      done: '✅',
      inProgress: '🔄',
      notStarted: '⬜',
      deferred: '⏸️',
      deffered: '⏸️',
      cancelled: '❌',
      blocked: '🚫',
    }[t.status]
    return `| ${statusEmoji} | ${t.priority} | ${t.title} | ${t.source || 'weekPlan'} |`
  }).join('\n')

  const dayTodoList = dayTodos.length > 0
    ? dayTodos.map(d => `- ${d.date} (${d.weekday}): ${d.completedTasks}/${d.totalTasks} 完成`).join('\n')
    : '无每日记录'

  const recurring = identifyRecurringUncompleted(dayTodos)
  const recurringList = recurring.length > 0
    ? recurring.map(r => `- "${r.title}" - 未完成 ${r.count} 次`).join('\n')
    : '无'

  return `---
weekId: "${weekId}"
generatedAt: "${new Date().toISOString()}"
type: "week-end-advisor"
---

# Week End Review: ${weekId}

## 时间范围

- **周次**: ${weekId} 至 ${end.toISOString().slice(0, 10)}
- **复盘时间**: ${new Date().toLocaleString('zh-CN')}

## 本周目标回顾

### 计划主题

${weekPlan.theme || '未设定'}

### 计划任务执行统计

| 状态 | 优先级 | 任务 | 来源 |
|------|--------|------|------|
${taskTable}

### 完成情况概览

- **总任务**: ${stats.totalTasks}
- **已完成**: ${stats.completed} (${stats.completionRate}%)
- **进行中**: ${stats.inProgress}
- **已推迟**: ${stats.deferred}
- **已取消**: ${stats.cancelled}

## 每日完成情况

${dayTodoList}

### 反复未完成的任务

${recurringList}

## 复盘摘要

### 整体评价

- **完成率**: ${stats.completionRate}%
- **能量状态**: ${review.energy}
- **关键完成**: ${review.completed.slice(0, 3).join(', ') || '无'}

### 本周亮点

${review.completed.slice(0, 5).map(c => `- ✨ ${c}`).join('\n') || '- 无'}

### 遗憾与阻塞

${review.deferred.map(d => `- ⏸️ ${d.title}: ${d.reason} (建议: ${d.suggestion})`).join('\n') || '- 无'}

### Corpus 信号

- 能量状态: ${corpusState.overallEnergy}
- 情绪状态: ${corpusState.overallMood}
${corpusState.recommendations.map(r => `- ${r}`).join('\n')}

## 下周交接

### 必须继续的任务

${review.handoff.map(h => `- [ ] ${h}`).join('\n') || '- 无'}

### 建议

${stats.completionRate < 60 ? '- 本周完成率较低，建议评估任务量是否合理\n' : ''}- 基于${corpusState.overallEnergy}能量状态，下周建议${corpusState.overallEnergy === 'low' ? '减少任务量' : '保持当前节奏'}

---
*此文件由 end-my-week 自动生成*
`
}

function generateMonthBacklogUpdate(
  weekId: string,
  review: WeekReview,
): { content: string; tasksToUpdate: Array<{ title: string; action: string }> } {
  const tasksToUpdate: Array<{ title: string; action: string }> = []

  for (const completed of review.completed) {
    tasksToUpdate.push({ title: completed, action: 'mark-done' })
  }

  for (const deferred of review.deferred) {
    if (deferred.suggestion === 'backlog') {
      tasksToUpdate.push({ title: deferred.title, action: 'add-note' })
    }
  }

  const lines: string[] = [
    `<!-- Week ${weekId} Review Updates -->`,
    `<!-- Updated at: ${new Date().toISOString()} -->`,
    '',
    '## 本周更新摘要',
    '',
    `### 已完成任务 (${review.completed.length})`,
    '',
  ]

  if (review.completed.length > 0) {
    review.completed.forEach(c => lines.push(`- [x] ${c}`))
  }
  else {
    lines.push('- 本周无已完成任务')
  }

  lines.push(
    '',
    `### 回收到Backlog (${review.deferred.filter(d => d.suggestion === 'backlog').length})`,
    '',
  )

  const backToBacklog = review.deferred.filter(d => d.suggestion === 'backlog')
  if (backToBacklog.length > 0) {
    backToBacklog.forEach(d => lines.push(`- ${d.title}: ${d.reason}`))
  }
  else {
    lines.push('- 本周无回收任务')
  }

  lines.push(
    '',
    `### 放弃任务 (${review.deferred.filter(d => d.suggestion === 'drop').length})`,
    '',
  )

  const dropped = review.deferred.filter(d => d.suggestion === 'drop')
  if (dropped.length > 0) {
    dropped.forEach(d => lines.push(`- ${d.title}: ${d.reason}`))
  }
  else {
    lines.push('- 本周无放弃任务')
  }

  return { content: lines.join('\n'), tasksToUpdate }
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

    const commitMsg = `${CONFIG.git.commitPrefix} add week review for ${weekId}`
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

function displayWeekSummary(weekPlan: WeekPlan, stats: WeekStats): void {
  console.log('═══════════════════════════════════════')
  console.log(`📅 本周总结 (${weekPlan.theme || '无主题'})`)
  console.log('═══════════════════════════════════════')
  console.log(`\n✅ 完成: ${stats.completed}/${stats.totalTasks} (${stats.completionRate}%)`)
  if (stats.inProgress > 0) console.log(`🔄 进行中: ${stats.inProgress}`)
  if (stats.deferred > 0) console.log(`⏸️  已推迟: ${stats.deferred}`)
  if (stats.cancelled > 0) console.log(`❌ 已取消: ${stats.cancelled}`)

  const unfinished = weekPlan.tasks.filter(t =>
    t.status === 'notStarted' || t.status === 'inProgress' || t.status === 'deferred'
  )
  if (unfinished.length > 0) {
    console.log('\n📋 未完成任务:')
    unfinished.forEach(t => console.log(`   • ${t.title} (${t.status})`))
  }
  console.log('')
}

function displayDayTodosSummary(dayTodos: DayTodo[]): void {
  if (dayTodos.length === 0) return

  console.log('═══════════════════════════════════════')
  console.log('📝 本周每日完成情况')
  console.log('═══════════════════════════════════════')
  dayTodos.forEach(d => {
    const pct = d.totalTasks > 0 ? Math.round((d.completedTasks / d.totalTasks) * 100) : 0
    console.log(`   ${d.date} ${d.weekday}: ${d.completedTasks}/${d.totalTasks} (${pct}%)`)
  })
  console.log('')
}

function displayReview(review: WeekReview): void {
  console.log('═══════════════════════════════════════')
  console.log('📋 AI 生成的复盘草案')
  console.log('═══════════════════════════════════════')
  console.log(`\n总结: ${review.summary}`)
  console.log(`\n能量状态: ${review.energy}`)

  if (review.completed.length > 0) {
    console.log('\n已完成:')
    review.completed.forEach(c => console.log(`   ✨ ${c}`))
  }

  if (review.handoff.length > 0) {
    console.log('\n需交接下周:')
    review.handoff.forEach(h => console.log(`   ➡️  ${h}`))
  }

  if (review.deferred.length > 0) {
    console.log('\n已推迟:')
    review.deferred.forEach(d => console.log(`   ⏸️  ${d.title} (${d.suggestion})`))
  }
  console.log('')
}

function displayVerificationContext(verification: VerificationContext): void {
  console.log('🧠 已收集验证上下文（由 AI 自行判断 pass / warn / fail）')
  console.log(`   run_id: ${verification.run_id}`)
  console.log(`   tasks: ${verification.tasks.length}`)
  console.log(`   documents: ${verification.documents.length}`)
  console.log(`   git_commits: ${verification.git_commits.length}`)
  console.log(`   potential_links: ${verification.potential_links.length}`)

  const topLinks = verification.potential_links.slice(0, 5)
  if (topLinks.length > 0) {
    console.log('   候选关联（前 5 条）:')
    for (const link of topLinks) {
      console.log(`   - [${link.confidence}] ${link.task_id} ↔ ${link.doc_path}`)
      console.log(`     reasons: ${link.reasons.join(' | ')}`)
    }
  }
  else {
    console.log('   未发现明显的 task-doc 候选关联。')
  }

  console.log(`   详细上下文: docs/dashboard/advisor/runs/${verification.run_id}/context.yml`)
  console.log('')
}

async function main(): Promise<void> {
  const args = process.argv.slice(2)
  const dryRun = args.includes('--dry-run')
  const autoApprove = process.env.AUTO_APPROVE === 'true'
  const updateBacklog = !args.includes('--no-backlog')

  console.log('🚀 end-my-week 启动\n')

  const weekId = getCurrentWeekId()
  console.log(`📅 当前周: ${weekId}\n`)

  // 读取周计划
  const weekPlan = await readCurrentWeekPlan(weekId)
  if (!weekPlan) {
    console.log('❌ 未找到本周计划文件，请先运行 start-my-week 或手动创建')
    return
  }

  // 读取上下文
  const context = await readContext(weekId)

  // 读取每日计划
  const dayTodos = await readDayTodos(weekId)

  // 计算统计
  const stats = calculateWeekStats(weekPlan, dayTodos)

  // 显示周总结
  displayWeekSummary(weekPlan, stats)

  // 显示每日完成情况
  displayDayTodosSummary(dayTodos)

  // 读取 corpus 信号
  const weekRange = getWeekRange(weekId)
  const corpusState = await readCorpusSignals(weekRange)

  // 生成询问问题
  const questions = generateQuestionsForAI(weekId, weekPlan, stats, dayTodos)
  console.log(questions)

  // 生成复盘
  const highlights = identifyCompletedHighlights(weekPlan, dayTodos)
  const review = generateWeekReview(weekPlan, stats, dayTodos, highlights)

  displayReview(review)

  console.log('\n🔍 验证任务-文档一致性...')
  const allTasks = [...weekPlan.tasks]
  for (const day of dayTodos) {
    for (const task of day.tasks) {
      if (!allTasks.find(t => t.title === task.title)) {
        allTasks.push(task)
      }
    }
  }

  const verification = await verifyTaskDocConsistency({
    window_type: 'weekly',
    window_id: weekId,
    plan: {
      tasks: allTasks.map(t => ({
        title: t.title,
        status: t.status,
        priority: t.priority,
        dod: t.dod,
        tags: t.tags
      }))
    },
    daily_plans: dayTodos.map(d => ({
      date: d.date,
      tasks: d.tasks
    })),
    corpus_dirs: ['docs/corpus', 'docs/posts', 'docs/dashboard'],
    git_enabled: true
  })

  displayVerificationContext(verification)

  if (!autoApprove && !dryRun) {
    console.log('═══════════════════════════════════════')
    console.log('⏸️  等待确认')
    console.log('═══════════════════════════════════════')
    console.log('请回答以上问题以完善复盘。')
    console.log('设置 AUTO_APPROVE=true 可跳过确认直接写入。')
    console.log('使用 --dry-run 可预览而不写入文件。')
    console.log('使用 --no-backlog 跳过 monthBacklogs 更新。\n')
    return
  }

  const filesToCommit: string[] = []

  // 更新周计划文件（添加 review 字段）
  const weekFile = `${CONFIG.paths.weekTasks}/${weekId}.yml`
  const reviewYaml = createWeekReviewYaml(review)

  if (dryRun) {
    console.log('🏃 DRY RUN 模式 - 不写入文件')
    console.log(`\n将要更新: ${weekFile}`)
    console.log('\n复盘内容预览:')
    console.log(reviewYaml.slice(0, 500) + '...')
  }
  else {
    const finalContent = mergeWeekReviewWithExisting(weekFile, reviewYaml)
    writeFileSync(weekFile, finalContent, 'utf-8')
    console.log(`✅ 周复盘已更新: ${weekFile}`)
    filesToCommit.push(weekFile)
  }

  // 生成 advisor 文件
  const advisorFile = `${CONFIG.paths.advisor}/${weekId}-end.md`
  if (!dryRun) {
    ensureDir(CONFIG.paths.advisor)
    const advisorContent = generateAdvisorContent(
      weekId,
      context,
      weekPlan,
      dayTodos,
      stats,
      review,
      corpusState,
    )
    writeFileSync(advisorFile, advisorContent, 'utf-8')
    console.log(`✅ Advisor 文件已写入: ${advisorFile}`)
    filesToCommit.push(advisorFile)
  }

  // 可选：更新 monthBacklogs
  if (updateBacklog && !dryRun) {
    const monthId = weekId.slice(0, 7)
    const backlogFile = `${CONFIG.paths.monthBacklogs}/${monthId}.yml`
    if (existsSync(backlogFile)) {
      const backlogUpdate = generateMonthBacklogUpdate(weekId, review)
      const existingBacklog = readFileSync(backlogFile, 'utf-8')
      const updatedBacklog = `${existingBacklog}\n\n${backlogUpdate.content}`
      writeFileSync(backlogFile, updatedBacklog, 'utf-8')
      console.log(`✅ 月度 Backlog 已更新: ${backlogFile}`)
      filesToCommit.push(backlogFile)
    }
  }

  // Git 工作流
  if (!dryRun && filesToCommit.length > 0) {
    console.log('\n📦 执行 Git 工作流...')
    const gitResult = await executeGitWorkflow(weekId, filesToCommit)

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
