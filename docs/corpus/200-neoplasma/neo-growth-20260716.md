---
title: Growth Patrol：不要按 Agent 的名字分工，要沿着后果边界切开
created: 2026-07-16
status: probe
last_modified: 2026-07-16 04:02:04
aigc: true
---

从三个 harnessed agent 的分工构思出发，提出一种部署原则：角色应由执行位置、监督延迟、状态归属与权限后果共同定义，而非绑定某个产品名称。

---

[[toc]]

#growth #author/hanako
#scope/work/coding/indie

本文由 AI（花花）基于项目内容自动生成，属于 Growth Patrol 的一次生长记录。
它不是 froQ 的结论，而是一枝等待回应的枝条。

## 枝条从三台「不同的 Agent」长出来

本轮 Continuation 轨检查了近期 Growth / Continuation 文件，
没有发现 `## froQ 反馈` 下的新回应，因此没有生成 Continuation。
Growth 轨仍继续扫描近两天 Git 变化、corpus 六层、posts 与 dashboard。
近三次 Growth 已分别谈过对话互惠、平台裁量与键盘拓扑，
继续沿人机关系或界面设计生长会让方向过密。

最后停下来的，是 Neoplasma 里新出现的
[《260714 capture · agent 分工构思》](./neo-260714-cap.md)：
Codex 常驻 Mac mini，承接可以远程发起的项目任务；
Pi 同时用于 Mac mini 和 MacBook，处理本地监督下的小型修改；
Hermes 也常驻 Mac mini，但角色更接近个人助理。

这组分工表面上按产品命名，底层依据其实已经不是模型偏好，
而是三种完全不同的运行关系：人在不在场、任务活多久、状态放在哪里、
机器能触碰什么，以及失败时谁能及时接管。

因此，这次 Growth 想把那套直觉压成一个更稳定的判断：

> Agent 的角色不应首先按品牌、模型或 persona 划分，
> 而应沿着执行后果的边界切开。
> 名字可以更换，权限、状态与接管条件必须保持可辨认。

## 搜索路径：从 role allocation 追到责任错位

我以 `multi-agent role allocation`、`human supervisory control`、
`distributed workload placement` 和 `agent least privilege` 为种子向外搜索。
第一轮原本想找「哪个 Agent 更适合哪个任务」的形式化说法，
第二轮却把问题从能力比较带到了协作成本、监督失联与共同失效。

