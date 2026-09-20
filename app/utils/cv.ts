/**
 * Copy for /cv. Drawn from the bilingual brief: page-density A,
 *  plus a few lines fished from the long pool.
 */

export type CvLang = 'en' | 'zh'

export interface CvEntry {
  when: string
  title: string
  what: string
  blurb: string
  href?: string
  warn?: string
}

export function groupCvEntries<T extends { when: string }>(
  items: readonly T[],
) {
  const groups: { when: string, items: T[] }[] = []
  for (const item of items) {
    const last = groups.at(-1)
    if (last?.when === item.when)
      last.items.push(item)
    else
      groups.push({ when: item.when, items: [item] })
  }
  return groups
}

const CJK = /[\u4E00-\u9FFF]/
const CJK_PUNCT = /[。，；：、！？「」『』（）—–…]/

function fold(text: string) {
  const parts = text.split('\n').map(line => line.trim()).filter(Boolean)
  let out = ''
  for (const part of parts) {
    if (!out) {
      out = part
      continue
    }
    const a = out.at(-1)!
    const b = part[0]!
    const tight = (CJK.test(a) && CJK.test(b))
      || CJK_PUNCT.test(a)
      || CJK_PUNCT.test(b)
    out += `${tight ? '' : ' '}${part}`
  }
  return out
}

const reach = [
  {
    label: 'Email',
    handle: 'sayhola@froq.me',
    href: 'mailto:sayhola@froq.me',
    doodle: 'mail',
  },
  {
    label: 'GitHub',
    handle: '@0froq',
    href: 'https://github.com/0froq',
    brand: 'github' as const,
  },
  {
    label: 'Site',
    handle: 'froq.me',
    href: '/',
    doodle: 'globe',
  },
]

const reachZh = [
  ...reach,
  {
    label: '电话',
    handle: '166-0823-8238',
    href: 'tel:+8616608238238',
    doodle: 'phone',
  },
]

const practice = [
  { label: 'Fluent', names: ['Markdown'] },
  {
    label: 'Daily',
    names: [
      'Vue.js',
      'TypeScript',
      'CSS/UnoCSS',
      'Git',
      'Neovim',
      'AI Agents',
    ],
  },
  { label: 'Used', names: ['Python'] },
  { label: 'Learning', names: ['Nuxt'] },
  { label: 'Curious', names: ['iOS Development'] },
] as const

const practiceZh = [
  { label: '熟练', names: practice[0].names },
  { label: '日常', names: practice[1].names },
  { label: '用过', names: practice[2].names },
  { label: '在学', names: practice[3].names },
  { label: '好奇', names: practice[4].names },
] as const

