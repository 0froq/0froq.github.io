---
name: core-git-workflow
description: Git 提交与推送的完整工作流，包含错误处理
---

# Git 工作流

## 依赖

```typescript
import { simpleGit, SimpleGit, StatusResult } from 'simple-git'
```

## 配置

```typescript
const GIT_CONFIG = {
  commitPrefix: 'docs(dashboard):',
  remote: 'origin'
}
```

## 完整流程

```typescript
interface GitOperationResult {
  success: boolean
  commitHash?: string
  pushed: boolean
  error?: GitError
}

interface GitError {
  type: 'NOT_A_REPO' | 'NO_REMOTE' | 'NO_CHANGES' | 
        'COMMIT_FAILED' | 'PUSH_FAILED' | 'AUTH_FAILED' | 'UNKNOWN'
  message: string
}

async function executeGitWorkflow(
  today: string, 
  files: string[]
): Promise<GitOperationResult> {
  try {
    const git = simpleGit()
    
    // 1. 检查是否是 git 仓库
    const isRepo = await git.checkIsRepo()
    if (!isRepo) {
      return {
        success: false,
        pushed: false,
        error: { type: 'NOT_A_REPO', message: '当前目录不是 git 仓库' }
      }
    }

    // 2. 添加文件
    for (const file of files) {
      if (existsSync(file)) {
        await git.add(file)
      }
    }

    // 3. 检查是否有变更
    const status = await git.status()
    if (status.staged.length === 0) {
      return {
        success: true,
        pushed: false,
        error: { type: 'NO_CHANGES', message: '没有要提交的变更' }
      }
    }

    // 4. 提交
    const commitMsg = `${GIT_CONFIG.commitPrefix} add day review for ${today}`
    const commitResult = await git.commit(commitMsg)
    
    if (!commitResult.commit) {
      return {
        success: false,
        pushed: false,
        error: { type: 'COMMIT_FAILED', message: '提交失败' }
      }
    }

    // 5. 推送
    try {
      const remotes = await git.getRemotes(true)
      if (remotes.length === 0) {
        return {
          success: true,
          commitHash: commitResult.commit,
          pushed: false,
          error: { type: 'NO_REMOTE', message: '没有配置远程仓库' }
        }
      }

      await git.push(GIT_CONFIG.remote, 'HEAD')
      return { success: true, commitHash: commitResult.commit, pushed: true }
    }
    catch (pushError) {
      return {
        success: true,
        commitHash: commitResult.commit,
        pushed: false,
        error: {
          type: 'PUSH_FAILED',
          message: `推送失败: ${(pushError as Error).message}`
        }
      }
    }
  }
  catch (error) {
    return {
      success: false,
      pushed: false,
      error: { type: 'UNKNOWN', message: (error as Error).message }
    }
  }
}
```

## 提交信息格式

```
docs(dashboard): add day review for 2026-03-31
```

## 错误处理

| 错误类型 | 说明 | 处理 |
|----------|------|------|
| NOT_A_REPO | 不是 git 仓库 | 提示用户确保在正确目录运行 |
| NO_REMOTE | 没有远程仓库 | 仅提交，跳过推送 |
| NO_CHANGES | 没有变更 | 跳过提交 |
| COMMIT_FAILED | 提交失败 | 检查 git 配置 |
| PUSH_FAILED | 推送失败 | 检查网络或权限 |

## 结果展示

```typescript
function displayGitResult(result: GitOperationResult, today: string): void {
  console.log('\n📦 Git 操作结果')
  console.log('═══════════════════════════════════════')
  
  if (result.success) {
    console.log(`✅ 提交成功: ${result.commitHash?.slice(0, 7)}`)
    
    if (result.pushed) {
      console.log('✅ 推送成功')
    } else if (result.error?.type === 'NO_CHANGES') {
      console.log(`ℹ️ ${result.error.message}`)
    } else if (result.error) {
      console.log(`⚠️ 推送跳过: ${result.error.message}`)
    }
  } else {
    console.log(`❌ 操作失败: ${result.error?.message}`)
  }
}
```

## 非致命错误处理

Git 操作失败不应中断整体流程，因为文件已经保存：

```typescript
if (!result.success) {
  console.log('\n⚠️ Git 操作未完成，但文件已保存')
  console.log('你可以手动执行:')
  console.log(`git add ${files.join(' ')}`)
  console.log(`git commit -m "docs(dashboard): add day review for ${today}"`)
  console.log('git push')
}
```
