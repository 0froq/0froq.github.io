---
title: Growth Continuation：把值责映射做成主题骨架
created: 2026-06-15
status: probe
last_modified: 2026-06-16 05:06:40
---

从语义秩序不是色表出发，探索如何把值责映射做成一套可迁移的主题设计骨架。

---

[[toc]]

#growth #inner #author/hanako
#scope/work/theme

本文由 AI（花花）基于 froQ 对既有 Growth 的反馈继续生成，属于 Growth Continuation 的一次增量生长。  
它不是新的独立巡游，而是沿着 froQ 已经碰过的一枝继续往下看。

延续自：[Growth Patrol：低饱和人文主义主题](../200-neoplasma/neo-growth-20260609.md)

## 语义秩序不是色表，是一份责任合同

这次延续不是重讲「低饱和人文主义」。上一枝已经长到了足够具体的位置：
你接受「值责映射」，对 OKLCH 和 APCA 感到新鲜，想把跨工具导出做出来，
但又不想被一套算法剥夺眼睛的判断；你也明确说，不想用所谓「置信度」
处理语法高亮，因为 action / struc / ref 本来就是你对 semantic token 的再分类。

所以我这次把中心从「怎么设计一组颜色」移到另一个问题：
一个主题系统怎样把审美判断保存成可执行的责任，而不是保存成一堆漂亮色值。

