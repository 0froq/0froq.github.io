---
name: verify-task-doc
description: 验证任务完成状态与文档记录的一致性。扫描 corpus/posts 目录，检查任务标记为 done 时是否有对应的文档产出，或有文档产出时是否忘记勾选任务完成。
when_to_use: 在 end-my-day 或 end-my-week 时自动调用，用于验证当日/当周的任务-文档一致性
---

## 核心职责

你是**任务-文档一致性验证器**。你的工作是：

1. **收集证据**：扫描任务状态、文档变更、Git 提交记录
2. **建立关联**：判断哪些文档与哪些任务相关
3. **检测异常**：
   - 任务标记 done 但无文档证据（可能忘记记录）
   - 有大量文档产出但任务未标记 done（可能忘记勾选）
   - 时间窗不匹配（产出在任务窗口外）
4. **做出判定**：PASS / WARN / FAIL / BLOCK
5. **持久化状态**：将验证结果写入 advisor，供下次 start 时检查

## 验证流程

### 第 1 步：收集输入数据

**读取任务计划：**
- `docs/dashboard/dayTodos/{date}.yml` - 日计划
- `docs/dashboard/weekTasks/{weekId}.yml` - 周计划

提取：`task_id`, `title`, `status`, `tags`, `expected_paths`

**扫描文档目录：**
- `docs/corpus/` - 知识库文档
- `docs/posts/` - 博客/文章
- `docs/dashboard/` 下的更新（advisor, hints 等）

提取：文件路径、大小、frontmatter（title, tags, tasks）、hash、修改时间

**采集 Git 证据：**
```bash
git status --short
git log --since="{window_start}" --until="{window_end}" --pretty=format:"%H|%ad|%s"
git diff --stat HEAD~1 HEAD
```

提取：提交 SHA、提交时间、提交信息、变更文件列表

### 第 2 步：建立任务-文档关联

**关联评分算法：**

```typescript
interface LinkScore {
  task_id: string
  doc_id: string
  score: number        // 总分
  confidence: 'strong' | 'medium' | 'weak'
  evidence: Evidence[]
}

interface Evidence {
  type: 'frontmatter_task_ref' | 'commit_message_ref' | 'path_match' | 
        'tag_overlap' | 'keyword_match' | 'time_overlap' | 'same_commit'
  score: number
  value: string
}
```

**评分规则：**

| 证据类型 | 分值 | 说明 |
|---------|------|------|
| frontmatter 显式 task_id | +70 | 文档 frontmatter: `tasks: [task_id]` |
| commit message 引用 task | +50 | commit msg 包含 "完成 [task_id]" |
| 路径命中 expected_paths | +20 | 文档路径匹配任务声明的输出路径 |
| tags 重叠 | +10 | 文档 tags 与任务 tags 有交集 |
| 关键词匹配 | +10 | 标题/heading 关键词重叠 |
| 时间窗命中 | +8 | 文档修改时间在任务窗口内 |
| 同 commit 出现 | +8 | 同一 commit 修改了任务文件和文档 |

**置信度分层：**
- `strong` (≥70): 可作为完成证明
- `medium` (45-69): 可作为辅助证据
- `weak` (<45): 仅作提示，不能单独证明

### 第 3 步：检测不一致

#### 规则 A: 任务 done 但无足够证据

**条件：** `task.status == 'done'` 且没有 medium+ 关联文档

**判定：** `FAIL`

**示例：**
```
❌ 不一致检测

任务: "完成技能系统设计" (status: done)
关联文档: 无 (score < 45)
Git 提交: 无相关提交

判定: FAIL - 任务标记完成但无文档或提交证据
建议: 补充设计文档，或将任务改回 in_progress
```

#### 规则 B: 任务 done 但只有弱证据/草稿

**条件：** 有 weak 关联，或文档 dirty/未 commit

**判定：** `WARN`

**示例：**
```
⚠️ 警告

任务: "整理 meeting notes" (status: done)
关联文档: corpus/meeting-2026-03-31.md (score: 35, weak)
Git 状态: 未提交 (untracked)

判定: WARN - 有产出但未提交或证据较弱
建议: 提交文档到 Git，或完善文档内容
```

#### 规则 C: 文档有显著产出但无对应 done 任务

**条件：** 窗口内有显著产出，但无法关联到任何 done 任务

**判定：** `WARN` 或 `FAIL`（取决于显著程度）

**显著产出定义：**
- 新建文档（任何大小）
- posts/ 目录新发布
- diff 行数 ≥ 50
- 变更文件数 ≥ 2 且都在目标目录

**示例：**
```
⚠️ 警告

文档: corpus/weekly-review.md (新建, 120行)
关联任务: 无
任务状态: 未找到对应 done 任务

判定: WARN - 有显著产出但未关联到完成任务
建议: 检查是否忘记勾选相关任务，或创建新任务记录此次产出
```

