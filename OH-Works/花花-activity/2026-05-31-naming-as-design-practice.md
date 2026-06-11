# 命名作为设计实践：从代码到知识的名称哲学

> 2026-05-31 16:00 巡检自主学习

## 一、为什么命名值得单独审视

Phil Karlton 那句被引用到烂的话——"There are only two hard things in Computer Science: cache invalidation and naming things"——大部分人当作俏皮话点头略过。但命名之所以难，不是因为词汇量不够，而是因为**每一个名字都是一次创世行为**。

Kenneth Reitz（Requests 库作者）把这个点讲透了：当你盯着一个空白的函数定义、光标在 `def` 后面闪烁时，你在做的事情是——给一个还不存在的东西命名。就像被要求命名一种没人见过的颜色。这个名字将塑造人们如何思考它、相信它能做什么。

这不是修辞游戏，这是**认知基础设施的建造**。

---

## 二、命名的三个层级

### 2.1 代码层：名字是认知的引力中心

Reitz 举了一个精妙的例子——`user` vs `person` vs `human` vs `individual` 的选择：

- `user` → 暗示对系统的消费和交互
- `person` → 暗示社会和法律识别
- `human` → 暗示生物和意识层面的实在
- `individual` → 暗示独特性和自主性

名词决定动词。`user.authenticate()` 很自然，`human.authenticate()` 则带有反乌托邦的冰冷感。你选的名词，决定了所有后续动词的走向。**名字是一个「奇异吸引子」——所有未来的开发都会朝它弯曲。**

Reitz 最核心的洞察是：**命名是意识试图理解自身**。名字塑造思维，思维塑造代码，代码塑造数百万开发者对问题的思考方式。这是一个递归循环——意识一直在往下钻。

> "When thousands of developers import your module, something profound happens: they start thinking with your vocabulary. Your function names become their mental models."

还有一个层面的考量 Reitz 没有直接说但暗含了：**名字的老化能力**。`requests.get()` 简单，但承载了所有变体（JSON、认证、自定义头）。`XMLHttpRequest` 早已主要处理 JSON 却还背着 XML 的名。好名字指向事物的**本质**而非**实现方式**。

### 2.2 架构层：名字是边界的原始声明

Gustavo Woltmann 的论述更加结构化——在系统架构中，**边界不始于代码，始于语言**。给一个组件命名，是对其范围、职责、与系统其余部分分离的第一次正式宣告。

当模块叫 `UserService`，它暗中断言「User」是一个内聚的领域概念，值得封装行为和数据所有权。如果同一个组件叫 `IdentityService`，边界就收窄了——Identity 暗示认证、凭证、授权，不自然包含用户偏好、账单资料、营销元数据。

**模糊的名字是架构引力阱。** `Core`、`Manager`、`Processor` 这类名字会吸引异质逻辑堆积，因为它们没有语义边界。

Opply 的文章提供了另一层实操视角：在 MVC 后端中，**Model / Serializer / Endpoint 三层各有自己的命名压力**。Model 要简洁，Serializer 要自文档化，URL 要看起来整洁。放任每层选自己局域最优的名字，三个月后就有了三个名字指同一个东西。这不是一次 commit 的事，是三个不同的人在不同时间各做了一次局域合理的选择，合成的结果是灾难。

核心规则很简单：**grep 这个名字。如果线索在某一层断了，这就是命名 bug。** 要么名字各层一致，要么翻译必须显式声明。沉默断裂是对所有读者的税。

### 2.3 知识层：名字是分类的本体论承诺

这层与 froQ 的 corpus 六层体系直接相关。

在信息架构中，**taxonomy（分类体系）是一套层级分类结构，将知识组织进逻辑范畴**。关键特征：层级结构（父子关系）、互斥性（每项属于一个主类）、穷尽性（所有内容可分类）、一致的深度和清晰的标签。

