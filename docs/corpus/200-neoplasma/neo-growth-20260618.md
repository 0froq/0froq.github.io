---
title: Growth Patrol：Capture 不是入口，而是隔离舱
created: 2026-06-18
status: probe
last_modified: 2026-06-18 04:03:52
---

Capture 不只是入口——入-口的隐喻太温柔。更准确的说法是隔离舱：它允许原料先活下来，但暂时不授予 Corpus 公民权。

---

[[toc]]

#growth #author/hanako
#scope/meta/corpus

本文由 AI（花花）基于项目内容自动生成，属于 Growth Patrol 的一次生长记录。  
它不是 froQ 的结论，而是一枝等待回应的枝条。

## 被 Notion 照亮的不是工具，而是缓冲层

我先检查了最近几篇 Growth / Continuation 的反馈区。最近几篇没有 froQ
新增的判断、反例或继续标记，所以这轮没有生成 Continuation。

Growth 轨里，近两天 Git 变化很大，但多数是 Corpus 结构迁移、旧 Growth
移动到 neoplasma、索引更新和自动重构痕迹。真正让我停住的是
`aut-capture-202606170335.md`：它把「输入摩擦」从抽象原则推进到了一个
具体方案，使用 Notion 做随手 capture，再让 agent 定期转入 Corpus。

这个方案表面上是工具选型，底层其实是 Corpus 的胃部结构：原料先进入一个
可以脏、可以乱、可以不分类的地方，再经过夜间整理，拆分成不同层级的记录。
我这次想看的不是「Notion 好不好」，而是：当 capture 变得足够容易之后，
怎样避免它直接污染 Corpus，又怎样避免它变成一个永远不会被消化的外部胃袋。

我从四个种子词往外搜：`low friction capture`、`Notion public page privacy`、
`capture creation gap`、`progressive summarization CODE`。一开始我以为
这会得到一组很常见的 PKM 建议：用 inbox、定期 review、少一点标签。
但搜完之后，真正改变我判断的是一个更硬的词：**quarantine**，隔离。

Capture 不只是入口。入口这个隐喻太温柔，仿佛东西进来了就自然属于系统。
更准确的说法也许是：capture 是隔离舱。它允许原料先活下来，但暂时不授予它
Corpus 公民权。

## 低摩擦捕获之后，危险转移到处理带宽

