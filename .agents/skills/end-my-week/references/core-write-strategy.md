---
name: core-write-strategy
description: 非破坏性写入策略 - 使用标记锚点更新 AI 生成的复盘内容
---

# 非破坏性写入策略

## 核心原则

1. **不覆盖用户手动内容**：只修改 AI 生成的复盘部分
2. **可识别**：使用清晰的标记锚点
3. **可追加**：文件已存在时智能合并
4. **可回滚**：保留生成历史

## 标记锚点

```yaml
# 文件头部（用户手动维护）
theme: 用户手动设定的主题
tasks:
  - title: 用户手动任务
    priority: high
    status: done
    dod: 用户定义的完成标准

# 用户手动添加的复盘笔记
manualNotes: 用户自己的观察

# AI-WEEK-REVIEW-START
# 以下内容由 AI 生成，可被覆盖
# 生成时间: 2026-03-31T22:00:00Z

review:
  summary: 本周完成率 60%
  completed:
    - 任务1
    - 任务2
  deferred:
    - title: 整理笔记库
      reason: 时间不足
      suggestion: backlog
  cancelled: []
  energy: medium
  notes: 本周任务量适中，完成率良好
  handoff:
    - 下周继续的任务

# AI-WEEK-REVIEW-END

# 文件尾部（用户手动维护）
nextWeekNotes: 用户为下周做的准备笔记
```

## 标记常量

```typescript
const MARKERS = {
  START: '# AI-WEEK-REVIEW-START',
  END: '# AI-WEEK-REVIEW-END'
} as const
```

## 写入逻辑

```typescript
interface WriteResult {
  filePath: string
  created: boolean
  updated: boolean
  content: string
}

async function writeWeekReview(
  weekId: string,
  reviewYaml: string,
  dryRun: boolean = false
): Promise<WriteResult> {
  const filePath = `docs/dashboard/weekTasks/${weekId}.yml`
  const exists = await fileExists(filePath)

  let finalContent: string

  if (!exists) {
    // 理论上不应该发生，因为复盘基于已有周计划
    console.warn('⚠️ 周计划文件不存在，创建新文件')
    finalContent = createNewWeekFile(weekId, reviewYaml)
  } else {
    const existingContent = await readFile(filePath, 'utf-8')
    finalContent = mergeWeekReviewWithExisting(existingContent, reviewYaml)
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
```

## 合并策略

```typescript
function mergeWeekReviewWithExisting(
  existing: string,
  reviewYaml: string
): string {
  const startIdx = existing.indexOf(MARKERS.START)
  const endIdx = existing.indexOf(MARKERS.END)

  // 情况 1: 标记存在且有效
  if (startIdx !== -1 && endIdx !== -1 && startIdx < endIdx) {
    // 提取标记之前的内容（保留手动部分）
    const before = existing.slice(0, startIdx).trimEnd()
    // 提取标记之后的内容
    const after = existing.slice(endIdx + MARKERS.END.length)
    
    // 组合：before + 新review + after
    return `${before}\n\n${reviewYaml}\n${after}`
  }

  // 情况 2: 只有 START 标记（文件损坏）
  if (startIdx !== -1 && endIdx === -1) {
    const before = existing.slice(0, startIdx).trimEnd()
    return `${before}\n\n${reviewYaml}\n\n${MARKERS.END}\n`
  }

  // 情况 3: 只有 END 标记（文件损坏）
  if (startIdx === -1 && endIdx !== -1) {
    const after = existing.slice(endIdx + MARKERS.END.length)
    return `${existing.slice(0, endIdx).trimEnd()}\n${MARKERS.START}\n\n${reviewYaml}\n${after}`
  }

  // 情况 4: 没有标记（旧文件格式或全新文件）
  // 追加到文件末尾
  return `${existing.trimEnd()}\n\n${reviewYaml}\n`
}

function createNewWeekFile(weekId: string, reviewYaml: string): string {
  return `# Week Plan: ${weekId}
# Created: ${new Date().toISOString()}

theme: ''
tasks: []

${reviewYaml}
`
}
```

## 备份策略

```typescript
async function createBackupBeforeWrite(
  filePath: string
): Promise<string | null> {
  const backupDir = 'docs/dashboard/backups/weekTasks'
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const basename = filePath.split('/').pop() || 'backup'
  const backupPath = `${backupDir}/${basename}.${timestamp}.bak`

  await ensureDir(backupDir)

  if (await fileExists(filePath)) {
    const content = await readFile(filePath, 'utf-8')
    await writeFile(backupPath, content, 'utf-8')
    console.log(`📄 已创建备份: ${backupPath}`)
    return backupPath
  }

  return null
}
```

## 错误处理

