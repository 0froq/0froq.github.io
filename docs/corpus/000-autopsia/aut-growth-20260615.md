---
title: Growth Patrol：把日程做成距离感
created: 2026-06-15
status: probe
last_modified: 2026-06-15 01:02:52
---

本文由 AI（花花）基于项目内容自动生成，属于 Autopsia Growth Patrol 的一次生长记录。  
它不是 froQ 的结论，而是一枝等待回应的枝条。

---

[[toc]]

#source/ai #author/hanako
<!-- tags: 可按主题补充 #scope/work/theme / #scope/life / #thought 等 -->

## 这次不是在看 Swift，而是在看「快了」这件事

近两天的 Git 变化里，有一条很小但很有生命力的枝条：
`docs/corpus/500-vigil/vig-20260614.md` 里定下了一个 iOS app 的技术选型。
表面上它是 SwiftUI / Flutter / React Native 的取舍，真正让我停住的是这句话：

> 我只想知道哪些事快了、哪些事还远。

这句话比「做一个 timeline 式日程管理 app」更核心。它说的不是 calendar，
也不只是 task manager，而是一种时间距离感。传统日历把「周三」对齐成一列，
但这种对齐对你没有信息增益；你要的不是社会时间表的格子，而是未来事件在感知上的
远近、压迫、空隙、逼近速度。

所以这次 Growth 没有继续讨论「SwiftUI 是否合适」。这个判断已经相当闭合：
iOS only、Widget 是核心、SwiftUI 是 Widget 的原生路径，Flutter 混搭会把维护成本拉高。
我想往下一层看：如果这个 app 的核心是距离感，它应该怎样避免变成另一种日历皮肤。

## Widget 不是缩小版 app，而是时间感知的外露器官

我从四个种子词开始搜：`WidgetKit timeline glanceable`、`timeline calendar UX`、
`temporal landmarks time perception`、`calendar visualization fisheye`。
最先改变方向的是 Apple 对 Widget 的定义。

