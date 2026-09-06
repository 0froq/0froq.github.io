<script setup lang="ts">
useHead({ title: 'Stack' })

type Level = 'fluent' | 'daily' | 'used' | 'learning' | 'curious'

interface StackTool {
  name: string
  story: string
  joke?: boolean
}

const groups: {
  level: Level
  label: string
  tools: StackTool[]
}[] = [
  {
    level: 'fluent',
    label: 'Fluent',
    tools: [
      {
        name: 'Markdown',
        story: `
          I first picked up Markdown in my 1st year of university,
          for writing, publishing and an unhealthy fascination with PKM.
          Years of Obsidian, Typora, and web work later,
          I'm comfortable not only with the syntax itself,
          but also with GFM, CommonMark and the wider MD tooling ecosystem.
        `,
      },
      {
        name: 'Keyboard Layouts',
        story: `
          I stopped collecting keyboards fairly quickly after
          discovering split 40% layouts;
          the rabbit hole I stayed in was mapping.
          Colemak-DH, Home Row Mods, layers and combos are now muscle memory,
          backed by a fairly opinionated system
          for where keys and symbols should be.
        `,
      },
      {
        name: '3×3 Cube Speed-solving',
        story: `
          I spent a mildly unreasonable part of my middle school years
          speed-solving the 3×3 cubes, with a 10s PB and 18s Ao5 at my peak.
          I also managed to drag most of my class into cubing for a while,
          which may be my earliest documented case of accidental community building.
        `,
        joke: true,
      },
    ],
  },
  {
    level: 'daily',
    label: 'Daily',
    tools: [
      {
        name: 'Vue.js',
        story: `
          Vue 3 was my entrance into frontend development:
          I found it while trying to build a personal site,
          before I properly knew JavaScript or HTML.
          Since then I've used Vue for everything from personal projects
          to coursework that probably shouldn't have been done in web dev.
        `,
      },
      {
        name: 'TypeScript',
        story: `
          I moved from JavaScript to TypeScript
          because I simply prefer software to tell me when I'm wrong.
          It is now the default for almost every project I start;
          I'm comfortable writing application code with it,
          while still learning how to design elegant generic
          and type-level APIs instead of merely satisfying the checker.
        `,
      },
      {
        name: 'CSS/UnoCSS',
        story: `
          CSS actually predates JavaScript in my own timeline:
          I first used SCSS to build an Obsidian theme
          before I started frontend development properly.
          These day I'm comfortable with responsive layouts, Flexbox,
          Grid and the usual pseudo-elements and states,
          while UnoCSS has become the layer I reach for most often
          when actually building interfaces.
        `,
      },
      {
        name: 'Git',
        story: `
          I used to do almost everything in Git manually from the CLI,
          including hunk-level staging and the occasional reset,
          revert or cherry-pick.
          These days I delegate more of the mechanical work to AI agents,
          but the workflow is still mine: atomic conventional commits,
          and a strong dislike of using \`chore\` as a drawer
          for changes nobody bothered to classify.
        `,
      },
      {
        name: 'Neovim',
        story: `
          I moved from VS Code to Neovim after getting tired of
          performance issues and moving my hands away from the home row
          just to navigate text.
          My config eventually grew into its own ecosystem,
          including a small plugin called \`headup.nvim\`;
          I currently write most code in Cursor
          for the AI layer, 
          but Neovim is still the editing model I actually prefer.
        `,
      },
      {
        name: 'AI Agents',
        story: `
          I've watched coding with AI evolve from copying errors into ChatGPT,
          through Tab completion and Copilot,
          into agents that can operate on entire repos.
          I now maintain my own prompts, commands and agent instructions,
          and have experimented with various harnesses,
          multi-agent orchestration and cross-session workflows;
          I understand the user-facing layer much better than the internals,
          and that boundary is something I'm still pushing on.
        `,
      },
      {
        name: 'Scraps',
        story: `
          Scraps exist because I once designed knowledge systems so elaborate
          that putting information into them became work.
          This is the opposite: thoughts, fragments and sometime
          completely useless words are allowed to exist without category,
          a future purpose or even the expectation that I will ever read them.
        `,
        joke: true,
      },
      {
        name: 'Deep Work',
        story: `
          I strongly prefer keeping one context loaded for hours at a time.
          A 6-hour session often feels cheaper than being interrupted twice;
          the expensive part is reconstructing the mental state
          after it has been evicted.
        `,
        joke: true,
      },
    ],
  },
  {
    level: 'used',
    label: 'Used',
    tools: [
      {
        name: 'Python',
        story: `
          Python was the first programming language I was formally taught,
          and I've written enough scripts, automation
          and fairly substantial data-processing code with it to know that
          I can use it.
          I just rarely want to:
          dynamic typing, indentation-as-syntax and parts of its tooling
          have never matched how I like software to feel.
        `,
      },
      {
        name: 'Personal Knowledge Management',
        story: `
          I spent a large part of my first two university years trying to
          organise knowledge properly, eventually building an Obsidian system
          around atomic Notes, Concepts and higher-level Topics.
          The system is gone, but the lesson stayed:
          the more aggressively information is classified,
          the easier it is to flatten the context that originally gave it meaning.
        `,
        joke: true,
      },
      {
        name: 'Writing',
        story: `
          I used to write more frequently, mostly personal and reflective essays
          rather than technical pieces.
          Woolf gave me an interest in stream-of-consciousness,
          Shi Tiesheng pushed me towards plainer and more restrained prose,
          while Camus affected the questions I ask more than the sentences I write.
        `,
        joke: true,
      },
      {
        name: 'Minecraft',
        story: `
          I've been playing Minecraft since the 1.7 era,
          almost entirely in survival.
          I'm much more interested in building believable spaces, farming and 
          slow modded play than in redstone,automation and competitive PvP.
        `,
        joke: true,
      },
      {
        name: 'Pour Over',
        story: `
          I started making pour-over coffee a couple of years ago,
          but never turned into much of a ceremony.
          I grind my own beans and have settled into a brewing habit
          of questionable theoretical validity;
          fortunately, my palate is not sensitive enough to file a formal complaint.
        `,
        joke: true,
      },
    ],
  },
  {
    level: 'learning',
    label: 'Learning',
    tools: [
      {
        name: 'Nuxt',
        story: `
          I found Nuxt through the wider Vue ecosystem and was drawn to things
          like auto-imports, server APIs and Nitro
          long before I actually needed most of them.
          I'm now migrating my site from VitePress to Nuxt Content,
          so this is no longer something I merely admire from a distance.
        `,
      },
      {
        name: 'Visual Design',
        story: `
          Most of what I know about visual design still comes from taste rather
          than formal training.
          I tend towards restrained colour, grayscale, serif typography
          and small accents,
          and I'm increasingly interested in turning that intuition into systems.
        `,
        joke: true,
      },
      {
        name: 'Espresso',
        story: `
          I recently moved from occasional pour-over to making three or four
          espresso shots a day on a small home machine.
          Extraction time, ratios, distribution, tamping and milk are all still
          very much in the "learning what I'm doing" phase.
        `,
        joke: true,
      },
      {
        name: 'Podcasting',
        story: `
          I started a podcast because I wanted another medium for thinking out loud,
          but there are not many published episodes yet.
          The part I already know I enjoy is expression;
          the craft around it-better topics, scripts, editing, guests and
          perhaps video-is still something I need to build deliberately.
        `,
        joke: true,
      },
    ],
  },
  {
    level: 'curious',
    label: 'Curious',
    tools: [
      {
        name: 'iOS Development',
        story: `
          I haven't written Swift yet. I live almost entirely inside Apple's
          hardware and software ecosystem,
          and building something native for the platforms I use every day
          feels less like an "if" than a "when".
        `,
      },
      {
        name: 'Game Design',
        story: `
          What interests me about games is not engines or rendering so much
          as rules, interactions and the behaviour they produce.
          I'm especially interested in how small mechanical constraints
          can create social dynamics, mistakes, conflict and comedy between players.
        `,
        joke: true,
      },
      {
        name: 'Creative Coding',
        story: `
          I'm drawn to the point where code stops being infrastructure and
          starts producing a visual language of its own.
          Procedural graphics, strict pixel-based systems and
          generative visual elements all appeal to me,
          although for now I'm still much closer to experimenting with hand-drawn
          web details than making actual generative art.
        `,
        joke: true,
      },
    ],
  },
]