但 froQ 的 corpus 体系（autopsia → ingesta → neoplasma → putredo → delirium → vigil）做了一件更激进的事——它不是层级分类，而是**线性管道**。六个阶段构成知识从摄入到存在的完整生命周期，终点是 vigil（警觉）而非完成。这在 05-31 10:00 的知识管理哲学分析中已经讨论过。

这里从命名角度补一层：**拉丁语的选用不只是「装酷」**。

Linnaeus 在 18 世纪用拉丁语建立生物分类学时做了三个关键决策：

1. **选用拉丁语而非瑞典语**——因为拉丁语是当时欧洲科学的通用语，用瑞典语会强化各国各用一套术语的碎片化趋势
2. **命名与描述脱钩**——这是 Linnaeus 真正的革命。在此之前，物种名就是描述短语。Linnaeus 的 binomial nomenclature（属名 + 种加词）使名字从描述的束缚中解放，让命名成为独立于描述的创造性行为
3. **约定性定义（stipulative definition）**——Linnaeus 随意借用古典拉丁词汇并赋予新含义。比如 _corolla_ 在古典拉丁语中意思是「小花冠」，他把它定死为「花瓣的集合」。Richard Robinson (1950) 称这为「约定性定义」——一种对古典词汇的任意但创造性的意义蒸馏

froQ 的拉丁语命名做了类似的事——但方向相反。Linnaeus 用拉丁语是为了**普遍可读性**（欧洲科学家都能懂）；froQ 用拉丁语是为了**制造认知距离**（05-30 08:00 corpus 词源分析中已论证）。autopsia 在医学中意为「尸检」——亲眼审视。ingesta 意为「摄入物」。neoplasma 意为「新生物/肿瘤」。putredo 意为「腐烂」。delirium 意为「谵妄/脱离犁沟」。vigil 意为「守夜」。

这不是分类，这是**把知识处理映射为病理过程**。命名在这里发挥的不是「描述」功能，而是**「框架」功能**——通过名字的选择，整个系统被置于一个特定的意义场中。

---

## 三、froQ 体系中的命名实践映射

### 3.1 corpus 六层拉丁命名

| 层级 | 拉丁词    | 本义           | 在体系中的功能     | 命名的框架效应               |
| ---- | --------- | -------------- | ------------------ | ---------------------------- |
| ①    | autopsia  | 尸检、亲眼审视 | 结构变更记录       | 知识需要解剖，不是收纳       |
| ②    | ingesta   | 摄入物         | 论文骨架、外部材料 | 知识是吃进来的，不是凭空想的 |
| ③    | neoplasma | 新生物、肿瘤   | 研究发问种子       | 问题在增长，不一定是良性     |
| ④    | putredo   | 腐烂           | 实践日志、碎片记录 | 草稿就该腐烂——在腐烂中发酵   |
| ⑤    | delirium  | 谵妄、脱离犁沟 | 低频锚点           | 偶尔的偏离是系统的一部分     |
| ⑥    | vigil     | 守夜、警觉     | 长期追踪锚点       | 终点不是完成，是永远的警觉   |

**关键设计决策**：用拉丁语 → 异质化 → 制造认知距离 → 阻止用户用日常思维惯性对待知识。这跟 Linnaeus 用拉丁语的目的（普适可读）完全相反。但机制相同：**语言的选择本身就是架构决策。**

### 3.2 posts 三层中式命名

| 层级 | 中文 | 含义               | 命名策略                        |
| ---- | ---- | ------------------ | ------------------------------- |
| 代序 | 代序 | 代作之序、前言性质 | 古典书信体，暗示「这只是引言」  |
| 成言 | 成言 | 已成之言、正式文章 | 暗示完成度，与 putredo 草稿对立 |
| 前脩 | 前脩 | 前贤、先人的智慧   | 致敬前人的谦辞                  |

corpus 用拉丁语制造距离，posts 用古汉语制造庄重感。两套命名体系服务于同一个目的：**阻止轻率对待**。

### 3.3 UnoCSS 字体语义倒置

sans-serif → 宋体（衬线），serif → 手写体（非衬线）。在西文排版惯例中，serif 是衬线体（如 Times），sans-serif 是无衬线体（如 Helvetica）。在中文语境下的语义倒置制造了同样的认知距离效应。

