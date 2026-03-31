---
name: core-read-context
description: 读取 dashboard 中的长期/中期信息（fence、visions、monthBacklogs）
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
}
```

## 数据源说明

### fence.yml 结构

```yaml
# 客观约束
constraints:
  workHours:
    start: "09:00"
    end: "18:00"
    days: [mon, tue, wed, thu, fri]
  
# 主观偏好
preferences:
  maxDeepWorkHoursPerDay: 4
  minExerciseDaysPerWeek: 3

# 风险信号
riskSignals:
  - name: burnout
    indicators: [连续高压超过2周, 睡眠评分持续低于70]
    action: 减少任务量，增加恢复活动
```

### year-YYYY.yml 结构

```yaml
theme: 2026年的核心主题
categories:
  career:
    - goal: 完成技能生成平台
      target: Q2
      priority: high
```

### global.yml 结构

```yaml
vision: 长期愿景描述（5-10年）
principles:
  - 持续学习优于短期产出
  - 健康是一切的基础
```

### monthBacklogs/{YYYY-MM}.yml 结构

```yaml
# 月度主题
theme: 3月主题

# 任务池
tasks:
  - title: 完成技能系统重构
    priority: high
    estimatedDays: 5
    deadline: "2026-03-15"
```

## 读取逻辑

```typescript
async function readContext(weekId: string): Promise<Context> {
  const year = parseInt(weekId.slice(0, 4))
  const monthId = weekId.slice(0, 7) // YYYY-MM
  
  const [
    fence,
    yearVision,
    globalVision,
    monthBacklog
  ] = await Promise.all([
    readYaml(PATHS.fence),
    readYaml(PATHS.yearVision(year)),
    readYaml(PATHS.globalVision),
    readYaml(PATHS.monthBacklog(monthId))
  ])
  
  return {
    fence: fence || {},
    yearVision: yearVision || {},
    globalVision: globalVision || {},
    monthBacklog: monthBacklog || {}
  }
}
```

## 降级策略

| 文件缺失 | 处理方式 |
|----------|----------|
| fence.yml | 使用默认约束 |
| year-YYYY.yml | 从 global.yml 推断 |
| global.yml | 创建空愿景 |
| monthBacklog | 创建空 backlog |
