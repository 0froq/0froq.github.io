---
name: core-write-strategy
description: 非破坏性写入策略 - 使用标记锚点更新 AI 生成内容
---

# 非破坏性写入策略

## 核心原则

1. **不覆盖用户手动内容**：只修改 AI 生成的部分
2. **可识别**：使用清晰的标记锚点
3. **可追加**：文件已存在时智能合并
4. **可回滚**：保留生成历史

## 标记锚点

```yaml
# 文件头部（用户手动维护）
theme: 用户手动设定的主题

# 用户手动添加的任务（在 AI 区域外）
tasks:
  - title: 用户手动任务
    priority: high
    dod: 用户自己定义
    status: notStarted

# AI-WEEK-PLAN-START
# 以下内容由 AI 生成，可被覆盖
aiGenerated:
  generatedAt: "2026-03-31T08:00:00Z"
  model: "start-my-week"
  
tasks:
  - title: AI 生成的任务 1
    priority: high
    dod: 完成定义
    status: notStarted
    tags:
      - forIdiot
# AI-WEEK-PLAN-END

# 文件尾部（用户手动维护）
notes: 用户笔记
```

## 写入逻辑

```typescript
const MARKERS = {
  START: '# AI-WEEK-PLAN-START',
  END: '# AI-WEEK-PLAN-END'
}

async function writeWeekPlan(
  weekId: string,
  aiContent: string,
  dryRun: boolean = false
): Promise<WriteResult> {
  const filePath = `docs/dashboard/weekTasks/${weekId}.yml`
  
  // 检查文件是否存在
  const exists = await fileExists(filePath)
  
  let finalContent: string
  
  if (!exists) {
    // 创建新文件
    finalContent = createNewFile(weekId, aiContent)
  } else {
    // 更新现有文件
    const existingContent = await readFile(filePath, 'utf-8')
    finalContent = mergeContent(existingContent, aiContent)
  }
  
  if (!dryRun) {
    await ensureDir(dirname(filePath))
    await writeFile(filePath, finalContent, 'utf-8')
  }
  
  return {
    filePath,
    created: !exists,
    updated: exists,
    content: finalContent
  }
}

function createNewFile(weekId: string, aiContent: string): string {
  const header = `# Week Plan: ${weekId}
# Created: ${new Date().toISOString()}

# 在此区域上方添加手动任务

tasks: []

${MARKERS.START}

${aiContent}

${MARKERS.END}

# 在此区域下方添加备注和复盘
`
  return header
}

function mergeContent(existing: string, aiContent: string): string {
  const startIndex = existing.indexOf(MARKERS.START)
  const endIndex = existing.indexOf(MARKERS.END)
  
  // 情况 1: 标记存在且有效
  if (startIndex !== -1 && endIndex !== -1 && startIndex < endIndex) {
    // 替换标记之间的内容
    const before = existing.slice(0, startIndex + MARKERS.START.length)
    const after = existing.slice(endIndex)
    
    return `${before}\n\n${aiContent}\n${after}`
  }
  
  // 情况 2: 只有 START 标记（损坏）
  if (startIndex !== -1 && endIndex === -1) {
    // 在文件末尾添加 END 标记和新内容
    const before = existing.slice(0, startIndex + MARKERS.START.length)
    return `${before}\n\n${aiContent}\n\n${MARKERS.END}\n`
  }
  
  // 情况 3: 只有 END 标记（损坏）
  if (startIndex === -1 && endIndex !== -1) {
    // 在 END 前插入 START 和内容
    const after = existing.slice(endIndex)
    return `${existing.slice(0, endIndex)}\n${MARKERS.START}\n\n${aiContent}\n${after}`
  }
  
  // 情况 4: 没有标记（旧文件格式）
  // 在文件末尾添加标记区域
  return `${existing}\n\n${MARKERS.START}\n\n${aiContent}\n\n${MARKERS.END}\n`
}
```

## YAML 合并策略

