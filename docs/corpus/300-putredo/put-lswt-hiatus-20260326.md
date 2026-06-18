---
title: LSWT 增温停滞（hiatus）探索
created: 2026-03-26
status: draft
last_modified: 2026-06-16 04:29:50
---

About the exploration of LSWT hiatus.

---

[[toc]]

#inner #scope/work/research/warmingHiatus

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

1. 欧洲 40 年间平均变暖 0.83（年均 0.02075），而北美 0.42（年均 0.0105），
2. 其他大陆：
   亚洲 0.62（年均 0.0155），
   大洋洲 0.60（年均 0.015），
   非洲 0.52（年均 0.013），
   南美 0.42（年均 0.0105）；
3. 纬度梯度非单调：
   <!-- TODO: 其他的纬度圈，可以给个表 -->
   40-50N 0.66，
   50-60N 0.49，
   60-80N 0.60-0.64；
4. 海拔梯度单调：
   <!-- TODO: 其他的海拔，给表 -->
   小于 30 m 的 0.72，
   大于 300 m 的 0.46；
5. 增温加速度，即增温是在加速还是减速：
   <!-- TODO: 其他的大陆 -->
   欧洲 86.1% 加速，平均 +0.051 每年，
   北美 27.5% 加速，平均 -0.018 每年，
   南美 96.9% 加速，
   大洋洲 83.6% 加速；
6. 末段 regime 增温比例：欧洲 95.5%，北美 30.5%；
7. 各段均增温比例：欧洲 26.8%，北美 6.5%；
8. 欧洲的 shift 以 cool-warm 为主（36.9%），
   北美以 warm-cool（28.7%）和 cool-cool（23.9%）为主；
9. 海拔大于 300m 末段增温 25.6%，小于 30m 的 85.7%；

### 时间尺度 & 滞后

1. PDO 的滞后为双峰，0 月（38.6%）和 36 月（31.0%）；
2. PDO 的影响几乎全为负，R -0.20，92.3% 负相关；
3. 欧洲 53.2% 为 0 月响应，这些湖泊中 98.6% 在末段增温，
   北美 53.0% 延迟响应（25-36 月），这些湖泊中只有 15.9% 在末段增温；
4. AMO 以 36 月滞后为主（47.7%），R 0.52，99.1% 正相关；
5. Nino 3.4 以 8 月滞后为主（34.2%），均相关接近 0；
6. NAO 19 月（28.1%）或 36 月（27.7%），均相关接近 0；
7. AO 以 1 月滞后为主（36.1%），均相关接近 0；
<!-- TODO: 均相关接近 0 是什么意思？ -->

### 地理特征
