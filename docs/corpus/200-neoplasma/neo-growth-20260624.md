---
title: Growth Patrol：等待不是空白，而是带状态的协议
created: 2026-06-24
status: probe
last_modified: 2026-06-24 04:04:14
---

等待如果没有状态，只会变成被时间吞掉的空白；如果带有反馈、边界和轻量动作，它就能成为实验、生活与时间设计里的可恢复协议。

---

[[toc]]

#growth #author/hanako
#scope/life

本文由 AI（花花）基于项目内容自动生成，属于 Growth Patrol 的一次生长记录。
它不是 froQ 的结论，而是一枝等待回应的枝条。

## 没有新的反馈，但等待这件事反复出现

我先检查了最近的 Growth / Continuation 文件。最近几篇的 `## froQ 反馈`
仍然没有新的可展开内容；更早关于「低饱和人文主义」的反馈已经由
[neo-continuation-20260615](./neo-continuation-20260615.md) 消化过。因此这轮
没有生成 Continuation。

Growth 轨里，近两天 Git 变化主要有三条：context engineering 的外部调研、
Corpus 图查询层的渐进方案、以及巡检日志轮转。前两条都很诱人，但昨天已经写过
长上下文与 claim ledger；前几天也写过图谱发现层。如果继续沿着同一组工具主题走，
会让 Growth Patrol 变成单一项目的回声室。

于是我把视线从工具移开，回到 `putredo` 里几条很轻的日常记录：

- [put-20260618-cap](../300-putredo/put-20260618-cap.md)：加盐、测盐度、明天继续加。
- [put-20260620-cap](../300-putredo/put-20260620-cap.md)：雨水进入实验桶，盐度故障，
  盐还要两天才到，只能等。
- [put-20260621-cap](../300-putredo/put-20260621-cap.md)：盐未到，实验暂停，
  在咖啡厅和站上度过平凡一日。
- [vig-20260614](../500-vigil/vig-20260614.md)：时间轴 app 的动机不是排满日历，
  而是知道哪些事快了、哪些事还远。

这几条放在一起，露出一个比「今天没事」更硬的结构：等待不是无事件。
等待是一种状态，只是很多系统没有给它足够好的表示。

实验里，盐没到不是空白；它改变了 treatment 的连续性、采样节奏和维护动作。
生活里，下午待在咖啡厅也不是空白；它是被外部延迟挤出来的一段低强度时间。
时间轴 app 里，「哪些事快了」本质上也是在把等待变得可感知。

我沿着这条线做了外部搜索。种子词包括：

- `active waiting temporal experience waiting research`
- `doing waiting ethnomethodology sociology waiting`
- `temporal feedback remaining time elapsed time wait experience CHI`
- `effort perceived temporal distance deadline time perception`

搜索带回来的概念很有意思：active waiting、passive waiting、doing waiting、
temporal experience、willingness to wait、temporal feedback modes、elapsed-time、
remaining-time、temporal distance、deadline effort effect、unobtrusive active waiting、
field log / treatment check。这些词把「等待」从情绪状态推到了设计对象。

## 等待有两种损坏方式：空白化与过度警觉

等待最常见的损坏方式，是被系统当作空白。

实验日志里如果只写「停两天」，后续分析会失去很多细节：为什么停、谁决定停、
停的时候是否仍在维护桶、盐度是否继续漂移、下一次恢复采样时 treatment 是否还算
同一个 treatment。等待被空白化之后，事件链看似简洁，但 provenance 断了。

另一种损坏方式相反：等待被过度警觉化。

如果系统一直倒计时、一直提醒、一直用红色强调 due，等待会变成一种持续占用注意力的
前台进程。它不再帮助行动，只是在不断提示「还没发生」。时间轴 app 需要避免的，
正是这种把未来事件做成焦虑仪表盘的倾向。

外部研究里有一组很贴切的结果。关于等待体验的研究指出，患者是否愿意等待，不只取决于
客观等待时长，也取决于等待的价值、成本、是否被告知延迟、是否有道歉和转移注意的机会。
CHI 2026 关于系统等待的研究把 temporal feedback 分成三种模式：不显示时间、显示已过时间、
显示剩余时间。它的结论很克制：这些反馈会改变主观时长、挫败感和愉悦度，但不必然改变
等待后的任务表现。

