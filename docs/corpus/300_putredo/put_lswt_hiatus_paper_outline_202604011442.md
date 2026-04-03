---
title: LSWT Hiatus Paper Outline
created: 2026-04-01
status: draft
last_modified: 2026-04-03 13:20:24
lang: en
---

LSWT Post-Hiatus Trend Study Memo

---

[[toc]]

#scope/work/research/warming_hiatus #scope/work/paper

## Background + Questions
- hiatus/post-hiatus framework: 1985-1998 vs 1998-2012 vs 2013-present  
- Core questions:
  * Does post-hiatus trend differ significantly from pre-hiatus?
  * What's the spatial consistency (global vs regional)?
  * [Does 2015-2018 plateau exist independently?]{.text-rose}
- Literature gap: No systematic post-hiatus LSWT segmentation analysis

## Data Checklist
Primary:
- Lakes_cci / C3S LSWT (1995-2022, 2000+ lakes)
- Backup: GloboLakes / ARC-Lake

Auxiliary:
- ERA5-Land (drivers: wind, radiation, SAT)
- Teleconnections: PDO/ENSO/AMO indices  
- Lake attributes: depth, elevation, latitude, mixing regime

## Methods Checklist
1. Segmented linear trends: MK test + Sen's slope
2. [Change point detection: PELT/BFAST/Pettitt to validate segmentation]{.text-rose}
3. Spatial consistency:
   * Trend change maps (post-pre)
   * Stratified regression/RF for spatial heterogeneity
4. 2015-2018 special test:
   * [Independent trend significance]{.text-rose}
   * [ENSO interference removal]{.text-rose}

## Results Framework
1. Global trend comparison
   * pre / hiatus / post magnitude ranking
   * [post > pre?]{.text-rose}

2. [2015-2018 plateau test]{.text-rose}
   * Independent window vs hiatus extension vs post-internal fluctuation
   * ENSO correlation test

3. Spatial consistency
   * Globally synchronized enhancement regions
   * Regional divergence patterns  
   * High-lat/elev/deep vs others

## Mechanism Explanation
- Teleconnections: PDO phase shift / ENSO interannual
- Physical processes: stilling / ice period shortening / stratification enhancement
- [Lake attribute ranking: which matters most?]{.text-rose}

## Ecological Extension
- bloom / DO / ice phenology / fish habitat
- [Lag relationship test]{.text-rose}
- Discussion only, not stealing main thread

## Next Steps Validation {.text-yellow}
1. Which is real changepoint: \~2012 vs \~2015 vs \~2018?
2. Is post-hiatus significantly higher than pre-hiatus?
3. Does spatial synchronization enhancement pattern exist?
4. PDO/ENSO/wind: which has strongest explanatory power?
5. Is bloom data worth including?
