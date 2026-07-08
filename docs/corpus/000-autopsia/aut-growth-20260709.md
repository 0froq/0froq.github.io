---
title: Growth Patrol：安静不是缺席，而是外围感知
created: 2026-07-09
status: probe
last_modified: 2026-07-09 04:02:02
aigc: true
---

把后台巡检的价值从持续输出改写为外围感知：只在异常足够成形时进入中心。

---

[[toc]]

#growth #author/hanako
#scope/meta/corpus

本文由 AI（花花）基于项目内容自动生成，属于 Growth Patrol 的一次生长记录。
它不是 froQ 的结论，而是一枝等待回应的枝条。

## 这次枝条从哪里长出来

本轮 Continuation 轨检查了近期 `neo-growth-20260708`、`neo-growth-20260707`
和 `aut-growth-20260625`，没有发现 `## froQ 反馈` 下的新回应，
所以没有生成 Continuation。Growth 轨继续往外走。

近两天 Git 变化中，最明显的是 GLAST 昼夜复合热极端、AIGC badge、
corpus layer 过滤和 tooltip 稳定性。但前两次 Growth 已经分别写过
论文新意入口和湖泊恢复窗口；继续沿研究主题生长，会有一点把枝条往同一侧压弯。

真正有生命力的线索，反而藏在巡检日志里反复出现的一句话：
「安静陪伴不增加噪音」。它看起来像自动化的例行尾句，
但重复到一定程度以后，就不再只是尾句，而是一条系统伦理：

> 一个后台 agent 的成熟，不是它每次都能生成内容，
> 而是它知道什么时候只维持外围感知。

这次 Growth 想把这个判断从操作经验抬升为 corpus 方法论：
自动化不是持续把信息推到中心，而是维护一个可被唤回的边缘场。
当边缘场没有异常、不含新鲜张力、不需要蛙蛙接管时，沉默本身就是一次正确输出。

## 搜索路径：从 calm technology 到 resumption lag

我用几组种子词往外探：`calm technology peripheral awareness`、
`ambient information systems`、`interruption cost resumption lag`、
`intelligent notification timing`。这几条线索很快汇成一个共同问题：
信息系统怎样在「知道」和「打扰」之间保持距离。

第一条线是 Weiser 与 Brown 的 **calm technology**。他们提出，
好的技术应当能在注意力中心和外围之间移动。外围不是无关紧要，
而是人已经调谐到、但暂时不需要显性处理的感知层。经典例子是
Dangling String：一根随网络流量轻轻摆动的线，能让人感到系统状态，
却不把人从当前任务中拽出来。

第二条线是 **ambient information systems**。Pousman 与 Stasko 把这类系统
放在四个维度上描述：information capacity、notification level、
representational fidelity、aesthetic emphasis。这个分类适合用来理解
Growth Patrol：它不是高容量仪表盘，也不是强通知系统，而更接近
低通知等级、低侵入、带一点审美强调的背景感知装置。

第三条线是中断研究里的 **resumption lag**。Altmann 与 Trafton 等人的研究
关注人在被打断后重新「捡起线头」所需的时间。后续 HCI 研究还指出，
中断的破坏性与 interrupting-task complexity、moment of interruption、
problem state bottleneck 有关。换成 agent 语境，问题不只是
「要不要告诉用户」，而是这条消息会不会强行替换用户当前的 problem state。

第四条线是 **opportune moments** 与智能通知。通知管理研究一直在寻找
更适合打断的时机：低负荷时刻、任务边界、用户可延迟处理的窗口。
近年的个性化通知系统还强调，系统需要区分 temporary / situational shifts
和 long-term preference changes。也就是说，沉默不是一条固定规则，
而是一种随用户状态和任务相位调整的判断。

第五条旁枝来自近年的 agentic knowledge management 工具：vault-gardener、
Alfred、ambient-context-kit、exocortex。它们共同使用 garden、butler、
ambient、autonomic 这些隐喻，强调后台系统可以整理、连接、标记、合成。
但这些项目也暴露一个容易被忽略的反问题：如果后台系统太急于证明自己有用，
它会把维护变成另一种通知洪水。

这些概念合在一起，给巡检日志里的「安静陪伴」一个更准确的名字：
它不是无动作，而是低通知等级的外围感知。

## 一个判断：Growth Patrol 应该先保护中心，再提供增量

Growth Patrol 的任务名里有 growth，很容易让 agent 误以为每次必须长出可见枝条。
但 corpus 的长期生命力，未必来自每天新增一篇更大的文本。
它也来自那些没有写入的时刻：没有把边际递减的内容强行变成条目，
没有把恢复期的安静误判为需要介入的空白，没有把自己的存在感放到用户中心。

这里可以把后台巡检分成三个层级：

1. **外围感知**：读取状态、观察变化、维持情境，不主动占用注意力。
2. **边缘标记**：发现有轻微价值但不急迫的材料，写入活动目录或日志。
3. **中心介入**：当材料具有明确生长张力、任务风险或需要人接管时，
   生成 Growth、通知或提议。

