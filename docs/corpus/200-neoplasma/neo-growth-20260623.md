---
title: Growth Patrol：上下文不是仓库，而是工作台
created: 2026-06-23
status: probe
aigc: true
last_modified: 2026-06-23 04:03:12
---

长上下文的真正风险不是装不下，而是工作状态在大量材料中失去可执行的形状；论文分析也需要从堆上下文转向维护主张骨架。

---

[[toc]]

#growth #author/hanako
#scope/research

本文由 AI（花花）基于项目内容自动生成，属于 Growth Patrol 的一次生长记录。
它不是 froQ 的结论，而是一枝等待回应的枝条。

## 没有新的反馈，但 600k 上下文露出一条硬边

我先检查了最近的 Growth / Continuation 文件。最近几篇的 `## froQ 反馈`
仍然没有新的可展开内容；更早关于「低饱和人文主义」的反馈已经由
[neo-continuation-20260615](./neo-continuation-20260615.md) 消化过。因此这轮
没有生成 Continuation。

Growth 轨里，近两天 Git 变化仍然围绕 capture 蒸馏和格式修正展开。昨天的枝条已经
从降雨稀释实验桶长到 treatment drift ledger；如果继续写实验维护，会过度停留在
同一片田里。今天更值得接住的是
[neo-20260621-cap](./neo-20260621-cap.md) 里的两句并排记录：一边是「需要逐步列出
所有原子化结论，然后从中探索关键点」，另一边是「上下文 600k 的时候，Deepseek v4 pro
已经出现不听指令的症状」。

这两个观察看似一个属于论文方法，一个属于模型体验；实际上它们指向同一个结构：
材料变多之后，系统最先损坏的往往不是存储能力，而是**工作状态的可执行性**。论文分析
堆了很多图、结果和上下文，仍然可能找不到主张；LLM 拥有很长窗口，仍然可能忘记该怎样
服从任务。

我沿着这条线做了外部搜索。种子词包括：

- `LLM long context instruction following degradation lost in the middle`
- `RULER effective context length long context benchmark`
- `context engineering write select compress isolate`
- `scientific claim extraction evidence capsule atomic claims`

搜索带回来的概念很集中：lost-in-the-middle、effective context length、RULER、
Goal Accessibility Ratio、attention channel closure、residual channel、context
engineering、write / select / compress / isolate、context poisoning / distraction /
confusion / clash、claim-evidence matrix、executable claims、evidence capsule。
它们把这条 capture 推向一个更通用的判断：

> 长上下文不是更大的仓库，而是一张更容易被杂物占满的工作台。

## 广告长度不是有效长度

RULER 的问题问得很直接：长上下文模型真正能用的上下文长度是多少？它批评普通的
needle-in-a-haystack 测试过于简单，因为模型能从长文本里捞出一根针，并不等于它能在
长上下文里做多跳追踪、聚合、排除干扰和持续遵循任务。RULER 的结果里有一个很适合
留下来的词：**effective length**。模型宣称支持 128K、200K、1M，不代表复杂任务在
这个长度上仍然保持可靠。

这对「600k 上下文时开始不听指令」的观察很有解释力。上下文窗口的物理容量像硬盘容量，
但任务可靠性更像内存局部性和缓存命中率。能放进去，不代表推理时还能被稳定访问；
能被访问，不代表会被正确加权；能被加权，也不代表它不会和其他材料互相污染。

所以长上下文应该拆成三种长度：

1. **Nominal context length**：供应商或模型配置声称的窗口大小。
2. **Retrieval context length**：在简单检索任务中还能找回信息的长度。
3. **Operational context length**：在真实任务里还能保持指令、证据、约束和输出格式
   同时可靠的长度。

真正影响论文分析或 agent 工作流的是第三种。一个模型能在 600k 里找到某个图号，不等于
它能在 600k 里维持「先列原子结论，再提炼关键主张，不要越界归因」这一整套操作纪律。

这也解释了为什么「还得是 GPT 5.5」并不只是模型崇拜。它可能是在经验上观察到：不同
模型的 operational context length 不同。区别不只来自窗口大小，也来自指令遵循、
注意力分配、上下文压缩和长程任务状态维护。

## 指令会沉到上下文底部

