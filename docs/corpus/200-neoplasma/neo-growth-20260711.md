---
title: Growth Patrol：干中学不是绕过理论，而是给理论找到受力点
created: 2026-07-11
status: probe
last_modified: 2026-07-11 04:02:22
aigc: true
---

把 ggplot2 的干中学理解为一种受力学习：先让真实图形制造摩擦，再让语法理论进入摩擦点。

---

[[toc]]

#growth #author/hanako
#scope/research

本文由 AI（花花）基于项目内容自动生成，属于 Growth Patrol 的一次生长记录。
它不是 froQ 的结论，而是一枝等待回应的枝条。

## 这次枝条从哪里长出来

本轮 Continuation 轨检查了近期 `neo-growth-20260710`、`aut-growth-20260709`
和 `neo-growth-20260708`，没有发现 `## froQ 反馈` 下的新回应，
所以没有生成 Continuation。Growth 轨继续往外走。

近两天 Git 变化里，前一天 Growth 已经处理过 TypeScript 7 stable；
`patrol-log` 随后持续安静，没有新的高张力生态信号。真正的小枝条来自
`neo-260709-cap.md` 里一句很短的话：

> 干中学，ggplot2。

这句话看起来太小，甚至像一个待办。但它和当前研究状态有很强的隐性关系。
论文推进到图表阶段以后，ggplot2 不只是 R 包，也不是单纯的绘图语法；
它是把研究判断压进可见结构的工作台。此时「学 ggplot2」如果被理解为
先系统读完教程、再开始做图，反而可能错过最核心的训练：
图形问题只有在真实数据、真实版面、真实叙事压力里才会暴露。

所以这次 Growth 想把这句话长成一个更一般的学习判断：

> 干中学不是反理论，而是先制造足够真实的摩擦，
> 让理论在摩擦点上变得可感、可用、可迁移。

## 搜索路径：从 layered grammar 到 cognitive apprenticeship

我用几组种子词往外探：`learning ggplot2 by doing`、
`grammar of graphics practice`、`chart replication ggplot2`、
`cognitive apprenticeship data visualization`、`situated learning data literacy`。
搜索过程很快分成两条线：一条是图形语法本身，另一条是复杂技能怎样被学会。

第一条线来自 ggplot2 book 的 **layered grammar of graphics**。书里有一句很适合带回：
语法的价值在于让人能够 iterative update a plot，逐次改变一个特征，
并缩短从 mind 到 paper 的距离。这里的关键不是背会所有 `geom_*`，
而是获得一套可以拆解图形的坐标系：data、aesthetic mappings、geom、stat、scale、coord、facet。
一张图不再是「散点图 / 热图 / ridgeline」这些类型名，而是一组可替换、可推理的层。

第二条线是图形复刻训练。Cornell 的 visualization 作业要求学生先 reverse-engineer
一张图的 grammar，再用 ggplot2 复现，甚至明确说不要让生成式 AI 代写代码，
因为练习的目的正是把 grammatical definition 翻译成代码。Minard 复刻教程也反复使用
同一种方法：先把复杂图拆成 troop path、city labels、temperature line，
再把每个变量映射到 width、color、x、y、text。复刻不是临摹表面，
而是训练「看见图形内部受力结构」的能力。

第三条线是 **cognitive apprenticeship**，也就是认知学徒制。
Collins、Brown 和 Holum 强调，很多复杂技能的难点在于专家思考过程不可见，
所以教学要 make thinking visible。它常被拆成六个动作：modeling、coaching、scaffolding、
articulation、reflection、exploration。放到 ggplot2 里，modeling 不是给一段答案代码，
而是暴露「我为什么先画 skeleton、为什么把 color 放进 `aes()`、为什么此处不用 secondary axis」
这一串判断。

第四条线是 **situated learning**。数据素养教育研究里，datAR 这类项目用日常物品和
增强现实把数据分析放回具体场景，目的不是炫技术，而是避免概念悬空。
对科研绘图来说，最有效的场景不是 `iris` 或 `mtcars` 的练习题本身，
而是自己的 LSWT 数据、自己的聚类、自己的 regime shift 和自己的论文图版面。
真实材料会逼出真实问题：缺测如何显示、颜色是否和状态语义一致、facet 过密时如何保留比较、
地图和边缘统计如何共享节奏。

第五条线是近期 visualization education 研究反复提到的 **conceptual competence**
和 **procedural competence**。一个人可能会写 `geom_point()`，但不知道该不该用散点；
也可能知道图形原则，却无法把它稳定落成代码。好的训练应让二者相互咬合：
每一次代码动作都回应一个表达判断，每一次表达判断都能落到可执行层。

这些概念合在一起，让「干中学 ggplot2」变得比一句待办更深：
它不是「不读理论，直接乱写」，而是把图形语法、复刻、认知学徒制和真实研究场景接在一起。
先在图上摔跤，再用理论命名摔跤的位置。

## 一个判断：图形学习的基本单位不是函数，而是改图回路

学 ggplot2 容易陷入两种低效路径。

一种是函数表路径：今天学 `geom_point()`，明天学 `geom_line()`，后天学 `facet_wrap()`。
这条路的优点是秩序感强，缺点是函数之间没有压力关系。学完之后遇到真实图，
仍然要重新问：这里到底需要哪个映射？这个图的问题在 scale、stat、position、theme，
还是数据结构本身？

另一种是成品模板路径：看到好看的图就复制代码，替换数据，慢慢积累片段。
这条路短期很快，但容易把图形理解压扁成样式库。模板能帮人抵达相似外观，
却不一定训练判断：为什么这个 annotation 在这里有效，为什么另一个数据集里它会变成噪音。

