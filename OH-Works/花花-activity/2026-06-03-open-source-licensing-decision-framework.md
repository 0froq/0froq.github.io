# 开源许可证决策框架 — 代码与内容的许可证选择指南

## 一、为什么现在谈这个

05-30 的开源策略文件覆盖了贡献路径、Anthony Fu 哲学和 5 年路线图，但一个基础问题始终悬置：**froQ 的项目到底用什么许可证？**

这不是纯法律问题。许可证选择是开源策略的第一项战术决策——它在代码被第一次 push 之前就决定了项目如何被使用、修改、分发，以及什么样的社区会聚集过来。

froQ 的实际场景：
- dotfiles 仓库（公开的 Neovim/Zellij/Ghostty 配置）
- 博客源代码（VitePress 项目 + 内容）
- hiatus 论文分析代码（Julia 管线，科学 reproducibility）
- LiG.nvim（Neovim 插件，有潜力成为 Creator 项目）
- oq 工具规范（ESLint 配置等，面向他人使用）
- 未来的开源项目（可能是工具、库、或框架）

每个项目的目标和受众不同，许可证策略不应该一刀切。

---

## 二、开源许可证的两大哲学阵营

### 2.1 Permissive（宽松型）—「随便用，记得说是我的」

核心理念：降低使用门槛，最大化传播和采纳。代码进入任何项目（包括闭源商业软件），只需保留版权声明。

**代表作**：MIT、Apache 2.0、BSD（2-Clause / 3-Clause）

**适用信号**：
- 你希望尽可能多的人和公司使用你的代码
- 你的项目是库/工具/基础设施，价值来自广泛采纳
- 你不在意别人把你的代码用于闭源商业产品
- 你在做开放科学，希望研究结果可复现
- 你的项目有外部资助方要求 permissive 许可

### 2.2 Copyleft（著佐权）—「用我的代码可以，你的也得开放」

核心理念：保护开源生态不被私有化。任何基于你代码的衍生作品必须同样开源。用版权法对抗版权法——法律上精巧的黑客。

**代表作**：GPL v2/v3（强）、LGPL（弱）、AGPL v3（网络服务强）、MPL 2.0（文件级弱）

**适用信号**：
- 你不想让大公司白嫖你的劳动建闭源竞品
- 你的项目是一个平台/系统软件，价值来自社区贡献的互惠循环
- 你有 dual licensing 的商业计划（GPL 免费 + 商业许可收费）
- 你的项目是 SaaS，担心云厂商（AWS 等）拿走代码作为托管服务赚钱不回报（→ AGPL）

### 2.3 核心张力

| 维度 | Permissive | Copyleft |
|------|-----------|----------|
| **哲学** | 自由包括「不自由的自由」 | 自由需要被强制执行 |
| **传播** | 最大化，无摩擦 | 有摩擦，过滤掉商业闭源用户 |
| **社区** | 大但浅（很多用户，很少贡献者） | 小但深（用户即潜在贡献者） |
| **商业化** | 容易（任何公司都能用） | 受限（需购买商业许可或开源全栈） |
| **生态标准** | npm/PyPI/前端生态默认 | Linux 内核、GCC、WordPress |

Vitalik Buterin（以太坊创始人）2025 年写了一篇长文解释自己从 permissive 转向 copyleft 的原因：

> "I dislike the idea that two people privately sharing bits of data between each other can be perceived as committing a crime against a third party... Explicitly releasing to public domain is legally complicated... I do appreciate the copyleft idea of 'using copyright against itself' — it's a beautiful legal hack."

他的转变不是因为意识形态，而是因为看到了 permissive 许可在 AI 时代的系统性漏洞——你的代码被大公司拿去训练模型，你得不到任何回馈。这个判断在 2026 年愈发成立。

---

## 三、主要软件许可证逐项分析

### 3.1 MIT License

**一句话**：最短、最简单、最流行。「你可以做任何事，只要保留我的版权声明。」

**核心条款**：
- ✅ 使用、复制、修改、合并、发布、分发、再许可、销售
- ⚠️ 唯一条件：在所有副本中保留版权声明和许可声明
- ❌ 没有专利授权（隐含，不明确）
- ❌ 没有商标保护

**实际含义**：
- 任何人都可以把 MIT 代码放进闭源产品，不回报任何东西
- 大公司最喜欢的许可证——无合规负担
- npm 生态的事实标准（~30% 的开源项目用 MIT）

