# Multi-Agent Deployment Topology: 2026 Production Patterns

2026-07-15 · supplementary reference

> 对多 agent 部署拓扑和角色分工模式的梳理。作为理解多 agent 系统设计时的参考，不是方案建议。

---

## 三种主流部署拓扑

2026 年生产环境中的 AI agent 部署拓扑可分为三类，选择取决于对延迟、成本、安全性、和运维复杂度的取舍：

| 拓扑 | 特点 | 适用场景 |
|------|------|----------|
| **单节点** (Single-Node) | 所有组件（runtime、memory、tools）在同一台机器上，仅 LLM 调用出网。延迟极低，运维简单。 | 个人助理、单机自动化、低并发场景 |
| **分布式** (Distributed) | 组件拆分到多节点：协调节点 + 工作节点 + 数据库节点。支持横向扩展。 | 高并发、团队级部署、需要隔离的场景 |
| **混合** (Hybrid) | 本地 runtime + 云端推理。2026 年最常见的生产模式。 | 需要本地工具访问 + 远程 LLM 的场景 |

当前生产趋势：Hybrid 模式最为普遍——本地提供低延迟工具执行和高带宽文件访问，远程提供 LLM 推理能力。

## 角色分工的四种协作模式

多 agent 系统的协作模式不是一锅粥式的"大家一起聊"，而是有明确拓扑的选择：

1. **Supervisor → Workers**（管理者模式）
   - 一个 manager agent 分解任务、路由到 specialist workers、汇总结果
   - 最可靠的生产模式，2026 年幸存下来的系统大多有 phase gates 或 supervisor
   - 容错性好：worker 失败不影响全局状态

2. **Router + Domain Agents**（路由模式）
   - 中央 router 根据意图分发到领域 agent
   - 每个 domain agent 只关注自己的知识域
   - 典型：Bertelsmann Content Search 生产级架构

3. **Peer Collaboration**（对等协作）
   - 多个 agent 共享上下文轮流发言
   - AutoGen group chat 是典型实现，但生产中使用受限
   - 需要 hidden selector / arbiter 约束，否则 token 消耗失控

4. **Hierarchical**（层级模式）
   - 高层 agent 做规划和战略，低层 agent 执行
   - 适合复杂多步骤工作流
   - Anthropic Research 系统是典型案例：planning agent 创建并行子 agent 同时搜索

## 运行模式的关键维度

不同的 agent 在运行时面临三个核心决策：

### 始终在线 vs 按需启动

| | 始终在线 | 按需启动 |
|---|---|---|
| **状态** | 持久化 memory，跨会话存活 | 每次启动无状态（或需加载） |
| **可用性** | 依赖宿主机的 uptime | 临时启动，用完即灭 |
| **适合** | 助理、监控、定时任务 | 代码修改、一次性分析 |
| **成本** | 固定资源占用 | 按使用计费，可归零 |

### 本地监督 vs 远程委托

| | 本地监督 | 远程委托 |
|---|---|---|
| **延迟** | 工具执行亚毫秒 | 依赖网络，通常可接受 |
| **文件访问** | 直接读写本地文件系统 | 需通过网络或 bridge |
| **适合** | 小型项目、频繁修改 | 24/7 守护、移动端查询 |
| **安全性** | 不出网，数据留在本地 | 需考虑鉴权和隔离 |

### 多设备统一身份

当 agent 可以在多台机器上访问时，身份和上下文如何保持一致：
- 持久化记忆存储（文件 / 数据库）
- 私有网络（Tailscale / ZeroTier）提供安全互访
- 统一的消息通道（Bridge / Webhook）

## 用户视角的实践映射

结合用户已有构思（Codex / Pi / Hermes 三种 agent），有几个可供展开的思考方向：

1. **状态隔离**：Codex（移动端访问）+ Hermes（7×24 助理）都跑在 mac mini 上，需要考虑它们是否共享同一个 context / memory，还是完全隔离。共享降低重复工作，隔离避免相互污染。

2. **路由策略**：当同时在 Mac mini 和 MacBook 上跑多个 agent 时，需要知道"哪个 agent 适合处理当前任务"。可以用 intent-based routing（根据任务类型自动路由），也可以用 device-based routing（当前使用哪台机器就调用哪台的 agent）。

3. **监督边界**：Pi 被定位为"只在本地监督运行"，这种模式的优势在于可以直接看到 agent 每一步操作、随时纠正。与 Codex/Hermes 的可信任度分级（supervised / unsupervised / semi-autonomous）是一个值得明确的设计维度。

4. **消息通道**：Hermes 作为个人助理，"一直在线"意味着它需要一个独立的消息入口（Bridge / Webhook / 定时调度），而不是依赖终端交互。这决定了助理的行为模式——是 push 式（主动通知）还是 pull 式（询问才响应）。

## 补充观察

Agent 系统的复杂度往往被人低估。2026 年的生产经验表明：
- **多 agent 的 token 消耗大约是纯聊天的 15×**（Anthropic 数据）
- **协作需要明确的 phase gates**，而不是自由对话——"collaboration is the most romantic pattern and the least durable default"
- **agent 的 autonomy 是逐渐扩大的**：先 supervised → conditional autonomous → 仅在低风险领域 full autonomous

这些不是约束，而是设计边界——好的 agent 系统用边界定义行为，而不是用 freedom 定义。

---

*Sources: Anthropic research architecture, Zylos Research deployment topologies, David Daniel always-on agents paper, MoClaw 2026 production guide, Multi-Agent in Production field survey.*
