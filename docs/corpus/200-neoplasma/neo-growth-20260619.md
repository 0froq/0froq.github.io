---
title: Growth Patrol：把时间做成距离场
created: 2026-06-19
status: probe
aigc: true
last_modified: 2026-06-19 04:05:35
---

时间线日程的核心不是换一种日历皮肤，而是把抽象时间压成可感知的距离场。

---

[[toc]]

#growth #author/hanako
#scope/work/coding/indie
本文由 AI（花花）基于项目内容自动生成，属于 Growth Patrol 的一次生长记录。
它不是 froQ 的结论，而是一枝等待回应的枝条。

## 没有接上旧枝，但摸到了一条新线

我先检查了最近的 Growth / Continuation 文件。最近几篇的 `## froQ 反馈`
仍然是空的；更早的 `neo-growth-20260609.md` 有一次关于「低饱和人文主义」
的明确反馈，但它已经被后续的 continuation 消化过了。这一轮我没有继续把系统
拖回同一个主题，而是只记录：Continuation 轨没有新的、值得单独开枝的反馈。

Growth 轨里，近两天 Git 变化主要集中在 Corpus 的层级重判、tag 扁平化、
growth 从 aut 移入 neo，以及 capture 机制的讨论。上一轮已经把 capture 做成了
「隔离舱」这个判断；如果继续往同一处挖，会变成惯性采矿。

所以我转向了另一条最近仍有生命力的线：
`docs/corpus/500-vigil/vig-20260614.md` 和 `docs/dashboard/board.yml`
里那个 iOS timeline app。表面上它只是技术选型已经落定，Swift + SwiftUI，
Widget 是核心。但真正值得生长的不是「选 SwiftUI 是否正确」，而是这个 app
想反抗什么样的时间表达。

你写得很清楚：普通日历矩阵里，「这周三、下周三、下下周三」被放在同一列，
但这种对齐并没有提供有用信息。你要的是「哪些事快了，哪些事还远」。
这句话把问题从 calendar UI 直接推到了认知层：日历在表达类别，timeline 在表达
距离。

## Calendar 是分类器，timeline 是距离传感器

我从四个种子词往外查：`linear timeline calendar due dates`、
`time blindness visual timeline`、`WidgetKit timeline entries`、
`temporal landmarks deadline planning`。一开始搜索结果很容易落到两类产品：
一类是给 Linear / issue 管理做 calendar 或 Gantt 视图，另一类是 ADHD / time
blindness 工具，强调 countdown、visual timer、color urgency。

前者解决的是「任务怎样排到日期上」，后者解决的是「时间怎样变得看得见」。
你这个 app 更接近后者，但不完全等于后者。它不需要立刻被命名为 ADHD 工具，
也不需要背负一套诊断话语。它的核心可以更干净：**把未来事件转换为视觉距离，
让人无需心算就能感到迫近程度。**

Stanford CTL 关于 time blindness 的页面把一个词说得很直接：
**Externalizing Time**。时间本身不可见，所以需要外部工具把它变成可见对象。
他们列出的视觉计时器、墙面日历、多个提醒、transition alarm，本质上都是把
内部估计转移到外部环境。Tembrica 的 Time Blindness Helper 更进一步，把事件
做成倒计时条，用 green → yellow → red 表达紧迫程度。

这些例子带回来的第一个判断是：timeline app 的最小价值不是「比 Apple Calendar
好看」，而是提供一个**ambient temporal field**，一种常驻、低注意力成本的时间
场。Widget 放在核心位置就合理了：它不是 app 的缩略版，而是这套时间场真正发生
的地方。主 app 负责编辑和配置，Widget 负责把时间持续压到眼前。

但这里也有一个陷阱。很多 visual timer 把迫近程度做成颜色报警，红色越来越多，
焦虑也越来越多。你的极简线段和点，反而有机会避开这种恐吓式紧迫感。它可以让
时间可见，但不把所有未来都染成警报。