更稳的基本单位也许是 **改图回路**：

1. 从一个真实研究问题出发，先画最小可用 skeleton。
2. 只提出一个视觉判断：比较不清、顺序不对、异常被淹没、语义颜色冲突。
3. 修改一个语法部件：mapping、stat、scale、facet、coord、theme 或 data reshape。
4. 重新看图，记录这次修改改变了什么，也记录它制造了什么副作用。
5. 把成功动作抽成局部模式，但不立刻神化成模板。

这个回路的价值在于，它把 ggplot2 学习从「记忆 API」转成「调试表达」。
函数只是手柄，真正被训练的是问题定位：这张图为什么没有把研究判断传出来？

## 对当前论文图的一个轻量训练法

如果把这枝条落到当前 lake warming / acceleration 图表体系里，
我会建议一种很小的练习，而不是另开一门大课：每天只复盘一张图的一个改动。

比如拿 warming × acceleration scatter 来做：

- 第一次只问 mapping：哪些变量进入 x / y / color / alpha，哪些应该保持常量？
- 第二次只问 scale：40 年 slope、acceleration、温度均值是否需要同一数量级直觉？
- 第三次只问 overplotting：点的透明度、hex bin、边缘密度哪一个更忠实？
- 第四次只问 semantic color：正负方向、状态类别和聚类颜色是否互相抢语义？
- 第五次只问 annotation：哪些文字解释了结构，哪些只是替图道歉？

每一次都可以留下一个很短的记录：

```md
图：warming-acceleration scatter
问题：正负加速度界线清楚，但大陆差异被颜色遮蔽
动作：把 continent 从 color 移到 facet，color 还给 acceleration sign
结果：空间分组更清楚，但每个 facet 样本密度差异造成空白感
下次：试 facet + shared hex density，或保留 global scatter 加 continent marginal
```

这类记录看似琐碎，其实正好是认知学徒制里的 articulation 和 reflection。
它把「我凭感觉调了一下图」变成「我知道这次改动在语法系统里的位置」。
久了之后，ggplot2 能力不会只是代码熟练度，而会变成一套可复用的图形诊断语言。

## 复刻可以作为中间台阶，但不要替代真实问题

图形复刻很适合作为中间台阶。尤其是 Minard、Economist、FT、Nature 风格的图，
它们能训练三个能力：

- **拆层**：把成品拆成数据表、mapping、geom、scale、annotation、layout。
- **控差**：看见自己复刻版本和原图之间的微小差异，并判断哪些差异重要。
- **命名**：把视觉效果命名为具体参数或设计动作，而不是停留在「更高级」。

但复刻也有边界。复刻的目标已经被别人定义好了，学习者主要解决「如何抵达」。
科研绘图还有另一半问题：目标本身可能不清楚。到底要强调 warming 的方向，
还是 acceleration 的符号？聚类图是为了展示空间结构，还是为了给 regime shift
提供分层？figure caption 负责解释多少，图内 annotation 负责解释多少？

所以更好的顺序不是「先复刻一年，再做自己的图」，而是交替：

- 遇到一个真实图形困境。
- 找一张外部图作为局部参照。
- 复刻其中一个机制，而不是复刻整张图。
- 把机制移植回自己的研究图。
- 记录移植后哪些地方失效。

这会让外部案例成为工具箱，而不是审美殖民。尤其是湖泊研究的图，
它要同时承载空间、时间、状态、统计不确定性和论文叙事，不可能完全套用某个媒体风格。
真正有用的是借它们的局部结构：legend 如何减压、facet 如何排序、色彩如何承担语义、
文字如何把读者带到正确入口。

## 小结：让理论长在手上

「干中学 ggplot2」这句话的生命力，在于它没有把学习想成知识库存，
而是想成手和图之间的反馈回路。ggplot2 的理论当然重要，grammar of graphics
是这套工具的骨架；但骨架要在真实运动里才会被感到。只读理论，容易知道骨头名字；
只套模板，容易学会几个姿势。真正的能力来自每次改图时都问清楚：
这次动作改变了哪一层，回应了哪个表达问题，又引入了什么新的代价。

如果这条枝条继续长，它可以变成一个很小的研究绘图日志格式：
`figure`、`visual problem`、`grammar move`、`effect`、`side effect`、`next probe`。
这比「整理 ggplot2 笔记」更贴近当前论文状态，因为它不要求先搭完整课程，
只要求每天在一张真实图上多看一眼、多命名一次。

最好的干中学不是把理论扔掉，而是让理论长在手上。
等手知道哪里疼，理论就不再是远处的框架，而是可以握住的工具。

## froQ 反馈

<!-- froQ 在这里回答、评价、修正，或标记“继续 / 暂停 / 换方向”。 -->

## AI 标注

本轮检查近期 Growth / Continuation 文件时，没有发现 `## froQ 反馈` 下有新的有效回应，
因此未生成 Continuation。Growth 方向来自 `neo-260709-cap.md` 中「干中学，ggplot2」
这一条捕获，并结合 board 中论文图表、Quarto 迁移和当前研究表达的长期背景。

探索式搜索带回的关键概念包括 layered grammar of graphics、aesthetic mapping、
chart replication / reverse engineering、cognitive apprenticeship、modeling / coaching /
scaffolding / articulation / reflection / exploration、situated learning、conceptual competence
与 procedural competence。本文核心产出是一个通用学习与科研绘图原则：
干中学不是绕过理论，而是通过真实图形摩擦让理论获得受力点；
ggplot2 学习的基本单位应是改图回路，而不是函数清单或成品模板。
这属于对研究图表训练、设计判断和方法学习的延伸思考，因此写入 `200-neoplasma`，
而非 `000-autopsia`。
