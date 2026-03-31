---
name: core-day-id
description: 识别当天日期和所属周ID的逻辑
---

# 日期识别

## 当天日期

```typescript
/**
 * 获取当天日期
 * @returns YYYY-MM-DD 格式的日期
 */
function getToday(): string {
  return new Date().toISOString().slice(0, 10)
}
```

## 所属周ID

```typescript
/**
 * 获取指定日期所属周的周ID（周一日期）
 * @returns YYYY-MM-DD 格式的周一日期
 */
function getWeekId(date: Date = new Date()): string {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(d.setDate(diff))
  return monday.toISOString().slice(0, 10)
}
```

## 星期几

```typescript
/**
 * 获取指定日期是星期几
 * @returns 中文星期名称
 */
function getWeekday(date: string): string {
  const d = new Date(date)
  return d.toLocaleDateString('zh-CN', { weekday: 'long' })
}
```

## 规则

1. **周起始日**：周一（ISO 8601 标准）
2. **日期格式**：`YYYY-MM-DD`（例如：`2026-03-31`）
3. **时区**：使用系统本地时区
4. **文件名**：`docs/dashboard/dayTodos/{YYYY-MM-DD}.yml`

## 边缘情况处理

| 情况 | 处理 |
|------|------|
| 当前是周一 | 周ID就是当天日期 |
| 当前是周日 | 周ID回退到本周一 |
| 跨年周 | 使用周一所在年份的日期 |
