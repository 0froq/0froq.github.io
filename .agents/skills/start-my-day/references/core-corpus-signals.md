---
name: core-corpus-signals
description: 读取最近 2-3 天的 corpus 条目，分析状态信号
---

# Corpus 信号分析

## 目的

1. 通过最近 2-3 天的 corpus 条目判断当前能量状态和情绪状态
2. 识别工作强度和产出频率
3. 提供个性化的当日建议

## 数据源

| 分类 | 目录 | 信号含义 |
|------|------|----------|
| 000_autopsia | `docs/corpus/000_autopsia/` | 元认知反思 - 整体状态指标 |
| 100_ingesta | `docs/corpus/100_ingesta/` | 输入/学习 - 知识摄入 |
| 200_neoplasma | `docs/corpus/200_neoplasma/` | 主观思考 - 创造力指标 |
| 300_putredo | `docs/corpus/300_putredo/` | 项目日志 - 产出频率 |
| 500_vigil | `docs/corpus/500_vigil/` | 提醒/备忘 - 待处理事项 |

## 读取范围

```typescript
/**
 * 读取最近 N 天的 corpus 条目
 * @param date 当前日期
 * @param days 回溯天数（默认 3 天）
 */
async function readRecentCorpus(
  date: string, 
  days: number = 3
): Promise<SynthesizedState> {
  const dateObj = new Date(date)
  const corpusEntries: CorpusEntry[] = []
  
  // 读取最近 N 天的所有 corpus 分类
  for (let i = 0; i < days; i++) {
    const d = new Date(dateObj)
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().slice(0, 10)
    
    // 读取各分类条目
    const categories = ['000_autopsia', '100_ingesta', '200_neoplasma', '300_putredo', '500_vigil']
    
    for (const category of categories) {
      const entries = await readCorpusCategory(category, dateStr)
      corpusEntries.push(...entries)
    }
  }
  
  return synthesizeSignals(corpusEntries)
}

interface CorpusEntry {
  date: string
  category: string
  title: string
  content?: string
  tags?: string[]
  energy?: 'high' | 'medium' | 'low'
  mood?: 'positive' | 'neutral' | 'negative'
}
```

## 信号合成

```typescript
interface SynthesizedState {
  overallEnergy: 'high' | 'neutral' | 'low'
  overallMood: 'positive' | 'neutral' | 'negative' | 'mixed'
  intensity: 'light' | 'moderate' | 'heavy'
  recommendations: string[]
  writingFrequency: number  // 近 N 天写作条数
}

function synthesizeSignals(entries: CorpusEntry[]): SynthesizedState {
  if (entries.length === 0) {
    return {
      overallEnergy: 'neutral',
      overallMood: 'neutral',
      intensity: 'moderate',
      recommendations: [],
      writingFrequency: 0,
    }
  }
  
  // 计算能量状态
  const energyCounts = { high: 0, medium: 0, low: 0 }
  entries.forEach(e => {
    if (e.energy) energyCounts[e.energy]++
  })
  
  const overallEnergy = 
    energyCounts.high > energyCounts.low ? 'high' :
    energyCounts.low > energyCounts.medium ? 'low' : 'neutral'
  
  // 计算情绪状态
  const moodCounts = { positive: 0, neutral: 0, negative: 0 }
  entries.forEach(e => {
    if (e.mood) moodCounts[e.mood]++
  })
  
  let overallMood: 'positive' | 'neutral' | 'negative' | 'mixed' = 'neutral'
  if (moodCounts.positive > moodCounts.negative) overallMood = 'positive'
  else if (moodCounts.negative > moodCounts.positive) overallMood = 'negative'
  else if (moodCounts.positive > 0 && moodCounts.negative > 0) overallMood = 'mixed'
  
  // 计算强度
  const putredoCount = entries.filter(e => e.category === '300_putredo').length
  const intensity = putredoCount >= 3 ? 'heavy' : putredoCount >= 1 ? 'moderate' : 'light'
  
  // 生成建议
  const recommendations = generateRecommendations({
    overallEnergy,
    overallMood,
    intensity,
    writingFrequency: entries.length
  })
  
  return {
    overallEnergy,
    overallMood,
    intensity,
    recommendations,
    writingFrequency: entries.length,
  }
}
```

## 建议生成

```typescript
function generateRecommendations(state: SynthesizedState): string[] {
  const recommendations: string[] = []
  
  // 基于能量状态
  if (state.overallEnergy === 'low') {
    recommendations.push('能量较低，建议今天安排更多简单任务（forIdiot 标签）')
    recommendations.push('减少并行任务，专注完成 1-2 件核心任务')
  } else if (state.overallEnergy === 'high') {
    recommendations.push('能量充沛，可以挑战高难度任务')
  }
  
  // 基于情绪状态
  if (state.overallMood === 'negative') {
    recommendations.push('情绪状态一般，建议安排一些能带来成就感的任务')
  }
  
  // 基于强度
  if (state.intensity === 'heavy') {
    recommendations.push('最近产出密集，今天可以适当降低强度')
  } else if (state.intensity === 'light') {
    recommendations.push('近期产出较少，建议今天增加任务量')
  }
  
  return recommendations
}
```

## 与周计划的对比

```typescript
function compareWithWeekPlan(
  corpusState: SynthesizedState,
  weekPlan: WeekInfo
): ComparisonResult {
  const weekTasksTotal = weekPlan.tasks.length
  const weekTasksDone = weekPlan.tasks.filter(t => t.status === 'done').length
  const weekProgress = weekTasksTotal > 0 
    ? Math.round((weekTasksDone / weekTasksTotal) * 100) 
    : 0
  
  return {
    weekProgress,
    onTrack: weekProgress >= 50, // 假设周中检查
    suggestions: corpusState.overallEnergy === 'high' && weekProgress < 50
      ? ['周进度落后但能量充足，建议今天加快进度']
      : []
  }
}
```

## 使用场景

| 场景 | 信号 | 建议 |
|------|------|------|
| 连续高产 | intensity: heavy | 安排缓冲日 |
| 能量低谷 | energy: low | 减少任务量，增加恢复 |
| 情绪低落 | mood: negative | 安排简单/有趣的任务 |
| 产出稀疏 | intensity: light | 增加挑战性任务 |
