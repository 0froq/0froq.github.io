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
  branch: 'main', // 或从当前分支检测
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
  details?: unknown
}

async function gitWorkflow(
  weekId: string,
  files: string[]
): Promise<GitOperationResult> {
  const git = simpleGit()
  
  // 1. 检查是否是 git 仓库
  const isRepo = await git.checkIsRepo()
  if (!isRepo) {
    return {
      success: false,
      pushed: false,
      error: {
        type: 'NOT_A_REPO',
        message: '当前目录不是 git 仓库'
      }
    }
  }
  
  // 2. 检查仓库状态
  const status = await git.status()
  
  // 3. 添加文件
  const addResult = await stageFiles(git, files)
  if (!addResult.success) {
    return {
      success: false,
      pushed: false,
      error: addResult.error
    }
  }
  
  // 4. 检查是否有变更要提交
  const statusAfterAdd = await git.status()
  if (statusAfterAdd.staged.length === 0) {
    return {
      success: true,
      pushed: false,
      error: {
        type: 'NO_CHANGES',
        message: '没有要提交的变更'
      }
    }
  }
  
  // 5. 提交
  const commitResult = await commitChanges(git, weekId, statusAfterAdd)
  if (!commitResult.success) {
    return {
      success: false,
      pushed: false,
      error: commitResult.error
    }
  }
  
  // 6. 推送
  const pushResult = await pushChanges(git)
  
  return {
    success: true,
    commitHash: commitResult.hash,
    pushed: pushResult.success,
    error: pushResult.error
  }
}
```

## 文件暂存

```typescript
async function stageFiles(
  git: SimpleGit,
  files: string[]
): Promise<{ success: true } | { success: false; error: GitError }> {
  try {
    // 检查文件是否存在
    for (const file of files) {
      if (!await fileExists(file)) {
        return {
          success: false,
          error: {
            type: 'UNKNOWN',
            message: `文件不存在: ${file}`
          }
        }
      }
    }
    
    // 添加文件
    await git.add(files)
    
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: {
        type: 'UNKNOWN',
        message: `添加文件失败: ${(error as Error).message}`,
        details: error
      }
    }
  }
}
```

## 提交变更

```typescript
async function commitChanges(
  git: SimpleGit,
  weekId: string,
  status: StatusResult
): Promise<{ success: true; hash: string } | { success: false; error: GitError }> {
  try {
    const message = generateCommitMessage(weekId, status)
    
    const result = await git.commit(message)
    
    if (!result.commit) {
      return {
        success: false,
        error: {
          type: 'COMMIT_FAILED',
          message: '提交命令执行失败'
        }
      }
    }
    
    return {
      success: true,
      hash: result.commit
    }
  } catch (error) {
    const errMsg = (error as Error).message
    
    if (errMsg.includes('user.email') || errMsg.includes('user.name')) {
      return {
        success: false,
        error: {
          type: 'COMMIT_FAILED',
          message: 'Git 身份未配置，请先设置 user.name 和 user.email',
          details: error
        }
      }
    }
    
    return {
      success: false,
      error: {
        type: 'COMMIT_FAILED',
        message: `提交失败: ${errMsg}`,
        details: error
      }
    }
  }
}

function generateCommitMessage(weekId: string, status: StatusResult): string {
  const files = status.staged.map(f => f.path)
  
  // 检测变更类型
  const hasNewWeek = files.some(f => f.includes('weekTasks') && f.includes(weekId))
  const hasAdvisor = files.some(f => f.includes('advisor'))
  
  let action = 'update'
  if (hasNewWeek && !files.some(f => !f.includes(weekId))) {
    action = 'add'
  }
  
  const parts: string[] = [GIT_CONFIG.commitPrefix]
  
  if (action === 'add') {
    parts.push(`add plan for ${weekId}`)
  } else {
    parts.push(`update plan for ${weekId}`)
  }
  
  // 添加文件摘要
  const fileSummary = generateFileSummary(files)
  if (fileSummary) {
    parts.push(`(${fileSummary})`)
  }
  
  return parts.join(' ')
}