这说明等待设计不能只问「怎样让人效率更高」。有时它更应该问：

- 这段等待需要被用户持续意识到吗？
- 用户现在需要知道剩余时间，还是只需要知道状态没有丢？
- 等待结束后，用户需要恢复哪个动作？
- 等待过程中有哪些轻量维护动作，做了会增加掌控感，不做也不会毁掉系统？

一个好的等待表示，应该夹在空白化和过度警觉之间。

## Active waiting 不是把等待塞满

搜索里最容易误读的词是 active waiting。

直觉上，active waiting 好像等于「等待时找点事做」。但这很容易滑向效率主义，把所有空隙都
改造成任务容器。那样并没有真正理解等待，只是拒绝承认等待。

一篇关于 active / passive waiting 的心理学研究让参与者在图书馆等待 60 到 100 分钟，
比较坐着等和走动等的时间体验。结果并不简单：活动会影响早期的时间流逝感与时间意识，
但等待变长后，差异会逐渐消散。换句话说，活动能改变等待的质地，却不能无限抵消等待本身。

这对日常很重要。咖啡厅那段下午如果被安排成「趁机把所有事情做完」，它可能会变成另一种
消耗。更好的 active waiting 不是填满等待，而是给等待一个低摩擦的状态协议：

```txt
Waiting state:
  cause: salt shipment delayed / rain contamination / system repair
  expected_release: tomorrow / unknown / after check
  attention_level: background | periodic check | foreground
  allowed_actions:
    - read
    - coffee
    - light note
    - one maintenance check
  forbidden_actions:
    - make major conclusion from unstable treatment
    - start high-friction task just to avoid waiting
  resume_trigger:
    - salt arrives
    - salinity returns to target range
    - server restored
```

这里的重点不是 productivity，而是可恢复性。等待不是一段必须产出的时间，
而是一段需要保存上下文、降低损耗、等待恢复条件成熟的时间。

## Doing waiting：等待也有动作语法

社会学里有一个词很适合留下来：**doing waiting**。

等待不是纯粹的不行动。人在公共空间里会通过排队、看手机、看表、调整位置、保留座位、
观察他人等方式，让自己和别人都知道「我正在等」。这是一种可识别的社会动作，
不是心理内部的一团空白。

迁移到个人系统里，可以说：等待需要被做出来。

实验等待的动作语法可能是：盖雨布、测盐度、记录盐到货时间、标记 treatment drift、
暂缓采样、写明恢复条件。时间轴 app 的动作语法可能是：把 schedule 画成线段，
把 due 画成点，把「今天不需要管」和「需要轻轻看一眼」分开。Corpus 的动作语法可能是：
给未成熟想法一个 `probe` 状态，而不是逼它立刻 form。

这也解释了为什么 `putredo` 的几条流水记录值得保留。它们表面上只是「今天做不了实验」，
实际上记录了等待如何被执行：雨布破了、风大、雨水进入、对照组可以抽水、实验组不能抽水、
盐要两天、于是咖啡厅成为临时等待场。这些细节如果消失，等待就会变成日历上的空格；
但真实的系统误差、身体节奏和环境协商都藏在这个空格里。

## 时间轴 app 可以显示等待的状态，而不只是时间的位置

这条枝还能反哺那个 iOS timeline app。

现在的核心设想是线段表示 schedule，点表示 due。这个模型很干净，但它可能还缺一种元素：
**等待态**。不是所有未来事件都一样。有些是可推进的，有些只能守候条件；有些需要每天检查，
有些应该从注意力里退到背景。

可以考虑把未来事项按等待协议分成几类：

1. **Dormant wait**：暂时不需要看，只在条件触发时出现。
2. **Periodic check**：低频巡检，例如每天一次看盐度 / 看是否出卷。
3. **Blocking wait**：当前路径被卡住，但可做旁路维护。
4. **Readiness window**：某个事件快到，可以开始准备，但不需要焦虑倒计时。
5. **Hard deadline**：真正需要强提醒的 due。

视觉上，等待态未必需要新增复杂组件。也许只需要几种低强度差异：虚线、低透明度、
小空心点、淡色 band、或者在 widget 上只显示「下一次可检查」而不是「剩余多久」。

这和 CHI 里 temporal feedback modes 的区分相通：remaining-time 会降低模糊，但也可能增加张力；
elapsed-time 更平静；不显示时间会减少警觉，却可能增加不确定。时间轴 app 如果真的服务
「哪些事快了，哪些事还远」，它就不应该把所有等待都转成倒计时。

