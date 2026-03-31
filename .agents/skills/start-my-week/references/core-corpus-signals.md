---
name: core-corpus-signals
description: 读取 corpus 目录中的最近条目，判断能量与情绪状态信号
---

# Corpus 状态信号分析

## Corpus 目录结构

```typescript
const CORPUS_PATHS = {
  autopsia: 'docs/corpus/000_autopsia',    // 元认知与系统反思
  ingesta: 'docs/corpus/100_ingesta',      // 客观输入（论文、书摘）
  neoplasma: 'docs/corpus/200_neoplasma',  // 主观思考
  putredo: 'docs/corpus/300_putredo',      // 工作/项目日志
  delirium: 'docs/corpus/400_delirium',    // 审美材料
  vigil: 'docs/corpus/500_vigil',          // 感性日记
}
```

## 文件命名约定

```
{YYYYMMDD}-{slug}.md
例如:
- 20260325-reflection-on-focus.md
- 20260327-reading-notes-thinking-fast-slow.md
- 20260328-project-log-skill-system.md
```

## 读取最近一周的条目

```typescript
async function readRecentCorpus(
  weekRange: { start: Date; end: Date }
): Promise<CorpusSignals> {
  const signals: CorpusSignals = {
    entries: [],
    energyIndicators: [],
    moodIndicators: [],
    topicDistribution: {},
    writingFrequency: 0
  }
  
  for (const [category, path] of Object.entries(CORPUS_PATHS)) {
    const files = await glob(`${path}/**/*.md`)
    
    for (const file of files) {
      const date = extractDateFromFilename(file)
      
      // 只读取周范围内的文件
      if (date >= weekRange.start && date <= weekRange.end) {
        const content = await readFile(file, 'utf-8')
        const metadata = extractFrontmatter(content)
        
        signals.entries.push({
          category,
          date,
          file,
          title: metadata.title || extractTitle(content),
          tags: metadata.tags || [],
          energy: metadata.energy, // 可选: 1-10
          mood: metadata.mood      // 可选: positive | neutral | negative
        })
        
        // 分析内容信号
        const contentSignals = analyzeContentSignals(content)
        signals.energyIndicators.push(...contentSignals.energy)
        signals.moodIndicators.push(...contentSignals.mood)
      }
    }
  }
  
  signals.writingFrequency = signals.entries.length
  signals.topicDistribution = calculateTopicDistribution(signals.entries)
  
  return signals
}

function extractDateFromFilename(filename: string): Date {
  const match = filename.match(/(\d{8})/)
  if (match) {
    const year = match[1].slice(0, 4)
    const month = match[1].slice(4, 6)
    const day = match[1].slice(6, 8)
    return new Date(`${year}-${month}-${day}`)
  }
  return new Date(0) // fallback
}
```

## 内容信号分析

```typescript
interface ContentSignals {
  energy: string[]
  mood: string[]
}

function analyzeContentSignals(content: string): ContentSignals {
  const signals: ContentSignals = {
    energy: [],
    mood: []
  }
  
  const lowerContent = content.toLowerCase()
  
  // 能量信号关键词
  const highEnergySignals = [
    '高效', '专注', '沉浸', 'flow', '充实', '有动力',
    'productive', 'focused', 'energized', 'motivated'
  ]
  
  const lowEnergySignals = [
    '疲劳', '疲惫', '倦怠', '无力', '拖延', '困倦',
    'tired', 'exhausted', 'burnout', 'procrastinating', 'low energy'
  ]
  
  // 情绪信号关键词
  const positiveMoodSignals = [
    '开心', '满足', '平静', '感激', '期待', '享受',
    'happy', 'satisfied', 'calm', 'grateful', 'excited', 'enjoy'
  ]
  
  const negativeMoodSignals = [
    '焦虑', '压力', '沮丧', '失望', '愤怒', '孤独',
    'anxious', 'stressed', 'frustrated', 'disappointed', 'angry', 'lonely'
  ]
  
  // 简单关键词匹配（实际可用更复杂的 NLP）
  for (const signal of highEnergySignals) {
    if (lowerContent.includes(signal)) signals.energy.push(`high:${signal}`)
  }
  for (const signal of lowEnergySignals) {
    if (lowerContent.includes(signal)) signals.energy.push(`low:${signal}`)
  }
  for (const signal of positiveMoodSignals) {
    if (lowerContent.includes(signal)) signals.mood.push(`positive:${signal}`)
  }
  for (const signal of negativeMoodSignals) {
    if (lowerContent.includes(signal)) signals.mood.push(`negative:${signal}`)
  }
  
  return signals
}
```

## 信号综合判断

```typescript
function synthesizeSignals(signals: CorpusSignals): SynthesizedState {
  const state: SynthesizedState = {
    overallEnergy: 'neutral', // high | neutral | low
    overallMood: 'neutral',   // positive | neutral | negative | mixed
    intensity: 'moderate',    // light | moderate | heavy
    recommendations: []
  }
  
  // 基于条目数量判断活跃度
  if (signals.writingFrequency >= 5) {
    state.intensity = 'heavy'
  } else if (signals.writingFrequency <= 2) {
    state.intensity = 'light'
  }
  
  // 综合能量信号
  const highEnergyCount = signals.energyIndicators.filter(e => e.startsWith('high:')).length
  const lowEnergyCount = signals.energyIndicators.filter(e => e.startsWith('low:')).length
  
  if (highEnergyCount > lowEnergyCount * 2) {
    state.overallEnergy = 'high'
  } else if (lowEnergyCount > highEnergyCount * 2) {
    state.overallEnergy = 'low'
  }
  
  // 综合情绪信号
  const positiveCount = signals.moodIndicators.filter(m => m.startsWith('positive:')).length
  const negativeCount = signals.moodIndicators.filter(m => m.startsWith('negative:')).length
  
  if (positiveCount > negativeCount * 2) {
    state.overallMood = 'positive'
  } else if (negativeCount > positiveCount * 2) {
    state.overallMood = 'negative'
  } else if (positiveCount > 0 && negativeCount > 0) {
    state.overallMood = 'mixed'
  }
  
  // 生成建议
  if (state.overallEnergy === 'low') {
    state.recommendations.push('上周能量较低，本周建议减少任务量，增加简单直接的 forIdiot 标签任务')
  }
  if (state.overallMood === 'negative' || state.overallMood === 'mixed') {
    state.recommendations.push('情绪状态需要关注，建议本周安排恢复性活动和愉悦项目')
  }
  if (state.intensity === 'heavy') {
    state.recommendations.push('上周产出密集，本周注意避免过度疲劳')
  }
  
  return state
}
```

## 使用示例

```typescript
// 在生成周计划时调用
const corpusSignals = await readRecentCorpus(weekRange)
const state = synthesizeSignals(corpusSignals)

// 根据状态调整任务生成
if (state.overallEnergy === 'low') {
  // 增加更多 forIdiot 标签的简单任务
  // 减少高难度任务数量
}
```

## 注意事项

1. **隐私优先**：只读取文件元数据和必要内容片段，不分析详细内容
2. **信号非诊断**：corpus 信号用于调节任务强度，不做心理健康诊断
3. **可控范围**：限制读取文件数量（最多最近 20 篇），避免过度扫描
4. **降级优雅**：如果 corpus 目录为空或不存在，返回空信号不报错