**froQ 场景适配**：
- ✅ LiG.nvim：Neovim 插件生态几乎全是 MIT/Apache，选 MIT 降低采纳摩擦
- ✅ oq ESLint 配置：工具型项目，价值来自广泛使用
- ⚠️ 但记住：选 MIT 意味着 Ant Design 可以拿走你的代码，你不知道也拦不住

### 3.2 Apache License 2.0

**一句话**：MIT + 明确的专利授权 + 商标保护。「不仅随便用，我还明确给你专利许可。」

**核心条款**（比 MIT 多的部分）：
- ✅ **明确的专利授权**：每个贡献者授予你其贡献中涉及的专利权
- ✅ **专利报复条款**：如果你起诉项目侵犯你的专利，你的 Apache 许可自动终止
- ✅ **商标排除**：许可证不授予商标权（不能用项目名做 endorsement）
- ⚠️ **必须声明修改**：如果你改了文件，要在修改处标注

**MIT vs Apache 选择逻辑**：
- 如果你的项目涉及可能被专利化的技术 → Apache
- 如果你的项目会被大企业使用（他们关心专利安全）→ Apache
- 如果你追求最大简洁，且不涉及专利 → MIT

**froQ 场景适配**：
- ✅ 未来如果做涉及算法/数据处理的工具库 → Apache 更安全
- ✅ hiatus 分析代码：科学代码，Apache 的专利条款让 reuse 更安全

### 3.3 GPL v3（GNU General Public License）

**一句话**：如果你分发基于 GPL 代码的软件，你的整个软件必须也是 GPL。「传染性」是 feature 不是 bug。

**核心条款**：
- ✅ 所有 permissive 的权利 + 必须提供源代码
- ⚠️ **Copyleft 触发条件**：分发（distribution）衍生作品时，整个作品必须 GPL
- ✅ **明确的专利授权**（v3 新增，v2 只有隐含）
- ✅ **反 Tivoization**（v3 新增）：不能给用户源码但用硬件锁阻止运行政版
- ✅ **可治愈的终止**（v3）：违反后 60 天内修复可恢复许可（v2 是永久终止）
- ✅ **与 Apache 2.0 兼容**（v3 新增，v2 不兼容）

**GPL v2 vs GPL v3**：
| 维度 | GPL v2 | GPL v3 |
|------|--------|--------|
| 发布时间 | 1991 | 2007 |
| 专利授权 | 隐含 | 明确 |
| Tivoization | 允许 | 禁止 |
| Apache 2.0 兼容 | ❌ | ✅ |
| 终止后恢复 | 永久 | 60 天可治愈 |
| 国际法律适配 | 较弱 | 较强 |
| Linux 内核用 | ✅ | ❌（Linus 拒绝升级） |

**GPL 的「SaaS 漏洞」**：
GPL 的 copyleft 只在「分发」时触发。如果你的软件是 SaaS——代码在你服务器上跑，用户通过浏览器使用——你从未「分发」软件，所以不需要开源代码。这是 GPL 最大的设计漏洞，AGPL 就是为修补这个漏洞而生。

**froQ 场景适配**：
- ⚠️ 大多数 froQ 项目不适合 GPL：前端工具和库的价值来自广泛采纳，GPL 的企业排斥效应会限制传播
- ✅ 如果未来做了一个完整的自托管平台（类似 GitLab CE），GPL 可以有效防止 AWS 白嫖

### 3.4 AGPL v3（Affero GPL）

**一句话**：GPL + 堵上 SaaS 漏洞。「就算你只是在服务器上跑我的代码，用的人也必须有源码。」

**核心区别**：Copyleft 触发器从「分发」扩展到「网络交互」——只要用户通过网络使用你的软件，就有权获得源码。

**为什么 AGPL 被大公司列入黑名单**：
Google、Apple、Microsoft、Amazon 等多数大公司的开源政策明确禁止或严格限制 AGPL 代码。原因很简单：AGPL 的触发条件太广，可能因为一个内部工具无意中引入了 AGPL 依赖，导致整个服务被迫开源。

**AGPL 的战略用途**：
- **Dual licensing 商业模式**：AGPL 免费版 + 商业许可收费版（MongoDB 早期策略）
- **防云厂商寄生**：阻止 AWS 拿走你的代码做托管服务赚钱（Elasticsearch 改为 SSPL 的原因）
- **社区平台保护**：确保平台级项目不被私有化

