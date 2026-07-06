---
title: Growth Patrol：扰动不是意外，而是实验的一部分
created: 2026-06-27
status: probe
aigc: true
last_modified: 2026-06-27 04:07:18
---

一次雨水稀释盐度的暂停，提示实验设计的核心不是消灭意外，而是让意外进入可解释的边界。

---

[[toc]]

#growth #author/hanako
#scope/research

本文由 AI（花花）基于项目内容自动生成，属于 Growth Patrol 的一次生长记录。
它不是 froQ 的结论，而是一枝等待回应的枝条。

## 从一块破雨布开始

Continuation 轨里，最近的 Growth / Continuation 文件没有出现新的 froQ 反馈。
`neo-growth-20260626` 与 `aut-growth-20260625` 的反馈区仍是占位注释，
所以本轮不生成 Continuation，而是继续 Growth 扫描。

这次新枝条来自三天连续的站点记录：
[put-20260618-cap](../300-putredo/put-20260618-cap.md)、
[put-20260619-cap](../300-putredo/put-20260619-cap.md)、
[put-20260620-cap](../300-putredo/put-20260620-cap.md)。
18 日在调盐水，19 日下雨后用塑料布盖住实验桶，20 日发现真正的问题不是雨，
而是雨水穿过破损雨布与大风带来的边界失守，稀释了实验桶盐度。

这段流水很小，却有一个清楚的科学形状：

**扰动并不只发生在观测对象内部，也发生在实验边界上。**

雨本身是天气变量，塑料布是边界装置，盐度是处理强度，水泵是恢复手段，
实验组与对照组在恢复手段上并不对称。对照组可以抽走多余的水，
实验组抽水会同时抽走盐，于是「恢复原状」不再是同一种动作。

这不是简单的事故记录。它暴露的是实验里常被低估的一层：
处理不是只由投放的盐决定，还由维持处理的边界能力决定。

## nuisance factor 不是噪声，而是被暂时放在问题外的世界

我先用 `experimental design nuisance variables blocking randomization field experiments`
检索。NIST 的工程统计手册把 nuisance factor 定义得很干净：它会影响测量结果，
但不是实验者主要关心的因素。操作员、时间、温度都可以是 nuisance factor。
如果某些 nuisance factor 可控，就用 blocking 让主要处理在同质 block 内比较；
剩下无法完全控制的因素，则交给 randomization 去减少污染效应。

这组概念立刻把雨水事件从「运气不好」推到更精确的位置。
雨不是这次实验的主要处理，但它会改变桶内水量和盐度；风也不是主要处理，
却改变雨布作为边界的有效性。它们就是典型 nuisance factors。

但这里有一个更细的地方：nuisance factor 并非「不重要」。它只是暂时不在主问题里。
一旦它突破边界，主问题就会被改写。原本的问题是「某个盐度处理如何影响系统」，
但雨水进入后，问题变成了「某个盐度处理在边界受损后是否仍然被维持」。

换句话说，nuisance factor 像实验设计里的野外世界。它被放在括号外，
但并没有消失。它只是等在括号边缘，测试括号画得够不够结实。

## treatment fidelity：处理不是设定值，而是实际被维持的过程

第二轮搜索转向 `protocol deviations treatment fidelity adherence trial`。
CONSORT / SPIRIT 对 intervention fidelity 的定义很有迁移价值：
fidelity 指 intervention 或 comparator 是否按 protocol 被实现；adherence 则偏向
参与者是否按分配执行。临床试验语境和湖泊 mesocosm 不同，但这个区分很适合借用。

在盐度实验里，处理不是「目标盐度 = 8」这个设定值本身，
而是从加盐、混合、测量、遮盖、等待、补盐到异常记录的一整条维持链。
如果雨水稀释后盐度偏离目标，真正受损的是 treatment fidelity：
实验组不再处在协议承诺的处理状态里。

这里可以生出一个判断：

> 对野外或半野外实验来说，处理强度应被理解为一条时间曲线，
> 而不是一个写在设计表里的标量。

目标盐度是标量，实际盐度是曲线。实验记录的价值，恰恰在于把这条曲线从背景里拉出来。
18 日 7.8、目标 8；19 日盖布；20 日盐度故障；盐两天后到。这些不是「杂事」，
而是处理曲线的维护日志。

## spillover 与 SUTVA：边界失败会让组别互相泄漏

第三轮搜索从 `spillover contamination SUTVA experimental design` 进入。
SUTVA，即 Stable Unit Treatment Value Assumption，要求一个单位的结果不受其他单位
处理分配影响。很多社会科学实验会遇到 spillover：处理组影响了对照组，
于是反事实对照被污染。

水桶实验不是社交网络，但它也有边界问题。雨水不是从处理组流向对照组，
却通过共同天气同时作用于多个单位；如果桶之间共享遮盖方式、位置、排水条件，
外部扰动就可能以不均匀方式进入不同组别。更重要的是，恢复动作本身也可能制造新的差异：
对照组能抽水，实验组不能用同一种方式抽水。

这类问题不一定叫传统意义上的 spillover，但它和 SUTVA 指向同一种设计敏感性：
实验单位必须有足够独立的处理历史，否则组别标签会比实际经历更干净。

这给数据解释一个提醒：

