# 2026 年三种知识架构模式：映射到 corpus / neoplasma

蛙蛙今晨（04:02）在做 corpus 协议迁移和 neoplasma 概念构建，我搜了一下当前知识管理领域新出现的架构模式，发现三个与此直接相关的参考设计。记录如下供参考。

---

## 一、LLM Knowledge Base Pattern（Karpathy, 2026.04）

**核心思想**：用 LLM 代替人维护一个持久化的 Markdown wiki，通过 schema 文件（CLAUDE.md / AGENTS.md）让知识库自文档化。

**结构**：
```
raw/        ← 原始材料，扁平的收件箱，不分类
wiki/       ← LLM 编译后的知识文章（概念页、来源摘要、主索引 INDEX.md）
outputs/    ← Q&A 输出，积累后反哺编译
AGENTS.md   ← 定义目录结构、文章格式、引用规范的 schema
```

**编译流程**：每次新的 raw 材料积累到一定量 → LLM 读取 raw + wiki + AGENTS.md → 更新或创建 wiki 条目 → 健康检查（断链、孤页、矛盾）。

**关键洞察**：
- 不需要手动标签、链接、分类决策——这些是维持系统的认知开销，LLM 代劳。
- 系统随时间复合增值：12 次月编译后的回答质量远超第 1 次。
- AGENTS.md 是核心——它让 LLM 成为「有纪律的维基维护者」而非通用聊天机器人。

**与蛙蛙工作的映射**：
- 你正在写的 AGENTS.md 正好是这个 schema 文件角色
- corpus 的 hashtag 协议（#kind/#origin/#source/#scope）可以理解为 wiki 的元数据层
- 区别/值得思考的点：你的 corpus 是人写为主、LLM 辅助，而这个模式是 LLM 全权维护、人只读

---

## 二、Denkraum（"Thinking Space" Architecture, 2026）

**核心思想**：不是 RAG，不是笔记系统——是一个**认知架构**，让系统从一个思想者的语料库中**以该思想者的声音**作出回应。

**8 层架构**：
```
Archive                     ← 原始文本，版本化，永不删除
  └── State Registry        ← 文件状态追踪（增量处理）
        └── Chunk Store     ← 语义分块（非 token 数切分，是语义段）
              ├── Vector Index      ← 向量索引（语义相似）
              └── Graph Index       ← 图索引（论证关系：支持/反驳/精炼/综合/前驱）
                    └── Hybrid Retrieval  ← 向量+图混合检索
                          └── Stylesheet  ← 思想者的认识立场、论证逻辑、语体
                                └── Interface  ← Chat / API / 书籍生成
```

**与普通 RAG 的本质区别**：RAG 是工程技术，Denkraum 是**认识论架构**。它不回答"关于"语料库的问题，而是**从**语料库回答问题。

**与蛙蛙工作的映射**：
- 你 corpus 的分层设计（raw → processed → published）本质上已经隐含了这种结构
- Graph Index 中的 argumentative relations（支持/反驳/精炼/前驱）对你论文分析特别有用——你是环境科学背景，论文间的关系正是这些
- Stylesheet 层很有趣——它和你的 blog voice / 写作风格是一回事
- 值得思考：你的 corpus 需不需要一个「论证图」层？

---

## 三、Capture-Process-Compound（Applied AI Society, 2026）

**核心思想**：每日实践——捕获→处理→复合，让每一次对话、每一次会议都成为个人操作系统的永久升级。

**三步骤**：
1. **Capture**：摩擦趋近于零。语音备忘录、粗糙转录、脑转储——只要把材料从脑子里弄出来就行
2. **Process**：用 Agent（LLM）处理原始材料→更新关系文件→提取见解→记录决策→调整策略
3. **Compound**：每次处理让系统更智能。下一次交互时 agent 拥有更多上下文，飞轮转动

**关键原则**：如果一个有用的输出只活在聊天窗口里，那就是失败。每条见解应该在持久化的文档中。

**与蛙蛙工作的映射**：
- 这和你的 neoplasma 概念几乎完全重叠——低摩擦输入、访谈式记忆、多路径消费
- 你的语音备忘→转录→处理的流程就是这个模式的具体实现
- 你提到的「发布品压力」正好对应本文的"如果输出只活在聊天里就是失败"
- 值得借鉴的地方：这个框架强调人+Agent 的协作（人负责高信号输入，Agent 负责结构化处理）

---

## 三个模式的对比

| 维度 | LLM Wiki | Denkraum | Capture-Process-Compound |
|------|----------|----------|--------------------------|
| 核心目的 | 知识编译与检索 | 认识立场复现 | 经验→系统升级 |
| 人机分工 | LLM 写，人读 | LLM 检索+合成，人判断 | 人捕获，Agent 处理 |
| 规模 | ~100-1000 篇文章 | 一个思想者的全集 | 日常经验流 |
| 最像你现有系统的部分 | AGENTS.md + corpus | corpus 分层 + 写作风格 | neoplasma 概念 |
| 可能缺的 | 定期编译健康检查 | 论证关系图 | Agentic processing harness |

---

这不是要你照搬某个模式——三个模式都有不同的设计目标。但把它们放在一起，可以帮你看到自己正在构建的东西在全景图中的位置。你的 corpus + neoplasma 其实在同时做这三件事，只是用你自己定义的分层和协议在落地。
