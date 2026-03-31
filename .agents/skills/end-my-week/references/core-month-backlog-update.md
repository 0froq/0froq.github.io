---
name: core-month-backlog-update
description: 可选的 monthBacklogs 轻量更新逻辑
---

# 月度 Backlog 更新

## 目的

在周复盘时，轻量更新月度 backlog，实现：

1. **标记已完成任务**：将本周完成的任务标记为 done
2. **回收未完成任务**：将推迟的任务退回 backlog
3. **更新任务状态**：反映最新的优先级和截止日期变化
4. **可选执行**：用户可通过 `--no-backlog` 跳过

## 触发条件

```typescript
interface BacklogUpdateOptions {
  enabled: boolean        // 是否启用（默认 true）
  dryRun: boolean        // 干跑模式
  markCompleted: boolean // 标记已完成任务（默认 true）
  recycleDeferred: boolean // 回收推迟任务（默认 true）
}

function shouldUpdateBacklog(options: BacklogUpdateOptions): boolean {
  return options.enabled && !options.dryRun
}
```

## 文件路径

```typescript
const BACKLOG_PATH = (monthId: string) => 
  `docs/dashboard/monthBacklogs/${monthId}.yml`

// monthId 格式: YYYY-MM
function getMonthId(weekId: string): string {
  return weekId.slice(0, 7) // "2026-03-31" -> "2026-03"
}
```

## Backlog 文件结构

```yaml
theme: 3月主题
description: 技能系统重构月

# 任务池
tasks:
  - title: 完成技能系统重构
    priority: high
    estimatedDays: 5
    deadline: "2026-03-15"
    status: done          # <- 更新为 done
    completedInWeek: "2026-03-10"  # <- 添加完成周
    
  - title: 阅读《思考，快与慢》
    priority: medium
    estimatedDays: 3
    status: inProgress    # <- 更新为 inProgress
    startedInWeek: "2026-03-24"    # <- 添加开始周
    
  - title: 整理笔记库
    priority: low
    estimatedDays: 2
    status: todo          # <- 从推迟回收，恢复为 todo
    recycledFromWeek: "2026-03-31" # <- 添加来源周
```

## 更新逻辑

```typescript
interface BacklogUpdate {
  markCompleted: Array<{
    title: string
    completedWeek: string
  }>
  recycleDeferred: Array<{
    title: string
    reason: string
    sourceWeek: string
  }>
  updateStatus: Array<{
    title: string
    newStatus: string
    notes?: string
  }>
}

async function updateMonthBacklog(
  weekId: string,
  weekReview: WeekReview,
  options: BacklogUpdateOptions
): Promise<BacklogUpdateResult> {
  const monthId = getMonthId(weekId)
  const backlogPath = BACKLOG_PATH(monthId)

  // 检查文件是否存在
  if (!await fileExists(backlogPath)) {
    console.log(`⚠️ 月度 backlog 不存在: ${backlogPath}，跳过更新`)
    return { updated: false, reason: 'file_not_found' }
  }

  // 读取现有 backlog
  const backlog = await readYaml(backlogPath)
  if (!backlog || !backlog.tasks) {
    console.log('⚠️ Backlog 格式异常，跳过更新')
    return { updated: false, reason: 'invalid_format' }
  }

  // 计算需要更新的内容
  const update: BacklogUpdate = calculateBacklogUpdate(
    backlog.tasks,
    weekReview,
    weekId
  )

  if (options.dryRun) {
    console.log('🏃 DRY RUN 模式 - Backlog 不会更新')
    displayPlannedUpdates(update)
    return { updated: false, reason: 'dry_run' }
  }

  // 应用更新
  const updatedTasks = applyBacklogUpdate(
    backlog.tasks,
    update,
    options
  )

  // 生成更新后的 YAML
  const updatedBacklog = {
    ...backlog,
    tasks: updatedTasks,
    meta: {
      ...backlog.meta,
      lastUpdated: new Date().toISOString(),
      lastUpdatedBy: 'end-my-week'
    }
  }

  // 写入文件
  await writeFile(backlogPath, yamlStringify(updatedBacklog), 'utf-8')

  console.log(`✅ 月度 backlog 已更新: ${backlogPath}`)
  displayAppliedUpdates(update)

  return {
    updated: true,
    markedCompleted: update.markCompleted.length,
    recycledDeferred: update.recycleDeferred.length
  }
}
```

## 计算更新内容

```typescript
function calculateBacklogUpdate(
  backlogTasks: BacklogTask[],
  weekReview: WeekReview,
  weekId: string
): BacklogUpdate {
  const update: BacklogUpdate = {
    markCompleted: [],
    recycleDeferred: [],
    updateStatus: []
  }

  // 1. 标记已完成的任务
  for (const completedTask of weekReview.completed) {
    const backlogTask = backlogTasks.find(t => 
      t.title === completedTask || 
      t.title.includes(completedTask) ||
      completedTask.includes(t.title)
    )
    
    if (backlogTask && backlogTask.status !== 'done') {
      update.markCompleted.push({
        title: backlogTask.title,
        completedWeek: weekId
      })
    }
  }

  // 2. 回收推迟的任务
  for (const deferred of weekReview.deferred) {
    const backlogTask = backlogTasks.find(t => t.title === deferred.title)
    
    if (backlogTask) {
      if (deferred.suggestion === 'backlog') {
        update.recycleDeferred.push({
          title: deferred.title,
          reason: deferred.reason,
          sourceWeek: weekId
        })
      } else if (deferred.suggestion === 'nextWeek') {
        // 保持状态，但记录仍在进行中
        update.updateStatus.push({
          title: deferred.title,
          newStatus: 'inProgress',
          notes: `推迟到下周: ${deferred.reason}`
        })
      }
    }
  }

  // 3. 更新进行中的任务
  for (const handoff of weekReview.handoff) {
    const backlogTask = backlogTasks.find(t => t.title === handoff)
    
    if (backlogTask && backlogTask.status === 'todo') {
      update.updateStatus.push({
        title: handoff,
        newStatus: 'inProgress',
        notes: '本周已开始，下周继续'
      })
    }
  }

  return update
}
```