export const cv = {
  en: {
    name: 'froQ',
    legal: 'Zhengye Qing',
    now: 'NOW',
    print: 'Print PDF',
    line: 'student / design & code',
    place: {
      text: 'Nanjing, China',
      doodle: 'map-pin',
    },
    reach,
    hello: fold(`
      I code, build, read, write, and disappear into rabbit holes.
    `),
    episodes: {
      heading: 'SO FAR',
      items: [
        {
          when: 'now',
          title: 'LiG',
          what: 'A palette that assigns each colour.',
          blurb: fold(`
            Green for structure, blue for reference, orange for
            action. Other tokens stay almost all grayscale.
            Highlighting uses it. So does the rest of the editor.
            Neovim, VS Code, terminal.
          `),
        },
        {
          when: 'now',
          title: 'poim',
          what: 'It turns a post into a share card.',
          blurb: fold(`
            I'm tired of getting inconsistent screenshots of posts.
            Built this to turn posts URL into an image, easily shareable.
          `),
        },
        {
          when: 'now',
          title: 'nothing',
          what: 'A joke I built like a product.',
          warn: 'It is still WIP.',
          blurb: fold(`
            I kept promising to ship something and then shipping
            nothing. So I shipped nothing.
          `),
        },
        {
          when: 'now',
          title: 'bibr',
          what: 'Easy simple TUI for BibTeX.',
          blurb: fold(`
            A keyboard-first BibTeX TUI. I set the product and the
            architecture. A coding agent wrote most of the code.
            It's a prototype but anyway it works.
          `),
        },
        {
          when: '2023–2026',
          title: 'Qlean',
          what: 'An Obsidian theme, my first work.',
          href: 'https://github.com/Fro-Q/Qlean',
          blurb: fold(`
            First serious CSS rabbit hole. Open source, 7k+ downloads.
          `),
        },
      ],
    },
    background: {
      heading: 'BACKGROUND',
      items: [
        {
          when: '2025—now',
          title: 'University of Chinese Academy of Sciences',
          blurb: fold(`
            Resources & Environment.
            Nanjing Institute of Geography and Limnology, CAS.
          `),
        },
        {
          when: '2021—2025',
          title: 'Wuhan University of Technology',
          blurb: 'Geographic Information Science.',
        },
      ],
    },
    principles: {
      heading: 'PRINCIPLES',
      items: [
        {
          title: 'Have a point.',
          blurb: fold(`
            Minimal, strange, soft, brutal. Any of those is fine.
            The language has to be on purpose.
          `),
        },
        {
          title: 'Consistency is a feature.',
          blurb: fold(`
            Type, spacing, and feedback should match. If they
            don't, that's a decision.
          `),
        },
        {
          title: 'Make the default work.',
          blurb: fold(`
            Few settings, open underneath. Nobody has to configure
            everything.
          `),
        },
        {
          title: 'Ship small.',
          blurb: fold(`
            Done is better than perfect.
          `),
        },
      ],
    },
    tools: {
      heading: 'TOOLS',
      groups: practice,
      after: fold(`
        I care more about where a tool runs out than about
        memorising its API. Longer notes on
      `),
      stack: 'stack',
    },
    also: {
      heading: 'ELSE',
      lead: 'Besides coding and building.',
      paras: [
        fold(`
          I listen to a lot of Cantonese pop, make coffee, and fuss
          over rooms and the things in them. I like keyboards.
          Something catches me and I fall into a hole that is way
          too specific.
        `),
        fold(`
          Most of them have nothing to do with what I am supposed to be doing.
          I like that.
        `),
      ],
    },
  },
  zh: {
    name: 'froQ',
    legal: '卿正烨',
    now: 'NOW',
    print: '打印 PDF',
    line: '学生 / 设计 & 代码',
    place: {
      text: '南京',
      doodle: 'map-pin',
    },
    reach: reachZh,
    hello: fold(`
      我写代码、做产品、阅读、写作，以及一头扎进兔子洞里。
    `),
    episodes: {
      heading: 'SO FAR',
      items: [
        {
          when: 'now',
          title: 'LiG',
          what: '给颜色分配角色的代码高亮调色盘',
          blurb: fold(`
            绿色代表结构，蓝色代表引用、橙色代表动作。
            其余 token 几乎全为灰度。不止于代码高亮，
            也用于编辑器的其他元素。Neovim、VS Code、
            终端的一致性设计。
          `),
        },
        {
          when: 'now',
          title: 'poim',
          what: '把帖子变成分享卡片。',
          blurb: fold(`
            我厌倦了帖子截图总是不统一。于是做了这个，把帖子 URL
            变成图片，方便分享。
          `),
        },
        {
          when: 'now',
          title: 'nothing',
          what: '一个我像做产品一样做的玩笑。',
          warn: '当前状态：WIP。',
          blurb: fold(`
            我一直承诺要发布点什么，结果总是什么也没发。
            我发布了 nothing。
          `),
        },
        {
          when: 'now',
          title: 'bibr',
          what: '轻量简单的 BibTeX TUI。',
          blurb: fold(`
            一个键盘优先的 BibTeX TUI。我负责产品与架构，
            大部分代码由 coding agent 完成。
            它还是原型，但能用，且我在用。
          `),
        },
        {
          when: '2023–2026',
          title: 'Qlean',
          what: '一个 Obsidian 主题，我的第一件作品。',
          href: 'https://github.com/Fro-Q/Qlean',
          blurb: fold(`
            第一个认真掉进 CSS 兔子洞。开源，7k+ 下载。
          `),
        },
      ],
    },
    background: {
      heading: 'BACKGROUND',
      items: [
        {
          when: '2025 至今',
          title: '中国科学院大学',
          blurb: fold(`
            资源与环境。中国科学院南京地理与湖泊研究所。
          `),
        },
        {
          when: '2021—2025',
          title: '武汉理工大学',
          blurb: '地理信息科学。',
        },
      ],
    },
    principles: {
      heading: 'PRINCIPLES',
      items: [
        {
          title: '要有观点。',
          blurb: fold(`
            极简、怪、柔软、狂野，都可以。设计语言必须是有意为之。
          `),
        },
        {
          title: '一致性是重要功能',
          blurb: fold(`
            字体、间距和反馈都应该一致。若不一致，那也得是有意决定。
          `),
        },
        {
          title: '让默认值好用',
          blurb: fold(`
            设置要少，但底层开放。没人该配置一切。
          `),
        },
        {
          title: '小步交付',
          blurb: fold(`
            完成好过完美。
          `),
        },
      ],
    },
    tools: {
      heading: 'TOOLS',
      groups: practiceZh,
      after: fold(`
        比起记住一个工具的 API，我更在意它的边界。
        技术栈的详细笔记另见
      `),
      stack: 'stack',
    },
    also: {
      heading: 'ELSE',
      lead: '除了写代码和做东西。',
      paras: [
        fold(`
          我听很多粤语流行，做咖啡，也爱折腾房间和里面的物件。
          我喜欢键盘。一旦我被什么东西「抓住」，
          我就会陷入一个极其具体的兔子洞里。
        `),
        fold(`
          它们大多和我本该做的事毫无关系。我喜欢这一点。
        `),
      ],
    },
  },
} as const

export function cvLangOf(value: unknown): CvLang {
  return value === 'zh' ? 'zh' : 'en'
}