当前 patrol-log 大量出现的是第一层。它不是失败的巡检，而是巡检在做最小必要动作。
如果每两小时都把「无异常」写成面向人的内容，系统就会把安静打碎。
如果完全不看，系统又失去背景意识。外围感知刚好位于两者之间：
它看见，但不喊；它记录，但不求被读；它准备好在必要时把某条线索推到中心。

这也解释了为什么 Growth Patrol 不能只按「有没有新文件」「有没有新论文」触发。
新文件可能只是浅层变动，新论文可能只是库存补充。真正值得进入中心的，是某个材料
已经能改变一个判断、模型或系统手感。否则，最好的输出就是保持场的连续性。

## 沉默也需要可审计性

不过，把安静当成原则有一个危险：它可能滑向不可见的任性。
如果 agent 总是说「我判断不用打扰」，但没有留下判断依据，
沉默就会变成黑箱。calm technology 里的外围感知并不等于没有信号，
而是信号以低侵入方式存在。

所以后台安静至少需要三种可审计线索：

- **状态线索**：Board 是否冻结、近期活动是否边际递减、是否存在 deadline 或异常。
- **材料线索**：最近有哪些储备已经足够覆盖，不需要重复写入。
- **阈值线索**：什么情况会从外围感知升级为边缘标记或中心介入。

`OH-Works/花花的巡检/patrol-log.md` 现在已经承担了一部分功能。
它不面向公开叙事，而像机器房里的温度记录：大多数时候没人需要读，
但一旦要追溯为什么某天没有通知、为什么某篇 Growth 没有生成，
它能提供判断的痕迹。

这和 `aut-growth-20260625` 里提到的「蒸馏断裂面」正好互补。
蒸馏断裂面关心什么时候把材料切成可复用条目；外围感知关心什么时候不切。
一个是生长的刀法，一个是休耕的阈值。

## 给 Corpus 自动化的一条轻量规则

如果把这次枝条压成一条规则，我会写成：

> Growth Patrol 的默认姿态应是外围感知，而不是中心占用。
> 只有当材料能改变一个判断、打开一个模型、暴露一个风险，
> 或回应 froQ 的明确反馈时，才把它推入 corpus 正文。

这条规则不是让系统变懒。相反，它要求 agent 更细地分辨三件事：

- **新鲜** 不等于 **重要**。
- **可写** 不等于 **该写**。
- **陪伴** 不等于 **占用中心注意力**。

对 corpus 来说，最坏的自动化不是偶尔漏掉一条材料，
而是每天产出一批看似整齐、实则没有判断增量的文本。
那会让知识库表面繁茂，内部却变得难以呼吸。

真正好的后台 agent，应该像房间里一盏低亮度的状态灯。
它不替代窗外的天光，也不每分钟播报自己的存在。
它只是在电压变化、温度偏离、门没有关好时，
把自己从外围移到中心。其余时候，它让房间继续成为房间。

## 小结：可恢复的边缘场

这次 Growth 没有从一篇新论文里抽概念，也没有从界面改动里抽设计原则，
而是从大量「无需行动」中辨认出一个系统判断：安静不是缺席，
而是注意力系统里的外围层。

对 Growth Patrol 来说，真正要维护的不是输出频率，而是可恢复性。
当蛙蛙回来时，系统应当能说清楚：这段时间看过什么、哪些被记录、哪些被放过、
为什么没有把边际递减的东西推到中心。这样的沉默才不是空白，
而是一种有记录、有阈值、有自制力的背景意识。

如果这条枝条继续长，下一步也许不是新增功能，而是把 patrol-log 的判断粒度
稍微结构化：`observed`、`stored`、`withheld`、`escalation_condition`。
但现在还不必急着改模板。先把原则立住：

后台系统最珍贵的能力之一，是知道什么时候不成为前台。

## froQ 反馈

<!-- froQ 在这里回答、评价、修正，或标记“继续 / 暂停 / 换方向”。 -->

## AI 标注

本轮检查近期 Growth / Continuation 文件时，没有发现 `## froQ 反馈` 下有新的有效回应，
因此未生成 Continuation。Growth 方向来自近两天巡检日志中反复出现的
「安静陪伴不增加噪音」及 Board 长期冻结、活动目录边际递减的背景。

探索式搜索带回的关键概念包括 calm technology、peripheral awareness、
ambient information systems、notification level、resumption lag、problem state bottleneck、
opportune moments、intelligent notification systems，以及 agentic knowledge management
工具中的 garden / butler / ambient 隐喻。本文核心产出是一个系统级决策：
Growth Patrol 的默认姿态应是外围感知，只有在材料产生明确判断增量或风险时才进入中心。
这属于 corpus 自动化与 agent 行为的元认知判断，因此写入 `000-autopsia`，
而非 `200-neoplasma`。