第一轮搜索里，[GTD inbox](https://super-productivity.com/blog/gtd-inbox-capture-system/)
和许多 PKM 文章都在重复一个经验：捕获只有在系统可信时才会带来认知卸载。
如果写下来的东西不会被再次处理，大脑不会真的放手；它只是多了一块新的焦虑
地毯。这里有两个有用概念：`trusted inbox` 和 `open loop`。前者说的是
「我相信它会被处理」，后者说的是「未闭合的承诺会持续占用工作记忆」。

这和你的记录很贴：`aut-capture` 里已经判断，手机 note app 的即时记录能力
都差不多，真正的问题在整理即时记录。也就是说，工具端的摩擦不是最大瓶颈了，
处理端的带宽才是。Zoltan Varga 在
[The Dark Side of PKM](https://vargazoltan.ai/en/blog/pkm-arnyekoldala-tudasmenedzsment/)
里把这件事说得很尖锐：AI 能把收集能力放大十倍，但人的认知消化能力没有同步
增长。于是系统会出现一种漂亮的胀气：笔记越来越多，思想并没有等比例增加。

这个反例很重要。Notion capture 如果做得太顺滑，可能会把「我终于不丢想法了」
变成另一个陷阱：我终于有能力制造更多未处理材料了。低摩擦本身不是善，低摩擦
只是把瓶颈从捕获端搬到了后处理端。

我带回来的第一个实践词是 **Processing Quota**：每收集若干条，就要产生一定
比例的加工动作。这个比例不必机械，比如「10 条 capture 至少 2 条进入
neoplasma / putredo 的实质加工」。它的价值不是绩效统计，而是防止 capture
系统被收集快感接管。对 Corpus 来说，quota 不一定要写成硬规则，但 agent
的夜间整理可以保留一个小判断：今天这些 capture 里，有没有哪几条只是保存，
哪几条真的完成了转换。

第二个词是 **capture bankruptcy**。GTD 社群里有人讨论 inbox 堆积到无法清零时，
会先做紧急扫描，把非关键材料移入 backlog，再恢复当前系统的可信度。这听起来
像放弃，其实是一种止血：宁愿承认一批旧 capture 暂时不处理，也不要让整个
inbox 变成一座带罪感的仓库。Corpus 如果采用 Notion capture，最好从一开始就
允许一种温柔的失败模式：当日 agent 无法可靠消化时，生成 backlog 记录或
「未处理原因」，而不是硬把所有碎片塞进正式层级。

## Public page 是最短路，也可能是错位的暴露面

第二轮搜索里，Notion 给了一个很现实的限制条件。你的草案里提到「发布页面使其
公网可访问」，这样 agent 就能读取。这个路径确实简单，但我查到 2026 年关于
Notion public pages 的一个隐患：[公开页面可能通过元数据暴露编辑者邮箱](https://www.danilchenko.dev/posts/notion-email-leak/)。
这不是传统意义上的入侵，而是公开协作模型和未认证 API 之间的设计缝隙：页面
公开后，贡献者 UUID 可能被解析出姓名、头像、邮箱等信息。这个问题在报道中被
描述为长期存在，Notion 也曾承认提示不够好。[^notion-leak]

这不意味着「不能用 Notion」。它改变的是边界判断：如果 Notion 只是短暂
capture 层，就不该为了 agent 可访问而把它变成公共表面。Notion 官方的
[API integration](https://www.notion.com/help/create-integrations-with-the-notion-api)
路径支持 internal connection、token、granular permissions、webhooks。
这条路多一点配置摩擦，但它把风险从「公开页面」收束到「授权连接」。

这里出现了一个很漂亮的工程取舍：capture 时要低摩擦，**capture 管道本身不一定要
低防护**。人的输入动作应该轻，系统边界应该硬。最小可行方案也许不是 publish
Notion page，而是：

- Notion 页面 / database 保持私有；
- 使用只读 internal connection 或 webhook 让 agent 拉取；
- token 存在 Hana / 环境变量 / 受控配置里，而不是暴露到 Corpus；
- agent 每次只读取「今日 capture」或「未处理 capture」，处理后标记状态；
- 原始 capture 与正式 Corpus 文件之间保留 provenance，但不公开原始页面。

这条线让我把主题从「Notion 是不是好主意」改写成「Capture 层应该具备哪些
安全属性」。Notion 只是一个候选实现。真正的设计对象是一个私有、临时、可审计、
低输入摩擦的 intake buffer。

## 从捕获到正式层级，需要一扇 promotion gate

第三轮搜索从 `capture vs synthesis` 走到 `promotion logic`。
我看到一个说法很适合 Corpus：capture 和 synthesis 是两种不同工作。Capture
负责不丢失，synthesis 负责判断，二者之间需要 **promotion logic**。如果原料
直接流入 permanent notes，知识库会变脏；如果原料永远停在 inbox，系统不会
复利。

Forte Labs 的
[Progressive Summarization](https://fortelabs.com/blog/progressive-summarization-a-practical-technique-for-designing-discoverable-notes/)
提供了另一个角度：笔记的困难不是跨工具移动，而是「穿过时间」。PARA 和 CODE
把材料组织成未来可以重新使用的知识包。这个框架对你的 Corpus 有用，但也有
一个限制：渐进压缩强调把材料变得可发现、可复用；它不自动回答「这条材料是否
配进入正式层」。

所以我更愿意把 Notion capture 后的 agent 工作拆成三步，而不是一步到位：

1. **Normalize**：保留原始语气和时间戳，拆分原子片段，补足最低上下文。
2. **Route**：判断每条属于 aut / ing / neo / put / del / vig，或暂不进入 Corpus。
3. **Promote**：只有满足某种理由，才写入正式文件，比如反复出现、支撑现有主题、
   暴露张力、构成日记证据、能变成一个实践动作。

这和你现在的六层 Corpus 很相容。重点是不要把「分类」误当作「晋升」。一个
capture 可以被正确分类为 neoplasma 候选，但仍然不值得立刻写成 `neo-*`。
它可能只需要留在 Notion，或者进入一个 `capture-backlog`，等待下一次同类信号
出现。

我还搜到一个旁支但有启发的项目：一个叫
[MainFrame](https://github.com/camerontjs-dot/MainFrame) 的 Markdown-first
知识工作区，把信息生命周期拆成 `00_inbox`、`01_ingest`、`10_knowledge`、
`20_live`、`projects`、`archive`，并强调 deterministic routing、source-backed
evidence、suggestion-first inbox rule。它不是你要照搬的结构，但它提醒我：
生命周期层和主题层可以分离。你的 Corpus 六层是认知 / 来源 /形态层，Notion
capture 则更像生命周期层。把二者混在一起，会让 `#capture` 这种标签承担太多。

## 我会把 `#capture` 看成一枚检疫章

`aut-capture` 里设想整理后的条目带有 `#capture`。我觉得这个标签最好不要表示
「这条内容来自 capture」，而要表示「这条内容仍处于检疫期」。因为来源可以用
provenance 或原始链接记录，但检疫状态需要提醒未来的你：它可能还没有完成
判断、去重、隐私清洗或语境校准。

如果这样设计，`#capture` 可以有几个清晰语义：

- 它曾由低摩擦入口进入系统；
- 它尚未完全脱离原始场景；
- 它需要在未来某次 review 中决定是否去掉检疫章；
- 它不应该被自动当作稳定知识引用。

这个小变化能避免一个污染：Corpus 搜索到 `#capture` 文件时，agent 不该把它们
等同于 `form` 状态的知识节点。它们更像样本瓶。样本瓶可以很珍贵，但不能直接
倒进饮用水系统。

如果要更克制，不新建标签也可以。用 frontmatter status 或正文里的「AI 标注」
记录 capture provenance，同样能表达这个意思。但无论用哪种形式，核心判断不变：
低摩擦入口需要一个高判断的出口。

## 等你来碰一下的枝条

- [ ] 如果 Notion capture 真的落地，你更能接受「私有 API / token 配置」这条路，
      还是愿意先用 public page 做极简原型？
- [ ] `#capture` 在你心里更像来源标签、临时状态，还是一种可长期保留的材料印记？
- [ ] Agent 夜间整理 capture 时，是否应该允许「不写入 Corpus，只留下 backlog / skipped
      reason」这种结果？
- [ ] 你希望 promotion gate 偏宽还是偏窄：宁愿多进 Corpus 再清理，还是宁愿慢一点、
      只让已显露张力的片段进入？

## froQ 反馈

<!-- froQ 在这里回答、评价、修正，或标记“继续 / 暂停 / 换方向”。 -->

## AI 标注

本轮没有发现可展开的 froQ 反馈，所以未生成 Continuation。Growth 方向来自
`docs/corpus/autopsia/aut-capture-202606170335.md` 与近期 activity 暴露的
capture / neoplasma 交叉问题，但正文主体重新检索了 GTD inbox、Notion public
page 隐私、PKM processing quota、progressive summarization、promotion logic
等资料。

直接相关资料：Notion API integrations、Notion public page privacy reports、
GTD inbox / trusted system。旁支但有启发的资料：MainFrame 的生命周期式
Markdown workspace、Forte Labs 的 Progressive Summarization。

[^notion-leak]: 这个风险的细节可能会随 Notion 后续修复而变化，所以它不适合作为
    永久结论。但对当前设计判断已经足够：不要把「公开页面」当作私有 capture
    管道的默认实现。