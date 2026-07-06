---
title: Growth Patrol：蒸馏的断裂面
created: 2026-06-25
status: probe
aigc: true
last_modified: 2026-06-25 04:03:55
---

Corpus 蒸馏的关键不是把 capture 变短，而是找到能同时保留主张、来源与再生能力的断裂面。

---

[[toc]]

#growth #author/hanako
#scope/meta/corpus

本文由 AI（花花）基于项目内容自动生成，属于 Growth Patrol 的一次生长记录。
它不是 froQ 的结论，而是一枝等待回应的枝条。

## 这次巡游碰到的枝条

最近几天的变化里，有一条线没有直接写成规则，却在多处露出来：
Corpus 正在从「记录系统」变成「蒸馏系统」。

`aut-capture-202606170335` 已经把 capture 的职责说清楚：先降低输入摩擦，
再由 agent 进行原子化拆分和分层。`neo-20260621-cap` 又把论文分析的当前动作
压缩成一句：「逐步列出所有原子化的结论，然后从中探索出关键的点」。
而 06-24 的 activity 用 Zettelkasten 语言把这个过程解释为：从 fleeting / literature
note 提炼成 permanent note。

这些判断都成立。但它们共同留下一个更细的问题：

**原子化的切割线到底在哪里？**

如果切得太粗，条目仍然像一块潮湿的泥，里面混着事实、情绪、判断和行动线索，
后续引用时不知道引用的是哪一部分。如果切得太细，条目会变成无菌碎屑，
每片都干净，但失去来源张力，无法再长回一棵树。

所以 Corpus 需要的不是「越原子越好」，而是一种断裂面判断：
每一次蒸馏都要问，这一刀切下去之后，剩下的片段还能不能独立工作，
同时还能不能追溯它从哪里来、为什么被切出来。

## 原子不是尺寸，而是可引用单位

外部搜索从 Zettelkasten 的 atomicity 开始。Zettelkasten.de 对 atomicity 的表述
很有用：atomicity 是「一条笔记一个知识构件」的方向，但它不是刚性法律，
而是需要按应用场景调整的指南。这个提醒很关键，因为 Corpus 的六层结构
并不等同于经典卡片盒。

在 Corpus 里，`100-ingesta` 可以保留外部材料的完整来源感，`300-putredo` 可以保留
日记的时间连续性，`200-neoplasma` 才更接近「可复用主张」。因此同一句话在不同层里
有不同的最小单位：

- 在 ingesta 中，最小单位可能是一个外部材料或一个文献事实。
- 在 putredo 中，最小单位可能是一段当天状态和它的触发条件。
- 在 neoplasma 中，最小单位才是一个可以被别处调用的 claim / model / design judgment。
- 在 autopsia 中，最小单位则是一个关于系统自身如何运作的判断。

这意味着「原子」不是长度，不是文件大小，也不是一句话。

更像函数接口：只要调用者能明确知道它提供什么语义，它就是原子的；
如果调用者必须读完整篇才知道该链接指向哪一个意思，它就还没有被正确切开。

Andy Matuschak 的 evergreen note 里有一个贴切说法：好的标题像 API。
标题不是装饰，而是这条笔记暴露给其他笔记的函数名。这个角度可以直接移植到
Corpus：

> 一个 corpus 条目的标题，应当让它能够被其他条目以低歧义方式引用。

这也解释了为什么「标题即主张」比「标题即主题」更适合蒸馏层。
`warmingHiatus 方法论` 是主题，`长上下文应被视为仓库而非工作台` 是接口。
前者要求读者进入房间，后者已经把门牌和用途写出来。

## 蒸馏不是摘要，而是带谱系的分株

搜索 literature note / permanent note 时，另一个反复出现的区分是：来源笔记保留
材料的来处，永久笔记用自己的话重构一个可独立存在的想法。这个区分和 Corpus 的
`ingesta → neoplasma` 很近，但 Corpus 还多了一层复杂性：capture 可能同时包含
生活状态、研究判断、系统设计、任务阻塞和一句诗。

所以蒸馏不能只做摘要。

摘要的目标是压缩，蒸馏的目标是繁殖。压缩只问「能不能更短」，蒸馏还要问：

1. 这个片段脱离原文后，是否仍然有完整语义？
2. 它是否保留了足够的来源指针，日后能回到原场景校准？
3. 它进入新层之后，是否会获得新的链接机会？
4. 它是否有明确的使用方式：解释、判断、提醒、反驳、生成下一步？

这四个问题可以合成一个更短的准则：

**好的蒸馏片段是可移植的，但不是失忆的。**

它像从植物上剪下来的枝条。真正能扦插的枝条，不是越小越好，
而是必须带着足够的节、芽点和组织方向。只剪一片叶子，漂亮但不一定能活；
把整棵树搬走，又失去了繁殖的意义。

在 Corpus 中，来源链接就是根系残留，标题主张是芽点，tag 和 layer 是土壤类型，
正文里的最小论证则是这根枝条自己的水分。

## 从 berry picking 到 information farming

这次搜索里最意外的旁枝，是 2026 年 CHIIR 的 `Information Farming`。
它把传统的信息寻找模型重新分成两类：过去的用户像采莓者，在外部信息斑块之间移动，
一点一点捡拾有用信息；生成式 AI 出现后，用户越来越像农民，会用 prompt 播种，
用 workflow 培育，再收获结构化产物。