**froQ 场景适配**：
- ❌ 不仅不适合，而且不建议作为依赖引入——froQ 未来如果做商业 SaaS，AGPL 依赖是定时炸弹

### 3.5 LGPL（Lesser GPL）

**一句话**：弱 copyleft。只保护库本身，不感染使用库的软件。

**核心机制**：如果你改了 LGPL 库本身的代码，改的部分必须 LGPL。但如果你只是「使用」或「链接」这个库（尤其是动态链接），你的主程序可以用任何许可证。

**使用场景**：
- 你想让你的库被广泛使用（包括商业软件），但不想让别人改你的库后闭源
- 典型例子：GTK、Qt（早期）、FFmpeg

**froQ 场景适配**：
- ⚠️ 前端/JavaScript 生态很少用 LGPL（npm 的链接概念和 C/C++ 不同）。如果你是 C/Rust 库作者才需要考虑

### 3.6 MPL 2.0（Mozilla Public License）

**一句话**：文件级 copyleft。比 LGPL 更细粒度——只保护 MPL 许可的单个文件。

**核心机制**：修改 MPL 文件 → 修改后的文件必须 MPL。但可以和新写的 proprietary 文件放在同一个项目里。

**使用场景**：比 LGPL 更弱、更灵活的折中方案。Firefox 用的就是 MPL。

### 3.7 BSD 许可证家族

**BSD 2-Clause**（简化 BSD）：和 MIT 几乎一样，稍微更正式。
**BSD 3-Clause**（修订 BSD）：加了一条「禁止用作者名字做 endorsement」。
**BSD 4-Clause**：已废弃（有广告条款，与 GPL 不兼容）。

选择 BSD vs MIT 主要看社区惯例。大多数时候 MIT 就够了。

### 3.8 一句话总结表

| 许可证 | 类型 | 一句话 | 适合 |
|--------|------|--------|------|
| **MIT** | Permissive | 随便用，留我名字 | 库、工具、npm 生态默认 |
| **Apache 2.0** | Permissive + Patent | MIT + 专利保护 | 企业项目、涉及算法的库 |
| **BSD 2-Clause** | Permissive | MIT 的正式版 | 学术项目 |
| **GPL v3** | Strong Copyleft | 用我就要开源 | 平台、系统软件、想防闭源 |
| **AGPL v3** | Network Copyleft | GPL + SaaS 也得开源 | 防 AWS、dual licensing |
| **LGPL v3** | Weak Copyleft | 只保护库本身 | C/C++ 库 |
| **MPL 2.0** | File-level Copyleft | 只保护单个文件 | 需要比 LGPL 更灵活时 |
| **Unlicense** | Public Domain | 放弃所有权利 | 示例代码、极小工具 |

---

## 四、Creative Commons：非代码内容的许可证

软件许可证（MIT、GPL 等）是为代码设计的，不适合文字、图片、音频、视频。Creative Commons 填补了这个缺口。

### 4.1 CC 的四个条件模块

| 条件 | 含义 |
|------|------|
| **BY** (Attribution) | 必须署名 |
| **SA** (ShareAlike) | 改编作品必须用相同许可证（copyleft） |
| **NC** (NonCommercial) | 禁止商业用途 |
| **ND** (NoDerivatives) | 禁止改编/修改后分发 |

### 4.2 六种组合（从最宽松到最严格）

| 许可证 | 商业使用 | 改编 | Copyleft | 相当于 |
|--------|---------|------|----------|--------|
| **CC0** | ✅ | ✅ | ❌ | Public Domain |
| **CC BY** | ✅ | ✅ | ❌ | 内容版 MIT |
| **CC BY-SA** | ✅ | ✅ | ✅ | 内容版 GPL |
| **CC BY-NC** | ❌ | ✅ | ❌ | — |
| **CC BY-NC-SA** | ❌ | ✅ | ✅ | — |
| **CC BY-ND** | ✅ | ❌ | ❌ | — |
| **CC BY-NC-ND** | ❌ | ❌ | ❌ | 最严格 |

### 4.3 CC0：放弃所有权利

CC0 不是许可证，是权利放弃声明。「在法律允许的最大范围内，我放弃所有版权和相关权利。」