function stackStory(text: string): string {
  return text.replace(/\s+/g, ' ').trim()
}

const { data: storyAst } = await useAsyncData('stack-stories', async () => {
  const { parseMarkdown } = await import('@nuxtjs/mdc/runtime')
  const entries = await Promise.all(
    groups.flatMap(group =>
      group.tools.map(async (tool) => {
        const ast = await parseMarkdown(stackStory(tool.story), {
          toc: false,
          contentHeading: false,
        })
        return [`${group.level}:${tool.name}`, ast] as const
      }),
    ),
  )
  return Object.fromEntries(entries)
})
</script>

<template>
  <section
    un-box-border
    un-mx-auto
    un-w="[calc(100%-3rem)] max-md:[calc(100%-2rem)]"
    un-max-w-5xl
    un-pt="[clamp(2.25rem,8vh,4.5rem)]"
    un-pb-20
  >
    <header>
      <h1
        un-m-0
        un-font-serif
        un-text="[clamp(2.2rem,4.6vw,3rem)]"
        un-font-medium
        un-tracking-tighter
        un-leading-tight
        class="text-balance"
      >
        Stack
      </h1>
      <InkRule
        seed="stack"
        un-block
        un-max-w-20
        un-mt-2.5
      />
      <!-- <p
        un-mt-6
        un-max-w-xl
        un-font-serif
        un-text="[clamp(1.05rem,1.9vw,1.22rem)] ink/80"
        un-italic
        un-leading-relaxed
      >
        what I reach for, what I have held, what I am still learning to hold.
      </p> -->
    </header>


    <div
      un-mt-10
      un-grid
      un-items-start
      un-gap="[clamp(1.75rem,4vw,3.25rem)] max-md:6"
      un-grid-cols="[minmax(0,1fr)_minmax(10rem,13rem)] max-md:1"
      un-max-md:flex
      un-max-md:flex-col
    >
      <ul
        un-m-0
        un-list-none
        un-max-w-xl
        un-pl-6
        aria-label="Stack by habit"
      >
        <li
          v-for="group in groups"
          :key="group.level"
          class="stack-li"
          un-py-2.5
        >
          <InkFold
            :seed="`stack-${group.level}`"
            :label="group.label"
            :panel-id="`stack-fold-${group.level}`"
            un-m-0
            un-text="left [clamp(1.2rem,2.2vw,1.4rem)] ink"
            un-font-serif
            un-leading-snug
          >
            <template #trigger>
              <span
                un-block
                un-tracking-tight
              >{{ group.label }}</span>
              <span
                un-mt-1.5
                un-block
                un-text="[1rem]"
                un-italic
                un-leading-relaxed
                un-text-pretty
                un-opacity-70
              >
                <template
                  v-for="(tool, i) in group.tools"
                  :key="tool.name"
                >
                  <span
                    v-if="i"
                    aria-hidden="true"
                    un-inline-block
                    un-px-2.5
                    un-not-italic
                    un-opacity-35
                    un-select-none
                  >·</span>
                  <span :class="tool.joke ? 'stack-wry' : undefined">{{ tool.name }}</span>
                </template>
              </span>
            </template>
            <div un-mt-3>
              <dl
                un-m-0
                un-flex
                un-flex-col
                un-gap-5
              >
                <div
                  v-for="tool in group.tools"
                  :key="tool.name"
                  un-flex
                  un-flex-col
                  un-gap-1.5
                >
                  <dt
                    un-m-0
                    un-font-serif
                    un-font-medium
                    un-tracking-tight
                    un-text="[1.05rem] ink"
                    :class="tool.joke ? 'stack-wry' : undefined"
                  >{{ tool.name }}</dt>
                  <dd
                    un-m-0
                    un-max-w="[36rem]"
                    un-font-serif
                    un-text="[0.98rem] muted"
                    un-leading-relaxed
                    un-text-pretty
                  >
                    <MDCRenderer
                      v-if="storyAst?.[`${group.level}:${tool.name}`]?.body"
                      :body="storyAst[`${group.level}:${tool.name}`]!.body"
                      tag="div"
                      unwrap="p"
                      un-prose="~"
                    />
                  </dd>
                </div>
              </dl>
            </div>
          </InkFold>
        </li>
      </ul>

      <aside
        un-pt-1.5
        un-font-serif
        un-text="[0.95rem] colored-ink"
        un-italic
        un-max-md:order-first
        un-max-md:flex
        un-max-md:flex-wrap
        un-max-md:gap-x-5
        un-max-md:gap-y-3
        aria-hidden="true"
      >
        <p
          un-m-0
          un-mb-4
          un-opacity-85
          un-max-md:mb-0
        >
          fluent → curious
        </p>
        <p
          un-m-0
          un-mb-4
          un-opacity-85
          un-max-md:mb-0
        >
          no ranks
        </p>
      </aside>
    </div>
  </section>
</template>

<style scoped>
.stack-wry {
  color: var(--wry);
  display: inline-block;
  padding-inline: 0.08em 0.32em;
  margin-inline: -0.08em -0.32em;
}

@supports (background-clip: text) or (-webkit-background-clip: text) {
  .stack-wry:hover {
    background-image:
      linear-gradient(
        105deg,
        transparent 0 42%,
        color-mix(in oklab, var(--wry) 42%, white) 50%,
        transparent 58% 100%
      ),
      linear-gradient(var(--wry), var(--wry));
    background-size: 240% 100%, 100% 100%;
    background-position: 140% 0, 0 0;
    background-repeat: no-repeat;
    background-clip: text;
    -webkit-background-clip: text;
    color: transparent;
    -webkit-text-fill-color: transparent;
    animation: stack-wry-gleam 2.2s linear infinite;
  }
}

@keyframes stack-wry-gleam {
  0% {
    background-position: 140% 0, 0 0;
  }

  28% {
    background-position: -40% 0, 0 0;
  }

  100% {
    background-position: -40% 0, 0 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .stack-wry,
  .stack-wry:hover {
    animation: none;
    background-image: none;
    color: var(--wry);
    -webkit-text-fill-color: unset;
  }
}
</style>
