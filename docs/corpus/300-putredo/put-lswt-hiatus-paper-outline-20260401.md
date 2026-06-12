---
title: LSWT Hiatus Paper Outline
created: 2026-04-01
status: void
last_modified: 2026-04-22 01:29:51
lang: en
---

LSWT Post-Hiatus Trend Study Memo

---

[[toc]]

#scope/work/research/warmingHiatus #scope/work/paper

## Background + Questions

- hiatus/post-hiatus framework: ?-1998 vs 1998-2012 vs 2012-present
- Core questions:
  - Does [post-hiatus]{.text-amber} trend differ significantly from [pre-hiatus]{.text-amber} and [hiatus]{.text-amber}?
  - What's the [spatial]{.text-amber} consistency?
    - Layback?
    - Trend / trend change vary?
  - [(Does 2015-2018 plateau exist independently?)]{.text-rose}
  - [(Dose PDO impact on warming reversed?)]{.text-rose}

## Data Checklist

> We need to compare the trend among pre-hiatus, hiatus and post-hiatus.
> Hiatus is about 14 year(1998-2012), post-hiatus maybe 12 is the best we can do.
> I think we should garantee at least 12 year for pre-hiatus,
> so 1986 should be the latest start point.
>
> I don't think the easily available datasets can cover 1986-2024.
>
> Another issue. There was a climate regime shift around late 1980s,
> which may cause a significant temperature or trend change around.
> So if we start from 1986,
> the pre-hiatus trend may be affected by this regime shift.
> [@reid2016](../100_ingesta/ing_@reid2016.md) says the shift year varies
> among regions. See this figure:
> ![@reid2016 f6](/attachments/reid2016/reid2016-f6.png)
> If we are to be strict, we need to test every timeseries for to avoid the
> influence of this shift.

### LSWT datasets

- [ESA CCI](https://cds.climate.copernicus.eu/datasets/satellite-lake-water-temperature?tab=overview)
  - 0.05° \* 0.05°, 1995-2024
  - Big data. I haven't fully explored it yet.
- [GloboLakes](https://catalogue.ceda.ac.uk/uuid/76a29c5b55204b66a40308fc2ba9cdb3/)
  - per lakes(?maybe), 1995/05/31-2016/12/31
  - Download from [here](https://data.ceda.ac.uk/neodc/globolakes/data/lake-surface-temp/per-lake)
- [ARC-Lake](https://www.laketemp.net/home_ARCLake/)
  - per lakes(?maybe), 1995-2012
  - Download from [here](https://www.laketemp.net/home_ARCLake/per_lake_data.php)
- [ERA5-Land](https://cds.climate.copernicus.eu/datasets/reanalysis-era5-land-monthly-means?tab=overview)
  - 0.1° \* 0.1°, 1950-2025
  - Only Lake mix-layer temperature, but water in this layer is well mixed
    and has a near constant temperature with depth. A good proxy for LSWT.
  - Reanalysis data, might not accurate as satellite.

:::tip TODO
#todo: What vars do they provide? Vars in thost dataset might have better
consistency than ERA5-Land, but they might not have all the drivers we need for
mechanism explanation.
:::

### Drivers and attributes (Need to be explored)

- ERA5-Land
- Teleconnections: PDO/ENSO/AMO indices
- Lake attributes: depth, elevation, latitude, mixing regime
- Ecological: bloom, DO, ice phenology, fish habitat
- Human: population

## Methods Checklist

> Generally, we want to compare the trend among pre-hiatus, hiatus and post-hiatus.
>
> We can do it in a:
>
> 1. predefined segmentation way, i.e., 1986-1998, 1998-2012, 2012-2024. or,
> 2. data-driven way, i.e., use changepoint detection to
>    determine the segmentation.
>
> They both have their cons. 1 is more straightforward but due to spatial
> heterogeneity, the segmentation may not be optimal for all lakes.
> 2 has the issue that the changpoint detection may be affected by the internal
> variability, the results may be far from the "hiatus" definition.
> And because the length is not that long and the trends are not that strong,
> in addition to its method / param sensitivity, results may be not that robust.
>
> A better approach may be to combine both. Although the "hiatus" is spatial
> heterogeneous, it is still a global phenomenon and the actual "hiatus" period
> should be around 1998 (pre -> hiatus) and 2012 (hiatus -> post) for most lakes.
> We can use STARS(Sequential t Test Analysis of Regime Shifts,
> [@rodionov2004](../100_ingesta/ing_@rodionov2004.md)) to detect the changepoints
> within a window (for example 3 years) around these 2 key years.
>
> Also, if we need to say something about the 2015-2018 platform,
> we can do a 3 or 5-year running trend.

- Changepoint detection in predefined window (STARS)
- Trend comparison: Mann-Kendall test / Sen's slope / linear regression
- Spatial heterogeneity: trend map / clustering
  - Comparison among lake groups (e.g., by lat/elev/depth/mixing regime)
  - EOF? PCA? Need to explore.
- Teleconnection and driver correlation
  - Correlation test (Pearson/Spearman)
  - Multiple regression / Random forest for attribute importance ranking
  - If there is a phase shift in the PDO/ENSO
- Lag correlation test for ecological extension
  - Eh, is the "lag" needed? Since we are probobly doing it in a annual scale,
    the lag may not be that meaningful. Anyway let's keep it in mind.

## Results Framework

### Global trend comparison

- pre / hiatus / post magnitude ranking
- [post > pre?]{.text-rose}

### [2015-2018 plateau test]{.text-rose}

- Independent window vs hiatus extension vs post-internal fluctuation
- (ENSO correlation?)

### Spatial consistency

- Globally synchronized enhancement regions
- Regional divergence patterns
- High-lat/elev/deep vs others

### Mechanism explanation

- Teleconnections: PDO phase shift / ENSO interannual
- Physical processes: stilling / ice period shortening / stratification enhancement
- [Lake attribute ranking: which matters most?]{.text-rose}

### Ecological Extension

- bloom / DO / ice phenology / fish habitat
- [Lag relationship test]{.text-rose}