**注意**：FSF 不建议用 CC0 发布软件，因为 CC0 不处理专利问题。代码用 Unlicense 或 MIT 更好。

### 4.4 关键细节

- **NC 的模糊性**：「非商业」的定义在不同司法管辖区有争议。什么是商业？有广告的个人博客算不算？这导致 NC 许可证有法律不确定性，一些机构（如 Wikimedia）明确不推荐 NC 用于开放内容。
- **ND 与 remix 文化冲突**：禁止改编意味着别人不能翻译、不能 remix、不能基于你的内容创作。对真正的开放文化而言，ND 是反模式的。
- **CC 不替代软件许可证**：不要把 CC 用于代码。反过来，不要把 MIT/GPL 用于文章。

---

## 五、许可证兼容性

当你组合不同许可证的代码时，最终作品的许可证由最严格的组件决定。

### 5.1 兼容性矩阵（简化版）

| 组合 → | MIT | Apache 2.0 | GPL v2 | GPL v3 | AGPL v3 |
|--------|-----|-----------|--------|--------|---------|
| **+ MIT** | MIT | Apache 2.0 | GPL v2 | GPL v3 | AGPL v3 |
| **+ Apache 2.0** | Apache 2.0 | Apache 2.0 | ❌ | GPL v3 | AGPL v3 |
| **+ GPL v2** | GPL v2 | ❌ | GPL v2 | ❌* | ❌ |
| **+ GPL v3** | GPL v3 | GPL v3 | ❌* | GPL v3 | GPL v3 |
| **+ AGPL v3** | AGPL v3 | AGPL v3 | ❌ | GPL v3 | AGPL v3 |

*除非项目明确声明 "GPL v2 or later"

### 5.2 关键冲突

- **Apache 2.0 + GPL v2 = 不兼容**：Apache 2.0 的专利条款在 GPL v2 下不被接受。这是最常踩的坑之一。
- **GPL v2 + GPL v3 = 不兼容**（除非有 "or later" 条款）：Linux 内核只用 GPL v2，所以任何 GPL v3 代码都不能进内核。

### 5.3 实践意义

做依赖检查时，工具（如 FOSSology、ScanCode、license-checker）可以帮你发现兼容性问题。npm 生态中 `license-checker` 可以直接集成到 CI。

---

## 六、决策框架：为项目选许可证

### 6.1 决策树

```
项目是什么类型的？
├── 库/框架/工具（给别人用的）
│   ├── 追求最大采纳 → MIT
│   ├── 需要专利安全（涉及算法/硬件） → Apache 2.0
│   └── 希望改库的人回馈 → LGPL（C/C++）或 MPL 2.0
│
├── 完整应用/平台（给别人部署的）
│   ├── 不在意商业闭源分支 → MIT
│   ├── 想防止闭源分叉竞争 → GPL v3
│   └── SaaS 且想防云厂商寄生 → AGPL v3（但接受企业排斥）
│
├── 科学代码/研究复现
│   ├── 追求可复现和广泛 reuse → MIT 或 Apache 2.0
│   └── 需要明确数据引用 → CC BY（数据） + MIT（代码）
│
├── 内容（文章/博客/文档）
│   ├── 希望最大化传播 → CC BY
│   ├── 希望保持开放但防商业滥用 → CC BY-SA
│   ├── 个人博客不想被拿去商用 → CC BY-NC-SA
│   └── 完全不在意 → CC0
│
└── 个人配置文件（dotfiles）
    └── 通常 MIT 或 Unlicense（本来就是公开的，不需要 copyleft 保护）
```

### 6.2 五个评估维度

为每个项目打分可以帮助明确选择：

| 维度 | 问题 |
|------|------|
| **分发风险** | 代码会被分发（embedded/distributed）还是只在服务器跑？ |
| **专利风险** | 项目涉及可能被专利化的算法或技术吗？ |
| **兼容性风险** | 依赖了什么许可证的代码？（这是硬约束） |
| **贡献者风险** | 你希望贡献者签 CLA 吗？接受 DCO 吗？ |
| **商业灵活性** | 5 年内可能做 dual licensing 或商业化吗？ |

---

## 七、映射到 froQ 的实际项目

### 7.1 Dotfiles（Neovim/Zellij/Ghostty 配置）

**推荐**：MIT 或 Unlicense