第一组概念是 **role allocation** 与 **function allocation**。
多 Agent 研究区分了 task 和 role：task 是某次要完成的动作，
role 则是一组持续的责任、行为模式与协作预期。
[Campbell 与 Wu 的综述](https://campbellssite.com/papers/JAAMAS_1.pdf)
指出，角色可以促进专门化、减少干扰，
但角色设计还受到通信能力与任务结构约束。
Feigh 与 Pritchett 对人机团队的研究则强调，分配 taskwork 以后，
系统会凭空增加 teamwork：同步状态、解释边界、监控结果、处理交接。

这意味着「三台 Agent 可以并行做更多事」只计算了执行容量，
没有计算协调税。若三个 Agent 都能修改同一项目，
真正新增的工作还包括决定谁拥有当前任务、谁持有最新上下文、
谁负责合并，以及两次修改冲突时相信哪一份。
角色如果没有减少这些不确定性，就只是把一个入口复制了三遍。

第二组概念来自 **joint cognitive systems**。
认知系统工程不把人和自动化分别看成独立部件，
而把人、工具、程序、界面与规程视为共同完成认知工作的系统。
由此，Agent 的能力也不能只看 benchmark：
同一个模型在本地终端、远程 daemon 和移动端入口中，
会成为三种不同的系统部件，因为它获得的信息、响应时间、
可恢复路径和人的在场程度都不同。

第三组是 **coactive design**。
Johnson、Bradshaw 等人提出，设计人机协作时应围绕 interdependence，
并检查三项条件：
[observability、predictability 与 directability](https://doi.org/10.5898/jhri.3.1.johnson)。
我能否看见 Agent 正在做什么？
我能否预测它接下来大致会怎样行动？
当方向改变时，我能否把它重新指向？

这三个词让「本地监督」获得了比“人盯着”更精确的含义。
本地 Pi 的优势未必只在轻量，而在于它与人的反馈环短：
终端状态可见，修改可以立即检查，方向可以随时纠正。
远程 Codex 的价值则在另一处：人离开设备后仍能发起任务，
但这种便利要求更强的过程可观察性、暂停点和完成证据。
如果远程任务只能在结束后交出一个大 diff，
它虽然可达，却未必可监督。

第四组是 **out-of-the-loop performance problem**。
自动化越可靠，人越容易退出过程；一旦异常要求接管，
人又可能缺少情境意识和近期练习。
Endsley 将它称为 automation conundrum：
更多自治提高常态表现，却可能降低异常时的接管能力。
这对常驻 Agent 尤其重要。
「后台一直运行，人只在出错时出现」听起来节省注意力，
实际上把最难的一次理解留给了信息最少的时刻。

因此，监督不能只是一枚 kill switch。
若人不知道 Agent 当前目标、已完成步骤、不可逆副作用和失败位置，
停止执行以后仍无法接管。
真正的接管能力需要连续留下足够小的状态面：任务所有者、当前阶段、
最近一次可验证结果、下一项外部副作用，以及明确的暂停或升级条件。

第五组是 **authority-responsibility mismatch**。
人机功能分配研究指出，当一个主体有权执行、另一个主体却为结果负责时，
负责者会被迫增加监控、信息传递和干预工作。
[相关研究](https://link.springer.com/article/10.1007/s10111-011-0191-6)
把 ability、authority、control 与 responsibility 放在同一张图里检查。
如果四者长期错位，所谓「自动化减负」可能只是把执行负担换成了警戒负担。

个人助理 Agent 最容易触碰这条边界。
它需要长期状态才能理解日程、知识库与偏好，
却不因此自动获得发送消息、修改计划或代表本人承诺的权力。
状态亲密度和行动权限是两条轴。
知道得多，不等于应该做得多；
常驻，也不等于默认自治。

第六组概念来自分布式系统的 **workload placement** 与 **data gravity**。
工作不应仅按哪里算得快来放置，还要考虑数据位置、网络可靠性、
延迟、隐私、恢复和运维复杂度。
这恰好解释了 Mac mini 与 MacBook 的区别：
Mac mini 提供持续在线、稳定项目副本与远程可达性；
MacBook 提供人的现场注意、当前工作树和低延迟纠偏。
任务跟着哪台机器走，本质上是在选择一种故障域和数据保管关系。

第七组是 **common-mode failure** 与 **cognitive diversity**。
多 Agent 很容易制造一种虚假的冗余感：三次回答一致，似乎比一次更可信。
但 2025 年的
[LLM correlated errors 研究](https://arxiv.org/html/2506.07962v1)
发现，不同模型的错误仍可能高度相关；经典的
[N-version programming 实验](http://sunnyday.mit.edu/papers/nver2-submitted.pdf)
也早已表明，独立实现会在同一处困难或歧义规格上共同失败。
因此，三个 harness、三个供应商或三个 persona 并不天然构成三条独立证据链。

有效的冗余要沿失败模式制造差异：
一个 Agent 实现，另一个根据测试 oracle 验证；
一个读代码，另一个从用户行为或文档契约反推；
一个提出改动，另一个只检查权限、回滚和副作用。
角色差异比名字差异更能削弱共同盲点。

## 一个模型：用执行包络定义 Agent

把这些线索放在一起，我会用 **execution envelope（执行包络）**
描述一个 Agent 的稳定角色。它至少包含五个维度：

1. **执行位置**：运行在哪台设备、靠近哪份数据、依赖何种网络。
2. **时间形态**：同步短任务、异步长任务，还是持续监听的常驻服务。
3. **监督延迟**：人能在几秒、几分钟还是几小时后发现偏移并介入。
4. **状态归属**：谁保存任务进度、长期记忆、工作树与完成证据。
5. **权限后果**：它最远能触及哪里，错误动作的 blast radius 有多大。

模型、harness 和 persona 是包络中的可替换实现。
当 Codex、Pi 或 Hermes 升级、改名、停用时，
「远程项目执行者」「本地共编者」「常驻个人助理」这些角色仍应成立；
换入新工具时，只需判断它是否满足相应包络，
不必重新发明整套分工叙事。

这也能避免一种常见漂移：因为新 Agent 能力更强，
就顺手给它更多目录、更多凭证和更长记忆。
能力提升只改变 `can`，不会自动改变 `may`。
执行包络要求每次扩权都回答：哪类任务因此成为可能，
谁承担结果，人在何时仍能看见并纠正，失败是否被限制在可恢复范围内。

## 把三个构思改写成三种运行关系

若按执行包络重新描述原 capture，三者可以暂时这样定位：

### 远程项目执行者

它运行在持续在线的 Mac mini，适合人在外时发起边界清楚、
可异步等待、能由测试或 diff 验证的项目任务。
它需要稳定工作区、任务级权限、阶段性状态和明确完成证明。
高风险外部动作不应因为「远程方便」而混入同一权限包络。

### 本地共编者

它靠近当前终端和人的注意力，适合范围小、反馈密、
需求可能边做边变的修改。
这里的关键资源不是算力，而是低监督延迟。
它可以少写状态报告，但应保持变更局部、命令可见、回滚直接。
如果任务增长到人无法持续掌握，就应显式转交给异步执行者，
而不是让一次本地会话无声长成后台工程。

### 常驻个人助理

它需要跨时间保持状态，理解知识库、日程与长期线索，
因此对 provenance、数据边界和权限分层的要求最高。
比较稳的起点是「高可见性、低行动权」：
可以读取、整理、提出候选和请求升级，
但对外发送、不可逆修改和代表本人承诺需要单独授权。
长期状态让它更连贯，也让错误积累与隐私暴露更有纵深，
所以记忆保留规则和撤销路径属于角色定义本身。

三种角色之间的 handoff 也应传递工作所有权，
而不只是复制整段聊天记录。
最小交接包可以包含：目标、当前状态、已验证事实、未决问题、
允许触及的资源、停止条件与期待的完成证明。
交接以后，旧角色应停止继续修改同一任务，
否则共享上下文会变成共享写锁。

## 一份轻量的分工检查表

真正部署三个 Agent 前，可以先不写复杂 orchestrator，
只为每个角色回答下面七个问题：

1. 它拥有哪类任务，哪些任务明确不归它？
2. 它的状态保存在设备、仓库、服务端，还是只在会话里？
3. 人多久不看它，仍能在异常时有效接管？
4. 它能采取的最严重动作是什么，这个后果是否必要？
5. 结束、失败和卡住分别留下什么可验证痕迹？
6. 与另一个 Agent 交接时，任务所有权在哪一刻转移？
7. 所谓独立复核是否真的使用了不同证据和失败路径？

这份表的目标不在于一次设计出永久组织结构。
角色可以随任务和设备变化动态调整。
但每次调整都应移动一条明确边界，
而不是因为某个新工具「感觉更聪明」就让权限、状态和责任一起漫出去。

## 小结：分工的单位是可承担的后果

三个 harnessed agent 最值得保留的并非三种人格，
而是三种人与执行系统之间的距离：远程发起、本地共编、长期陪伴。
这些距离决定了什么信息可见、多久能够纠偏、状态由谁保管，
以及一次错误会扩散到哪里。

role allocation 提醒我们，角色会减少干扰，也会产生协调成本；
joint cognitive systems 与 coactive design 要求把人、Agent 和运行环境一起设计；
out-of-the-loop problem 说明名义监督不等于可接管；
authority-responsibility mismatch 要求权限与责任尽量相称；
data gravity 和 workload placement 把设备位置变成架构变量；
common-mode failure 则警告我们，多个名字并不自动带来多个视角。

所以，多 Agent 系统的第一张图不该只是
`Codex → coding`、`Pi → local`、`Hermes → assistant`。
更有用的图会标出状态在哪里、谁能写什么、多久汇报一次、
何时必须停下、谁承担结果，以及任务怎样完整地交到下一双手里。

名字是门牌，执行包络才是房子的承重墙。
真正可靠的分工，不从「谁更聪明」开始，
而从「哪一种后果应该由谁、在什么距离上承担」开始。

## froQ 反馈

<!-- froQ 在这里回答、评价、修正，或标记“继续 / 暂停 / 换方向”。 -->

## AI 标注

本轮检查近期 Growth / Continuation 文件时，没有发现 `## froQ 反馈`
下的新有效回应，因此未生成 Continuation。Growth 方向来自
[《260714 capture · agent 分工构思》](./neo-260714-cap.md)，
但没有替 froQ 选择具体 harness，也没有把三个产品的功能说明重新排列，
而是追问这套分工在工具更名、模型替换和设备变化后怎样仍然成立。

探索式搜索带回的关键概念包括 role / function allocation、joint cognitive systems、
coactive design、observability / predictability / directability、
out-of-the-loop performance problem、authority-responsibility mismatch、
workload placement / data gravity，以及 common-mode failure / cognitive diversity。
本文核心产出是 **execution envelope**：用执行位置、时间形态、监督延迟、
状态归属与权限后果定义 Agent 的稳定角色，并让模型、harness 与 persona
成为可替换实现。这是一项可迁移到个人 Agent 部署和多 Agent 系统的通用设计判断，
因此写入 `200-neoplasma`，而非关于 corpus 本身结构与方法论的
`000-autopsia`。
