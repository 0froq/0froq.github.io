---
name: core-day-id
description: 计算日标识（Day ID）和周标识（Week ID）的逻辑
---

# 日期标识计算

## 当天日期

```typescript
/**
 * 获取当天日期
 * @returns YYYY-MM-DD 格式
 */
function getTodayDate(date: Date = new Date()): string {
  return date.toISOString().slice(0, 10)
}

// 示例
getTodayDate(new Date('2026-03-31')) // '2026-03-31'
```

## 周标识计算（与 start-my-week 一致）

```typescript
/**
 * 获取指定日期所属周的周一日期
 * @returns YYYY-MM-DD 格式的周一日期
 */
function getWeekId(date: Date): string {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(d.setDate(diff))
  return monday.toISOString().slice(0, 10)
}

// 示例
getWeekId(new Date('2026-03-31')) // '2026-03-31' (周二，本周一)
getWeekId(new Date('2026-04-05')) // '2026-03-31' (周日，本周一)
```

## 昨天日期计算

```typescript
/**
 * 获取昨天日期
 * @param today YYYY-MM-DD 格式的今天日期
 * @returns YYYY-MM-DD 格式的昨天日期
 */
function getYesterdayDate(today: string): string {
  const d = new Date(today)
  d.setDate(d.getDate() - 1)
  return d.toISOString().slice(0, 10)
}

// 示例
getYesterdayDate('2026-03-31') // '2026-03-30'
```

## 星期名称

```typescript
/**
 * 获取指定日期的星期名称（中文）
 */
function getWeekdayName(dateStr: string): string {
  const d = new Date(dateStr)
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return weekdays[d.getDay()]
}

// 示例
getWeekdayName('2026-03-31') // '周二'
```

## 日期范围

```typescript
/**
 * 获取指定日期的一天范围（用于 corpus 查询）
 */
function getDayRange(date: string): { start: Date; end: Date } {
  const start = new Date(date)
  start.setHours(0, 0, 0, 0)
  const end = new Date(date)
  end.setHours(23, 59, 59, 999)
  return { start, end }
}
```

## 规则

1. **日期格式**：`YYYY-MM-DD`（例如：`2026-03-31`）
2. **周起始日**：周一（ISO 8601 标准）
3. **时区**：使用系统本地时区
4. **文件名**：`docs/dashboard/dayTodos/{date}.yml`

## 边缘情况处理

| 情况 | 处理 |
|------|------|
| 当前是周一 | 昨天是上周日 |
| 跨月 | 正确处理日期边界（如 3月1日 的昨天是 2月28日） |
| 跨年 | 正确处理年份边界（如 1月1日 的昨天是去年12月31日） |
| 闰年 | 自动处理 2月29日 |