这个概念对 Corpus 有启发，但也有一个危险：如果只强调 farming，agent 很容易以为
「生成更多结构化内容」就是生长。实际上 Corpus 的蒸馏更像半野外试验田，
不是无土栽培。它仍然需要外部材料、生活事件、实验条件和原始 capture 的粗糙性。

因此更准确的说法也许是：

**Corpus 的蒸馏是在采集与耕作之间建立轮作。**

capture 是 berry picking：从生活、论文、对话、实验、突发想法里捡回浆果。
蒸馏是 farming：把可复用的种子种到合适层级里，给它标题、链接和 provenance。
Growth Patrol 则像巡田：不直接替代播种，也不只做库存盘点，而是看哪些枝条
已经露出下一次分株的可能。

这也给自动化提出了边界：agent 不该把每条 capture 都加工成整齐的永久笔记。
有些东西只适合留在 putredo 的时间泥土里；有些东西只适合作为 ingesta 的来源证据；
有些东西要等几天后才知道它的断裂面在哪里。

## 一个可执行的断裂面检查

如果把上面的判断压成蒸馏时可用的检查表，可以是五个问题：

### 1. 这条内容的主要生命形式是什么？

事实、主张、状态、方法、审美材料、梦境、任务线索，不应被同一种模板强行处理。
生命形式决定层级，而不是关键词决定层级。

### 2. 它能不能被一句完整标题调用？

如果标题只能写成名词短语，说明它可能仍然是主题容器。
如果能写成一个可争辩、可复用、可被链接的句子，它更接近 neoplasma 或 autopsia。

### 3. 它的来源是否足够可回溯？

蒸馏后的条目不需要携带全部上下文，但至少要知道自己从哪块原料里切出来。
这可以是原始 capture 链接、文献 citation、日期日志、相关 Growth，或一个明确的
provenance 句子。

### 4. 它是否有至少一个未来使用场景？

不是所有好句子都值得进入长期系统。可以问：它未来会被用于解释什么、判断什么、
生成什么、提醒什么？如果答案暂时没有，留在 putredo 里也许更好。

### 5. 切开后是否需要一条缝合线？

有些 capture 被拆成多条以后，需要一个 map / index / hub 把它们保留为一次事件的
多个切面。否则原子化会制造新的失真：每个碎片都对，但整体关系丢了。

这里的缝合线不一定是新文件。它可以是：

- 原始 capture 文件中的索引段；
- 每个拆分条目中的 `来源` 小节；
- 一个 topic entry；
- 构建时 graph index 里的 `derived-from` 关系；
- Growth Patrol 里的路径记录。

## 给 Corpus 的一个小判断

Corpus 现在已经有 layer、tag、capture、growth、activity、dashboard 这些部件。
下一步容易诱人的方向，是继续加结构：relations 字段、graph index、claim ledger、
自动摘要、自动归档。

但这次巡游后的判断是：在加图层之前，先把「蒸馏断裂面」变成稳定手感。

因为图只会放大已有切割的质量。如果节点是清楚的 claim，图会变成路径；
如果节点是混合泥团，图会变成毛线球。关系字段也一样：它无法替代理解，
只能表达已经理解过的关系。

所以这里可以先不急着立刻修改模板，只把一个轻量规则放在 Growth 枝条上：

> 进行 capture → corpus 蒸馏时，优先判断断裂面，而不是优先追求条目数量。
> 一条好条目必须同时满足可调用、可回溯、可再生。

这条规则如果后续被 froQ 接受，可以再下沉进 capture 自动化 prompt 或 corpus 模板。
现在它先保持 probe 状态，像一根插在土里的标记杆。

## froQ 反馈

<!-- froQ 在这里回答、评价、修正，或标记“继续 / 暂停 / 换方向”。 -->

## AI 标注

本轮没有发现新的 froQ 反馈，因此未生成 Continuation。Growth 方向来自近两天
Git 变化中的 capture / corpus 蒸馏线索，尤其是
`OH-Works/花花-activity/2026-06-24-zettelkasten-for-corpus-distillation.md`、
[aut-capture-202606170335](./aut-capture-202606170335.md)、
[aut-remove-inner-outer-20260619](./aut-remove-inner-outer-20260619.md) 与
[neo-20260621-cap](../200-neoplasma/neo-20260621-cap.md)。

写入层级选择为 `000-autopsia`：本文核心产出不是一个外部话题的通用设计原则，
而是对 Corpus 自身蒸馏方法的系统级判断，即 capture 进入 corpus 时应优先判断
「断裂面」，并以可调用、可回溯、可再生作为条目质量标准。这属于 corpus 方法论
与元认知自省，因此写入 autopsia，而不是 neoplasma。

探索式搜索带回的概念包括：Zettelkasten atomicity、evergreen note titles as APIs、
literature note / permanent note、provenance、berry picking、information foraging、
information farming。搜索过程主要参考了 Zettelkasten.de 的 atomicity 说明、
Andy Matuschak 关于 evergreen note title / API 的笔记、Zettelkasten literature note
讨论，以及 2026 年 `Information Farming` 对生成式 AI 时代信息行为的重新描述。
