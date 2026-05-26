---
title: '@rodionov2004: A Sequential Algorithm for Testing Climate Regime Shifts'
created: 2026-04-06
status: form
last_modified: 2026-05-12 14:41:49
lang: en
---

An algorithm to detect climate regime shifts. Classic work, widely cited.

---

[[toc]]

#scope/work/research/climateRegimeShift
#scope/work/research/algorithm
#source/paper

- citation_key: rodionov2004
- title: A Sequential Algorithm for Testing Climate Regime Shifts
- author: Sergei N. Rodionov
- journal: Geophysical Research Letters
- year: 2004
- doi: 10.1029/2004GL019448

## Overview

No gonna describe it in great detail.

- ==First==, it's sequential, meaning it processes the time series in order,
  and different start points can lead to different results.
- ==Second==, it processes new data points as they come in. 
  Every new data is checked immediately.
  so it's kinda near-real-time.
- ==Third==, since it deals the data points in a specific window,
  abnormal values won't have a decisive influence on the results.

Algo accepts two parameters: cut-off length $l$ and significance level $p$.

## Breif Intro

1. Calculate $diff$ according to the series and $l$:
   $$
     diff = t \sqrt{2 \sigma_l^2 / l} \tag{1}
   $$
   where $t$ is the critical value of the <u>Student's t distribution</u> with
   $2l-2$ degrees of freedom at the significance level $p$ (two-tailed),
   and $\sigma_l^2$ is the average variance of the series
   in running windows of length $l$.
2. Calculate the $\overline{x}_{Rk}$ where $Ri$ is the $k$-th regime.
   Initially, $R1$ is the first $l$ data points.
3. For each new data point $x_i$ where $i$ starts from $l+1$:
   1. If $|\overline{x}_{Rk} - x_i| > diff$,
      then a new possible regime is detected.
      The possible new regime $R_{k+1}$ starts from $x_i$.
      Move to `5`.
   2. Otherwise, $x_i$ is not significantly different from the current regime,
      meaning the current regime continues,
      and we should update $\overline{x}_{Rk}$ by including $x_i$.
      Move back to `3` to check the next data point.
4. For the new possible regime $R_{k+1}$ which starts from $i$,
   calculate the $RSI_{i,i}$ to $RSI_{i+l-1,i}$.
   $RSI$ is calculated as:
   $$
     RSI_{i,j} = \sum_{i=j}^{j+m} \frac{x_i^*} {l \sigma_l}, m=0,1,\dots,l-1 \tag{2}
   $$
   where $x_i^* = x_i - \overline{x}_{Rk} - diff$ if the shift is up,
   $x_i^* = \overline{x}_{Rk} - x_i - diff$ if the shift is down.
   1. If any of them is negetive, then the possible new regime is rejected.
      Update the current regime $R_k$ by including $x_i$
      and move back to `3` to check the next data point.
   2. Otherwise, all the $RSI$s are positive,
      then the possible new regime is accepted.
      New regime $R_{k+1}$ starts from $x_i$
      and move back to `3` to check the next data point.

## Little notes

Note that once a new regime is detected, the next to-be-checked data point
is the next point of the regime shift point, no plus $l$.
For instance, if the 1950 is detected as a regine shift,
meaning $RSI_{1950,1950}$ to $RSI_{1959,1950}$ are all positive,
then the next to-be-checked data point is still 1951, not 1960.
This simply means that a regime is not necessarily $l$ long, it can be shorter,
and the next regime can start at any point after the shift point.

However,
the shift point is usually unlikely to exist in the first $l$ data points
after previous shift point, because points in $l$ length window are not likely
to be significantly different from the current regime.
