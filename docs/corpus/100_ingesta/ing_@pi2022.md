---
title: Mapping Global Lake Dynamics Reveals the Emerging Roles of Small Lakes
created: 2025-10-29
status: probe
last_modified: 2025-12-15 19:06:04

---

---

[[toc]]

#source/paper

- citation_key: pi2022
- title: Mapping Global Lake Dynamics Reveals the Emerging Roles of Small Lakes
- author: Xuehui Pi, Qiuqi Luo, Lian Feng, Yang Xu, Jing Tang, Xiuyu Liang, Enze Ma, Ran Cheng, Rasmus Fensholt, Martin Brandt, Xiaobin Cai, Luke Gibson, Junguo Liu, Chunmiao Zheng, Weifeng Li, Brett A. Bryan
- journal: Nature Communications
- year: 2022
- doi: 10.1038/s41467-022-33239-3

## Points

- [GLAKES](https://garslab.com/?p=310&lang=zh-hans)
  - global lakes (and reservoirs)
  - min area 0.03 $km^2$
  - 3.4 million more
- dynamics of lake area over 35 years (1984-2019)
- small lakes important

---

## Procedure

- [U-net](#u-net)
- Landsat
- 1984-2019

## Deeper

### U-Net

pixel-wise semantic segmentation
on the Global Surface Water Occurrence (GSWO) dataset
(1984-2019, 30m).

#### Input data

- source: GSWO dataset (from Landsat imagery)
- coverage: 60°S to 80°N
- resolution: 30 m pixels
- input image patches: 512 \* 512 pixels

#### Label

- GSWO (mask land/non-water)
- GRWL (Global River Widths from Landsat): mask rivers
- OSMWL (OpenStreetMap Water Layer): validate rivers & oceans
- HydroLAKES: confirmed lake polygons

#### Manually Corrected\*

- **split connected river–lake systems**
  - far less than 1%
- exclude low-confidence water pixels
  - lt 5% occurrence
  - 30% occurrence for floodplains
- min area 0.03 $km^2$ (about 33 pixels)

#### Model

- simplified loss
- MIoU (Mean Intersection over Union) as metric
- 2 models for normal and floodplain
- t/v/t: 60%/20%/20%

#### Post-processing

- checked area ratio before/after masking
  - if lt 0.8, indicates it's not even likely to be a water body, discard
- overlaid GRWL and OSMWL masks
- removed coastal lakes intersecting ocean boundaries (10m buffer)
- merged outputs of Normal Model and Floodplain Model