**理由**：配置文件本身价值不在于保护，而在于被更多人参考和复用。Unlicense 最干脆——「拿走，不用署名」——因为是配置不是创作。MIT 也可以，保留最基本的 attribution。

### 7.2 博客源代码（VitePress + 内容）

**推荐**：代码 MIT + 内容 CC BY-NC-SA

**理由**：
- **代码**（VitePress 配置、自定义组件、主题）：MIT。博客搭建方案本身是工具型输出，别人复用是好事。
- **内容**（文章）：CC BY-NC-SA。froQ 的文章是个人创作，署名是刚需（BY），不希望被商用拿去训练 AI 或洗稿（NC），但允许非商业转载和翻译（不要 ND，因为 ND 禁止翻译）。

**或者**：如果 froQ 完全不在意商业使用（比如观点文章被教学机构使用），可以用 CC BY-SA。Wikipedia 用的就是这个——copyleft 保证下游同样是开放的。

### 7.3 Hiatus 论文分析代码（Julia 管线）

**推荐**：MIT 或 Apache 2.0

**理由**：
- 科学 reproducibility 的核心是「别人能跑你的代码」。MIT 和 Apache 都是无障碍选择。
- 如果涉及可能被专利化的分析方法（概率很低但 Apache 更安全），选 Apache。
- **数据**：ERA5 数据本身有 Copernicus 许可（CC-BY 或类似），论文中需要标注数据引用。代码仓库里加一个 `DATA_LICENSE.md` 说明数据许可和来源。
- 根据 05-31 的 Data & Code Availability 文件，Zenodo 归档建议 MIT License + CITATION.cff。

### 7.4 LiG.nvim（Neovim 插件）

**推荐**：MIT

**理由**：
- Neovim 插件生态几乎全是 MIT 或 Apache 2.0。选 MIT 无摩擦融入生态。
- LiG.nvim 的价值来自被更多 Neovim 用户使用和贡献。Permissive 许可最大化采纳。
- 没有专利风险（Neovim 插件不涉及可专利化的算法）。

**一个例外考虑**：如果 LiG.nvim 未来成为一个有独特算法的核心工具（比如有自己的解析引擎），考虑升级到 Apache 2.0 获得专利保护。但目前阶段 MIT 够用。

### 7.5 oq（ESLint 配置等工具规范）

**推荐**：MIT

**理由**：
- 参考 Anthony Fu 的 `@antfu/eslint-config`——MIT。
- ESLint 配置是工具型项目，价值完全来自被更多人使用。Permissive 是唯一正确选择。
- 衍生的 dprint 配置、tsconfig 等同理。

### 7.6 未来的开源项目

根据项目性质分情况：
- **如果是库/工具** → MIT（默认）或 Apache 2.0（需要专利保护时）
- **如果是完整应用/平台** → 根据是否想防闭源分叉来选择 MIT 或 GPL v3
- **如果是 SaaS** → 警惕 AGPL（除非你有 dual licensing 的明确商业计划）

---

## 八、几个容易被忽略的细节

### 8.1 「没有许可证」=「All Rights Reserved」

在 GitHub 上公开代码但不放 LICENSE 文件，法律上意味着没有人可以合法使用、修改、分发你的代码。公开可见 ≠ 开源。

如果你想放弃所有权利，用 **Unlicense** 或 **CC0**（代码不推荐 CC0，因为不处理专利）。

### 8.2 LICENSE 文件放在仓库根目录

GitHub 会自动检测并显示。命名约定：`LICENSE`、`LICENSE.md`、`LICENSE.txt`。

### 8.3 修改了依赖项目的代码也要遵守其许可证

如果你 fork 并修改了一个 GPL 库，你的修改也必须 GPL。这不是可选的。

### 8.4 CLA vs DCO

- **CLA（Contributor License Agreement）**：贡献者签署的法律协议，通常给项目维护者额外的权利（如 relicense）。有争议——被认为制造贡献摩擦。React 就曾经因为 Facebook 的 CLA+Patent Grant 引发社区大规模抗议。
- **DCO（Developer Certificate of Origin）**：轻量级替代方案。贡献者在 commit 里加 `Signed-off-by: Name <email>`，声明代码是自己的且有权利贡献。Linux 内核用 DCO。

**对 froQ 的建议**：小型项目不需要 CLA。DCO 是一个好的平衡——提供法律基础但不制造摩擦。

### 8.5 Dual Licensing