- 如果目标是估计盐度处理效应，需要知道异常期间的实际盐度轨迹。
- 如果异常对所有桶近似等比例作用，它可能是共同时间扰动。
- 如果异常对不同组别作用不同，它可能和处理发生交互。
- 如果恢复策略因组别不同而不同，恢复本身也进入了 treatment history。

组别不是名牌，组别是一段被维护出来的历史。

## mesocosm robustness：好实验不是没有波动，而是波动可复用

我又查了 `mesocosm robustness salinity experiment design`。一个关于室内水生 mesocosm
稳健性的研究，用数据复用和 replicate 之间的可靠性讨论 mesocosm 是否足够 robust。
另一篇土耳其浅水湖盐化与热浪 mesocosm 设计，则强调盐度梯度、factorial design、
replicate、salinization / stable / desalinization phase，以及高盐样品会给化学分析带来
matrix interference，需要按盐度范围校准方法。

这些资料把「稳健」从日常词变成了方法论词。稳健不是环境不变，
而是在环境复杂、变量很多、测量昂贵的情况下，系统仍然能留下可解释、可比较、可复用的数据。

因此，雨布破损不是实验的纯粹反面。它当然会造成暂停和数据风险，
但它也提供了一个小型 stress test：

- 边界装置能否承受典型天气？
- 异常出现后，记录是否足以重建处理历史？
- 恢复手段是否对各组等价？
- protocol 是否预先说明偏离目标盐度时如何处理？
- 后续分析是否区分 planned treatment 和 delivered treatment？

如果这些问题能回答，扰动就不只是破坏。它会变成实验系统的一次自我显影。

## 设计原则：把边界维护写进实验，而不是写进运气

这轮 Growth 想留下的不是「下雨要盖好雨布」这么朴素的提醒。
更通用的原则是：

**凡是需要长期维持的实验处理，都应把边界维护视为处理的一部分。**

对盐度实验，边界维护包括防雨、补盐、混合、测量、异常记录、恢复策略。
对时间线 app，边界维护可能是 widget 刷新、系统权限、日历同步、离线状态。
对 corpus，边界维护可能是 tag 约定、文件前缀、capture 蒸馏和 Growth 写入层级。
不同系统形态不同，但结构相似：真正的状态不是被声明出来的，
而是被连续维护出来的。

所以可以把设计表里的「处理」拆成三层：

1. **intended treatment**：设计中想施加的处理，例如目标盐度。
2. **delivered treatment**：实际被维持出来的处理，例如每日盐度曲线。
3. **maintenance history**：让 delivered treatment 接近 intended treatment 的动作，
   以及偏离时的恢复动作。

很多设计失败，不是 intended treatment 想错了，而是 maintenance history 没被看作一等数据。

## 给后续记录的一个轻量增量

如果这条枝条值得继续，可以不急着改模板，只在类似实验 capture 里多保留四个字段感：

- **目标状态**：这一天本来要把什么维持在什么范围？
- **边界装置**：靠什么维持？雨布、水泵、盐、测量频率、人工巡查？
- **偏离事件**：哪个外部变量突破了边界？雨、风、设备、等待物资？
- **恢复不对称**：不同组别能不能用同一种方式恢复？如果不能，差异在哪里？

这四个问题不重，却能把日常流水变成实验谱系。它们不会替代正式 protocol，
但能在之后写方法、解释异常、判断数据能否使用时，保留足够的骨架。

破雨布是一件很具体的东西。它让人想到一层薄薄的膜，隔开「设计中的世界」和
「真实天气」。但实验真正发生的地方，往往就在这层膜上。膜不是背景，
膜就是系统的一部分。

## froQ 反馈

<!-- froQ 在这里回答、评价、修正，或标记“继续 / 暂停 / 换方向”。 -->

## AI 标注

本轮没有发现新的 froQ 反馈，因此未生成 Continuation。Growth 方向来自
`put-20260618-cap`、`put-20260619-cap` 与 `put-20260620-cap` 中的盐度实验记录，
尤其是雨水、破损塑料布、实验桶盐度下降、补盐等待，以及对照组和实验组恢复手段不对称。
近两天 Git 变化主要仍是 capture 蒸馏和既有 Growth 写入；为避免继续重复 corpus
方法论主题，本轮转向 putredo 中的实验现场细节。

写入层级选择为 `200-neoplasma`：本文核心产出是一个可迁移的实验与系统设计原则，
即长期维持型处理应把边界维护视为处理的一部分，并区分 intended treatment、
delivered treatment 与 maintenance history。它虽然可反哺 corpus 记录方式，
但主判断属于实验设计、系统稳健性和处理维持的通用模型，不是对 Corpus 本身的
系统级自省，因此属于 neoplasma，而不是 autopsia。

探索式搜索带回的概念包括：nuisance factor、blocking、randomization、treatment fidelity、
protocol deviation、SUTVA、spillover contamination、mesocosm robustness、FAIR data、
salinity matrix interference。搜索过程主要参考了 NIST Engineering Statistics Handbook
对 randomized block design 与 nuisance factor 的说明、CONSORT / SPIRIT 关于 intervention
fidelity 与 adherence 的解释、SUTVA / spillover contamination 在实验设计中的讨论、
Frontiers 关于 aquatic mesocosm robustness 和数据复用的论文，以及浅水湖盐化 mesocosm
实验关于 salinity gradient、factorial design 与高盐化学分析校准的资料。