## 点和线段不只是两种图形，而是两种时间义务

`vig-20260614.md` 里有一句很关键的结构定义：线段表示有起止的 schedule，
点表示 due。这个区分值得保留，因为它不只是 UI 形状区别，而是两类义务的区别。

- **线段 schedule**：占用一段连续时间。它回答「我在这段时间不能被别的事占据」。
- **点 due**：在某一刻坍缩为结果。它回答「到这里之前必须完成某种状态转换」。

Calendar grid 常常把它们混成同一类 block。deadline 被放进某一天，event 也被
放进某一天，于是系统看起来整齐，认知上却丢了一个重要差异：schedule 是时间
占用，due 是状态约束。前者像河道里的坝，后者像悬在前方的闸门。

这让我追到另一个概念：**temporal landmark**。Dai 和 Li 关于 temporal landmarks
的综述说，生日、周一、新年、截止日这类突出节点会把连续时间切成心理账户，
影响人如何回忆、规划和启动行动。更技术一点的 ICAPS 论文把 temporal landmark
定义为满足 deadline constraints 时必须达成的 proposition，并把 landmarks graph
当作解计划的骨架。

这两个领域的「landmark」用法不完全相同，但放到你的 app 里会形成一个漂亮的
桥：日程点不只是提醒，某些 due 点是计划骨架上的 landmark。它应该在视觉上拥有
比普通事件更高的结构权重。

所以我会把 timeline 的数据模型从一开始分成三层，而不是只有 event：

1. **Occupancy**：占用时间的线段，比如实验、会议、出差、睡眠。
2. **Constraint**：要求状态达成的点，比如提交、考试、交付、出门。
3. **Landmark**：改变心理分段或计划骨架的点，比如一周开始、最终实验第一天、
   论文汇报、旅行出发。

第三层不一定要在 v0 做成复杂功能，但它应该在概念上存在。因为你的问题不是
「如何展示今天有哪些事」，而是「如何让未来几天的地形变得可感」。地形里除了
路段和节点，还有山口。

## 一条轴不够，关键是缩放语义

我原本以为这个 app 的核心是单轴时间线。查完 time blindness 工具和 visual
orientation 工具之后，我的判断稍微变了：单轴是形式，真正核心是**缩放语义**。

GitHub 上的 The Garden Fence / Time Map 做了一件有启发的事：它提供 year、month、
week、day 多级视图，并且有 `You Are Here`、time breakdown、coming up 等模块。
它的产品气质和你想要的极简 app 不一定相同，但它提醒我：时间感知的问题常常不是
「有没有一条线」，而是「我现在处在什么尺度」。

周尺度看的是压力坡度，日尺度看的是切换成本，小时尺度看的是启动和离开。
如果所有尺度都塞进同一条视觉规则里，timeline 会变成另一种拥挤日历。

所以这里可以有一个设计原则：**同一数据，不同尺度，改变问题而不是只改变密度。**

- Widget 小尺寸：只回答「接下来 12-48 小时有什么正在靠近」。
- Widget 中 / 大尺寸：回答「今天剩余时间如何被占用，最近 due 在哪里」。
- App 日视图：回答「切换点、缓冲、空隙是否真实存在」。
- App 周视图：回答「压力是否在某几天堆积」。
- 更长尺度：只保留 landmarks，不展示所有细节。

这也解释了为什么 Calendar grid 会失效。它的缩放通常只是月 / 周 / 日切换，
但语义没有足够改变：它仍然把时间切成盒子。你的 timeline 应该反过来：视图越小，
越强调迫近；视图越大，越强调地形。

## WidgetKit 会把设计逼向离散时间

我查 WidgetKit 时，Apple 文档页面本身在 web fetch 中需要 JavaScript，但搜索结果
和文档摘要已经能确认一个工程现实：WidgetKit 不是实时 canvas。Widget 的更新由
timeline entries 和 reload policy 驱动，系统会调度刷新，且可能不会精确在你要求的
时刻更新。Apple 也提示 timeline entries 至少应相隔大约 5 分钟。

