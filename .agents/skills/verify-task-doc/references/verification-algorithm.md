---
name: verification-algorithm
description: 任务-文档一致性验证的核心算法，包括关联评分、不一致检测规则和判定逻辑
---

# 验证算法详解

## 1. 关联评分算法

### 输入
- `task`: 标准化后的任务对象
- `doc`: 文档对象（包含 frontmatter, path, git 信息）
- `git_evidence`: Git 提交证据

### 评分函数

```typescript
function calculateLinkScore(task: Task, doc: Document, git: GitEvidence): LinkScore {
  const evidence: Evidence[] = []
  let totalScore = 0
  
  // 1. Frontmatter 显式引用 (最高权重)
  if (doc.frontmatter.tasks?.includes(task.task_id)) {
    evidence.push({
      type: 'frontmatter_task_ref',
      score: 70,
      value: task.task_id
    })
    totalScore += 70
  }
  
  // 2. Commit message 引用
  if (git.commitMessage?.includes(task.task_id) || 
      git.commitMessage?.includes(task.title)) {
    evidence.push({
      type: 'commit_message_ref',
      score: 50,
      value: git.commitSha
    })
    totalScore += 50
  }
  
  // 3. 路径匹配 expected_paths
  if (task.expected_paths?.some(pattern => 
    minimatch(doc.path, pattern)
  )) {
    evidence.push({
      type: 'path_match',
      score: 20,
      value: doc.path
    })
    totalScore += 20
  }
  
  // 4. Tags 重叠
  const tagOverlap = intersect(task.tags || [], doc.frontmatter.tags || [])
  if (tagOverlap.length > 0) {
    evidence.push({
      type: 'tag_overlap',
      score: 10,
      value: tagOverlap.join(',')
    })
    totalScore += 10
  }
  
  // 5. 关键词匹配
  const taskKeywords = extractKeywords(task.title + ' ' + (task.description || ''))
  const docKeywords = extractKeywords(doc.frontmatter.title + ' ' + doc.headings.join(' '))
  const keywordOverlap = intersect(taskKeywords, docKeywords)
  if (keywordOverlap.length > 0) {
    evidence.push({
      type: 'keyword_match',
      score: Math.min(10, keywordOverlap.length * 2),
      value: keywordOverlap.join(',')
    })
    totalScore += Math.min(10, keywordOverlap.length * 2)
  }
  
  // 6. 时间窗命中
  if (isInWindow(doc.modifiedTime, task.window)) {
    evidence.push({
      type: 'time_overlap',
      score: 8,
      value: doc.modifiedTime
    })
    totalScore += 8
  }
  
  // 7. 同 commit 出现
  if (git.filesChanged?.includes(task.sourceFile)) {
    evidence.push({
      type: 'same_commit',
      score: 8,
      value: git.commitSha
    })
    totalScore += 8
  }
  
  // 置信度分层
  let confidence: 'strong' | 'medium' | 'weak'
  if (totalScore >= 70) confidence = 'strong'
  else if (totalScore >= 45) confidence = 'medium'
  else confidence = 'weak'
  
  return {
    task_id: task.task_id,
    doc_id: doc.path,
    score: totalScore,
    confidence,
    evidence
  }
}
```

## 2. 不一致检测规则

### 规则 A: done_task_without_evidence

```typescript
function detectDoneWithoutEvidence(task: Task, links: LinkScore[]): Issue | null {
  if (task.status !== 'done') return null
  
  const strongOrMedium = links.filter(l => 
    l.confidence === 'strong' || l.confidence === 'medium'
  )
  
  if (strongOrMedium.length === 0) {
    return {
      id: `ISSUE-${task.window.id}-${task.task_id}`,
      severity: 'high',
      type: 'done_task_without_evidence',
      task_id: task.task_id,
      message: `任务 "${task.title}" 标记为 done，但未找到足够的文档或 Git 证据`,
      recommendation: '补充设计文档，或将任务改回 in_progress'
    }
  }
  
  return null
}
```

### 规则 B: done_task_only_weak_evidence

```typescript
function detectDoneWithWeakEvidence(task: Task, links: LinkScore[], git: GitEvidence[]): Issue | null {
  if (task.status !== 'done') return null
  
  const strongOrMedium = links.filter(l => 
    l.confidence === 'strong' || l.confidence === 'medium'
  )
  
  const onlyWeak = links.filter(l => l.confidence === 'weak')
  
  // 只有 weak 证据，或文档未提交
  if (strongOrMedium.length === 0 && onlyWeak.length > 0) {
    const doc = getDocument(onlyWeak[0].doc_id)
    const isDirty = git.some(g => g.file === doc.path && g.status === 'untracked')
    
    return {
      id: `ISSUE-${task.window.id}-${task.task_id}`,
      severity: 'medium',
      type: 'done_task_only_weak_evidence',
      task_id: task.task_id,
      message: `任务 "${task.title}" 有产出但证据较弱${isDirty ? '且未提交' : ''}`,
      recommendation: isDirty ? '提交文档到 Git' : '完善文档内容或增加关联引用'
    }
  }
  
  return null
}
```

### 规则 C: output_without_done_task

