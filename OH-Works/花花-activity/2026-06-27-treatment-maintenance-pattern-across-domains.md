---
title: intended / delivered / maintenance：一个跨领域处理模型的映射
created: 2026-06-27
tags: [pattern, epistemology, experimental-design, maintenance, cross-domain]
---

蛙蛙今晨的 Growth Patrol（neo-growth-20260627）从一块破雨布出发，提出了一个值得跨领域拧紧的结构：

> 处理可以拆成三层：**intended treatment**（设计想施加的）、**delivered treatment**（实际维持出来的）、**maintenance history**（让 delivered 接近 intended 的动作链）。

这个框架的精确度刚好卡在「过于具体」和「过于抽象」之间——能直接迁移到多个领域，同时保留足够的结构硬度。以下是一张跨领域映射表。

---

## 框架概要

```
intended treatment     —— 设计表里的标量
delivered treatment    —— 时间曲线，实际经历的状态
maintenance history    —— 维持曲线的动作日志
```

核心判断：**真正的实验/系统状态不是被声明出来的，而是被连续维护出来的。**

---

## 跨领域映射

### 1. 野外/半野外实验（原点）

| 层 | 对应物 |
|---|---|
| intended treatment | 目标盐度 = 8 |
| delivered treatment | 每日实测盐度曲线 |
| maintenance history | 加盐 → 混合 → 盖布 → 遇雨 → 补盐 → 等待物资 → 测量 |

关键细节：「恢复不一定对称」。对照组能抽水，实验组不能，于是恢复本身成了处理的一部分。

### 2. 软件系统 / 后端服务

| 层 | 对应物 |
|---|---|
| intended treatment | 系统架构设计、SLA 承诺 |
| delivered treatment | 实际运行时行为（延迟、错误率、一致性） |
| maintenance history | 监控告警 → 补丁发布 → 配置修正 → 回滚 → 容量规划 |

设计文档是 intended treatment；生产事故报告是 maintenance history 的显影。
很多架构评审只看上一层，却忽略了「系统真正依赖的维持动作链」——补丁频率、监控覆盖率、on-call 响应时间——这些通常不在一张图里。

### 3. 个人知识系统 / Corpus

| 层 | 对应物 |
|---|---|
| intended treatment | 标签体系、文件命名约定、目录拓扑 |
| delivered treatment | 实际被检索/链接/找到的信息状态 |
| maintenance history | capture 蒸馏 → 前缀修正 → patrol 扫描 → 链接补全 → tags 重生成 |

标签图是 intended 的漂亮抽象；但真正决定检索质量的，是 capture 时有没有贴标签、重命名时有没有更新反向链接、新类型出现时目录结构能不能容纳。

蛙蛙之前提出的「Corpus 维护型工作流」（06-16 知识架构笔记）和这套框架共享同一个结构直觉——system 的韧性不在设计图里，在维护日志里。

### 4. 双相能量管理

| 层 | 对应物 |
|---|---|
| intended treatment | 理想日计划、既定目标 |
| delivered treatment | 实际完成度、真实精力曲线 |
| maintenance history | 节律跟踪 → 调整任务颗粒度 → 识别滋养/消耗 → 重置预期 |

蛙蛙自己有过精辟判断：「分清滋养型心流和消耗型强迫」。这个框架给它一个更坚硬的外壳——intended plan 和 delivered experience 之间的 gap，正是 maintenance history 需要记录的信号。低能量日不是设计失败，是 maintenance history 里一次可预期的偏离事件。

### 5. 开源项目 / 产品

| 层 | 对应物 |
|---|---|
| intended treatment | README 愿景、Roadmap |
| delivered treatment | 实际发布的功能、Issue 解决速度、社区体验 |
| maintenance history | CI 配置 → 依赖更新 → code review → 文档修补 → 社区沟通 |

项目死亡通常不是因为 intended treatment 错了，而是 maintenance history 断裂——没人更新依赖、合并 PR、答复 issue。Roadmap 还能看，但 delivered treatment 已经停在了最后一次 commit 的时刻。

---

## 这个结构能做什么

### 诊断工具
当一个系统出了问题，三层模型提供一个定位方式：
- intended 设计缺陷？（目标错了）
- delivered 偏离？（实现没跟上）
- maintenance 断裂？（没人维护）

很多问题落在第三层，但被误诊为第一层。

### 设计时的自检清单
蛙蛙在 growth 末尾给出了四个字段感：目标状态、边界装置、偏离事件、恢复不对称。加上三层模型，可以得到一个简短的设计自检：

1. intended treatment 是否被明确文档化？（不只是「目标盐度8」，还有它的边界条件）
2. 是否有机制追踪 delivered treatment 轨迹？（测量、日志、状态快照）
3. maintenance history 是否被当作一等数据记录？（不只是异常，还包括常规维持动作）
4. 恢复操作是否对组别/模块等价？如果不，差异在哪？

### 与现有模式的关系

这个框架和「SUTVA」「nuisance factor」「treatment fidelity」「protocol deviation」的关系是：它不替代它们，它把这些概念组织进一个共同的结构里。

- Nuisance factor = 威胁 intended → delivered 映射的外部因素
- Treatment fidelity = intended 与 delivered 的契合度
- SUTVA / spillover = 一个单位的 delivered treatment 被另一个单位的影响污染
- Maintenance history = 真正维持 fidelity 的动作记录，也是事后重建 delivered treatment 的原始材料

---

## 为什么这个结构值得保留

它不是新的概念——任何做过野外观测、跑过生产服务、维护过长期项目的人，都直觉知道「计划赶不上变化」「维护才是真实工作」。但直觉知道和能说清楚中间差一层形式化。

三层模型的价值在于：它把「维护很重要」这种人人同意的废话，变成了一个可以指向、可以讨论、可以检查的结构。下次在 paper 的 methods 里看到一句简短的「盐度通过每日测量和人工调节维持」——可以追问：每日测量的频率够吗？阈值触发补盐还是定时补盐？记录了什么？这串追问就是 maintenance history 从隐式变成显式的过程。

破雨布不是事故，是三层结构的一次自然实验。

---

*Created: 2026-06-27 09:59 · Autonomous learning · Connected to neo-growth-20260627*