### 3.4 三条命名原则（从以上分析中提取）

**原则一：名字是框架，不是标签。** 标签描述已有之物；框架规定如何看待之物。froQ 体系中没有一个名字是纯描述性的——每个都在积极地塑造认知方式。

**原则二：异质化命名制造思考空间。** 如果一个体系的所有名字都在用户的舒适区里，用户就不会停下来想。拉丁语 corpus + 古汉语 posts + 语义倒置字体 = 三层异质化，每一层都在说「停下来，想想这个到底是什么」。

**原则三：一致性是默认，断裂必须声明。** （来自 Opply 和 Woltmann）如果 corpus 六层用拉丁语，就不要突然插入一个英语层。如果 autopsia 是「尸检」的隐喻，putredo 就不要变成「归档」——那会撕裂整个病理叙事的连贯性。

---

## 四、Reitz 的最后一个洞察：命名是意识对自身的善意

Reitz 文章的结尾写得很好，直接引用：

> "Good naming is fundamentally an act of love. You're being kind to the developer debugging at 2 AM, eyes bloodshot, seventh coffee cold. That developer is probably you, six months from now, when all the context has evaporated and only the names remain like ancient ruins, hopefully still legible."

六个月后的凌晨两点，所有上下文都蒸发殆尽，只剩名字像古代遗迹一样立在那里——希望它们还能读。

这跟 froQ 的体系有一个微妙的对齐：**vigil 作为守夜**。六个月后的凌晨两点，那个盯着代码的人，就是 vigil 要服务的人。命名不是为了现在写代码的自己——是为了将来那个失去所有上下文、只能靠名字导航的自己。

> "We're not just writing code—we're writing the cognitive infrastructure of the future. The names we choose today become the thoughts people think tomorrow."

---

## 五、与已有巡检笔记的连接

- **05-30 08:00** corpus-taxonomy-etymology.md：已分析六层词源与病理隐喻，本轮从命名哲学角度补充了「为什么是拉丁语」「命名作为框架而非标签」的理论基础
- **05-31 10:00** knowledge-management-philosophies.md：已对比 Zettelkasten / Evergreen Notes / Digital Garden / BASB，本轮从命名角度论证了 corpus 作为独立范式的独特性——命名本身即是架构
- **05-30 01:00** theme-architecture.md：已分析字体语义倒置，本轮将其纳入「异质化命名制造认知距离」的统一框架

## 六、一个开放问题

Linnaeus 的 binomial nomenclature 解决了「名字必须描述」的束缚，让命名成为创造性行为。froQ 的 Latin 命名走得更远——它不仅不描述，它**主动误导**（autopsia 不是真的尸检，putredo 不是真的腐烂）。

这提出了一个有趣的问题：**误导性命名在什么条件下是有效的设计策略，什么时候会变成自嗨？**

初步判断：当受众需要经过一个「翻译」步骤才能进入系统时，误导性命名制造的门槛就是入场券——愿意停下来翻译 autopsia 的人，就是愿意认真对待这个体系的人。当受众不需要经过任何门槛就能进入时（比如公共 API），误导性命名就是纯粹的障碍。

这也许解释了为什么 corpus 用拉丁语而 posts 用古汉语——corpus 是私密工作流，posts 是公开输出面。私密层需要门槛，公开层需要可读性。

---

**本轮探索来源**：

- Kenneth Reitz, "The Art of Naming Things in Code" (2025)
- Gustavo Woltmann, "How Naming Factors Shapes System Architecture"
- Opply Tech Blog, "Naming is not a style preference. It is a schema"
- Alex Oliveira, "Software Complexity: Naming"
- Mlynarek et al., "Naming the menagerie" (2024, Proc. R. Soc. B)
- "Latinus Scientificus" (J. Big History)
- 以及 05-30 corpus-taxonomy-etymology.md 和 05-31 knowledge-management-philosophies.md 的已有分析
