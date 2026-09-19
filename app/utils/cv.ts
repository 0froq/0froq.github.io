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
    nowBlurb: fold(`
      Building a cross-tool visual system, shipping small experiments,
      refining an agent-heavy workflow, keeping this site,
      and strugling on my master's degree.
    `),
    place: {
      text: 'Nanjing, China',
      doodle: 'map-pin',
    },
    reach,
    hello: {
      lines: [
        fold(`
          I code, build, read, write, and disappear into rabbit holes.
        `),
        fold(`
          Most of the time I care a little too much about aesthetics,
          visual coherence, and how things feel to use. I like it when
          design and development are the same job. Open source, if I
          can get away with it.
        `),
      ],
    },
    facts: {
      heading: 'IN SHORT',
      items: [
        {
          label: 'SHIPPED',
          value: 'n',
          note: 'public things built and kept alive',
        },
        {
          label: 'STATUS',
          value: 'still',
          note: 'master’s student',
        },
        {
          label: 'PROOF',
          value: '7k+',
          note: 'Qlean downloads',
        },
      ],
    },
    episodes: {
      heading: 'SO FAR',
      items: [
        {
          when: 'now',
          title: 'LiG',
          what: 'A visual system for the editor.',
          blurb: fold(`
            A cross-tool visual system for the coding environment:
            custom palette, deliberately restrained semantic
            highlighting. Most code stays neutral; colour is for
            structure, actions, and references — not because it can
            be coloured. Neovim, VS Code, terminal.
          `),
        },
        {
          when: 'now',
          title: 'poim',
          what: 'It turns a post into a share card.',
          blurb: fold(`
            Screenshots made the same kind of content look different
            every time. Paste an X post URL and poim normalises it
            into a consistent card — PNG or a Web Component. Live,
            and part of my own daily workflow. Nuxt, TypeScript,
            Cloudflare.
          `),
        },
        {
          when: 'now',
          title: 'nothing',
          what: 'A joke product, taken seriously.',
          warn: 'It is still WIP.',
          blurb: fold(`
            I kept promising to ship something and shipping nothing.
            So I made nothing — a deliberately pointless product,
            overcrafted with complete sincerity. Art direction, copy,
            creative frontend, and actually shipping the joke.
          `),
        },
        {
          when: 'now',
          title: 'bibr',
          what: 'It finds the citation you already know.',
          blurb: fold(`
            I know roughly which paper I need, but not its citation
            key. A keyboard-first BibTeX TUI for that. I directed the
            product, architecture, and acceptance; most of the
            implementation went to a coding agent. Prototype, usable.
          `),
        },
        {
          when: '2023–2026',
          title: 'Qlean',
          what: 'An Obsidian theme that grew into UI.',
          href: 'https://github.com/Fro-Q/Qlean',
          blurb: fold(`
            First serious CSS rabbit hole: an Obsidian theme that
            grew from restyling into interface work — navigation
            cues, focus modes, custom controls, and a lot of
            user-facing configuration. Open source. I barely use
            Obsidian now, so I am not pretending it is actively
            maintained.
          `),
        },
      ],
    },
    background: {
      heading: 'BACKGROUND',
      lead: fold(`
        Formal training in GIS and environmental science. Programming
        showed up as a tool for that work; the tools became the point.
      `),
      items: [
        {
          when: '2025—2028',
          title: 'University of Chinese Academy of Sciences',
          what: 'A professional master’s in environment.',
          blurb: fold(`
            Resources & Environment (Environmental Engineering).
            Nanjing Institute of Geography and Limnology, CAS.
          `),
        },
        {
          when: '2021—2025',
          title: 'Wuhan University of Technology',
          what: 'A bachelor’s in GIS.',
          blurb: 'Geographic Information Science.',
        },
      ],
    },
    principles: {
      heading: 'PRINCIPLES',
      items: [
        {
          title: 'Coherence over decoration.',
          blurb: fold(`
            A product should have something to say visually, and say
            it consistently.
          `),
        },
        {
          title: 'Capability without coercion.',
          blurb: fold(`
            Software can be deep without forcing every feature into
            the way. Unused capability is fine. Forced capability is
            not.
          `),
        },
        {
          title: fold(`
            Opinionated on the surface, hackable underneath.
          `),
          blurb: fold(`
            Strong defaults, a restrained settings UI, and a system
            open enough for people to make it theirs.
          `),
        },
        {
          title: 'AI can execute; I decide.',
          blurb: fold(`
            Agents for implementation and exploration. Not for the
            problem, the product direction, the constraints, or the
            judgment.
          `),
        },
      ],
    },
    tools: {
      heading: 'TOOLS',
      groups: practice,
      after: fold(`
        I care more about a tool's boundaries than memorising its
        API. Longer notes on
      `),
      stack: 'stack',
    },
    also: {
      heading: 'ELSE',
      lead: 'Besides coding and building.',
      paras: [
        fold(`
          I listen to a lot of Cantonese pop, make coffee, and care
          a little too much about spaces and the things in them. I
          like keyboards, and I have a habit of falling into oddly
          specific rabbit holes whenever something catches my
          attention.
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
    nowBlurb: fold(`
      在做一套跨工具的视觉系统，把小实验送出去，打磨一套偏 agent
      的开发流程，并维护这个网站。
    `),
    place: {
      text: '南京',
      doodle: 'map-pin',
    },
    reach: reachZh,
    hello: {
      lines: [
        fold(`
          我写代码、做东西、读书、写作，然后钻进兔子洞。
        `),
        fold(`
          多半时候我对审美、视觉自洽、以及东西用起来的感觉，在意得
          有点过头。我喜欢设计和开发是同一份工作。开源也行，如果我
          能混进去的话。
        `),
      ],
    },
    facts: {
      heading: 'IN SHORT',
      items: [
        {
          label: '做出的',
          value: 'n',
          note: '做出来、还在用的公开项目',
        },
        {
          label: '状态',
          value: '仍是',
          note: '在读硕士',
        },
        {
          label: '证据',
          value: '7k+',
          note: 'Qlean 下载',
        },
      ],
    },
    episodes: {
      heading: 'SO FAR',
      items: [
        {
          when: 'now',
          title: 'LiG',
          what: '给编码环境做的视觉系统。',
          blurb: fold(`
            给编码环境用的跨工具视觉系统：自定义色板，语义高亮故意
            克制。代码大多保持中性；颜色留给结构、动作和引用，而不
            是因为能上色就上色。Neovim、VS Code、终端。
          `),
        },
        {
          when: 'now',
          title: 'poim',
          what: '把帖子收成同一张分享卡片。',
          blurb: fold(`
            截图会让同一类内容每次长得都不一样。贴一个 X 帖子链接，
            poim 收成同一张卡片——PNG，或嵌成 Web Component。已经
            上线，我也在自己的日常里用。Nuxt、TypeScript、
            Cloudflare。
          `),
        },
        {
          when: 'now',
          title: 'nothing',
          what: '一件故意没用、却认真做的产品。',
          warn: '还在做，WIP。',
          blurb: fold(`
            我老是答应要交出东西，然后什么也没交。于是做了
            nothing——一件故意没用的产品，用十足的认真把它做过头。
            练习美术指导、文案、creative frontend，以及真的把笑话
            送出去。
          `),
        },
        {
          when: 'now',
          title: 'bibr',
          what: '用来找你已经知道的那篇文献。',
          blurb: fold(`
            我大概知道要哪篇论文，但不知道它的 citation key。为此
            做的键盘优先 BibTeX TUI。产品、架构和验收是我定的；实现
            大多交给 coding agent。原型，能用。
          `),
        },
        {
          when: '2023–2026',
          title: 'Qlean',
          what: '从主题长成界面的 Obsidian 工作。',
          href: 'https://github.com/Fro-Q/Qlean',
          blurb: fold(`
            认真掉进 CSS 的第一个兔子洞：从改外观长成界面工作——导
            航线索、专注模式、自定义控件，还有给用户看的配置。开源。
            我已经不怎么用 Obsidian，所以也不假装它还在积极维护。
          `),
        },
      ],
    },
    background: {
      heading: 'BACKGROUND',
      lead: fold(`
        科班是 GIS 和环境科学。编程先是做这个用的工具；后来工具本
        身成了重点。
      `),
      items: [
        {
          when: '2025—2028',
          title: '中国科学院大学',
          what: '在读环境方向的专业硕士。',
          blurb: fold(`
            资源与环境（环境工程）。中国科学院南京地理与湖泊研究所。
          `),
        },
        {
          when: '2021—2025',
          title: '武汉理工大学',
          what: '本科读的是地理信息科学。',
          blurb: '地理信息科学。',
        },
      ],
    },
    principles: {
      heading: 'PRINCIPLES',
      items: [
        {
          title: '自洽，而不是装饰。',
          blurb: fold(`
            一个产品在视觉上得有话要说，并且说得前后一致。
          `),
        },
        {
          title: '有能力，但不强迫。',
          blurb: fold(`
            软件可以很深，不必把每个功能塞进使用方式里。闲置的能力
            没关系。被强迫的能力不行。
          `),
        },
        {
          title: '表面上有主张，底下可改。',
          blurb: fold(`
            强默认、克制的设置界面，底层仍开放到别人能把它变成自己
            的。
          `),
        },
        {
          title: 'AI 可以执行；决定是我的。',
          blurb: fold(`
            实现和探索可以交给 agent。问题、产品方向、约束和判断不
            行。
          `),
        },
      ],
    },
    tools: {
      heading: 'TOOLS',
      groups: practiceZh,
      after: fold(`
        我更在意摸清工具的边界，而不是背它的 API。更长的笔记在
      `),
      stack: 'stack',
    },
    also: {
      heading: 'ALSO',
      lead: '写代码、做东西之外。',
      paras: [
        fold(`
          Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          Integer vitae nisl sit amet nisi tincidunt tincidunt.
        `),
        fold(`
          Sed do eiusmod tempor incididunt ut labore et dolore magna
          aliqua. Ut enim ad minim veniam, quis nostrud exercitation
          ullamco laboris.
        `),
        fold(`
          Duis aute irure dolor in reprehenderit in voluptate velit
          esse cillum dolore eu fugiat nulla pariatur. Excepteur
          sint occaecat cupidatat non proident.
        `),
      ],
    },
  },
} as const

export function cvLangOf(value: unknown): CvLang {
  return value === 'zh' ? 'zh' : 'en'
}
