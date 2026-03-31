---
name: core-week-id
description: 计算周标识（Week ID）的逻辑
---

# 周标识计算

## 算法

```typescript
/**
 * 获取当前周的周标识（周一日期）
 * @returns YYYY-MM-DD 格式的周一日期
 */
function getCurrentWeekId(date: Date = new Date()): string {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(d.setDate(diff))
  return monday.toISOString().slice(0, 10)
}

/**
 * 根据周标识获取周的起止日期
 */
function getWeekRange(weekId: string): { start: Date; end: Date } {
  const start = new Date(weekId)
  const end = new Date(start)
  end.setDate(end.getDate() + 6)
  end.setHours(23, 59, 59, 999)
  return { start, end }
}

/**
 * 根据周标识获取本周所有日期
 */
function getWeekDates(weekId: string): string[] {
  const { start } = getWeekRange(weekId)
  const dates: string[] = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(start)
    d.setDate(d.getDate() + i)
    dates.push(d.toISOString().slice(0, 10))
  }
  return dates
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
| 输入文件不存在 | 返回 null，提示用户先创建周计划 |