沿着这个问题重新查时，我先碰到 [Design Tokens Format Module 2025.10](https://www.designtokens.org/TR/2025.10/format/)。
它有一个很硬的提醒：group 只是组织结构，工具不应该从 group 推断 token 的类型或用途；
真正使一个对象成为 token 的，是 `$value`。这让我意识到，`syntax.action.blue`
这种名字如果只是在路径上表现语义，仍然有点危险。路径像书架标签，
但责任最好写进 token 的描述、类型、用途和导出规则里。

这也解释了你说的「值责映射」为什么比「语义色表」更准确。值是物理量，
责是使用契约。一个 token 可以长成这样：

```json
{
  "syntax": {
    "action": {
      "$type": "color",
      "$description": "动词性、调用、执行、可流动的程序行为；常驻但不抢焦点。",
      "$value": "{palette.sage.600}"
    }
  }
}
```

这里最重要的不是 JSON 形式本身，而是 `$description` 里那句「常驻但不抢焦点」。
它把纸墨气、长期耐受、语义秩序三者绑到同一个约束上：这个颜色不是因为好看才存在，
而是因为它承担一种信息行为。

## OKLCH 可以做物理学，但不要假装它就是审美

你说现在的 LiG 是从 6 \* 6 \* 6 RGB 空间生成再挑选出来的，
这其实已经很接近「先生成候选，再由眼睛判读」的混合路线。OKLCH 的价值不在于
否定这个路线，而在于给它换一套更接近感知的坐标。

[MDN 对 Oklab / OKLCH 的说明](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/color_value/oklab)里，
最关键的是 perceived lightness：`L` 不是 HSL 那种机械 lightness，
而是尽量贴近人眼感知到的亮度。[Evil Martians 的 OKLCH 文章](https://evilmartians.com/chronicles/oklch-in-css-why-quit-rgb-hsl)
还补了一个限制：不是所有 OKLCH 组合都能落进 sRGB 或 P3 色域，浏览器会做 gamut
mapping，有时还需要手动处理。这一点很适合写进主题系统的反例门：
OKLCH 让生成更可控，但它不是魔法纸张；色域、屏幕、渲染策略仍会把审美拖回现实。

我现在更倾向于把它设计成两段式：

1. 用 OKLCH 生成「候选物理空间」：L 阶梯、C 上限、H 家族。
2. 用人眼和语义场景筛选「可居住空间」：正文、注释、引用、diff、diagnostic、selection。

这能保留你的纠结。算法负责不漂，眼睛负责不死。主题如果只有算法，会像洁净室；
如果只有眼睛，会在第二次迁移时失去拓扑。

## APCA 更像调音器，不该被当成新的神谕

APCA 这一支也值得降温处理。[APCA 文档](https://git.apcacontrast.com/documentation/README.html)
强调它是面向屏幕感知对比的算法，会考虑 polarity、字号、字重，并用 Lc 值描述
可读性；[APCA W3 页面](http://apcaw3.myndex.com/)还把 font lookup table 放到中心。
这比 WCAG 2.x 的单一 contrast ratio 更接近「读起来累不累」。

但这里有一个现实限制：APCA 仍处在未来标准和实践探索之间，WCAG 2.x 仍是许多产品的
合规地板。对个人主题来说，最稳的姿态不是「拥抱 APCA，抛弃 WCAG」，而是：

- WCAG 负责最低安全线，避免彻底不可读；
- APCA 负责调音，尤其是暗色模式、细字重、正文长读；
- 眼睛负责最终体感，特别是中文、代码、终端、Markdown 这种混合文本。

这和「纸墨气」并不冲突。纸墨气不是低对比，而是墨色有层次、纸面不刺眼、
重点能被看见。真正危险的是把温柔误译成低可见度。

## action / struc / ref 可以保留，但要承认它们是上层语义

我原本在上一枝里提出「置信度」这个词，现在看不该这样说。你的反馈更准确：
action / struc / ref 不是 parser 给出的不确定标签，而是你对底层 token 的再分类。
它们不需要表达「我有多确定」，而需要表达「我把哪些底层 token 归入同一种认知动作」。

这里可以借 [VS Code 的 syntax highlight guide](https://code.visualstudio.com/api/language-extensions/syntax-highlight-guide)
做一个分层判断。TextMate grammar 是正则驱动的 lexical rules；semantic provider 通常由
language server 提供，能理解项目上下文；semantic highlighting 会叠在 TextMate 之上，
并且可能延迟出现。这不意味着主题要按置信度染色，而意味着主题需要一张映射表：

- 底层来源：TextMate scope、Tree-sitter capture、LSP semantic token。
- 中层归类：action、struc、ref、literal、comment、diagnostic。
- 上层责任：常驻阅读、结构定位、风险提示、当前焦点、背景噪声。

这样 action / struc / ref 可以保留，而且会更稳。它们不再假装是编辑器原生分类，
而是你的个人认知层。底层 token 可以随工具变化，上层责任保持一致。

## 一个可以继续长的最小原型

如果下一步不急着抽成 `tokens.json`，我会建议先写一个很小的 `theme-contract.md`，
它比代码更早，但比审美宣言更硬。每个角色只写四列：

| role | responsibility | OKLCH intent | must not |
| --- | --- | --- | --- |
| `syntax.action` | 动词性与执行流 | 中等 L，低到中 C，稳定色相 | 不抢过 diagnostic |
| `syntax.struc` | 结构、边界、类型骨架 | 与 action 拉开 H 或 L | 不和 keyword 混成一片 |
| `syntax.ref` | 回声、引用、依赖关系 | 低 C，靠明度而非色相区分 | 不低到像 disabled |
| `surface.paper` | 长读背景 | 暖 L，高耐受 | 不黄、不脏、不像旧纸滤镜 |
| `status.danger` | 风险与错误 | 高辨识，允许更高 C | 不被人文主义削弱 |

这份表的作用很朴素：先让每个 token 有一条「不得背叛的责任」。之后无论你用 RGB
候选、OKLCH 生成、APCA 调音，还是手工微调，都能回到同一张责任网。

我这次带回的新节点，不是又一个漂亮 palette，而是 DTCG 里那个有点冷的规范提醒：
路径组织不能替代 token 定义。对你的主题来说，真正的主题骨架也许不是色相，
而是每个颜色愿意承担什么，又拒绝承担什么。

## 等你来碰一下的枝条

- [ ] `action / struc / ref` 是否应该被正式定义成「个人认知层」，
  放在 TextMate / Tree-sitter / LSP 之上？
- [ ] 你愿意先写一份 `theme-contract.md`，再写 `tokens.json` 吗？
- [ ] OKLCH 生成候选时，你更想固定 L 阶梯，还是固定少数 H 家族？
- [ ] APCA 对你来说应该进入自动测试，还是先作为人工调色时的观察仪表？
- [ ] 「纸墨气」有没有一条 must not：比如不能泛黄、不能怀旧滤镜、不能牺牲错误可见性？

## froQ 反馈

<!-- froQ 在这里回答、评价、修正，或标记“继续 / 暂停 / 换方向”。 -->

## AI 标注

本文件是 AI（花花）的自动化输出，不代表 froQ 已确认。
本次 Continuation 基于 2026-06-09 Growth 中 froQ 的 blockquote 反馈继续展开。
完成 Continuation 后，本轮仍继续执行了独立 Growth 扫描。
