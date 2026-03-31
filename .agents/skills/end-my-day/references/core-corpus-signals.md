---
name: core-corpus-signals
description: 读取当天 corpus 条目判断能量和情绪状态
---

# Corpus 信号读取

## Corpus 条目结构

```typescript
interface CorpusEntry {
  date: string
  content: string
  tags?: string[]
  energy?: string
  mood?: string
}
```

## 当天 Corpus 读取

```typescript
async function readCorpusSignals(today: string): Promise<SynthesizedState> {
  // 300_putredo 和 500_vigil 目录
  const corpusDirs = ['300_putredo', '500_vigil']
  const entries: CorpusEntry[] = []
  
  for (const dir of corpusDirs) {
    const corpusPath = `docs/corpus/${dir}`
    // 读取当天条目...
  }
  
  return synthesizeState(entries)
}
```

## 状态合成

```typescript
interface SynthesizedState {
  overallEnergy: 'high' | 'neutral' | 'low'
  overallMood: 'positive' | 'neutral' | 'negative' | 'mixed'
  intensity: 'light' | 'moderate' | 'heavy'
  recommendations: string[]
  writingFrequency: number
}

function synthesizeState(entries: CorpusEntry[]): SynthesizedState {
  // 基于条目数量和标签判断整体状态
  const energyScores = entries.map(e => {
    if (e.energy === 'high') return 3
    if (e.energy === 'medium') return 2
    if (e.energy === 'low') return 1
    return 2
  })
  
  const avgEnergy = energyScores.reduce((a, b) => a + b, 0) / energyScores.length
  
  return {
    overallEnergy: avgEnergy >= 2.5 ? 'high' : avgEnergy >= 1.5 ? 'neutral' : 'low',
    overallMood: 'neutral',
    intensity: entries.length > 5 ? 'heavy' : entries.length > 2 ? 'moderate' : 'light',
    recommendations: generateRecommendations(entries),
    writingFrequency: entries.length,
  }
}
```

## 信号解读

| 信号 | 判断依据 | 影响 |
|------|----------|------|
| 高能量 | 多个 high energy 标签 | 建议明日可安排挑战性任务 |
| 低能量 | 多个 low energy 标签 | 建议明日减少任务量 |
| 高压力 | vigil 条目过多 | 建议关注心理健康 |
| 低产出 | putredo 条目过少 | 可能处于停滞期 |
| 情绪波动 | mood 标签变化大 | 建议记录情绪触发因素 |