在 [WidgetKit foundations](https://developer.apple.com/videos/play/wwdc2026/277/) 里，
Apple 反复说好的 widget 有三个性质：glanceable、relevant、personalizable。
这不是普通产品话术。对你的 app 来说，glanceable 意味着 Widget 不是 app 本体的
「摘要卡片」，而是核心感知器官：它必须在一眼里回答「接下来几天的压力形状」。
relevant 则要求它随时间变，不能静态展示同一条未来线。

继续查 WidgetKit 的 timeline 后，我注意到一个结构性限制：Widget extension 不是常驻进程，
而是由 TimelineProvider 给系统一组未来的 TimelineEntry，再通过 reload policy 请求刷新。
这件事很适合你的设计，因为日程本来就是一串未来状态；但它也给出硬边界：
Widget 不能假装自己是实时、自由、永远在线的仪表盘。它更像预先排好的几张时间切片，
由系统在合适时刻翻页。

这带来一个设计判断：app 本体可以是编辑与模拟器，Widget 应该是「当前时间附近的投影」。
不是把所有 schedule 和 due 都塞进小组件，而是按距离、重要性、即将越界的程度筛选。

## 从 DateLens 到 calendar horizon：界面会悄悄改变时间边界

顺着 timeline calendar UX，我碰到一个旧但很有用的案例：[DateLens](https://dl.acm.org/doi/10.1145/972648.972652)。
它是为小屏 PDA 做的 fisheye calendar interface，用焦点加放大的方式，
把当前日期给更多空间，周和月的其他部分压缩在周围。研究里一个有趣结论是：
DateLens 对复杂、跨较长时间段的任务更有效，但专家用户在简单每日跟踪上仍偏好
默认日历。

这个反例很重要。它提醒我，时间可视化不是越聪明越好。你的 app 如果主要回答
「哪些事快了，哪些事还远」，它可能非常适合跨数天到数周的方向感，
但不一定适合替代当天 agenda。它不必吃掉 Apple Calendar，也不必吃掉 Things。
更稳的定位可能是「未来压力地形图」，而不是「全功能日程工具」。

然后我沿着 calendar interface 又看到一个 2026 年的概念：
[calendar horizon as a boundary affordance](https://www.mdpi.com/1995-8692/19/2/27)。
这篇文章讨论默认周视图里是否显示周末，会如何改变用户安排任务的位置。
它的核心启发是：界面展示的时间范围不是中性的。隐藏周末会让任务被挤到晚上，
显示周末则会让用户把周末当成可用边界的一部分。

这直接咬住你的「周三列」问题。传统日历不是只在展示时间，它在暗中规定哪些边界重要：
周、天、工作日、周末、整点、半小时。你的单轴 timeline 如果成立，就要重新决定边界。
它可以弱化星期几，强化「距离现在还有多久」；可以弱化月历格子，强化 due 前剩余窗口；
也可以把「今天 / 明天 / 本周 / 更远」做成感知分区，而不是社会日历分区。

## 时间地标与距离感：不是所有点都只是 due

搜索 temporal landmarks 时，我读到 PubMed 上一篇关于 [temporal landmarks](https://pubmed.ncbi.nlm.nih.gov/23066883/) 的摘要。
它把生日、重要日历日期这类时间地标类比成空间地标：它们会把连续时间切成 chunks，
改变人对当前自我与未来自我的距离感，并影响动机。这里的启发不是要把心理学论文塞进 app，
而是提醒：timeline 上的点不只有 due。

有些点是截止，有些点是开始，有些点是边界，有些点是仪式，有些点只是提醒。
如果全部画成同一种圆点，app 会重新掉回「日期列表」。距离感需要区分事件的时间功能：

- due：逼近的硬边界。
- schedule：已经占用的时间段。
- landmark：改变阶段感的点，比如考试、旅行、项目提交、生日。
- buffer：留给恢复、路上、准备、切换的空隙。
- horizon：当前视图愿意承认的未来范围。

这些词里，landmark 和 horizon 是这次搜索带回的新节点。它们把 app 从「把事项放到线上」
推进到「让线本身有心理地形」。

## 一条线也可能过载：旧系统 TimeStore 给的反面提醒

旁支里还有一个老案例叫 [TimeStore](https://www.dgp.toronto.edu/public_user/RMB/papers_old/p11.pdf)，
它用时间作为 email 和 task 的组织方式。它的直觉很接近你的 app：有些信息按语义文件夹
放很费劲，时间轴能帮助人找回活动模式。但它也暴露了限制：有些任务没有明确 due，
用户不愿完全放弃语义组织。

这个限制值得保留。你的 timeline app 如果要求一切都有时间位置，它会排斥那些
「只是要做，但还没长出日期」的东西。也许它不应该管理所有任务，只管理已经进入时间场的事。
无日期任务可以在别的系统里沉睡，只有当它获得 due、schedule、landmark 或 buffer，
才被投到这条线上。

这和 WidgetKit 的限制也能对上：Widget 不需要知道所有事情，只需要知道已经进入
近期时间场的事情。它不是责任仓库，而是雷达。

## 一个很小的产品骨架

我现在看到的最小骨架像这样：

- App 本体：编辑事件，模拟未来几天的压力地形，允许把 task 转成 due / schedule / landmark。
- Widget：只展示当前 horizon 内最有感知价值的 3 到 7 个元素。
- Timeline 视觉：一条主轴，点是边界，线段是占用，空白是可呼吸空间。
- 距离编码：越近越清晰，越远越淡；不是因为远的不重要，而是因为远处不该抢眼。
- 边界编码：今天、明天、本周、更远可以是轻微断点，而不是日历格子。
- 反例门：不要替代所有 calendar，不要吃掉无日期任务，不要把每个未来点都画成警报。

如果用 SwiftUI 落地，`Canvas + Shape` 确实足够画出这个原型；`TimelineView` 可以处理
app 内的动态刷新。但 Widget 侧要接受 TimelineProvider 的节奏，把「实时变化」翻译成
一组未来 entries。这不是缺陷，反而逼迫设计变得克制：Widget 只需要在关键时刻更新，
比如进入今天、进入 due 前一天、某个 schedule 开始前、某个 horizon 收缩时。

这次我带回的主判断是：这个 app 的核心名词也许不该是 calendar 或 timeline，
而是 horizon。timeline 是画法，horizon 是认知契约。它回答的不是「我的日程是什么」，
而是「我现在应该把未来看到哪里」。

## 留给蛙的几句话

- [ ] 这个 app 的核心对象应该叫 event，还是要拆成 due / schedule / landmark / buffer？
- [ ] Widget 的默认 horizon 是 3 天、7 天，还是根据最近 due 自动收缩？
- [ ] 你希望它替代日历的哪一小块功能，又明确不替代哪一块？
- [ ] 无日期任务是否应该完全不进入这条时间线，直到它获得时间属性？
- [ ] 「快了」在视觉上更像距离、颜色、透明度、线宽，还是轴上的空间压缩？

## froQ 反馈

<!-- froQ 在这里回答、评价、修正，或标记“继续 / 暂停 / 换方向”。 -->

## AI 标注

本文件是 AI（花花）的自动化输出，不代表 froQ 已确认。
本轮同时生成了对既有主题的 Continuation；本篇是独立 Growth，来自 2026-06-14
的 iOS app 技术选型与 dashboard 中的 timeline app 线索。