```typescript
async function mergeYamlIntelligently(
  existingPath: string,
  aiPlan: WeekPlan
): Promise<WeekPlan> {
  const existing = await readYaml(existingPath)
  
  // 保留用户的手动任务（不在 AI 区域内的任务）
  const manualTasks = (existing.tasks || []).filter((t: Task) => 
    !t._aiGenerated // 假设 AI 生成的任务有标记
  )
  
  // AI 生成的任务
  const aiTasks = aiPlan.tasks
  
  // 合并：手动任务在前，AI 任务在后
  const mergedTasks = [...manualTasks, ...aiTasks]
  
  // 去重（基于标题）
  const seen = new Set()
  const deduped = mergedTasks.filter(t => {
    if (seen.has(t.title)) return false
    seen.add(t.title)
    return true
  })
  
  return {
    ...existing,
    theme: existing.theme || aiPlan.theme, // 保留用户主题
    tasks: deduped,
    meta: {
      ...existing.meta,
      ...aiPlan.meta,
      lastUpdated: new Date().toISOString()
    }
  }
}
```

## 用户审核流程

```typescript
async function writeWithUserApproval(
  weekId: string,
  naturalVersion: string,
  yamlContent: string
): Promise<void> {
  // 1. 输出自然语言版本供审核
  console.log('═══════════════════════════════════════')
  console.log('📋 周计划草案')
  console.log('═══════════════════════════════════════')
  console.log(naturalVersion)
  console.log('═══════════════════════════════════════')
  
  // 2. 等待用户确认（在实际实现中，这需要交互式输入）
  // 这里使用环境变量或参数控制
  const autoApprove = process.env.AUTO_APPROVE === 'true'
  const dryRun = process.env.DRY_RUN === 'true'
  
  if (dryRun) {
    console.log('🏃 DRY RUN 模式 - 不写入文件')
    return
  }
  
  if (!autoApprove) {
    console.log('')
    console.log('⚠️  请在审核后设置 AUTO_APPROVE=true 以确认写入')
    console.log('   或手动编辑后重新运行')
    return
  }
  
  // 3. 写入文件
  const result = await writeWeekPlan(weekId, yamlContent, false)
  
  console.log(`✅ 已${result.created ? '创建' : '更新'}: ${result.filePath}`)
}
```

## 错误处理

```typescript
interface WriteError {
  type: 'PERMISSION_DENIED' | 'PARSE_ERROR' | 'CONFLICT' | 'IO_ERROR'
  message: string
  details?: unknown
}

async function safeWrite(
  filePath: string,
  content: string
): Promise<{ success: true } | { success: false; error: WriteError }> {
  try {
    await ensureDir(dirname(filePath))
    await writeFile(filePath, content, 'utf-8')
    return { success: true }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'EACCES') {
      return {
        success: false,
        error: {
          type: 'PERMISSION_DENIED',
          message: `无权写入文件: ${filePath}`,
          details: error
        }
      }
    }
    
    if ((error as NodeJS.ErrnoException).code === 'ENOSPC') {
      return {
        success: false,
        error: {
          type: 'IO_ERROR',
          message: '磁盘空间不足',
          details: error
        }
      }
    }
    
    return {
      success: false,
      error: {
        type: 'IO_ERROR',
        message: `写入失败: ${(error as Error).message}`,
        details: error
      }
    }
  }
}
```

## 备份策略

```typescript
async function createBackup(filePath: string): Promise<string> {
  const backupDir = 'docs/dashboard/backups/weekTasks'
  const timestamp = format(new Date(), 'yyyyMMdd-HHmmss')
  const basename = filePath.split('/').pop() || 'backup'
  const backupPath = `${backupDir}/${basename}.${timestamp}.bak`
  
  await ensureDir(backupDir)
  
  if (await fileExists(filePath)) {
    const content = await readFile(filePath, 'utf-8')
    await writeFile(backupPath, content, 'utf-8')
  }
  
  return backupPath
}
```
