# 08-11 湖泊研究动态补充（8 月上旬）· GLAST v2.0 待办闭合

> 2026-08-11 20:00 巡检 · 距上次湖沼学扫描（07-31）11 天 · 补充 digest

## GLAST v2.0 状态确认（08-01 遗留待办）

- **结论：尚未发布**。Zenodo 官方页面（DOI: 10.5281/zenodo.8322038）仍标注 "Stay Tuned: GLAST v2.0 is coming soon!"。
- v2.0 更新要点（官方预告）：
  - 历史记录从 1982-2020 扩展至 **2025**（覆盖近期极端热事件）
  - 未来投影升级至最新 **CMIP6** 标准（v1.0 基于 RCP/CMIP5）
- 对用户研究的潜在价值：若回归论文涉及近年极端事件时段，v2.0 发布后可直接取 2021-2025 窗口补全时间序列。建议关注 Tong/Feng 团队（南科大）发布信号。

## 新论文（8 月上旬扫描，按相关度排序）

### 1. HESS — 四十年全深度剖面：层解析驱动与事件尺度 hypolimnetic 增暖
- Mi Chenxi, Gai Bo, **Kong Xiangzhen**（中科院南京地理与湖泊研究所，同城团队）, Jiang Yuzhe, Chan Chun Ngai, Rinke Karsten
- DOI: 10.5194/hess-30-4611-2026（2026-07-21 发表）
- 对象：德国 Rappbode 水库（德国最大饮用水库），40 年高频全深度温度剖面
- 方法：监测 + 过程模型两步框架，配 interpretable ML（SHAP）做深度分层归因
- 关键结果：
  - 分层强度指标（水面温度、垂直温差、Schmidt stability）主要由 **30 天滑动平均的短波辐射与气温** 驱动
  - hypolimnion 温度在晚分层期主要由 **出流（outflow discharge）** 驱动
  - 4 个特定年份出现最高 **10°C** 的事件尺度 hypolimnetic 增暖，机制为深水取水强化 → 弱化密度梯度 → 上层暖水下传
- 与用户研究关联：层解析驱动归因框架可迁移；hypolimnetic warming 事件机制与「湖泊温度年代际变化」叙事互补。通讯作者 Kong 在南湖所，未来若有合作/引用语境值得关注。

### 2. npj Climate and Atmospheric Science — 东北中国湖冰冰情变化与冬季经济活动
- Lu Peng, Huo Puzhen（大连理工）等，含 Leppäranta（赫尔辛基）、Cheng Bin（芬兰气象所）、**Kirillin**（IGB Berlin）
- DOI: 10.1038/s41612-026-01453-1（2026 年，npj CAS）
- 方法：一维热力学湖冰模型 + 机器学习残差校正；32 湖卫星冰情（2001-2014）训练验证；1901-2100 历史回溯 + CMIP6 投影（SSP126/370/585）
- 关键结果：
  - 1970s 起冻结推迟、解冻提前、冰期缩短
  - 三情景区域气温 +1.2~8.1 °C/century，冰期 -13.6~49.8 d/century
  - **SSP585 下历史极端冰情成为新常态**（"historically extreme conditions become the new phenological state"），冬季旅游与渔业的季节规划承压
- 与用户研究关联：冰封变化核心领域 + CMIP6 投影 + 中国东北区域案例，直接可用于冰封时间序列的方法参照。

### 3. Polar Science — 新地群岛（Novaya Zemlya）湖冰解冻提前
- Maraldo, Choi 等，DOI: 10.1016/j.polar.2026.101365（2026-02-21 online）
- MODIS 2000-2024，俄罗斯高北极 25 年证据：解冻日期提前、开放水域季延长
- 价值：补足高北极区域冰情空白（此前覆盖 Alaska/加拿大/斯堪的纳维亚为主），可作为区域扩展引文。

### 4. J. Contaminant Hydrology — 抚仙湖热分层对极端天气的响应
- Jin Chao 等（云南），DOI: 10.1016/j.jconhyd.2026.104879（2026-02，Vol 277）
- EFDC 模拟热浪/寒潮/强风三类极端事件对深水高原湖分层的扰动与恢复
- 结果：热浪压缩混合层、强风加深混合层、寒潮轻微冷却表层；提出 10 m 取水口 + 风停后 5 天监测等管理建议
- 相关度中等：中国深水湖 + 极端天气事件尺度，与 #1 的事件尺度叙事呼应。

## 小结

8 月上旬湖沼学无 Nature Water/NCC 级别重磅，但 #1（HESS）与 #2（npj CAS）与用户核心研究（湖泊增暖/冰封变化/年代际趋势）直接相关且方法可参照；GLAST v2.0 仍 in progress，是唯一值得保持跟踪的发布信号。

## 关联笔记

- 2026-07-29-lake-research-mid-recovery-digest.md（6 篇全景）
- 2026-07-31-lake-ice-threshold-pnas-supplement.md（PNAS 冰情阈值 / L&O 热浪趋同）
- 2026-08-01-monthly-switch-d10-context.md（GLAST v2.0 待确认来源）
