---
name: core-read-context
description: 读取 dashboard 中的长期/中期信息（fence、visions、monthBacklogs、weekTasks）
---

# 读取上下文信息

## 文件路径

```typescript
const PATHS = {
  // 约束与提示
  fence: 'docs/dashboard/hints/fence.yml',
  
  // 年度目标
  yearVision: (year: number) => `docs/dashboard/visions/year-${year}.yml`,
  
  // 宏观愿景
  globalVision: 'docs/dashboard/visions/global.yml',
  
  // 月度 backlog
  monthBacklog: (monthId: string) => `docs/dashboard/monthBacklogs/${monthId}.yml`,
  
  // 周计划
  weekPlan: (weekId: string) => `docs/dashboard/weekTasks/${weekId}.yml`,
}
```

## 数据源列表

start-my-day 读取以下数据源：

| 文件 | 路径模式 | 用途 |
|------|----------|------|
| fence.yml | `docs/dashboard/hints/fence.yml` | 客观约束与主观偏好 |
| year-YYYY.yml | `docs/dashboard/visions/year-{YYYY}.yml` | 年度目标 |
| global.yml | `docs/dashboard/visions/global.yml` | 宏观愿景 |
| month-YYYY-MM.yml | `docs/dashboard/monthBacklogs/{YYYY-MM}.yml` | 月度 backlog |
| week-YYYY-MM-DD.yml | `docs/dashboard/weekTasks/{weekId}.yml` | 本周计划 |
| week-advisor.md | `docs/dashboard/advisor/{weekId}-start.md` | 本周初始 advisor |

## fence.yml 结构

```yaml
# 客观约束
constraints:
  workHours:
    start: "09:00"
    end: "18:00"
    days: [mon, tue, wed, thu, fri]
  locations:
    - home
    - office
    - cafe
  bioRhythm:
    peakHours: [9, 10, 11, 14, 15]
    lowHours: [13, 16, 17]

# 主观偏好
preferences:
  maxDeepWorkHoursPerDay: 4
  minExerciseDaysPerWeek: 3
  preferredMeetingDays: [tue, wed, thu]

# 风险信号
riskSignals:
  - name: burnout
    indicators: [连续高压超过2周, 睡眠评分持续低于70]
    action: 减少任务量，增加恢复活动
```

## year-YYYY.yml 结构

```yaml
theme: 2026年的核心主题
categories:
  career:
    - goal: 完成技能生成平台
      target: Q2
      priority: high
    - goal: 发布3个开源项目
      target: Q4
      priority: medium
  health:
    - goal: 建立稳定的运动习惯
      target: 全年
      priority: high
```

## weekTasks/{weekId}.yml 结构

```yaml
theme: 本周主题/主线目标

tasks:
  - title: 任务标题
    priority: high           # high | medium | low
    dod: 完成定义
    status: notStarted       # done | inProgress | notStarted | deferred | blocked
    links:
      - label: 设计文档
        url: ./docs/design.md
    tags:
      - deepWork
      - forIdiot

meta:
  generatedAt: "2026-03-31T08:00:00Z"
  basedOn: ["year-vision", "month-backlog", "last-week-review"]
```

## 读取逻辑

```typescript
async function readContext(date: string): Promise<Context> {
  const weekId = getWeekId(new Date(date))
  const year = parseInt(date.slice(0, 4))
  const monthId = date.slice(0, 7) // YYYY-MM
  
  const [
    fence,
    yearVision,
    globalVision,
    weekPlanData,
    monthBacklog
  ] = await Promise.all([
    readYaml(PATHS.fence),
    readYaml(PATHS.yearVision(year)),
    readYaml(PATHS.globalVision),
    readYaml(PATHS.weekPlan(weekId)),
    readYaml(PATHS.monthBacklog(monthId))
  ])
  
  const weekPlan: WeekInfo | null = weekPlanData ? {
    weekId,
    theme: weekPlanData.theme as string,
    tasks: (weekPlanData.tasks || []) as Task[],
    highPriorityTasks: ((weekPlanData.tasks || []) as Task[])
      .filter(t => t.priority === 'high'),
  } : null
  
  return {
    fence,
    yearVision,
    globalVision,
    weekPlan,
    monthBacklog,
    currentDate: date,
    currentMonthId: monthId,
    currentYear: year,
    currentWeekId: weekId
  }
}
```

## 降级策略

| 文件缺失 | 处理方式 |
|----------|----------|
| fence.yml | 使用默认约束（标准工作时间） |
| year-YYYY.yml | 从 global.yml 推断，或创建空目标 |
| global.yml | 创建空愿景，依赖用户输入 |
| weekTasks | 提示用户先运行 start-my-week |
| monthBacklog | 创建空 backlog，依赖用户输入 |
