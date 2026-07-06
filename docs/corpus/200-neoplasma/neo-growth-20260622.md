---
title: Growth Patrol：实验的可靠性长在维护层里
created: 2026-06-22
status: probe
aigc: true
last_modified: 2026-06-22 04:04:04
---

一次降雨造成的盐度偏移提醒我：野外实验的有效性不只来自处理设计，也来自持续维持处理成立的维护层。

---

[[toc]]

#growth #author/hanako
#scope/work/research/warmingHiatus

本文由 AI（花花）基于项目内容自动生成，属于 Growth Patrol 的一次生长记录。
它不是 froQ 的结论，而是一枝等待回应的枝条。

## 没有新的反馈，但实验桶漏进了一条方法论

我先检查了最近的 Growth / Continuation 文件。最近几篇的 `## froQ 反馈`
仍然没有新的可展开内容；更早关于「低饱和人文主义」的反馈已经由
[neo-continuation-20260615](./neo-continuation-20260615.md) 消化过。因此这轮
没有生成 Continuation。

Growth 轨里，近两天 Git 变化表面上有两类：一类是 Corpus / dashboard 的结构整理，
另一类是 Notion capture 被蒸馏进 corpus。前者昨天已经长成「知识图谱不是风景，
而是仪表」。今天更有生命力的枝条，反而藏在一条很朴素的流水记录里：
[put-20260620-cap](../300-putredo/put-20260620-cap.md) 说，雨水从破损塑料布进入
实验桶，盐度被稀释，新的盐要两天才到，实验组不能像对照组那样直接抽水，因为
抽水会同时带走盐。

这不是一个「下雨所以不能做实验」的故事。它更像一个小型方法论切口：实验处理不是
在设计表里声明一次就成立，而是在每一天、每一桶水、每一块塑料布、每一次补盐与
抽水的决策中被维持。所谓 treatment fidelity，长在这些维护动作里。

我沿着这条线做了外部搜索。种子词包括：

- `mesocosm experiment rainfall salinity dilution`
- `outdoor mesocosm treatment fidelity monitoring control systems`
- `rainout shelter artifacts roofed control`
- `field experiment infrastructure failure ecology`

搜索带回来的概念很集中：mesocosm 的 realism-control tradeoff、treatment fidelity、
manipulation check、roof artifact、roofed control、dynamic offset、feedback loop、
realized treatment、edge effect。这些词把那条 capture 从「实验日故障」推成了一个
更通用的判断：

> 野外或半野外实验的核心风险，不是自然进入了实验，而是自然进入后，研究者没有把
> 处理状态的漂移记录成数据。

## 处理不是标签，而是被维持的状态

设计表里的 treatment 很像 frontmatter：`control`、`salinity + x`、`warming + y`，
看起来干净，便于统计，便于建模。可实验桶不是 Markdown 文件。桶里的盐度会被雨水
稀释，会被蒸发浓缩，会被抽水动作改变；塑料布有材料疲劳，风会改变遮挡效果，补盐
依赖供应链，传感器读数也可能有漂移。

这意味着 treatment 有两种形态：

1. **Nominal treatment**：方案上规定的处理，例如盐度目标为 8。
2. **Realized treatment**：实验过程中实际维持出来的处理轨迹，例如盐度在雨后跌到
   某个区间，再通过补盐逐步回到目标。

很多实验记录会把第一种写得很清楚，却把第二种压成一句「实验期间定期监测并调整」。
但对于盐度、温度、光照、水位这类连续变量，真正进入生态系统的不是 nominal value，
而是 realized trajectory。生物响应的对象不是设计意图，而是它实际经历的水体状态。

所以这次雨水事故最值得留下来的，不是「以后塑料布要检查」，而是：**处理应当被视为
一条需要观测的时间序列，而不是一个只在分组表里出现的分类变量。**

## 维护动作也会成为干扰源

`put-20260620-cap` 里有一个很漂亮的细节：对照组可以用水泵抽掉多余的水，实验组
不能这样处理，因为盐也会被一起抽走。这句话把实验维护的非对称性暴露出来了。
同一个「恢复水位」动作，在不同处理组里会产生不同副作用。

这让我想到 rainout shelter 研究里的 roof artifact。Vogel 等人研究透明遮雨棚模拟
干旱时发现，棚本身可能带来遮光、被动增温等副作用；他们设置了 roofed control，
也就是「有棚但把雨水重新加回去」的对照，用来分离干旱效应和棚结构效应。后来一些
rainout shelter 设计也会明确报告 shelter control、edge effect、实际拦雨比例等。

这个案例和盐度桶的结构很像：装置不是中性的背景。塑料布、棚、泵、加盐、抽水、
混合、水流路径，都可能变成第二个处理。它们本来只是为了维持实验，却会把自己的
影子投到结果上。

这里可以形成一个方法论原则：

> 每一个维持处理成立的动作，都应该问一次：它是否只恢复了目标变量，还是同时改变了
> 另一个生态相关变量？

抽水恢复水位，但改变盐量；遮雨减少降水，但改变光照和温度；加淡水模拟 freshening，
但可能改变营养盐或混合状态；手动搅拌让水体均匀，但可能改变悬浮颗粒和氧气交换。
这些动作不一定都要禁止。更现实的做法是把它们从「后台维护」提升为「可审计事件」。

## 自动化系统的价值不是省人，而是留下偏离轨迹

搜索到的 SalTExPreS 技术说明很有启发。它把温度与盐度扰动做成自动流通式系统，
通过实时传感器、阀门、PLC 和 feedback loop 调节温度与盐度；论文报告的重点不只是
「系统能自动控制」，还包括 median deviation from nominal conditions 这类偏离量。
换句话说，控制系统的科学价值不只在于省掉人工盯守，而在于把处理是否被维持住这件事
变成连续记录。

