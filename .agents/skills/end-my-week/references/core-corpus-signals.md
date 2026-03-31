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
async function readCorpusSignals(
  weekRange: { start: Date; end: Date }
): Promise<SynthesizedState> {
  // 简化实现，返回默认状态
  // 实际实现可遍历 corpus 目录读取文件
  return {
    overallEnergy: 'neutral',
    overallMood: 'neutral',
    intensity: 'moderate',
    recommendations: [],
    writingFrequency: 0,
  }
}
```

## 信号综合判断

```typescript
interface SynthesizedState {
  overallEnergy: 'high' | 'neutral' | 'low'
  overallMood: 'positive' | 'neutral' | 'negative' | 'mixed'
  intensity: 'light' | 'moderate' | 'heavy'
  recommendations: string[]
  writingFrequency: number
}

function synthesizeSignals(signals: CorpusSignals): SynthesizedState {
  const state: SynthesizedState = {
    overallEnergy: 'neutral',
    overallMood: 'neutral',
    intensity: 'moderate',
    recommendations: []
  }
  
  // 基于条目数量判断活跃度
  if (signals.writingFrequency >= 5) {
    state.intensity = 'heavy'
  } else if (signals.writingFrequency <= 2) {
    state.intensity = 'light'
  }
  
  // 综合能量信号
  const highEnergyCount = signals.energyIndicators
    .filter(e => e.startsWith('high:')).length
  const lowEnergyCount = signals.energyIndicators
    .filter(e => e.startsWith('low:')).length
  
  if (highEnergyCount > lowEnergyCount * 2) {
    state.overallEnergy = 'high'
  } else if (lowEnergyCount > highEnergyCount * 2) {
    state.overallEnergy = 'low'
  }
  
  // 生成建议
  if (state.overallEnergy === 'low') {
    state.recommendations.push('上周能量较低，建议评估本周任务量')
  }
  
  return state
}
```

## 在复盘中的使用

```typescript
const corpusState = await readCorpusSignals(weekRange)

// 根据状态调整复盘内容
if (state.overallEnergy === 'low') {
  review.notes += ' 上周能量较低，注意调整节奏。'
}
```
