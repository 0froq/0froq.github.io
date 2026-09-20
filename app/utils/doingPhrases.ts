export type DoingMode = 'working' | 'sleeping'
export type DoingLocale = 'zh' | 'en'
export type DoingKind = 'coding' | 'ai' | 'terminal' | 'browser' | 'notes'

export interface DoingLocalePhrases {
  working?: string[]
  sleeping?: string[]
}

export interface DoingAppConfig {
  url?: string
  kinds?: DoingKind[]
  extra?: Partial<Record<DoingLocale, DoingLocalePhrases>>
}

export interface DoingPhrasePick {
  text: string
  url?: string
}

const DOING_FALLBACK: Record<DoingLocale, Required<DoingLocalePhrases>> = {
  zh: {
    working: ['在 {app} 中干活', '在 {app} 里游荡', '在 {app} 里工作'],
    sleeping: ['在 {app} 中眠了'],
  },
  en: {
    working: ['Working on {app}', 'Wandering in {app}'],
    sleeping: ['Sleeping in {app}'],
  },
}

const DOING_KINDS: Record<DoingKind, Partial<Record<DoingLocale, DoingLocalePhrases>>> = {
  coding: {
    zh: {
      working: ['在 {app} 打码'],
      sleeping: ['码不动了', '在 {app} 面前打盹'],
    },
    en: {
      working: ['coding in {app}'],
      sleeping: ['tired of coding', 'dozing beside {app}'],
    },
  },
  ai: {
    zh: {
      working: ['尝试在 {app} 里用完 token'],
      sleeping: ['坐着等 AI 完成'],
    },
    en: {
      working: ['trying to use up the token in {app}'],
      sleeping: ['waiting for AI to finish'],
    },
  },
  terminal: {
    zh: {
      working: ['在 {app} 里游荡', '盯着光标闪烁'],
    },
    en: {
      working: ['wandering in {app}', 'watching the cursor blink'],
    },
  },
  browser: {
    zh: {
      working: ['在 {app} 里开一堆标签', '用 {app} 四处点'],
      sleeping: ['冲浪睡着了'],
    },
    en: {
      working: ['tab hoarding in {app}', 'clicking around in {app}'],
      sleeping: ['surfing asleep'],
    },
  },
  notes: {
    zh: {
      working: ['在 {app} 里写笔记', '在 {app} 里整理'],
      sleeping: ['在 {app} 面前打盹'],
    },
    en: {
      working: ['writing in {app}', 'tidying notes in {app}'],
      sleeping: ['dozing beside {app}'],
    },
  },
}

const DOING_APPS: Record<string, DoingAppConfig> = {
  'Cursor': {
    url: 'https://cursor.com/',
    kinds: ['coding', 'ai'],
  },
  'ChatGPT': {
    url: 'https://chatgpt.com/',
    kinds: ['ai'],
  },
  'Zed': {
    url: 'https://zed.dev/',
    kinds: ['coding'],
    extra: {
      zh: { working: ['在古法编程'] },
      en: { working: ['manually coding (seriously?)'] },
    },
  },
  'Ghostty': {
    url: 'https://ghostty.org/',
    kinds: ['terminal', 'coding'],
    extra: {
      zh: { working: ['大概率在 NeoVim', '无疑在古法编程'] },
      en: { working: ['probably in NeoVim', 'definitely manually coding'] },
    },
  },
  'Vivaldi': {
    url: 'https://vivaldi.com/',
    kinds: ['browser'],
  },
  'Zen': {
    url: 'https://zen-browser.app/',
    kinds: ['browser'],
  },
  'ego lite': {
    url: 'https://lite.ego.app/',
    kinds: ['ai', 'browser'],
  },
  'Grok Bot': {
    kinds: ['ai'],
  },
  'DimAgent': {
    url: 'https://dimagent.cn/',
    kinds: ['ai'],
  },
  'Lody': {
    url: 'https://lody.ai/',
    kinds: ['ai'],
  },
  'Notion': {
    url: 'https://www.notion.so/',
    kinds: ['notes'],
  },
}

function localeBucket(locale: string): DoingLocale {
  return locale.startsWith('zh') ? 'zh' : 'en'
}

function otherLocale(locale: DoingLocale): DoingLocale {
  return locale === 'zh' ? 'en' : 'zh'
}

function phrasesFrom(
  source: Partial<Record<DoingLocale, DoingLocalePhrases>> | undefined,
  mode: DoingMode,
  locale: DoingLocale,
): string[] {
  const primary = source?.[locale]?.[mode]
  if (primary?.length)
    return primary
  const secondary = source?.[otherLocale(locale)]?.[mode]
  if (secondary?.length)
    return secondary
  return []
}

function phrasesFor(
  config: DoingAppConfig | undefined,
  mode: DoingMode,
  locale: DoingLocale,
): string[] {
  const seen = new Set<string>()
  const out: string[] = []

  function push(list: string[]) {
    for (const phrase of list) {
      if (!phrase || seen.has(phrase))
        continue
      seen.add(phrase)
      out.push(phrase)
    }
  }

  for (const kind of config?.kinds ?? [])
    push(phrasesFrom(DOING_KINDS[kind], mode, locale))
  push(phrasesFrom(config?.extra, mode, locale))

  if (out.length)
    return out
  return DOING_FALLBACK[locale][mode]
}

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

export function pickDoingPhrase(
  appName: string,
  mode: DoingMode,
  locale: string,
): DoingPhrasePick {
  const bucket = localeBucket(locale)
  const config = DOING_APPS[appName]
  const list = phrasesFor(config, mode, bucket)
  const text = list[Math.floor(Math.random() * list.length)] ?? DOING_FALLBACK[bucket][mode][0]!
  return {
    text,
    url: config?.url,
  }
}