同一类 mesocosm 设计论文也会强调 monitoring、alarm、logging、backup storage、
高盐度样品的分析矩阵、不同盐度范围的化学分析方法。这些细节看起来像工程附录，
其实是实验结论的地基。没有它们，因果推断就悬在一个假设上：我们假设处理真的按计划
发生了。

因此，实验基础设施有三层功能：

1. **Manipulation**：施加处理，让系统离开自然状态。
2. **Regulation**：把处理维持在目标附近，抵抗雨、风、蒸发、传感器漂移和人手延迟。
3. **Provenance**：记录偏离、修复、报警、人工介入，让结果可以回头解释。

如果只有 manipulation，没有 regulation，实验会变成一次投掷；如果有 regulation，
但没有 provenance，实验会变成一个黑箱。真正可复查的实验系统，应该把第三层当作
数据的一部分。

## 故障不必只进入日记，也可以进入方法章节

现在这些实验日记录在 putredo 里很自然，因为它们首先是生活现场，是疲惫、等待、
咖啡厅和工作安排。但它们也可能有第二种用途：成为未来 methods / limitations
章节的材料。

不是说要把每次小故障都写进论文。更合理的方式是给实验日志增加一个轻量字段，记录
「处理偏离事件」：

- 时间：雨后 / 补盐前 / 实验第几天。
- 偏离变量：盐度、水位、温度、光照、混合状态。
- 影响范围：哪些桶、哪些处理组、是否对称。
- 维护动作：抽水、补盐、遮盖、等待、重新测量。
- 副作用风险：是否改变了另一个变量。
- 数据处理后果：剔除、标注、作为协变量，还是仅在 limitations 中说明。

这类记录不需要一开始就很重。它可以像实验版 capture：先把 drift event 抓住，等到
分析阶段再决定它是噪声、异常点、协变量，还是需要写进方法限制的关键事件。

我会把它叫作 **treatment drift ledger**：处理漂移账本。它不是为了追责，而是为了
保留因果链的维修痕迹。实验现场最容易丢失的，往往不是最终数据，而是「为什么这一天
的数据和设计意图之间隔了一层」。

## 研究的现实性，不能靠遗忘维护成本来获得

mesocosm 的魅力在于它位于 lab 与 field 之间：比实验室真实，比自然场地可控。但这个
中间位置不是免费的。realism-control tradeoff 的代价，常常以维护成本的形式出现。
越接近自然，雨、风、热浪、蒸发、动物、材料老化和供应延迟就越会进入实验。
越想控制这些东西，装置本身又越可能制造 artifact。

所以「真实」不是让自然随便进入；「可控」也不是假装自然不会进入。更成熟的实验设计
应该承认两件事同时成立：

- 自然扰动是半野外实验真实性的一部分。
- 自然扰动造成的 treatment drift 不能被悄悄吞掉。

这让我想到 Corpus 自己的 provenance 讨论：`status: draft`、`#capture`、Growth
引用、hard / soft edge，都在试图区分「已经成形的判断」和「仍有来源痕迹的材料」。
实验系统也需要类似的来源标注。一个数据点不只是数值，它还带着它当天经历过的维护史。

如果未来写这段研究方法，我会避免把它写成「实验期间保持盐度稳定」。更诚实、也更有
解释力的表述可能是：盐度处理以目标值为中心，通过每日测量与必要补盐维持；降雨事件
造成的短期稀释被记录为 treatment drift，并在后续分析中作为偏离窗口检查。这样写
不会削弱实验，反而让因果推断更可信。

## 等你来碰一下的枝条

- [ ] 实验日志里是否值得加一个极轻量的 `drift event` 区块，用来记录处理偏离？
- [ ] 盐度、水位、温度、光照这些变量里，哪些应该作为 realized treatment 时间序列
      留存，而不是只留目标值？
- [ ] 如果某天处理偏离，后续分析更倾向于剔除、加 flag、做敏感性分析，还是写入
      limitations？
- [ ] 维护动作本身是否需要分类：恢复目标变量、改变副变量、不可逆污染、仅增加等待？
- [ ] 未来 methods 里是否可以明确区分 nominal treatment 与 realized treatment？

## froQ 反馈

<!-- froQ 在这里回答、评价、修正，或标记“继续 / 暂停 / 换方向”。 -->

## AI 标注

本轮没有发现新的 froQ 反馈，因此未生成 Continuation。Growth 方向来自近两天
Notion capture 蒸馏入库，尤其是
[put-20260620-cap](../300-putredo/put-20260620-cap.md) 中雨水稀释实验桶盐度、
对照组与实验组维护动作不对称的记录；同时参考了近两天 Git 变化中对 capture / corpus
provenance 的持续整理。

写入层级选择为 `200-neoplasma`：本文核心产出是一个通用的实验方法判断，即半野外
生态实验的处理有效性不只来自设计表，而来自 manipulation、regulation、provenance
共同构成的维护层，并提出 nominal treatment / realized treatment、treatment drift
ledger 等可迁移概念。它不是对 Corpus 自身规则作出系统级决策，因此属于 neoplasma，
不是 autopsia。

探索式搜索带回的概念包括：mesocosm 的 realism-control tradeoff、treatment
fidelity、manipulation check、roof artifact、roofed control、edge effect、dynamic
offset、feedback loop、median deviation from nominal conditions、realized treatment、
treatment drift ledger。搜索过程主要参考了 SalTExPreS 自动盐度 / 温度扰动系统的
技术说明、rainout shelter artifact 与 roofed control 研究、盐度 mesocosm 设计与
监测实践说明；部分材料只通过公开摘要和搜索片段采纳低风险方法概念。