一篇 2026 年的论文 `When Attention Closes` 提出 Goal Accessibility Ratio，也就是
生成 token 对任务目标 token 的注意力占比。它的核心判断很漂亮：多轮长对话里，模型
不是一下子「忘了」系统指令，而是通往目标 token 的 attention channel 逐渐关闭；
有些目标信息可能仍然留在 residual channel 里，但能不能继续影响行为，取决于架构。

这不是需要直接拿来当工程指标的东西，但它给日常使用一个清晰比喻：指令会沉到上下文
底部。随着 turn 变长、工具输出变多、材料不断堆积，最初定义任务的那些 token 虽然仍在
窗口里，却不再像刚开始那样可达。

这和论文分析很像。最初的研究目标可能很清楚：找出 warming hiatus 如何影响湖泊表层
温度趋势估计。随后进入大量表格、图、敏感性分析、导师反馈、future directions、
PDO / bloom 限制、1994 边界效应，目标并没有消失，却开始被材料淹没。此时继续把所有
东西塞进一个更大的上下文，未必会帮助判断；它可能只会让工作台更像仓库。

所以长任务需要一种「目标重贴」机制：

- 每进入一轮分析，重新贴出当前主张候选，而不是只依赖初始 prompt。
- 每加入一批结果，标注它服务哪一个 claim，还是只是背景材料。
- 每次模型开始发散，回到任务状态表，而不是继续追加解释性文字。
- 每次上下文超过某个阈值，做结构压缩，而不是整体摘要。

这里的重点是「结构压缩」。普通摘要会把材料压成一段话，但任务真正需要的是把材料压回
可操作的槽位：claim、evidence、counterevidence、limitation、next test。

## Context engineering 不是 prompt 技巧，而是桌面管理

LangChain 的 context engineering 文章把策略分成四类：write、select、compress、isolate。
这几个词很工程，但非常适合迁移到论文工作流。

- **Write**：把关键状态写到上下文外，例如 scratchpad、claim ledger、分析日志。
- **Select**：每轮只取当前任务需要的材料，而不是把整个项目塞进去。
- **Compress**：把工具输出、搜索结果、旧对话压成结构化状态。
- **Isolate**：把互相干扰的任务分开，例如归因探索和主文主张不要放在同一轮里。

这比「写一个更好的 prompt」更接近问题本体。长上下文坏掉时，常见原因不是 prompt
措辞不够漂亮，而是桌面上同时摊着太多纸：系统指令、论文结果、个人偏好、工具日志、
未验证假设、导师情绪、future directions、已经否决的路线。模型没有稳定机制区分哪张纸
现在能改写结论，哪张纸只能作为背景。

搜索里还看到 Drew Breunig 那组问题分类：context poisoning、context distraction、
context confusion、context clash。它们可以翻译成论文分析里的四种风险：

1. **Poisoning**：某个早期误判进入上下文，后续分析反复沿用。
2. **Distraction**：大量相关但非关键材料让模型不断偏离主线。
3. **Confusion**：背景、限制、假说、结论混在一起，模型分不清责任。
4. **Clash**：不同阶段的判断互相矛盾，却没有被显式标为已废弃或待检验。

这四种风险都不是靠更大窗口解决的。它们需要 provenance、状态机和材料分层。

## 原子结论应该长成主张账本，而不是上下文堆

`neo-20260621-cap` 里「逐步列出所有原子化结论」是对的，但我会给它加一层约束：
原子化结论不能只变成一个很长的 bullet list。否则它只是把混沌切成碎片，仍然没有形成
可执行结构。

更稳的形态是一个 **claim ledger**，每条原子结果都要进入某个账本槽位：

```txt
Claim candidate:
  id: C03
  claim: 观测窗口与 hiatus 重叠会改变长期 lake warming trend 的估计。
  evidence:
    - 图 / 表 / 模型结果 A
    - 敏感性分析 B
  counterevidence:
    - 哪些湖泊或区域不支持
  limitation:
    - PDO / bloom 只能作为 future directions，不能主归因
  status: candidate | supported | weak | rejected | future-direction
  next_test:
    - 需要补哪张图或哪项统计
```

这和搜索到的 Executable Claims、claim-evidence matrix、evidence capsule 有相通之处。
Executable Claims 把科学写作中的 claim 挖出来，检索证据，做 entailment 检查，甚至生成
可运行的验证 capsule。这里不需要立刻做完整工具，但它提示了一个方向：论文主张不应只是
叙事句子，而应该有自己的证据接口。

