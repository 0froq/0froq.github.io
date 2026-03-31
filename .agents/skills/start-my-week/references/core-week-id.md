---
name: core-week-id
description: 计算周标识（Week ID）的逻辑
---

# 周标识计算

## 算法

```typescript
import { format, startOfWeek, subWeeks, addWeeks } from 'date-fns'

/**
 * 获取当前周的周标识（周一日期）
 * @returns YYYY-MM-DD 格式的周一日期
 */
function getCurrentWeekId(date: Date = new Date()): string {
  // 获取本周一的日期
  const monday = startOfWeek(date, { weekStartsOn: 1 })
  return format(monday, 'yyyy-MM-dd')
}

/**
 * 根据周标识获取上一周的标识
 */
function getLastWeekId(weekId: string): string {
  const currentMonday = new Date(weekId)
  const lastMonday = subWeeks(currentMonday, 1)
  return format(lastMonday, 'yyyy-MM-dd')
}

/**
 * 根据周标识获取下一周的标识
 */
function getNextWeekId(weekId: string): string {
  const currentMonday = new Date(weekId)
  const nextMonday = addWeeks(currentMonday, 1)
  return format(nextMonday, 'yyyy-MM-dd')
}

/**
 * 获取周的起止日期
 */
function getWeekRange(weekId: string): { start: Date; end: Date } {
  const start = new Date(weekId)
  const end = addWeeks(start, 1)
  end.setMilliseconds(-1) // 周日 23:59:59.999
  return { start, end }
}
```

## 规则

1. **周起始日**：周一（ISO 8601 标准）
2. **格式**：`YYYY-MM-DD`（例如：`2026-03-31`）
3. **时区**：使用系统本地时区
4. **文件名**：`docs/dashboard/weekTasks/{weekId}.yml`

## 边缘情况处理

| 情况 | 处理 |
|------|------|
| 当前是周一 | 直接使用当天日期 |
| 当前是周日 | 回退到本周一 |
| 跨年周 | 使用周一所在年份的日期 |
