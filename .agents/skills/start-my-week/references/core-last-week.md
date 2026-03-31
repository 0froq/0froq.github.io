---
name: core-last-week
description: 读取上周的周计划及执行情况的逻辑
---

# 读取上周执行与复盘

## 文件路径

```typescript
const PATHS = {
  weekTasks: (weekId: string) => `docs/dashboard/weekTasks/${weekId}.yml`,
}
```

## 周计划文件结构

```yaml
# 基础信息
createdAt: "2026-03-24"
updatedAt: "2026-03-30"

# 本周主题
theme: 专注于技能系统的核心实现

# 周目标
goals:
  - 完成 start-my-week 技能设计
  - 完成 3 篇 corpus 笔记

# 任务列表
tasks:
  - title: 设计周计划生成算法
    priority: high
    dod: 完成参考文档，编写 index.ts
    status: done
    completedAt: "2026-03-25"
    
  - title: 阅读《思考，快与慢》
    priority: medium
    dod: 完成第1-3章阅读，写读书笔记
    status: inProgress
    progress: 60
    
  - title: 整理笔记库
    priority: low
    dod: 归档过期笔记，更新索引
    status: deferred
    reason: 时间不足，顺延至下周

# 周复盘（在周末或下周初填写）
review:
  completed: [设计周计划生成算法]
  partial: [阅读《思考，快与慢》]
  failed: []
  
  # 能量与情绪状态
  energyLevel: 8  # 1-10
  mood: positive  # positive | neutral | negative | mixed
  
  # 关键洞察
  insights:
    - 深度工作时段集中在上午
    - 下午容易疲劳，应安排简单任务
    
  # 下周调整
  adjustments:
    - 减少并行任务数量
    - 增加运动时间

# AI 生成的计划（将被替换）
# AI-WEEK-PLAN-START
aiPlan:
  generatedAt: "2026-03-24T08:00:00Z"
  context:
    basedOn: [年度目标, 月度backlog]
# AI-WEEK-PLAN-END
```

## 读取逻辑

```typescript
async function readLastWeek(weekId: string): Promise<LastWeekInfo | null> {
  const lastWeekId = getLastWeekId(weekId)
  const filePath = PATHS.weekTasks(lastWeekId)
  
  // 检查文件是否存在
  if (!await fileExists(filePath)) {
    return null // 优雅降级
  }
  
  const content = await readFile(filePath, 'utf-8')
  const data = parseYaml(content)
  
  return {
    weekId: lastWeekId,
    theme: data.theme,
    goals: data.goals || [],
    tasks: data.tasks || [],
    review: data.review,
    hasReview: !!data.review,
    completion: calculateCompletion(data.tasks || [])
  }
}

function calculateCompletion(tasks: Task[]): { 
  total: number
  done: number 
  inProgress: number
  deferred: number
} {
  return {
    total: tasks.length,
    done: tasks.filter(t => t.status === 'done').length,
    inProgress: tasks.filter(t => t.status === 'inProgress').length,
    deferred: tasks.filter(t => t.status === 'deferred' || t.status === 'deffered').length
  }
}
```

## 信息提取策略

### 未完成的任务

```typescript
function extractCarryOverTasks(lastWeek: LastWeekInfo): Task[] {
  if (!lastWeek) return []
  
  return lastWeek.tasks.filter(task => {
    // 未开始的任务
    if (task.status === 'notStarted') return true
    
    // 进行中的任务
    if (task.status === 'inProgress') return true
    
    // 被推迟的任务
    if (task.status === 'deferred' || task.status === 'deffered') return true
    
    // 被阻塞的任务
    if (task.status === 'blocked') return true
    
    return false
  }).map(task => ({
    ...task,
    carryOverFrom: lastWeek.weekId,
    reason: task.reason || '从上周顺延'
  }))
}
```

### 复盘洞察提取

```typescript
function extractInsights(lastWeek: LastWeekInfo): string[] {
  if (!lastWeek?.review) return []
  
  const insights: string[] = []
  
  // 能量状态
  if (lastWeek.review.energyLevel) {
    if (lastWeek.review.energyLevel < 5) {
      insights.push(`上周能量较低(${lastWeek.review.energyLevel}/10)，建议本周减少任务量`)
    } else if (lastWeek.review.energyLevel > 8) {
      insights.push(`上周能量充沛(${lastWeek.review.energyLevel}/10)，本周可适当增加挑战`)
    }
  }
  
  // 情绪状态
  if (lastWeek.review.mood === 'negative' || lastWeek.review.mood === 'mixed') {
    insights.push('上周情绪状态不佳，建议本周增加恢复性活动')
  }
  
  // 复盘中的洞察
  if (lastWeek.review.insights) {
    insights.push(...lastWeek.review.insights)
  }
  
  // 调整建议
  if (lastWeek.review.adjustments) {
    insights.push(...lastWeek.review.adjustments.map(a => `调整建议: ${a}`))
  }
  
  return insights
}
```

## 降级策略

| 情况 | 处理方式 |
|------|----------|
| 上周文件不存在 | 返回 null，提示用户这是新开始 |
| 文件存在但无 review | 基于任务完成状态推断 |
| 任务状态字段缺失 | 默认为 notStarted |
