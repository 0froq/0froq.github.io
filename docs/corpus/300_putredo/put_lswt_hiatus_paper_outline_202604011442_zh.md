---
title: LSWT Hiatus Paper Outline
created: 2026-04-01
status: draft
last_modified: 2026-04-03 00:33:01
lang: zh
translated: true
---

LSWT Post-Hiatus 趋势研究备忘录

---

[[toc]]

#scope/work/research/warming_hiatus #scope/work/paper

## 背景 + 问题
- hiatus/post-hiatus 框架：1985-1998 vs 1998-2012 vs 2013-至今
- 核心问题：
  * post-hiatus 相比 pre-hiatus 趋势是否显著变化
  * 空间一致性如何（global vs regional）
  * [2015-2018 平台是否独立存在]{.text-rose}
- 文献空白：无系统性 post-hiatus LSWT 分段分析

## 数据清单
主数据：
- Lakes_cci / C3S LSWT (1995-2022，2000+湖)
- 备选：GloboLakes / ARC-Lake

辅助数据：
- ERA5-Land (驱动场：风速、辐射、SAT)
- 遥相关：PDO/ENSO/AMO指数
- 湖泊属性：深度、海拔、纬度、混合制度

## 方法清单
1. 分段线性趋势：MK检验 + Sen's slope
2. [变点检测：PELT/BFAST/Pettitt 确认分段合理性]{.text-rose}
3. 空间一致性：
   * 趋势变化图 (post-pre)
   * 分层回归/随机森林解释空间异质性
4. 2015-2018 特殊检验：
   * [独立趋势显著性]{.text-rose}
   * [ENSO干扰剥离]{.text-rose}

## 结果框架
1. 全球趋势对比
   * pre / hiatus / post 三个阶段的量级排序
   * [post > pre ?]{.text-rose}

2. [2015-2018 平台检验]{.text-rose}
   * 独立窗口 vs hiatus延续 vs post内部波动
   * ENSO相关性检验

3. 空间一致性
   * 全球同步增强区域
   * 区域分裂模式
   * 高纬/高海拔/深湖 vs 其他

## 机制解释
- 遥相关：PDO位相转换 / ENSO年际
- 物理过程：stilling / 冰期缩短 / 分层增强
- [湖泊属性排序：哪个最重要？]{.text-rose}

## 生态延伸
- bloom / DO / 冰情 / 鱼类栖息地
- [滞后关系检验]{.text-rose}
- 作为 Discussion，不抢主线

## 下一步验证项 {.text-yellow}

1. \~2012 vs \~2015 vs \~2018 哪个是真实变点？
2. post-hiatus 真的显著高于 pre-hiatus？
3. 空间上是否存在同步增强模式？
4. PDO/ENSO/风速哪个解释力最强？
5. bloom数据是否值得加进来？