## 应用更新

```typescript
function applyBacklogUpdate(
  tasks: BacklogTask[],
  update: BacklogUpdate,
  options: BacklogUpdateOptions
): BacklogTask[] {
  return tasks.map(task => {
    // 1. 标记已完成
    if (options.markCompleted) {
      const completed = update.markCompleted.find(m => m.title === task.title)
      if (completed) {
        return {
          ...task,
          status: 'done',
          completedInWeek: completed.completedWeek,
          completedAt: new Date().toISOString()
        }
      }
    }

    // 2. 回收推迟的任务
    if (options.recycleDeferred) {
      const recycled = update.recycleDeferred.find(r => r.title === task.title)
      if (recycled) {
        return {
          ...task,
          status: 'todo',
          recycledFromWeek: recycled.sourceWeek,
          recycleReason: recycled.reason,
          priority: adjustPriority(task.priority) // 可能降低优先级
        }
      }
    }

    // 3. 更新状态
    const statusUpdate = update.updateStatus.find(u => u.title === task.title)
    if (statusUpdate) {
      return {
        ...task,
        status: statusUpdate.newStatus,
        notes: statusUpdate.notes
      }
    }

    return task
  })
}

function adjustPriority(current: Priority): Priority {
  // 被回收的任务通常优先级降低
  const priorityMap: Record<Priority, Priority> = {
    high: 'medium',
    medium: 'low',
    low: 'low'
  }
  return priorityMap[current]
}
```

## 显示更新摘要

```typescript
function displayPlannedUpdates(update: BacklogUpdate): void {
  console.log('\n📋 计划中的 Backlog 更新:')
  console.log('═══════════════════════════════════════')

  if (update.markCompleted.length > 0) {
    console.log(`\n✅ 标记为完成 (${update.markCompleted.length}项):`)
    update.markCompleted.forEach(m => console.log(`   • ${m.title}`))
  }

  if (update.recycleDeferred.length > 0) {
    console.log(`\n♻️  回收至 backlog (${update.recycleDeferred.length}项):`)
    update.recycleDeferred.forEach(r => 
      console.log(`   • ${r.title} (${r.reason})`)
    )
  }

  if (update.updateStatus.length > 0) {
    console.log(`\n📝 状态更新 (${update.updateStatus.length}项):`)
    update.updateStatus.forEach(u => 
      console.log(`   • ${u.title} -> ${u.newStatus}`)
    )
  }

  if (update.markCompleted.length === 0 && 
      update.recycleDeferred.length === 0 &&
      update.updateStatus.length === 0) {
    console.log('ℹ️  无需更新')
  }

  console.log('═══════════════════════════════════════')
}

function displayAppliedUpdates(update: BacklogUpdate): void {
  const total = update.markCompleted.length + 
                update.recycleDeferred.length + 
                update.updateStatus.length
  
  console.log(`   已更新 ${total} 个任务:`)
  if (update.markCompleted.length > 0) {
    console.log(`   • ${update.markCompleted.length} 项标记为完成`)
  }
  if (update.recycleDeferred.length > 0) {
    console.log(`   • ${update.recycleDeferred.length} 项回收至 backlog`)
  }
  if (update.updateStatus.length > 0) {
    console.log(`   • ${update.updateStatus.length} 项状态更新`)
  }
}
```

## 命令行选项

```bash
# 标准模式（更新 backlog）
npx tsx skills/end-my-week/index.ts

# 跳过 backlog 更新
npx tsx skills/end-my-week/index.ts --no-backlog

# 干跑模式（预览不写入）
npx tsx skills/end-my-week/index.ts --dry-run
```

## 配置选项

```typescript
// 在 index.ts 中的默认配置
const BACKLOG_CONFIG = {
  enabled: true,              // 默认启用
  markCompleted: true,        // 标记已完成
  recycleDeferred: true,      // 回收推迟任务
  adjustPriority: true,       // 自动调整回收任务的优先级
  minMatchScore: 0.8          // 任务名称匹配的最小相似度
}

// 从命令行参数解析
function parseBacklogOptions(args: string[]): BacklogUpdateOptions {
  return {
    enabled: !args.includes('--no-backlog'),
    dryRun: args.includes('--dry-run'),
    markCompleted: true,
    recycleDeferred: true
  }
}
```

## 更新规则总结

| 来源 | 目标状态 | 条件 | 附加字段 |
|------|----------|------|----------|
| weekReview.completed | done | 匹配到 backlog 任务 | completedInWeek, completedAt |
| weekReview.deferred (backlog) | todo | suggestion === 'backlog' | recycledFromWeek, recycleReason |
| weekReview.deferred (nextWeek) | inProgress | suggestion === 'nextWeek' | 添加推迟备注 |
| weekReview.handoff | inProgress | 原为 todo | 添加进行中备注 |

## 注意事项

1. **轻量更新**：只更新状态字段，不修改任务描述
2. **容错匹配**：任务名称使用模糊匹配，允许轻微差异
3. **优先级调整**：回收的任务自动降低优先级
4. **可选执行**：用户可选择跳过，手动管理 backlog
5. **不删除任务**：只更新状态，不删除任何任务