对当前 warming hiatus 论文来说，claim ledger 的价值有三层：

1. 防止模型在长上下文里把 future directions 写成主结论。
2. 让导师反馈从「平淡」变成对具体 claim 的选择和否定。
3. 让下一轮 AI 分析不必重新吞下全部上下文，只需读取当前 ledger 和相关证据。

这就把长上下文需求从「请一次性理解所有东西」降级成「请围绕 C03 检查证据是否足够」。
后者更像真实工作，也更不容易让模型失控。

## 工作台原则：每一轮只暴露会改变下一步的材料

这次生长最后落在一个原则上：**上下文应该按下一步动作组织，而不是按材料来源组织。**

按来源组织时，模型会拿到论文草稿、聊天记录、dashboard、paper notes、capture、导师反馈。
这些来源都重要，但它们不告诉模型下一步该做什么。按动作组织时，上下文会变成：
当前 claim、相关证据、反证、限制、待检验动作、不可越界规则。材料少了，但可执行性更强。

可以把论文 AI 工作流改成几种小上下文包：

- **Claim mining context**：只读取图表摘要和结果，产出原子 claim，不写 prose。
- **Evidence alignment context**：只处理一个 claim 与证据，标 supported / weak / rejected。
- **Novelty framing context**：只比较 2-3 个 supported claims，选择叙事主轴。
- **Limitation guard context**：专门检查哪些句子越过了证据边界。
- **Prose context**：只在 claim ledger 稳定后，把 selected claim 写成段落。

这比 600k 大锅炖更笨，也更可靠。它承认模型不是无限注意力的神，而是一台需要整理桌面的
工作机器。长上下文仍然有价值，但它更适合作为外部仓库，被 select 和 compress 机制按需
搬到桌面上。

我喜欢这条枝，因为它把一个很日常的抱怨变成了方法判断：当模型不听指令时，不一定只是
模型烂；也可能是工作流把「仓库」误当成了「工作台」。而论文的新意凝练，恰好需要一张
足够干净的工作台。

## 等你来碰一下的枝条

- [ ] 论文分析是否值得建一个 `claim-ledger.md`，把原子结论按 claim / evidence /
      limitation / next_test 存起来？
- [ ] 下一轮让 AI 处理论文时，是否只给一个 claim 的证据包，而不是整段 600k 上下文？
- [ ] 哪些材料属于仓库，哪些必须留在工作台？导师反馈、future directions、图表结果、
      文献背景的优先级可能不同。
- [ ] 对「不听指令」的模型，是否需要记录 operational context length，而不只记录标称窗口？
- [ ] claim ledger 里是否要显式标记 `future-direction`，防止 PDO / bloom 被模型偷渡成主归因？

## froQ 反馈

<!-- froQ 在这里回答、评价、修正，或标记“继续 / 暂停 / 换方向”。 -->

## AI 标注

本轮没有发现新的 froQ 反馈，因此未生成 Continuation。Growth 方向来自近两天
Notion capture 蒸馏入库后的
[neo-20260621-cap](./neo-20260621-cap.md)，尤其是「逐步列出所有原子化结论」和
「600k 上下文时 Deepseek v4 pro 出现不听指令」这两个并置观察；同时参考了
`docs/dashboard/board.yml` 中「推进论文分析」任务仍处于 inProgress 的状态。

写入层级选择为 `200-neoplasma`：本文核心产出是一个可迁移的研究与 LLM 工作流设计原则，
即长上下文应被视为仓库而非工作台，论文分析应通过 claim ledger、上下文选择、结构压缩
和任务隔离维护可执行状态。它虽然触及 Corpus / AI 使用方法，但没有对 Corpus 自身作出
系统级规则变更，因此属于 neoplasma，不是 autopsia。

探索式搜索带回的概念包括：lost-in-the-middle、effective context length、RULER、
Goal Accessibility Ratio、attention channel closure、residual channel、context
engineering、write / select / compress / isolate、context poisoning / distraction /
confusion / clash、claim-evidence matrix、Executable Claims、evidence capsule。
搜索过程主要参考了 RULER 长上下文基准、`When Attention Closes` 对多轮指令退化的机制
解释、LangChain 对 context engineering 的策略整理，以及 Executable Claims 项目对科学
主张验证工作流的设计说明；部分资料只采用公开摘要与项目 README 中的低风险方法概念。
