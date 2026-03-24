<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import LinkUnderline from './LinkUnderline.vue'
import ProgressBarHeader from './ProgressBarHeader.vue'
import QCheckbox from './QCheckbox.vue'
import TooltipPostInfo from './TooltipPostInfo.vue'

// TODO: Abstract this component

const props = defineProps<{
  /**
   * Posts to be displayed.
   */
  posts: Record<string, any>[]
  /**
   * Boolean to control grouping by year.
   */
  groupByYear?: boolean
  /**
   * Function to format the year.
   */
  yearFormatter?: (year: string) => string
  /**
   * Boolean to control the visibility of the excerpt toggle.
   */
  showExcerptToggle?: boolean
  /**
   * Title of the section.
   */
  title: string
  /**
   * Boolean to control the visibility of the introduction.
   */
  showIntro?: boolean
  /**
   * Introduction.
   */
  intro?: string
}>()

const { t, d, locale } = useI18n({
  messages: {
    en: {
      excerptToggle: {
        show: 'showing',
        hide: 'hiding',
        prefix: 'Excerpt',
        suffix: '',
      },
    },
    zh: {
      excerptToggle: {
        show: '显示',
        hide: '隐藏',
        prefix: '已',
        suffix: '摘要',
      },
    },
  },
})

const excerptVisible = ref(false)
</script>

<template>
  <ProgressBarHeader
    v-if="props.title"
    :id="props.title"
    :title="props.title"
    :intro="props.intro ?? ''"
  >
    <template #default>
      <div
        un-flex="~ row"
        un-items-center
        un-gap-4
      >
        <div
          v-if="showExcerptToggle"
          un-flex="~ row"
          un-items-center
        >
          <QCheckbox
            :id="`${props.title}-excerpt`"
            :model-value="excerptVisible"
            :label-prefix="t('excerptToggle.prefix')"
            :label-text="{ checked: t('excerptToggle.show'), unchecked: t('excerptToggle.hide') }"
            :label-suffix="t('excerptToggle.suffix')"
            @update:model-value="excerptVisible = $event"
          />
        </div>
      </div>
    </template>
  </ProgressBarHeader>

  <div
    un-flex="~ col"
    un-items-end
    un-w-full
  >
    <div
      v-for="year in props.groupByYear && props.posts.length
        ? Array.from(new Set(props.posts.map(post => new Date(post.created).getFullYear().toString())))
          .sort((a, b) => parseInt(b) - parseInt(a))
        : ['-']"
      :key="year"
      un-py-10
      un-flex="~ col"
      un-gap-4
      un-w-full
    >
      <div
        un-text="stone-600 dark:stone-400 2xl"
        :style="locale === 'zh' ? { writingMode: 'vertical-lr' } : {}"
        un-px-4
        un-text-3xl
        un-sticky
        un-top-50
        un-pt-10
        un-z-2
        un-w-fit
      >
        {{ year !== '-' ? props.yearFormatter ? props.yearFormatter(year) : year : '' }}
      </div>
      <div
        v-for="post in props.groupByYear && props.posts.length > 0
          ? props.posts.filter(p => {
            return new Date(p.created).getFullYear().toString() === year
          })
            .sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime())
          : [...props.posts].sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime())"
        :key="post.url"
        un-flex="~ col"
        un-gap-2
        un-items-end
        un-relative
        un-p-2
        un-ml-15
      >
        <div
          un-flex="~ row"
          un-items-center
          un-max-w-full
          un-gap-2
        >
          <div
            v-if="post.frontmatter.status === 'void'"
            un-text="rose-600 dark:rose-400"
            un-font="mono italic"
          >
            {{ post.frontmatter.status }}
          </div>
          <div
            v-if="post.frontmatter.status === 'draft'"
            un-text="sky-600 dark:sky-400"
            un-font="mono italic"
          >
            {{ post.frontmatter.status }}
          </div>
          <div
            v-if="locale !== (post.frontmatter.lang || 'zh') && (post.frontmatter.lang || 'zh')"
            un-text="amber-600 dark:amber-400"
            un-font="mono italic"
          >
            {{ post.frontmatter.lang || 'zh' }}
          </div>
          <div
            un-text="stone-500 dark:stone-400 base"
            un-whitespace-nowrap
          >
            {{ d(new Date(post.created), 'withoutYear') }}
          </div>
          <div
            un-text="stone-700 dark:stone-300 hover:stone-950 dark:hover:stone-50 xl"
            un-text-align="right"
            un-overflow-hidden
          >
            <LinkUnderline
              :href="post.url"
              :text="post.title"
              un-before="bg-emerald-600 dark:bg-emerald-400"
            >
              <template #tooltip>
                <TooltipPostInfo :post="post" />
              </template>
            </LinkUnderline>
          </div>
        </div>
        <!-- Post excerpt -->
        <div
          v-show="excerptVisible && post.excerpt"
          un-text-stone-500
          class="markdown-rendered"
          v-html="post.excerpt?.replace(/<p>|<\/p>/g, '')"
        />
      </div>
    </div>
  </div>
  <slot
    name="empty-message-addons"
  />
</template>
