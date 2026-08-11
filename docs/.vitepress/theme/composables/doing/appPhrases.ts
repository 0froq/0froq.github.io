/**
 * Per-app Doing phrases (zh/en) + optional link on the app name.
 * Keys match `activity.process.name` from the R2 activity feed.
 */

export type DoingMode = 'working' | 'sleeping'

export interface DoingLocalePhrases {
  /** May omit `{app}` for free-form lines. */
  working?: string[]
  sleeping?: string[]
}

export interface DoingAppConfig {
  /** Optional; omit → plain text app name (no link). */
  url?: string
  zh?: DoingLocalePhrases
  en?: DoingLocalePhrases
}

export interface DoingPhrasePick {
  /** Phrase with a single `{app}` placeholder. */
  text: string
  url?: string
}

const DOING_FALLBACK: Record<'zh' | 'en', Required<DoingLocalePhrases>> = {
  zh: {
    working: ['在 {app} 中干活', '在 {app} 里游荡', '在 {app} 里工作'],
    sleeping: ['在 {app} 中眠了'],
  },
  en: {
    working: ['Working on {app}', 'Wandering in {app}'],
    sleeping: ['Sleeping in {app}'],
  },
}

/** Seeded phrases for common apps; extend freely. */
export const DOING_APP_CONFIG: Record<string, DoingAppConfig> = {
  Cursor: {
    url: 'https://cursor.com/',
    zh: {
      working: ['在 {app} 打码', '尝试用完 token'],
      sleeping: ['码不动了', '在 {app} 面前打盹', '坐着等 AI 完成'],
    },
    en: {
      working: ['coding in {app}', 'trying to use up the token'],
      sleeping: ['tired of coding', 'dozing beside {app}', 'waiting for AI to finish'],
    },
  },
  ChatGPT: {
    url: 'https://chatgpt.com/',
    zh: {
      working: ['在 {app} 里聊天', '尝试用完 token'],
      sleeping: ['在 {app} 面前打盹', '坐着等 AI 完成'],
    },
    en: {
      working: ['chatting in {app}', 'trying to use up the token'],
      sleeping: ['dozing beside {app}', 'waiting for AI to finish'],
    },
  },
  Code: {
    url: 'https://code.visualstudio.com/',
    zh: {
      working: ['在 {app} 打码', '在古法编程'],
      sleeping: ['码不动了', '在 {app} 面前打盹'],
    },
    en: {
      working: ['coding in {app}', 'manually coding (seriously?)'],
      sleeping: ['tired of coding', 'dozing beside {app}'],
    },
  },
  Ghostty: {
    url: 'https://ghostty.org/',
    zh: {
      working: ['在 {app} 里游荡', '盯着光标闪烁', '大概率在 NeoVim', '无疑在古法编程'],
      sleeping: ['码不动了', '在 {app} 面前打盹'],
    },
    en: {
      working: ['wandering in {app}', 'watching the cursor blink', 'probably in NeoVim', 'definitely manually coding'],
      sleeping: ['tired of coding', 'dozing beside {app}'],
    },
  },
  Vivaldi: {
    url: 'https://vivaldi.com/',
    zh: {
      working: ['在 {app} 里开一堆标签', '用 {app} 四处点'],
      sleeping: ['在刷 YouTube', '冲浪睡着了'],
    },
    en: {
      working: ['tab hoarding in {app}', 'clicking around in {app}'],
      sleeping: ['browsing YouTube', 'surfing asleep'],
    },
  },
}

function localeBucket(locale: string): 'zh' | 'en' {
  return locale.startsWith('zh') ? 'zh' : 'en'
}

function phrasesFor(
  config: DoingAppConfig | undefined,
  mode: DoingMode,
  locale: 'zh' | 'en',
): string[] {
  const fromApp = config?.[locale]?.[mode]
  if (fromApp && fromApp.length > 0)
    return fromApp
  // Prefer the other locale's app phrases before global fallback.
  const other = locale === 'zh' ? 'en' : 'zh'
  const fromOther = config?.[other]?.[mode]
  if (fromOther && fromOther.length > 0)
    return fromOther
  return DOING_FALLBACK[locale][mode]
}

/** Split a phrase on `{app}` into before/after; `hasApp` is false when omitted. */
export function splitDoingPhrase(text: string): {
  before: string
  after: string
  hasApp: boolean
} {
  if (!text.includes('{app}'))
    return { before: text, after: '', hasApp: false }
  const parts = text.split('{app}')
  return {
    before: parts[0] ?? '',
    after: parts.slice(1).join('{app}'),
    hasApp: true,
  }
}

/**
 * Pick a random phrase for the given app + mode + locale.
 * Re-call only when app / mode / locale changes (not on every poll).
 */
export function pickDoingPhrase(
  appName: string,
  mode: DoingMode,
  locale: string,
): DoingPhrasePick {
  const bucket = localeBucket(locale)
  const config = DOING_APP_CONFIG[appName]
  const list = phrasesFor(config, mode, bucket)
  const text = list[Math.floor(Math.random() * list.length)] ?? DOING_FALLBACK[bucket][mode][0]!
  return {
    text,
    url: config?.url,
  }
}