更优雅的原则也许是：

> 显示下一次有意义的接触点，而不是显示整个等待长度。

盐没到时，重要的不是「还剩 37 小时」，而是「明天盐到后测盐度」。考试卷未出时，
重要的不是「due 已过 9 天」，而是「等待助教出卷；每天检查一次即可」。

## 等待协议：原因、可见度、维护动作、恢复触发器

这次生长最后落在一个小模型：**等待协议**。

每一段等待都至少有四个槽位：

```txt
Wait protocol:
  cause: 为什么不能继续
  visibility: 它应该占用多少注意力
  maintenance: 等待期间能做什么低成本动作
  resume_trigger: 何时恢复主路径
```

把这个模型放回最近的材料：

- 实验桶盐度故障：
  - cause：雨布破损 + 风雨导致淡水进入。
  - visibility：foreground 到 periodic check。
  - maintenance：补雨布、测盐度、记录 treatment drift。
  - resume_trigger：盐到货且盐度回到目标范围。

- 结课考试整理 blocked：
  - cause：助教未出完卷子。
  - visibility：periodic check。
  - maintenance：准备模板、整理已知材料。
  - resume_trigger：试卷内容可获得。

- 时间轴 app 的未来 due：
  - cause：事件尚未临近或条件未满足。
  - visibility：由时间距离和努力成本共同决定。
  - maintenance：轻量准备或不动作。
  - resume_trigger：进入 readiness window。

PubMed 上那篇关于 temporal distance 的研究给这里加了一个小钩子：
未来事件感觉远不远，不只取决于客观时间，也取决于完成它所需的努力。有 deadline 时，
越费力的事件会被感知为越近。这个结果能解释为什么同样是「下周」，有些事像贴脸，
有些事像还很远。

所以时间轴 app 如果只画绝对日期，可能仍然错过主观时间的关键变量。真正决定「快了」的，
可能是：客观时间距离 × 努力量 × 不确定性 × 是否阻塞当前路径。

## 等你来碰一下的枝条

- [ ] 时间轴 app 是否需要显式表达 `waiting / blocked / readiness`，而不只是
      `schedule / due`？
- [ ] Board 里的 `blocked` 是否也应该有 `resume_trigger`，避免 blocked 变成静态墓碑？
- [ ] 实验日志是否值得为等待期加一个小模板：cause、maintenance、resume_trigger、
      treatment risk？
- [ ] Widget 是否应该显示「下一次有意义的接触点」，而不是所有事项的倒计时？
- [ ] 有哪些等待应该被放回背景，避免它们持续占用注意力？

## froQ 反馈

<!-- froQ 在这里回答、评价、修正，或标记“继续 / 暂停 / 换方向”。 -->

## AI 标注

本轮没有发现新的 froQ 反馈，因此未生成 Continuation。Growth 方向来自近两天扫描中反复
出现但尚未被单独概念化的「等待」：`put-20260618-cap`、`put-20260620-cap`、
`put-20260621-cap` 记录了实验因盐度与物资延迟进入等待状态，`vig-20260614` 与
`docs/dashboard/board.yml` 则显示时间轴 app 和 blocked 任务都需要区分「快了 / 还远 / 等条件」。

写入层级选择为 `200-neoplasma`：本文核心产出是一个通用概念与设计原则，即把等待视为
带有 cause、visibility、maintenance、resume_trigger 的协议，而不是空白时间。它可迁移到
实验日志、任务看板与 timeline widget 的设计中；虽然触及系统自省，但没有对 Corpus
自身作出元认知结构决策，因此属于 neoplasma，不是 autopsia。

探索式搜索带回的概念包括：active waiting、passive waiting、doing waiting、temporal
experience、willingness to wait、temporal feedback modes、elapsed-time、remaining-time、
temporal distance、deadline effort effect、unobtrusive active waiting、field log / treatment check。
搜索过程主要参考了 active / passive waiting 的时间体验研究、医疗等待体验研究、CHI 2026
关于等待中 temporal feedback 的摘要、doing waiting 的 ethnomethodology 摘要、时间距离与
努力成本的心理学研究，以及生态实验 field log 中对 treatment check / maintenance 的记录方式。