```typescript
interface WriteError {
  type: 'PERMISSION_DENIED' | 'PARSE_ERROR' | 'CONFLICT' | 'IO_ERROR'
  message: string
  details?: unknown
}

async function safeWriteWeekReview(
  filePath: string,
  content: string
): Promise<{ success: true } | { success: false; error: WriteError }> {
  try {
    await ensureDir(dirname(filePath))
    await writeFile(filePath, content, 'utf-8')
    return { success: true }
  } catch (error) {
    const err = error as NodeJS.ErrnoException

    if (err.code === 'EACCES') {
      return {
        success: false,
        error: {
          type: 'PERMISSION_DENIED',
          message: `无权写入文件: ${filePath}`,
          details: error
        }
      }
    }

    if (err.code === 'ENOSPC') {
      return {
        success: false,
        error: {
          type: 'IO_ERROR',
          message: '磁盘空间不足',
          details: error
        }
      }
    }

    if (err.code === 'EBUSY') {
      return {
        success: false,
        error: {
          type: 'CONFLICT',
          message: '文件被其他程序占用',
          details: error
        }
      }
    }

    return {
      success: false,
      error: {
        type: 'IO_ERROR',
        message: `写入失败: ${err.message}`,
        details: error
      }
    }
  }
}
```

## 用户审核流程

```typescript
async function writeWithUserApproval(
  weekId: string,
  review: WeekReview,
  reviewYaml: string,
  dryRun: boolean
): Promise<void> {
  // 1. 输出自然语言版本供审核
  console.log('═══════════════════════════════════════')
  console.log('📋 本周复盘草案')
  console.log('═══════════════════════════════════════')
  console.log(`\n${review.summary}\n`)
  
  console.log('✅ 完成的关键任务:')
  review.completed.forEach(t => console.log(`   • ${t}`))
  
  if (review.handoff.length > 0) {
    console.log('\n🔄 建议带入下周:')
    review.handoff.forEach(t => console.log(`   • ${t}`))
  }
  
  if (review.deferred.length > 0) {
    console.log('\n⏸️  推迟处理:')
    review.deferred.forEach(d => console.log(`   • ${d.title} (${d.suggestion})`))
  }
  
  console.log(`\n⚡ 能量状态: ${review.energy}`)
  console.log(`📝 备注: ${review.notes}`)
  console.log('═══════════════════════════════════════')

  // 2. 检查环境变量
  const autoApprove = process.env.AUTO_APPROVE === 'true'

  if (dryRun) {
    console.log('\n🏃 DRY RUN 模式 - 不写入文件')
    console.log('\n将要写入的内容:')
    console.log('---')
    console.log(reviewYaml)
    console.log('---')
    return
  }

  if (!autoApprove) {
    console.log('\n⚠️  请在审核后设置 AUTO_APPROVE=true 以确认写入')
    console.log('   或手动编辑后重新运行')
    return
  }

  // 3. 创建备份
  const filePath = `docs/dashboard/weekTasks/${weekId}.yml`
  await createBackupBeforeWrite(filePath)

  // 4. 写入文件
  const result = await writeWeekReview(weekId, reviewYaml, false)

  if (result.updated) {
    console.log(`✅ 已更新复盘: ${result.filePath}`)
  } else {
    console.log(`✅ 已创建复盘: ${result.filePath}`)
  }
}
```

## 降级策略

```typescript
async function writeWithFallback(
  weekId: string,
  reviewYaml: string
): Promise<boolean> {
  const filePath = `docs/dashboard/weekTasks/${weekId}.yml`

  // 尝试主写入策略
  const result = await safeWriteWeekReview(filePath, reviewYaml)

  if (result.success) {
    return true
  }

  console.error(`❌ 写入失败: ${result.error.message}`)

  // 尝试备用路径
  const fallbackPath = `docs/dashboard/backups/weekTasks/${weekId}-review-${Date.now()}.yml`
  console.log(`🔄 尝试写入备用路径: ${fallbackPath}`)

  try {
    await ensureDir(dirname(fallbackPath))
    await writeFile(fallbackPath, reviewYaml, 'utf-8')
    console.log(`✅ 已写入备用路径: ${fallbackPath}`)
    console.log('   请手动合并到主文件')
    return true
  } catch (fallbackError) {
    console.error('❌ 备用写入也失败')
    return false
  }
}
```

## 完整集成示例

```typescript
async function executeWriteStrategy(
  weekId: string,
  review: WeekReview,
  options: { dryRun?: boolean; autoApprove?: boolean } = {}
): Promise<void> {
  const { dryRun = false, autoApprove = false } = options

  // 1. 生成 YAML
  const reviewYaml = createWeekReviewYaml(review)

  // 2. 用户审核（或自动批准）
  if (!autoApprove && !dryRun) {
    console.log('═══════════════════════════════════════')
    console.log('⏸️  等待确认')
    console.log('═══════════════════════════════════════')
    console.log('请审核以上复盘内容')
    console.log('设置 AUTO_APPROVE=true 可跳过确认直接写入')
    console.log('使用 --dry-run 可预览而不写入文件\n')
    return
  }

  // 3. 创建备份
  const filePath = `docs/dashboard/weekTasks/${weekId}.yml`
  if (!dryRun) {
    await createBackupBeforeWrite(filePath)
  }

  // 4. 写入
  const result = await writeWeekReview(weekId, reviewYaml, dryRun)

  // 5. 输出结果
  if (dryRun) {
    console.log('🏃 DRY RUN 模式 - 文件未写入')
  } else {
    console.log(`✅ 复盘已${result.updated ? '更新' : '创建'}: ${result.filePath}`)
  }
}
```