function generateFileSummary(files: string[]): string {
  const types = new Set<string>()
  
  for (const file of files) {
    if (file.includes('weekTasks')) types.add('week')
    if (file.includes('advisor')) types.add('advisor')
    if (file.includes('monthBacklogs')) types.add('backlog')
    if (file.includes('dayTodos')) types.add('day')
  }
  
  if (types.size === 0) return ''
  if (types.size === 1) return `${Array.from(types)[0]}-plan`
  return `${types.size}-files`
}
```

## 推送变更

```typescript
async function pushChanges(
  git: SimpleGit
): Promise<{ success: boolean; error?: GitError }> {
  try {
    // 检查是否有远程
    const remotes = await git.getRemotes(true)
    if (remotes.length === 0) {
      return {
        success: false,
        error: {
          type: 'NO_REMOTE',
          message: '仓库没有配置远程（origin），跳过推送'
        }
      }
    }
    
    // 获取当前分支
    const status = await git.status()
    const currentBranch = status.current || 'main'
    
    // 推送
    await git.push(GIT_CONFIG.remote, currentBranch)
    
    return { success: true }
  } catch (error) {
    const errMsg = (error as Error).message
    
    if (errMsg.includes('Permission denied') || errMsg.includes('access')) {
      return {
        success: false,
        error: {
          type: 'AUTH_FAILED',
          message: '推送失败: 认证错误（请检查 SSH 密钥或凭证）',
          details: error
        }
      }
    }
    
    if (errMsg.includes('rejected')) {
      return {
        success: false,
        error: {
          type: 'PUSH_FAILED',
          message: '推送被拒绝：远程有更新，请先 pull',
          details: error
        }
      }
    }
    
    return {
      success: false,
      error: {
        type: 'PUSH_FAILED',
        message: `推送失败: ${errMsg}`,
        details: error
      }
    }
  }
}
```

## 错误展示

```typescript
function displayGitResult(result: GitOperationResult, weekId: string): void {
  console.log('')
  console.log('═══════════════════════════════════════')
  console.log('📦 Git 操作结果')
  console.log('═══════════════════════════════════════')
  
  if (result.success) {
    console.log(`✅ 提交成功`)
    console.log(`   提交哈希: ${result.commitHash?.slice(0, 7) || 'unknown'}`)
    
    if (result.pushed) {
      console.log(`✅ 推送成功`)
    } else if (result.error?.type === 'NO_CHANGES') {
      console.log(`ℹ️  ${result.error.message}`)
    } else if (result.error) {
      console.log(`⚠️  推送跳过: ${result.error.message}`)
    }
  } else {
    console.log(`❌ 操作失败`)
    console.log(`   错误: ${result.error?.message || '未知错误'}`)
    
    // 提供修复建议
    if (result.error?.type === 'NOT_A_REPO') {
      console.log('\n💡 建议:')
      console.log('   1. 确保在 0froq.github.io 仓库根目录运行')
      console.log('   2. 或先执行: git init')
    } else if (result.error?.type === 'AUTH_FAILED') {
      console.log('\n💡 建议:')
      console.log('   1. 检查 SSH 密钥: ssh -T git@github.com')
      console.log('   2. 或使用 HTTPS 并配置凭证助手')
    } else if (result.error?.type === 'PUSH_FAILED' && result.error.message.includes('pull')) {
      console.log('\n💡 建议:')
      console.log('   1. 先执行: git pull origin main')
      console.log('   2. 解决冲突后重新运行')
    }
  }
  
  console.log('═══════════════════════════════════════')
}
```

## 完整集成

```typescript
async function executeGitWorkflow(
  weekId: string,
  writtenFiles: string[]
): Promise<void> {
  console.log('📦 执行 Git 工作流...')
  
  const result = await gitWorkflow(weekId, writtenFiles)
  displayGitResult(result, weekId)
  
  // 如果不是关键错误，不中断流程
  if (!result.success && result.error?.type !== 'NOT_A_REPO') {
    console.log('\n⚠️  Git 操作未完成，但文件已保存')
    console.log('   你可以手动执行:')
    console.log(`   git add ${writtenFiles.join(' ')}`)
    console.log(`   git commit -m "docs(dashboard): add plan for ${weekId}"`)
    console.log(`   git push`)
  }
}
```