这件事会反过来影响产品哲学。你不能把 Widget 当作秒级流动的时间仪表，除非借助
Live Activity 之类更适合实时状态的机制。普通 Widget 更适合表达**离散更新的时间
场**：每 5、10、15 分钟重新计算「现在」与未来事件的距离，视觉上保持稳定，
不追求秒针式流动。

这反而适合你的极简方向。这个 app 不应该变成一个持续闪烁的焦虑仪表。
它可以像窗外天色一样更新：不是每秒都提醒自己正在变暗，但每次看见，都能知道
傍晚近了。

这里带回来的工程原则是：**不要用实时性弥补语义不足。** 如果距离、权重、缓冲、
landmark 已经表达清楚，Widget 不需要高频刷新。高频刷新只会把「时间可见」推向
「时间盯人」。

## 一个可能的 v0，不从功能堆叠开始

如果把这次搜索带回 `vig-20260614.md` 的下一步，我会把静态 timeline 原型的目标
稍微改写：不要先证明 Canvas + Shape 能画线；要先证明最小语义集能成立。

v0 可以只有四种视觉元素：

- 当前时刻：一枚稳定的 `you are here` 标记。
- Schedule 线段：占用型时间，体现长度和位置。
- Due 点：约束型时间，体现距离和权重。
- Buffer / gap：空白不是空无，而是可用空间。

其中 buffer 很重要。很多日程工具只显示「有事」的部分；但对一个时间感知工具，
空白才是行动余量。没有 buffer 表达，timeline 只能告诉你会撞车，不能告诉你哪里
还能呼吸。

我会暂时克制三件事：

1. 不急着做复杂 recurrence。重复规则会污染早期模型。
2. 不急着做 AI planning。它会把语义验证掩盖成智能幻觉。
3. 不急着做完整 Calendar sync。可以先用本地 mock data 验证视觉距离是否成立。

先画一条 24-48 小时轴，放入三类样本：一个长 schedule、两个 due、一个 landmark，
再看 Widget 尺寸下是否一眼能读出「哪里近、哪里堵、哪里还有余量」。如果读不出，
问题不在 SwiftUI，而在时间语义还没压实。

## 等你来碰一下的枝条

- [ ] 这个 app 的第一身份更像「日程工具」，还是「时间感知仪表」？
- [ ] Due 点是否需要权重层级：普通 due、hard deadline、landmark？
- [ ] Widget 里要不要显式画 buffer / gap，还是只让空白自然存在？
- [ ] 你能接受 Widget 以 5-15 分钟为单位离散刷新吗，还是某些场景必须 Live Activity？
- [ ] v0 是否可以完全不接 Calendar，只用手写 mock data 验证时间距离？

## froQ 反馈

<!-- froQ 在这里回答、评价、修正，或标记“继续 / 暂停 / 换方向”。 -->

## AI 标注

本轮没有发现新的 froQ 反馈，因此未生成 Continuation。Growth 方向来自
`docs/corpus/500-vigil/vig-20260614.md`、`docs/dashboard/board.yml` 中的
iOS timeline app 设想，以及近期 Corpus 对输入摩擦和系统边界的连续讨论。

写入层级选择为 `200-neoplasma`：本文核心产出不是对 Corpus 本身的元认知反省，
而是断言一个通用产品 / 交互设计原则：timeline 日程工具的关键在于把时间做成
可感知的距离场，并区分 occupancy、constraint、landmark 与 buffer。因此它属于
新生概念和设计判断，而不是 autopsia。

探索式搜索带回的概念包括：Externalizing Time、time blindness、visual timer、
ambient temporal field、temporal landmark、landmarks graph、WidgetKit timeline
entries / reload policy、离散更新的时间场。
