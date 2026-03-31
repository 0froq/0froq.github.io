#!/usr/bin/env node
/**
 * end-my-day Skill
 * 
 * 在每日结束时自动生成日复盘，基于当天计划执行情况、任务状态变更、
 * 能量水平记录及 corpus 状态信号。
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

const CONFIG = {
  paths: {
    dashboard: 'docs/dashboard',
    corpus: 'docs/corpus',
    weekTasks: 'docs/dashboard/weekTasks',
    advisor: 'docs/dashboard/advisor',
    dayTodos: 'docs/dashboard/dayTodos',
    hints: 'docs/dashboard/hints',
  },
  markers: {
    start: '# AI-DAY-REVIEW-START',
    end: '# AI-DAY-REVIEW-END',
  },
  git: {
    commitPrefix: 'docs(dashboard):',
    remote: 'origin',
  },
}

interface Task {
  title: string
  priority: 'high' | 'medium' | 'low'
  dod?: string
  status: 'done' | 'inProgress' | 'notStarted' | 'deferred' | 'deffered' | 'cancelled' | 'blocked'
  links?: { label: string; url: string }[]
  tags?: string[]
  carryOverFrom?: string
  reason?: string
}

interface DayTodo {
  date: string
  weekday: string
  tasks: Task[]
  completedTasks: number
  totalTasks: number
  theme?: string
  review?: {
    summary: string
    completed: string[]
    deferred: Array<{
      title: string
      reason: string
      suggestion: 'tomorrow' | 'thisWeek' | 'backlog' | 'drop'
    }>
    cancelled: string[]
    energy: 'low' | 'medium' | 'high' | 'mixed' | 'anxious' | 'scattered' | 'stressed'
    notes: string[]
  }
  meta?: {
    generatedAt: string
    basedOn: string[]
  }
}

interface WeekPlan {
  weekId: string
  theme: string
  tasks: Task[]
  review?: {
    energyLevel?: number
    mood?: 'positive' | 'neutral' | 'negative' | 'mixed'
    insights?: string[]
    adjustments?: string[]
  }
}

interface Fence {
  dailyCapacity?: number
  energyPatterns?: Record<string, unknown>
  [key: string]: unknown
}

interface CorpusEntry {
  date: string
  content: string
  tags?: string[]
  energy?: string
  mood?: string
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

interface InteractiveAnswers {
  completedTasks: string[]
  incompleteTasks: string[]
  newTasks: string[]
  energyStatus: 'low' | 'medium' | 'high' | 'mixed' | 'anxious' | 'scattered' | 'stressed'
  deferredTasks: Array<{
    title: string
    reason: string
    suggestion: 'tomorrow' | 'thisWeek' | 'backlog' | 'drop'
  }>
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

function getToday(): string {
  return new Date().toISOString().slice(0, 10)
}

function getWeekId(date: Date = new Date()): string {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(d.setDate(diff))
  return monday.toISOString().slice(0, 10)
}

function getWeekday(date: string): string {
  const d = new Date(date)
  return d.toLocaleDateString('zh-CN', { weekday: 'long' })
}

async function readDayTodo(today: string): Promise<DayTodo | null> {
  const filePath = `${CONFIG.paths.dayTodos}/${today}.yml`
  
  if (!existsSync(filePath)) return null
  
  const data = readYaml(filePath) || {}
  const tasks = (data.tasks || []) as Task[]
  
  return {
    date: today,
    weekday: getWeekday(today),
    tasks,
    completedTasks: tasks.filter((t: Task) => t.status === 'done').length,
    totalTasks: tasks.length,
    theme: data.theme as string,
    review: data.review as DayTodo['review'],
    meta: data.meta as DayTodo['meta'],
  }
}

async function readWeekPlan(weekId: string): Promise<WeekPlan | null> {
  const filePath = `${CONFIG.paths.weekTasks}/${weekId}.yml`
  
  if (!existsSync(filePath)) return null
  
  const data = readYaml(filePath) || {}
  const tasks = (data.tasks || []) as Task[]
  
  return {
    weekId,
    theme: (data.theme as string) || '本周计划',
    tasks,
    review: data.review as WeekPlan['review'],
  }
}

async function readFence(): Promise<Fence> {
  const filePath = `${CONFIG.paths.hints}/fence.yml`
  return (readYaml(filePath) || {}) as Fence
}

async function readAdvisorFiles(today: string, weekId: string): Promise<{ dayAdvisor?: string; weekAdvisor?: string }> {
  const result: { dayAdvisor?: string; weekAdvisor?: string } = {}
  
  const dayAdvisorPath = `${CONFIG.paths.advisor}/${today}-start.md`
  const weekAdvisorPath = `${CONFIG.paths.advisor}/${weekId}-start.md`
  
  if (existsSync(dayAdvisorPath)) {
    result.dayAdvisor = readFileSync(dayAdvisorPath, 'utf-8')
  }
  
  if (existsSync(weekAdvisorPath)) {
    result.weekAdvisor = readFileSync(weekAdvisorPath, 'utf-8')
  }
  
  return result
}

async function readCorpusSignals(today: string): Promise<SynthesizedState> {
  void today
  return {
    overallEnergy: 'neutral',
    overallMood: 'neutral',
    intensity: 'moderate',
    recommendations: [],
    writingFrequency: 0,
  }
}

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

  if (dayTodo) {
    lines.push(
      `📋 今日计划任务: ${dayTodo.totalTasks} 项`,
      `✅ 已完成: ${dayTodo.completedTasks}`,
      `⏳ 待完成: ${dayTodo.totalTasks - dayTodo.completedTasks}`,
      '',
    )
    
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
        const prio = task.priority === 'high' ? '🔴' : task.priority === 'medium' ? '🟡' : '🟢'
        lines.push(`${i + 1}. ${emoji} ${prio} ${task.title}`)
      })
      lines.push('')
    }
  }

  if (weekPlan) {
    lines.push(
      '═══════════════════════════════════════',
      `📅 本周主题: ${weekPlan.theme}`,
      '═══════════════════════════════════════',
      '',
    )
  }

  lines.push(
    '═══════════════════════════════════════',
    '1️⃣  今天实际完成了哪些任务？（输入序号或任务名，逗号分隔）',
    '═══════════════════════════════════════',
    '示例: 1,3,5 或 完成代码审查,提交PR',
    '',
    '═══════════════════════════════════════',
    '2️⃣  哪些计划内任务没有完成？（输入序号或任务名）',
    '═══════════════════════════════════════',
    '请说明未完成的原因...',
    '',
    '═══════════════════════════════════════',
    '3️⃣  有没有临时新增任务或突发事件？',
    '═══════════════════════════════════════',
    '如果有，请描述任务内容和处理情况...',
    '',
    '═══════════════════════════════════════',
    '4️⃣  今天状态评价？',
    '═══════════════════════════════════════',
    '- low: 低能量，效率低下',
    '- medium: 正常水平',
    '- high: 高能量，专注高效',
    '- mixed: 波动较大',
    '- anxious: 焦虑/压力大',
    '- scattered: 注意力分散',
    '- stressed: 高压状态',
    '',
    '═══════════════════════════════════════',
    '5️⃣  未完成任务的处理建议？',
    '═══════════════════════════════════════',
    '对于每个未完成任务，建议：',
    '- tomorrow: 推迟到明天',
    '- thisWeek: 推迟到本周其他时间',
    '- backlog: 退回backlog',
    '- drop: 放弃/取消',
    '',
  )

  void corpusState

  return lines.join('\n')
}

function parseInteractiveAnswers(
  _dayTodo: DayTodo | null,
  _rawInput: string,
): InteractiveAnswers {
  void _dayTodo
  void _rawInput
  
  return {
    completedTasks: [],
    incompleteTasks: [],
    newTasks: [],
    energyStatus: 'medium',
    deferredTasks: [],
  }
}

function updateTaskStatuses(
  tasks: Task[],
  answers: InteractiveAnswers,
): Task[] {
  return tasks.map((task) => {
    const isCompleted = answers.completedTasks.some(
      ct => ct === task.title || task.title.includes(ct)
    )
    const isDeferred = answers.deferredTasks.some(
      dt => dt.title === task.title || task.title.includes(dt.title)
    )
    const isCancelled = answers.incompleteTasks.some(
      it => it === task.title || task.title.includes(it)
    ) && !isDeferred

    if (isCompleted) {
      return { ...task, status: 'done' as const }
    }
    if (isCancelled) {
      return { ...task, status: 'cancelled' as const }
    }
    if (isDeferred) {
      const deferredInfo = answers.deferredTasks.find(
        dt => dt.title === task.title || task.title.includes(dt.title)
      )
      return { 
        ...task, 
        status: 'deferred' as const,
        reason: deferredInfo?.reason,
      }
    }
    return task
  })
}

function generateDayReview(
  today: string,
  dayTodo: DayTodo | null,
  answers: InteractiveAnswers,
): DayTodo {
  const updatedTasks = dayTodo 
    ? updateTaskStatuses(dayTodo.tasks, answers)
    : []
  
  const completedTasks = updatedTasks.filter(t => t.status === 'done')
  const deferredTasksList = answers.deferredTasks
  const cancelledTasks = updatedTasks.filter(t => t.status === 'cancelled')

  const summary = completedTasks.length > 0
    ? `今日完成 ${completedTasks.length} 项任务${deferredTasksList.length > 0 ? `，${deferredTasksList.length} 项延期` : ''}`
    : '今日未有明确完成记录'

  return {
    date: today,
    weekday: getWeekday(today),
    tasks: updatedTasks,
    completedTasks: completedTasks.length,
    totalTasks: updatedTasks.length,
    theme: dayTodo?.theme,
    review: {
      summary,
      completed: completedTasks.map(t => t.title),
      deferred: deferredTasksList,
      cancelled: cancelledTasks.map(t => t.title),
      energy: answers.energyStatus,
      notes: [
        ...(answers.newTasks.length > 0 ? [`临时新增: ${answers.newTasks.join(', ')}`] : []),
      ],
    },
    meta: {
      generatedAt: new Date().toISOString(),
      basedOn: ['day-todo', 'interactive-answers'],
    },
  }
}

function createDayTodoYaml(dayTodo: DayTodo): string {
  const tasksYaml = dayTodo.tasks.map((t: Task) => {
    let taskStr = `  - title: ${t.title}
    priority: ${t.priority}
    status: ${t.status}`
    
    if (t.dod) {
      taskStr += `
    dod: ${t.dod}`
    }
    
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
    
    if (t.reason) {
      taskStr += `
    reason: ${t.reason}`
    }
    
    return taskStr
  }).join('\n')

  const review = dayTodo.review
  const reviewYaml = review ? `
review:
  summary: "${review.summary}"
  completed:
${review.completed.map(c => `    - "${c}"`).join('\n') || '    []'}
  deferred:
${review.deferred.map(d => `    - title: "${d.title}"\n      reason: "${d.reason}"\n      suggestion: ${d.suggestion}`).join('\n') || '    []'}
  cancelled:
${review.cancelled.map(c => `    - "${c}"`).join('\n') || '    []'}
  energy: ${review.energy}
  notes:
${review.notes.map(n => `    - "${n}"`).join('\n') || '    []'}
` : ''

  const header = `# Day Todo & Review
# Date: ${dayTodo.date}
# Created: ${new Date().toISOString()}

# 在此区域上方添加手动任务

tasks: []

${CONFIG.markers.start}

date: "${dayTodo.date}"
weekday: "${dayTodo.weekday}"
${dayTodo.theme ? `theme: "${dayTodo.theme}"` : ''}

tasks:
${tasksYaml || '  []'}
${reviewYaml}
meta:
  generatedAt: "${dayTodo.meta?.generatedAt}"
  basedOn: [${dayTodo.meta?.basedOn.map(b => `"${b}"`).join(', ')}]

${CONFIG.markers.end}

# 在此区域下方添加备注和详细复盘
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
  today: string,
  dayTodo: DayTodo | null,
  weekPlan: WeekPlan | null,
  dayReview: DayTodo,
  corpusState: SynthesizedState,
): string {
  const completedTasks = dayReview.review?.completed || []
  const deferredTasks = dayReview.review?.deferred || []
  const cancelledTasks = dayReview.review?.cancelled || []
  const energy = dayReview.review?.energy || 'medium'
  
  const plannedCount = dayTodo?.totalTasks || 0
  const completedCount = completedTasks.length
  const completionRate = plannedCount > 0 ? Math.round((completedCount / plannedCount) * 100) : 0
  
  const taskTable = dayReview.tasks.map(t => {
    const status = t.status === 'done' ? '✅ 完成' : 
                   t.status === 'inProgress' ? '🔄 进行中' :
                   t.status === 'deferred' ? '⏸️ 延期' :
                   t.status === 'cancelled' ? '❌ 取消' : '⏳ 未开始'
    return `| ${t.title} | ${t.priority} | ${status} |`
  }).join('\n')

  const energyEmoji: Record<string, string> = {
    low: '😴',
    medium: '😐',
    high: '⚡',
    mixed: '📊',
    anxious: '😰',
    scattered: '🌀',
    stressed: '🔥',
  }

  return `---
date: "${today}"
generatedAt: "${new Date().toISOString()}"
type: "day-end-advisor"
weekId: "${getWeekId(new Date(today))}"
---

# Day Advisor: ${today}

## 时间信息

- **日期**: ${today} (${getWeekday(today)})
- **生成时间**: ${new Date().toLocaleString('zh-CN')}
- **所属周**: ${weekPlan?.weekId || getWeekId(new Date(today))}

## 执行情况摘要

### 完成统计

- **计划任务**: ${plannedCount} 项
- **实际完成**: ${completedCount} 项
- **完成率**: ${completionRate}%
- **延期任务**: ${deferredTasks.length} 项
- **取消任务**: ${cancelledTasks.length} 项

### 能量状态

${energyEmoji[energy] || '⚪'} ${energy}

- Corpus 信号: ${corpusState.overallEnergy} / ${corpusState.overallMood}
${corpusState.recommendations.map(r => `- ${r}`).join('\n')}

## 任务详情

| 任务 | 优先级 | 状态 |
|------|--------|------|
${taskTable || '| 无 | - | - |'}

## 复盘摘要

${dayReview.review?.summary || '无复盘记录'}

## 明日建议

### 优先处理

${deferredTasks.filter(d => d.suggestion === 'tomorrow').map(d => `- [ ] ${d.title} (延期自今日)`).join('\n') || '- 无延期任务'}

### 本周剩余

${deferredTasks.filter(d => d.suggestion === 'thisWeek').map(d => `- [ ] ${d.title}`).join('\n') || '- 无'}

### Backlog

${deferredTasks.filter(d => d.suggestion === 'backlog').map(d => `- ${d.title}`).join('\n') || '- 无'}

### 建议调整

${dayReview.review?.notes.map(n => `- ${n}`).join('\n') || '- 无特别建议'}

---
*此文件由 end-my-day 自动生成*
`
}

async function executeGitWorkflow(today: string, files: string[]): Promise<GitResult> {
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

    const commitMsg = `${CONFIG.git.commitPrefix} add day review for ${today}`
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

function displayDaySummary(dayTodo: DayTodo | null): void {
  if (!dayTodo) {
    console.log('📅 今日数据: 未找到今日计划\n')
    return
  }

  console.log('═══════════════════════════════════════')
  console.log(`📅 今日计划 (${dayTodo.date})`)
  console.log('═══════════════════════════════════════')
  console.log(`✅ 已完成: ${dayTodo.completedTasks}/${dayTodo.totalTasks}`)
  
  const inProgress = dayTodo.tasks.filter(t => t.status === 'inProgress').length
  const blocked = dayTodo.tasks.filter(t => t.status === 'blocked').length
  const notStarted = dayTodo.tasks.filter(t => t.status === 'notStarted').length
  
  if (inProgress > 0) console.log(`🔄 进行中: ${inProgress}`)
  if (blocked > 0) console.log(`🚫 阻塞中: ${blocked}`)
  if (notStarted > 0) console.log(`⏳ 未开始: ${notStarted}`)
  
  if (dayTodo.tasks.length > 0) {
    console.log('\n📋 任务列表:')
    dayTodo.tasks.forEach(t => {
      const emoji = t.status === 'done' ? '✅' : 
                    t.status === 'inProgress' ? '🔄' : 
                    t.status === 'blocked' ? '🚫' : '⏳'
      console.log(`   ${emoji} ${t.title} (${t.priority})`)
    })
  }
  console.log('')
}

function displayWeekContext(weekPlan: WeekPlan | null): void {
  if (!weekPlan) {
    console.log('📅 本周计划: 未找到\n')
    return
  }

  console.log('═══════════════════════════════════════')
  console.log(`📅 本周计划 (${weekPlan.weekId})`)
  console.log('═══════════════════════════════════════')
  console.log(`主题: ${weekPlan.theme}`)
  console.log(`总任务: ${weekPlan.tasks.length}`)
  
  const weekDone = weekPlan.tasks.filter(t => t.status === 'done').length
  const weekInProgress = weekPlan.tasks.filter(t => t.status === 'inProgress').length
  
  console.log(`本周已完成: ${weekDone}`)
  console.log(`本周进行中: ${weekInProgress}`)
  console.log('')
}

function displayReview(review: DayTodo): void {
  console.log('═══════════════════════════════════════')
  console.log('🌙 今日复盘')
  console.log('═══════════════════════════════════════')
  console.log(`\n${review.review?.summary || '无复盘摘要'}\n`)
  
  if (review.review?.completed.length) {
    console.log('✅ 已完成:')
    review.review.completed.forEach(t => console.log(`   • ${t}`))
  }
  
  if (review.review?.deferred.length) {
    console.log('\n⏸️  延期:')
    review.review.deferred.forEach(d => console.log(`   • ${d.title} → ${d.suggestion}`))
  }
  
  if (review.review?.cancelled.length) {
    console.log('\n❌ 取消:')
    review.review.cancelled.forEach(c => console.log(`   • ${c}`))
  }
  
  console.log(`\n💡 能量状态: ${review.review?.energy || 'medium'}`)
  console.log('')
}

async function main(): Promise<void> {
  const args = process.argv.slice(2)
  const dryRun = args.includes('--dry-run')
  const autoApprove = process.env.AUTO_APPROVE === 'true'

  console.log('🌙 end-my-day 启动\n')

  const today = getToday()
  const weekId = getWeekId()
  console.log(`📅 今日日期: ${today} (${getWeekday(today)})`)
  console.log(`📅 所属周: ${weekId}\n`)

  const dayTodo = await readDayTodo(today)
  displayDaySummary(dayTodo)

  const weekPlan = await readWeekPlan(weekId)
  displayWeekContext(weekPlan)

  const fence = await readFence()
  void fence

  const advisorFiles = await readAdvisorFiles(today, weekId)
  void advisorFiles

  const corpusState = await readCorpusSignals(today)

  const questions = generateQuestionsForAI(today, dayTodo, weekPlan, corpusState)
  console.log(questions)

  const answers = parseInteractiveAnswers(dayTodo, '')
  const dayReview = generateDayReview(today, dayTodo, answers)
  displayReview(dayReview)

  if (!autoApprove && !dryRun) {
    console.log('═══════════════════════════════════════')
    console.log('⏸️  等待确认')
    console.log('═══════════════════════════════════════')
    console.log('请回答以上问题以完善复盘。')
    console.log('设置 AUTO_APPROVE=true 可跳过确认直接写入。')
    console.log('使用 --dry-run 可预览而不写入文件。\n')
    return
  }

  const dayFile = `${CONFIG.paths.dayTodos}/${today}.yml`
  const yamlContent = createDayTodoYaml(dayReview)
  
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
    console.log(`✅ 日计划已更新: ${dayFile}`)
  }

  const advisorFile = `${CONFIG.paths.advisor}/${today}-end.md`
  if (!dryRun) {
    ensureDir(CONFIG.paths.advisor)
    const advisorContent = generateAdvisorContent(today, dayTodo, weekPlan, dayReview, corpusState)
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
