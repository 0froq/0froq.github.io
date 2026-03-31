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
# Day Todo & Review
# Date: 2026-03-31

# 在此区域上方添加手动任务

tasks: []

# AI-DAY-REVIEW-START
# 以下内容由 AI 生成，可被覆盖

date: "2026-03-31"
weekday: "星期二"

tasks:
  - title: 任务1
    priority: high
    status: done

review:
  summary: "今日完成 3 项任务"
  completed:
    - "任务1"
  deferred: []
  cancelled: []
  energy: high
  notes: []

meta:
  generatedAt: "2026-03-31T22:00:00Z"
  basedOn: ["day-todo", "interactive-answers"]

# AI-DAY-REVIEW-END

# 在此区域下方添加备注和详细复盘
```

## 写入逻辑

```typescript
const MARKERS = {
  START: '# AI-DAY-REVIEW-START',
  END: '# AI-DAY-REVIEW-END'
}

async function writeDayReview(
  today: string,
  aiContent: string,
  dryRun: boolean = false
): Promise<WriteResult> {
  const filePath = `docs/dashboard/dayTodos/${today}.yml`
  const exists = await fileExists(filePath)
  
  let finalContent: string
  
  if (!exists) {
    finalContent = createNewFile(today, aiContent)
  } else {
    const existingContent = await readFile(filePath, 'utf-8')
    finalContent = mergeContent(existingContent, aiContent)
  }
  
  if (!dryRun) {
    await ensureDir(dirname(filePath))
    await writeFile(filePath, finalContent, 'utf-8')
  }
  
  return { filePath, created: !exists, updated: exists }
}
```

## 合并策略

```typescript
function mergeContent(existing: string, aiContent: string): string {
  const startIndex = existing.indexOf(MARKERS.START)
  const endIndex = existing.indexOf(MARKERS.END)
  
  // 标记存在且有效 - 替换中间内容
  if (startIndex !== -1 && endIndex !== -1 && startIndex < endIndex) {
    const before = existing.slice(0, startIndex + MARKERS.START.length)
    const after = existing.slice(endIndex)
    const aiBody = aiContent
      .replace(new RegExp(`.*?${MARKERS.START}\\n`, 's'), '')
      .replace(new RegExp(`${MARKERS.END}.*`, 's'), '')
    return `${before}\n\n${aiBody}\n${after}`
  }
  
  // 只有 START 标记（损坏）
  if (startIndex !== -1 && endIndex === -1) {
    const before = existing.slice(0, startIndex + MARKERS.START.length)
    return `${before}\n\n${aiContent}\n\n${MARKERS.END}\n`
  }
  
  // 只有 END 标记（损坏）
  if (startIndex === -1 && endIndex !== -1) {
    return `${existing.slice(0, endIndex)}\n${MARKERS.START}\n\n${aiContent}\n${existing.slice(endIndex)}`
  }
  
  // 没有标记（旧文件格式）
  return `${existing}\n\n${MARKERS.START}\n\n${aiContent}\n\n${MARKERS.END}\n`
}
```

## YAML 构造

```typescript
function createDayTodoYaml(dayTodo: DayTodo): string {
  const tasksYaml = dayTodo.tasks.map((t: Task) => {
    let taskStr = `  - title: ${t.title}
    priority: ${t.priority}
    status: ${t.status}`
    
    if (t.dod) {
      taskStr += `\n    dod: ${t.dod}`
    }
    
    if (t.links?.length) {
      taskStr += `\n    links:\n${t.links.map(l => 
        `      - label: ${l.label}\n        url: ${l.url}`
      ).join('\n')}`
    }
    
    return taskStr
  }).join('\n')

  return `# Day Todo & Review
# Date: ${dayTodo.date}
# Created: ${new Date().toISOString()}

# 在此区域上方添加手动任务

tasks: []

${MARKERS.START}

date: "${dayTodo.date}"
weekday: "${dayTodo.weekday}"

tasks:
${tasksYaml}

${MARKERS.END}

# 在此区域下方添加备注和详细复盘
`
}
```