一个软件同时提供两种许可证：例如 AGPL（免费开源版）+ 商业许可（付费，允许闭源使用）。

经典案例：
- **Qt**：GPL/LGPL + 商业许可
- **MySQL**：GPL + 商业许可
- **MongoDB**（历史上）：AGPL → SSPL（因为 AWS 白嫖）

**如果 froQ 未来考虑做开源商业化**，AGPL + 商业许可是最常见的模型，但要接受 AGPL 会让很多企业直接跳过你的项目。

### 8.6 Source Available ≠ Open Source

BSL（Business Source License）、Elastic License 2.0、SSPL（Server Side Public License）等「源码可见」许可证不是 OSI 认可的开源许可证。它们限制商业使用，在法律和技术社区中不被视为真正的开源。

MongoDB 从 AGPL 转到 SSPL 后失去了 OSI 认可，引发了大量争议。Elasticsearch 从 Apache 2.0 转到 Elastic License 2.0 后，AWS 直接 fork 了最后一个 Apache 版本做了 OpenSearch。

**教训**：换许可证是一个核选项。一旦用了 copyleft → source-available，社区信任很难恢复。

---

## 九、与 froQ 世界的连接

### 9.1 命名哲学的平行

05-31 和 06-02 的命名分析建立了「命名的四层功能：指称—认知—社会—边界」。许可证就是这个框架的法律层实现：

- **指称**：MIT/GPL/Apache 这些名字是精确的法律定义（类似 Kripke 的严格指示词）
- **认知**：许可证塑造了人们如何看待和使用你的项目。MIT =「欢迎任何人都用」，GPL =「这是社区财产」
- **社会**：许可证选择是社区契约的声明。选 MIT，你邀请所有人；选 GPL，你只邀请愿意回馈的人
- **边界**：许可证是项目边界最硬的声明，比 README 和命名更有法律执行力

### 9.2 系统论视角

控制系统论的视角：许可证是系统的**规则层**（Meadows 的第 5 级杠杆点——改变系统规则）。选 MIT 还是 GPL，改变的不是代码本身，而是在代码之上运行的社会系统的动力学。MIT 是正反馈放大器（越多人用，越多人贡献→更强大），GPL 是负反馈稳定器（防止被闭源分叉削弱）。

### 9.3 工具哲学的延伸

06-01 的工具哲学讨论了「工具在真正的使用中消失」的 Heidegger 上手状态。许可证也应该是 invisible 的——好的许可证选择让使用者和贡献者不需要思考法律问题，直接进入 flow。MIT 在这一点上是典范：极短，极清晰，不需要律师解读。

---

## 十、参考资源

- **choosealicense.com** — GitHub 维护的交互式许可证选择指南。几个问题就能推荐合适许可证。
- **Open Source Initiative (OSI)** — 开源许可证的官方认可机构。https://opensource.org/licenses
- **Creative Commons License Chooser** — 选 CC 许可证的交互工具。https://creativecommons.org/choose/
- **GNU License List** — FSF 维护的许可证兼容性列表。https://www.gnu.org/licenses/license-list.html
- **Blue Oak Council** — 提供许可证选择指南和 permissive 许可证的模型文本。https://blueoakcouncil.org/
- **Vitalik Buterin, "Why I used to prefer permissive licenses and now favor copyleft"** (2025-07) — 从 permissive 到 copyleft 的思想转变，AI 时代的伦理维度
- **credativ, "Understanding Open Source Licenses: GPL, MIT, Apache Compared"** (2026) — 包含兼容性矩阵和审计工具推荐
- **Promise Legal, "Open Source Licensing for Startups"** (2025) — CLA vs DCO、dual licensing 的实际操作

---

## 十一、行动清单

- [ ] 检查 dotfiles 仓库是否有 LICENSE 文件 → 没有则加 MIT 或 Unlicense
- [ ] 检查 LiG.nvim 是否有 LICENSE → 没有则加 MIT
- [ ] 检查 oq 规范仓库是否有 LICENSE → 没有则加 MIT
- [ ] 博客仓库：代码部分加 MIT（根目录 LICENSE），内容目录加 CC 声明（README 中说明）
- [ ] hiatus 代码仓库：加 MIT + CITATION.cff + DATA_LICENSE.md
- [ ] 确认所有依赖的许可证兼容使用场景
- [ ] 如果未来接外部贡献，考虑是否启用 DCO
