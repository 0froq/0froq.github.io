# 开源贡献策略 — 从消费者到有影响力的贡献者

## 一、为什么谈这个

froQ 的长期目标：**5 年内成为有影响力的开源贡献者**。

前 31 轮自主学习覆盖了 hiatus 方法论、博客全栈架构、MCP/Neovim/Zellij/Ghostty/dprint/bumpp/oxc/UnoCSS 等大量工具链生态。但「如何成为有影响力贡献者」这个元问题本身，一直没有被拆解过。

本轮填补这个空白。

---

## 二、贡献者的四层金字塔

### 2.1 四层模型

```
┌──────────────┐
│   创造者       │  ← 自己 scratch itch，孵化新项目
│   Creator     │
├──────────────┤
│   维护者       │  ← 受邀加入核心团队，参与治理
│   Maintainer  │
├──────────────┤
│   贡献者       │  ← 提交 PR，开 Issue，参与讨论
│  Contributor  │
├──────────────┤
│   使用者       │  ← 用项目、报 bug、分享经验
│    Adopter    │
└──────────────┘
```

### 2.2 每层的核心行为和收益

| 层          | 核心行为                                      | 积累的资产                       | 陷阱                             |
| ----------- | --------------------------------------------- | -------------------------------- | -------------------------------- |
| Adopter     | 在会议上分享使用经验、写 case study、回答问题 | 可信度（credibility）、人脉      | 只索取不参与 → 被视作 tourist    |
| Contributor | 修 bug、提 feature PR、改进文档               | 技术声望、项目熟悉度、维护者信任 | 随机跳项目 → 没有深度积累        |
| Maintainer  | 代码审查、issue 分诊、社区治理、架构决策      | 治理权、行业影响力、招聘吸引力   | 倦怠（bus factor=1 的风险）      |
| Creator     | 从自身需求出发孵化项目、建立社区              | 品牌、生态位、赞助收入           | 过早追求 star 数、做无人用的项目 |

### 2.3 关键洞察：Adopter 层被严重低估

Adopter（使用者-倡导者）常被看作「不够硬核」，但实际上它是 ROI 最高的层：

- 投资低：分享自己已经在做的工作
- 社区收益高：生产环境案例是项目最需要的社会证明
- 自利和利他对齐：你做 recruiting + reputation，社区获得验证信号

Anthony Fu 反复强调的「从使用者开始」就是这个道理——先用、再修 bug、再提 feature、最后被邀请加入。

---

## 三、Anthony Fu 的渐进路径

froQ 的工具链（@antfu/eslint-config、UnoCSS、dprint、bumpp、Vitest、Slidev）高度对齐 Anthony Fu 生态。他的开源哲学对 froQ 有直接参考价值。

### 3.1 核心理念

**「不求回报」心态**

> 参与开源或创建项目时，保持「无所求」心态至关重要。不要将利益放在首位，专注于学习和享受过程，乐于分享。即便眼下没有实际回报，只要获得他人认可，信誉和声望会逐渐积累，长期来看获得回报会更容易、途径也更多。

**渐进式设计**

> 复杂性不可避免，但渐进式方法让工具更易学习。Vue 从一行代码起步，逐步扩展。Nuxt 只需 HTML 基础就能上手，再按需启用更多功能。这种哲学不只适用于框架设计，也适用于贡献路径本身。

**Set Theory（集合论）**

> - **交集（扩大用户面）**：不要将项目限定在利基市场。主动寻求通用化的可能。
> - **并集（协作与生态）**：即便必须保持特定性，底层工具可以通用化，让整个生态受益。Unplugin 从 Vite 专属扩展为支持多种构建工具的通用层，同时 Nuxt 仍可保持 opinionated。

**Yak Shaving 即创造**

> 每个项目都来自自身需求。不设预期，只是分享方案。当人们发现有用，会自然汇聚。失败的 9 个项目也是学习——第 10 个可能是你的成功产品。

### 3.2 他的具体路径（可参照）

1. **使用者阶段**：用 Vue/Vite，修文档 typo，报 bug
2. **贡献者阶段**：发现 ESLint 配置痛点，开始做 @antfu/eslint-config
3. **创造者阶段**：从自身需求孵化 Vitest、Slidev、UnoCSS、VueUse、Elk
4. **维护者/生态构建者阶段**：Nuxt 核心团队、Vite 团队成员、赞助转发计划

### 3.3 「不做」什么

- 不做没人用的项目（避免无应用场景的玩具项目）
- 不追求 star 数（最初自然会关注，但不应成为焦点）
- 不设过高预期（不保证每个项目成功）
- 不独占功劳（赞助转发计划体现了「影响力应回馈生态」的信念）

---

## 四、5 年路线图：针对 froQ 的具体策略

### 4.1 优势分析

| 优势                    | 开源价值                           |
| ----------------------- | ---------------------------------- |
| Vue/TypeScript 全栈能力 | 前端生态最活跃的开源领域           |
| GIS/环境科学背景        | 利基交叉领域，竞争者少             |
| 系统构建者思维          | 适合孵化工具/框架级项目            |
| 工具链深度定制经验      | 能识别真实痛点（best itch source） |
| 双语（中/英）           | 扩大受众面，Set Union 的天然优势   |
| 已有项目基础            | LiG.nvim、blog、oq 规范            |

