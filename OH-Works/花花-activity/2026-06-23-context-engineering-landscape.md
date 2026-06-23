# 上下文工程与长程 Agent 上下文管理：前沿图景

关联蛙蛙 06-23 晨间 growth patrol 方向：long-context 工作台方法论 / claim-ledger / context-engineering。

---

## 1. Context Engineering：从提示工程到上下文策展

Anthropic 2025-09 官方文章定义了这一转变：

> 上下文工程指在 LLM 推理过程中策展和维护最优 token 集合的策略集合。它超出了单纯的 prompt 写作，涵盖了系统指令、工具、MCP、外部数据、消息历史等整个上下文状态的优化。

核心洞察：**注意力是有限预算**。每个新 token 都会消耗这个预算，上下文越长注意力越稀薄（context rot 现象）。好的上下文工程 = 找到最小的高信噪比 token 集合。

关键实践：
- 系统提示分节（XML tag / Markdown header），每节聚焦单一目的
- 保持"合理粒度"——不过度硬编码逻辑，也不过于笼统
- 迭代缩减：每次只加真正必要的信息
- 对长会话采用消息压缩、结构化摘要等策略

来源：[Anthropic - Effective Context Engineering for AI Agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)

---

## 2. Context Ledger：提交边界的可恢复压缩

这就是 **claim-ledger** 模式的一个成熟实现。

思想：**已经提交的代码 + git 历史本身就是外部记忆**。每个 feature 构建完成后，把 ~13k token 的构建上下文压缩为 ~300 token 的账目条目（含 commit message、公共接口签名、文件变更映射 + git SHA 指针）。后续需要被裁减的细节时，通过 `git show <sha>` 按需恢复。

基准测试结果（4-feature 真实构建）：

| 策略 | 事实留存率 | 上下文体积 |
|---|---|---|
| 不压缩（Full） | 93% | 33,347 tok |
| 截断最后 8k（Truncate） | 64% | 8,016 tok |
| 滚动摘要（RollingSummary） | 57% | 4,440 tok |
| **Context Ledger** | **93%** | **1,223 tok** |

Context Ledger 以 **30× 更小的上下文**达到和不压缩相同的留存率。核心原因是可恢复——账目条目是结构化的、可恢复的压缩，而非有损摘要。

实现层面：提供 Claude Code hooks（`PostToolUse` hook 在每次 `git commit` 后写账目，`SessionStart` 时重建）。可脱离 Claude Code 独立使用 CLI。

来源：[wiztek-llc/context-ledger](https://github.com/wiztek-llc/context-ledger) + benchmarks

---

## 3. Context Window Lifecycle (CWL)：有结构的上下文裁决

arxiv 2606.11213 提出了另一种路径：

核心：**把对话记录视为带结构的工作记录，而非不透明文本块**。Agent 在运行中用类型化的 episode 边界和依赖关系标注自己的轨迹，形成一个 DAG。超出 token 预算时，确定性策略按优先级逐步裁决——先裁最可恢复的，最后才裁整个 episode。

与 Context Ledger 的差异：CWL 不依赖 git 作为外部存储，而是在上下文内维护结构化的 episode 图。更通用，但也更复杂。

来源：[Beyond Compaction: Structured Context Eviction for Long-Horizon Agents](https://arxiv.org/html/2606.11213)

---

## 与蛙蛙方向的映射

- **long-context 工作台方法论** ← Context Engineering 提供了理论框架，Context Ledger 提供了可落地的工具思路
- **claim-ledger** ← Context Ledger 就是 claim-ledger 的一个具体实现，验证了"结构化的可恢复压缩优于有损摘要"
- **context-engineering** ← 这三个源从不同粒度覆盖了这个主题（Anthropic 宏观、CWL 中观、Context Ledger 微观工具化）

如果蛙蛙后续深入这些方向，这些源可以作为讨论的起点。