```typescript
function detectOutputWithoutTask(docs: Document[], links: LinkScore[]): Issue[] {
  const issues: Issue[] = []
  
  for (const doc of docs) {
    // 只检查显著产出
    if (!isSignificant(doc)) continue
    
    // 检查是否关联到 done 任务
    const linkedDoneTasks = links
      .filter(l => l.doc_id === doc.path)
      .map(l => getTask(l.task_id))
      .filter(t => t.status === 'done')
    
    if (linkedDoneTasks.length === 0) {
      issues.push({
        id: `ISSUE-${doc.modifiedTime}-${doc.path}`,
        severity: doc.isNew ? 'medium' : 'low',
        type: 'output_without_done_task',
        doc_id: doc.path,
        message: `文档 "${doc.frontmatter.title || doc.path}" 有显著产出但未关联到 done 任务`,
        recommendation: '检查是否忘记勾选相关任务，或为此产出创建新任务'
      })
    }
  }
  
  return issues
}

function isSignificant(doc: Document): boolean {
  // 新建文档算显著
  if (doc.isNew) return true
  
  // posts/ 目录新发布算显著
  if (doc.path.startsWith('posts/') && doc.isNew) return true
  
  // diff 行数 ≥ 50
  if (doc.diffStats?.additions >= 50) return true
  
  // 变更文件数 ≥ 2
  // （这个需要在 git evidence 中统计）
  
  return false
}
```

## 3. 综合判定逻辑

```typescript
function makeVerdict(tasks: Task[], docs: Document[], links: LinkScore[]): Verdict {
  const issues: Issue[] = []
  
  // 检查每个 done 任务
  for (const task of tasks) {
    const taskLinks = links.filter(l => l.task_id === task.task_id)
    
    const issueA = detectDoneWithoutEvidence(task, taskLinks)
    if (issueA) issues.push(issueA)
    
    const issueB = detectDoneWithWeakEvidence(task, taskLinks, gitEvidence)
    if (issueB) issues.push(issueB)
  }
  
  // 检查显著产出
  const issueC = detectOutputWithoutTask(docs, links)
  issues.push(...issueC)
  
  // 分级统计
  const highCount = issues.filter(i => i.severity === 'high').length
  const mediumCount = issues.filter(i => i.severity === 'medium').length
  const lowCount = issues.filter(i => i.severity === 'low').length
  
  // 判定结果
  let status: 'PASS' | 'WARN' | 'FAIL' | 'BLOCK'
  let blocking = false
  
  if (highCount > 0) {
    status = 'FAIL'
    blocking = true
  } else if (mediumCount > 0) {
    status = 'WARN'
    blocking = false
  } else if (lowCount > 0) {
    status = 'PASS'  // low 级别不阻止
    blocking = false
  } else {
    status = 'PASS'
    blocking = false
  }
  
  return {
    status,
    blocking,
    issues,
    summary: {
      tasks_total: tasks.length,
      tasks_done: tasks.filter(t => t.status === 'done').length,
      docs_changed: docs.length,
      issues_high: highCount,
      issues_medium: mediumCount,
      issues_low: lowCount
    }
  }
}
```

## 4. 阻断条件

```typescript
function shouldBlock(latestEnd: LatestEnd | null): BlockResult {
  if (!latestEnd) {
    return { blocked: false }
  }
  
  // 检查是否已确认
  const hasAck = hasAcknowledgement(latestEnd.run_id)
  if (hasAck) {
    return { blocked: false }
  }
  
  // 检查状态
  if (latestEnd.status === 'FAIL' || latestEnd.status === 'BLOCK') {
    return {
      blocked: true,
      reason: `上次复盘 (${latestEnd.window_id}) 存在未解决的验证问题`,
      issues: latestEnd.issues_open,
      run_id: latestEnd.run_id
    }
  }
  
  // 检查是否有未解决的 high 级别问题
  if (latestEnd.issues_open > 0 && latestEnd.has_high_severity) {
    return {
      blocked: true,
      reason: `上次复盘有 ${latestEnd.issues_open} 个未解决的高级别问题`,
      issues: latestEnd.issues_open,
      run_id: latestEnd.run_id
    }
  }
  
  return { blocked: false }
}
```

## 5. 时间窗定义

```typescript
interface TimeWindow {
  type: 'daily' | 'weekly'
  id: string           // YYYY-MM-DD 或 weekId
  start: string        // ISO 8601
  end: string          // ISO 8601
}

function getDailyWindow(date: string): TimeWindow {
  const start = new Date(date)
  start.setHours(0, 0, 0, 0)
  
  const end = new Date(date)
  end.setHours(23, 59, 59, 999)
  
  return {
    type: 'daily',
    id: date,
    start: start.toISOString(),
    end: end.toISOString()
  }
}

function getWeeklyWindow(weekId: string): TimeWindow {
  // weekId 是周一日期
  const start = new Date(weekId)
  start.setHours(0, 0, 0, 0)
  
  const end = new Date(weekId)
  end.setDate(end.getDate() + 6)  // 周日
  end.setHours(23, 59, 59, 999)
  
  return {
    type: 'weekly',
    id: weekId,
    start: start.toISOString(),
    end: end.toISOString()
  }
}

function isInWindow(timestamp: string, window: TimeWindow): boolean {
  const t = new Date(timestamp).getTime()
  const start = new Date(window.start).getTime()
  const end = new Date(window.end).getTime()
  return t >= start && t <= end
}
```

## 6. 关键词提取

```typescript
function extractKeywords(text: string): string[] {
  // 分词（简单实现）
  const words = text
    .toLowerCase()
    .replace(/[^\u4e00-\u9fa5a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length >= 2)
  
  // 去重
  return [...new Set(words)]
}

function intersect(a: string[], b: string[]): string[] {
  return a.filter(x => b.includes(x))
}
```