### 4.2 分阶段策略

#### Year 1（2025.5 → 2026.5）：Adopter → Contributor

**目标**：在 2-3 个核心依赖项目建立可信度。

- **选 2-3 个项目深耕**（不用广撒网）：VueUse、UnoCSS、VitePress 等项目就是自然的入口
- **从 Adopter 起步**：写 blog 分享使用经验（froQ 已经在做，博客本身就是 Adopter 行为）
- **渐进提升贡献深度**：typo fix → bug report with reproduction → small PR → feature PR
- **保持一致性**：同一个项目持续贡献 > 随机跳 10 个项目各一个 PR

**关键指标**（非目标，只是信号）：

- 2-3 个项目有持续贡献记录
- 被至少一个维护者认识你的 GitHub handle
- 有被 merge 的非 trivial PR

#### Year 2（2026.5 → 2027.5）：Contributor → Creator

**目标**：孵化 1-2 个从自身需求出发的项目。

- **Scratch your own itch**：
  - LiG.nvim 是一个好的起点（Neovim 插件，已有基础）
  - GIS × 前端工具链的交叉工具（这个领域竞争者极少）
  - 博客实践中提炼的通用方案（如 Comark 组件、标签系统等）
- **Set Theory 应用**：设计时留出通用化空间，不绑定特定框架
- **推广但不焦虑**：分享方案，不设预期。Reddit、Twitter/X、Vue 社区、中文技术社区

**关键信号**：

- 至少一个项目有外部用户和 issue/PR
- 项目有清晰的 README、文档、logo（Anthony Fu 强调第一印象）

#### Year 3–4（2027.5 → 2029.5）：Creator → Maintainer

**目标**：项目进入自持阶段，受邀成为依赖项目的维护者。

- 如果自己的项目成长到需要社区治理，建立贡献者路径
- 如果对上游项目贡献足够深入，可能被邀请加入核心团队
- 开始关注开源可持续性（赞助、consulting、商业化的开放核心模式）

**关键信号**：

- 自己的项目有活跃贡献者（bus factor > 1）
- 在至少一个知名项目的治理中有话语权

#### Year 5（2029.5 → 2030.5）：生态构建者

**目标**：影响力不只在单一项目，而是生态级别。

- **Set Union 实践**：将底层工具通用化，让跨框架/跨生态受益
- **赞助生态参与**：类似 Anthony Fu 的赞助转发计划
- **社区领导力**：会议演讲、技术写作、mentor 新贡献者

---

## 五、核心原则

### 5.1 「不求回报」≠ 没有方向

Anthony Fu 说的「无所求」心态是战术层面的：不盯着即时回报做事。但战略层面需要有方向——选什么项目深耕、什么时候自己孵化、什么时候接受邀请加入团队，这些都需要判断。

### 5.2 深度 > 广度

开源信誉是 compound interest。一个项目持续 3 年的贡献 > 30 个项目各一个 PR。浅层广撒网不会被视作「有影响力的贡献者」。

### 5.3 Scratch your own itch 是创造引擎

所有 Anthony Fu 的项目都来自亲身痛点。这不是巧合——只有自己痛过，才能做出真正解决痛点的方案。froQ 已有的每一步（博客实践、hiatus 项目、Neovim 配置）都在积累 itch。

### 5.4 中英双语是 Set Union 武器

绝大多数中国开发者的开源项目只有中文受众。froQ 的双语能力天然扩大了交集（Set Intersection 扩大）。把 README 和文档双语化，本身就是影响力放大器。

### 5.5 科学背景 = 差异化生态位

前端开源领域聚集了大量纯软件工程师。GIS/环境科学背景 + 全栈能力的组合极为罕见。这片交叉领域的开源项目（地理数据处理工具、科学可视化组件、Julia-Vue 桥接等）几乎无人占领。

---

## 六、当前已在进行中的开源行为

froQ 已经在做很多「开源贡献者」做的事，只是可能没有从这个角度看待：

| 行为                           | 开源贡献类型                        |
| ------------------------------ | ----------------------------------- |
| 博客技术文章                   | Adopter advocacy（最高 ROI 的形式） |
| oq 工具规范                    | 个人 itch 的方案化（可孵化）        |
| LiG.nvim                       | 已有基础的 Creator 项目             |
| hiatus 项目（Julia 管线）      | 科学开源（另一种生态）              |
| 使用和反馈 VitePress/UnoCSS 等 | Adopter → Contributor 路径的起点    |

---

## 七、参考文献与延伸阅读

- Anthony Fu, "Roads to Open Source — The Set Theory" (ViteConf 2023): 集合论框架
- Anthony Fu, "Sponsorship Forwarding" (antfu.me): 开源可持续性与生态回馈
- Anthony Fu, Open Source Consulting (serko.dev): 渐进路径、Yak Shaving、推广策略
- GitHub Blog, "What to expect for open source in 2026": contributor→maintainer 路径、共享治理
- 2i2c, "On being a good open source citizen": Directed vs Foundational contributions
- "Corporate best practices for upstream open source contributions" (optimizedbyotto): 从小贡献开始、scratch your own itch 原则
- Nadia Eghbal, _Working in Public_ (2020): 开源维护者的真实生态