#### 规则 D: 上次 end 未验证通过

**条件：** 上次 `end` 结果为 `FAIL/BLOCK` 且无人工确认

**判定：** `BLOCK`

**阻断逻辑：**
```
if (latest_end.status === 'FAIL' || latest_end.status === 'BLOCK') {
  if (!has_acknowledgement(latest_end.run_id)) {
    return {
      verdict: 'BLOCK',
      message: '上次复盘存在未解决的验证问题，请先处理或提供证明',
      issues: latest_end.issues
    }
  }
}
```

### 第 4 步：输出验证结果

**验证报告结构：**

```yaml
# advisor/runs/{timestamp}/verdict.json
{
  "run_id": "2026-03-31T14-35-10+08-00",
  "window": {
    "type": "daily",      # daily | weekly
    "id": "2026-03-31"    # date or weekId
  },
  "status": "warn",       # PASS | WARN | FAIL | BLOCK
  "blocking": false,      # 是否阻断下次 start
  
  "summary": {
    "tasks_total": 5,
    "tasks_done": 3,
    "docs_changed": 4,
    "links_strong": 2,
    "links_medium": 1,
    "links_weak": 1,
    "issues_high": 0,
    "issues_medium": 2,
    "issues_low": 1
  },
  
  "issues": [
    {
      "id": "ISSUE-20260331-001",
      "severity": "medium",
      "type": "done_task_without_evidence",
      "task_id": "2026-03-31-design-system",
      "message": "任务标记为 done，但未找到足够的文档或 Git 证据",
      "recommendation": "补充设计文档，或将任务改回 in_progress"
    }
  ],
  
  "proof": {
    "plan_sha256": "sha256:...",
    "docs_index_sha256": "sha256:...",
    "git_head_sha": "abc123",
    "git_dirty": false,
    "timestamp": "2026-03-31T14:35:10+08:00"
  }
}
```

### 第 5 步：更新 ledger

**写入 `advisor/state/latest-end.json`：**

```json
{
  "run_id": "2026-03-31T14-35-10+08-00",
  "window_type": "daily",
  "window_id": "2026-03-31",
  "status": "warn",
  "blocking": false,
  "issues_open": 2,
  "proof_hash": "sha256:...",
  "created_at": "2026-03-31T14:35:12+08:00"
}
```

**追加 `advisor/ledger/proofs.jsonl`：**

```json
{"run_id":"2026-03-31T14-35-10+08-00","window":"2026-03-31","verdict":"warn","proof_hash":"sha256:abc","prev_hash":"sha256:def","timestamp":"2026-03-31T14:35:10+08:00"}
```

## 阻断机制详解

### 何时阻断

下次调用 `start-my-day` 或 `start-my-week` 时：

1. 检查 `advisor/state/latest-end.json`
2. 如果 `status` 为 `FAIL` 或 `BLOCK` → 阻断
3. 如果存在未解决的 `high` severity issues → 阻断
4. 如果存在 `active-run.lock`（上次 end 未完成）→ 阻断

### 阻断响应

```
🔒 验证阻断

检测到上次复盘（2026-03-31）存在未解决的验证问题：

1. [HIGH] 任务 "完成技能系统设计" 标记为 done 但无文档证据
   建议: 补充设计文档或将任务改回 in_progress

2. [MEDIUM] 文档 corpus/weekly-review.md 有显著产出但未关联任务
   建议: 检查是否忘记勾选相关任务

请处理以上问题，或提供证明（如口述说明已完成但无需文档）。

提供证明命令:
/ack "任务已口述完成，无需文档" --issue ISSUE-20260331-001

阻断将在以下情况解除:
- 所有 high 级别问题被解决或确认
- 提供有效的 ack 证明
```

### 人工确认 (ack) 机制

用户可以提供带理由的确认：

```yaml
# advisor/acknowledgements/ACK-20260331-001.yaml
id: ACK-20260331-001
issue_ids:
  - ISSUE-20260331-001
reason: "技能系统设计已通过代码审查，设计决策在 PR 讨论中记录，无需单独文档"
provided_by: user
provided_at: 2026-03-31T20:10:00+08:00
verification_method: "code_review_link"
evidence_url: "https://github.com/.../pull/123"
expires_after_runs: 1  # 只放行一次
```

**ack 验证标准：**
- 信度极高（如代码审查链接、会议纪要、口头讲述的详细摘要）
- 可追溯（有 URL、有记录、有第三方确认）
- 限时（通常只放行一次，下次仍需处理）

## 与现有 Skills 的集成

### 在 end-my-day 中集成

在生成日复盘后、写入文件前，插入验证步骤：

