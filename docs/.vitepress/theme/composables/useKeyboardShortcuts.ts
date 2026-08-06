import type { App } from 'vue'

/**
 * 全局快捷键系统
 *
 * 设计目标：站点级键盘支持的地基——批注只是第一个消费者，
 * 后续导航、命令面板等都可以注册进来。
 *
 * 使用：
 *   const keymap = useKeyboardShortcuts()
 *   keymap.register('slash', handler, { when: () => !typing })
 *   keymap.unregister('slash', handler)
 *
 * 上下文感知：
 *   - 默认在 input/textarea/select/contenteditable 内不触发（可覆盖）
 *   - handler 可检查 e.metaKey / e.ctrlKey / e.shiftKey / e.altKey
 */

export interface ShortcutContext {
  /** 当前焦点是否在可编辑元素内 */
  isEditing: boolean
  /** 是否在批注输入框内（避免与批注快捷键冲突） */
  isAnnotationPopover: boolean
}

export type ShortcutHandler = (e: KeyboardEvent, ctx: ShortcutContext) => void | boolean

export interface ShortcutOptions {
  /** 是否在可编辑元素内也触发（默认 false） */
  allowInInput?: boolean
  /** 组合键修饰符（不设 = 不要求修饰符） */
  meta?: boolean
  ctrl?: boolean
  shift?: boolean
  alt?: boolean
}

interface RegisteredShortcut {
  handler: ShortcutHandler
  options: ShortcutOptions
}

type ShortcutKey = 'slash' | 'escape' | 'b' | 'n' | 'p'

const SHORTCUT_KEYS: Record<ShortcutKey, string> = {
  slash: '/',
  escape: 'Escape',
  b: 'b',
  n: 'n',
  p: 'p',
}

const EDITABLE_SELECTOR = 'input, textarea, select, [contenteditable="true"], [role="textbox"]'

let app: App | null = null
const registry = new Map<ShortcutKey, Set<RegisteredShortcut>>()

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element))
    return false
  return target.closest(EDITABLE_SELECTOR) !== null
}

function isAnnotationPopoverTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element))
    return false
  return target.closest('.annotation-popover') !== null
}

function handleKeydown(e: KeyboardEvent) {
  const key = Object.entries(SHORTCUT_KEYS).find(([, value]) => value === e.key)?.[0] as ShortcutKey | undefined
  if (!key)
    return

  const ctx: ShortcutContext = {
    isEditing: isEditableTarget(e.target),
    isAnnotationPopover: isAnnotationPopoverTarget(e.target),
  }

  const shortcuts = registry.get(key)
  if (!shortcuts || shortcuts.size === 0)
    return

  for (const s of shortcuts) {
    const { handler, options } = s
    // 修饰符匹配
    const modifiersOk
      = (options.meta ?? false) === e.metaKey
        && (options.ctrl ?? false) === e.ctrlKey
        && (options.shift ?? false) === e.shiftKey
        && (options.alt ?? false) === e.altKey
    if (!modifiersOk)
      continue
    // 输入框内默认不触发
    if (ctx.isEditing && !options.allowInInput)
      continue

    const result = handler(e, ctx)
    if (result === false)
      continue // 该 handler 未消费，尝试下一个
    // 消费了：阻止默认行为（如浏览器快速查找）
    e.preventDefault()
    break
  }
}

export function useKeyboardShortcuts() {
  if (typeof window === 'undefined')
    return { register: () => {}, unregister: () => {} }

  function register(
    key: ShortcutKey,
    handler: ShortcutHandler,
    options: ShortcutOptions = {},
  ): void {
    if (!registry.has(key))
      registry.set(key, new Set())
    registry.get(key)!.add({ handler, options })
  }

  function unregister(key: ShortcutKey, handler: ShortcutHandler): void {
    const set = registry.get(key)
    if (!set)
      return
    for (const s of set) {
      if (s.handler === handler) {
        set.delete(s)
        break
      }
    }
    if (set.size === 0)
      registry.delete(key)
  }

  return { register, unregister }
}

/** 插件安装（App 级初始化，保证 document listener 只挂一次） */
export function installKeyboardShortcuts(_app: App): void {
  if (app || typeof window === 'undefined')
    return
  app = _app
  document.addEventListener('keydown', handleKeydown)
}
