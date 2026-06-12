---
title: LSWT 增温停滞（hiatus）探索
created: 2026-03-26
status: probe
last_modified: 2026-06-13 01:44:28
---

About the exploration of LSWT hiatus.

---

[[toc]]

#scope/work/research/warmingHiatus #log/project

<script setup lang="ts">
import { data as corpus } from '~/src/corpus.data'
import { useData } from 'vitepress'

const { page } = useData()

const thisCorpus = corpus.filter(
  (c) => {
    return c.tags.includes('scope/work/research/warmingHiatus')
      && c.url + '.md' !== '/' + page.value.filePath
      && c.frontmatter.status !== 'void'
  }
).sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime())

const thisPuts = thisCorpus.filter((c) => {
  console.log(c.url)
  return c.url.startsWith('/corpus/300-')
})

</script>

## Logs

<ul
  key="thisPuts.length"
>
  <li v-for="c in thisPuts" :key="c.path">
    <a :href="c.url" :text="c.title" />
  </li>
</ul>

## Collections

- [Paper collections](../100-ingesta/ing-hiatus-paper-collection.md)

## Points

### 背景

- 1981-2020 月尺度数据，92245 个湖泊；
- STL 分解，`period=12, robust=false, ni=5, no=0, nt=199, batch_size=10000`
- trend 分量做一阶差分，再 STARS 算法；
  - 检测的是长期低频趋势在速率上的 regime shifts，趋势变化量的 shift；

### 基本

1. 99.6% 的湖泊总体趋势为正；
2. 40 年间全球所有湖泊的增温均值为 0.58 °C，
   10th percentile 和 90th percentile 分别为 0.22 和 1.01；
3. 1982-1991 年，增温 0.0084 每年，
   <!-- TODO: 1991-2001 年，增温 {} 每年， -->
   2002-2011 年，增温 0.0175 每年，
   2012-2020 年，增温 0.0160 每年；
4. 

### 断点

1. 平均每个湖泊 2.69 个断点，0.05% 的湖无断点；
2. 断点年份在 1990 年有峰值，8.0 %，19845 个湖泊在此年 shift，最大单年值，
   且不是边界伪影；
3. 加速 shift 是减速 shift 的约三倍；
4. 最显著的减速信号大概在 2013-2015 年；
5.

### 区域

1. 欧洲 40 年间平均变暖 0.83 °C，而北美 0.42 °C，
2. 其他大陆：AS 0.62 °C，AU 0.60 °C，AF 0.52 °C，SA 0.42 °C；
3. 纬度梯度：40-50 °N 平均 0.66 °C，50-60 °N 0.49 °C，60-80 °N 0.60-0.64 °C；
4. 海拔梯度单调：小于 30 m 的 0.72 摄氏度，大于 300 m 的 0.46 °C；
5. 欧洲