```typescript
// end-my-day/index.ts
async function endMyDay() {
  // 1. 读取今日计划
  const dayPlan = await readDayPlan(today)
  
  // 2. 生成复盘内容（原有逻辑）
  const review = await generateReview(dayPlan)
  
  // 3. 【新增】验证任务-文档一致性
  const verification = await verifyTaskDocConsistency({
    window_type: 'daily',
    window_id: today,
    plan: dayPlan,
    corpus_dirs: ['docs/corpus', 'docs/posts'],
    git_enabled: true
  })
  
  // 4. 如果验证失败，向用户展示问题
  if (verification.status === 'FAIL' || verification.status === 'BLOCK') {
    console.log('🔒 验证发现问题，请先处理：')
    verification.issues.forEach(issue => {
      console.log(`  [${issue.severity}] ${issue.message}`)
    })
    
    // 询问用户处理方式
    const action = await askUser('如何处理这些问题？')
    // ... 处理逻辑
  }
  
  // 5. 将验证结果附加到 review
  review.verification = {
    status: verification.status,
    issues: verification.issues,
    proof_hash: verification.proof.hash
  }
  
  // 6. 写入文件（包含验证结果）
  await writeDayReview(today, review)
  
  // 7. 更新 ledger
  await updateLedger({
    run_id: verification.run_id,
    window_type: 'daily',
    window_id: today,
    status: verification.status,
    blocking: verification.blocking
  })
}
```

### 在 start-my-day 中集成阻断检查

在对话开始前，先检查验证状态：

```typescript
// start-my-day/index.ts
async function startMyDay() {
  // 1. 【新增】检查上次验证状态
  const lastEnd = await readLatestEnd('daily')
  
  if (lastEnd && (lastEnd.status === 'FAIL' || lastEnd.status === 'BLOCK')) {
    const hasAck = await hasAcknowledgement(lastEnd.run_id)
    
    if (!hasAck) {
      // 阻断并展示问题
      console.log('🔒 上次复盘存在未解决的验证问题')
      const issues = await readIssues(lastEnd.run_id)
      
      issues.forEach(issue => {
        console.log(`  [${issue.severity}] ${issue.message}`)
      })
      
      console.log('\n请处理以上问题，或提供证明：')
      console.log('/ack "说明原因" --issue ISSUE-xxx')
      
      return { blocked: true, issues }
    }
  }
  
  // 2. 原有逻辑：读取上下文、对话、生成计划
  const context = await readContext(today)
  // ...
}
```

## 存储结构

```
docs/dashboard/advisor/
├── state/
│   ├── latest-start.json      # 上次 start 信息
│   ├── latest-end.json        # 上次 end 信息（关键：阻断依据）
│   └── active-run.lock        # 正在进行的 run（防止重复）
├── runs/
│   └── 2026/
│       └── 2026-03-31T14-35-10/
│           ├── input/
│           │   ├── plan.snapshot.yaml
│           │   ├── docs.index.json
│           │   └── git.evidence.json
│           ├── output/
│           │   ├── links.json
│           │   ├── issues.json
│           │   ├── verdict.json
│           │   └── report.md
│           └── proof.json
├── ledger/
│   └── proofs.jsonl           # 链式账本
└── acknowledgements/
    └── ACK-20260331-001.yaml  # 人工确认
```

## 命令行接口

```bash
# 验证今日
npx tsx skills/verify-task-doc/index.ts --daily 2026-03-31

# 验证本周
npx tsx skills/verify-task-doc/index.ts --weekly 2026-03-31

# 查看上次验证结果
npx tsx skills/verify-task-doc/index.ts --status

# 提供人工确认
npx tsx skills/verify-task-doc/index.ts --ack "说明原因" --issue ISSUE-xxx
```

## 输出示例

**PASS（通过）：**
```
✅ 验证通过

任务: 3 done, 2 pending
文档: 4 changed
关联: 3 strong, 1 medium

所有 done 任务都有 sufficient evidence。
```

**WARN（警告）：**
```
⚠️ 验证警告

[MEDIUM] 任务 "整理 notes" 标记 done 但只有 weak 证据
  文档: corpus/notes.md (uncommitted)
  建议: 提交文档到 Git

[LOW] 文档 corpus/draft.md 有产出但未关联任务
  建议: 检查是否忘记勾选任务

可以继续，但建议处理以上警告。
```

**FAIL（失败）：**
```
❌ 验证失败

[HIGH] 任务 "完成系统设计" 标记 done 但无 evidence
  关联文档: 无
  Git 提交: 无相关提交
  建议: 补充设计文档或将任务改回 in_progress

[MEDIUM] 3 个文档有显著产出但未关联 done 任务

请处理以上问题后再继续。
```

**BLOCK（阻断）：**
```
🔒 验证阻断

上次复盘（2026-03-30）存在未解决的验证问题：

[HIGH] 任务 "xxx" 标记 done 但无 evidence（未解决）

请处理以上问题，或提供证明：
/ack "说明原因" --issue ISSUE-20260330-001
```