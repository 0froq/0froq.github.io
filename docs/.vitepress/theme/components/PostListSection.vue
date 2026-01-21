<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { renderMdInline } from '../../utils/renderMdInline'
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
  /**
   * Function to format the date.
   */
  dateFormatter?: (date: Date) => string
}>()

const { t, locale } = useI18n({
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
  <un-page-content
    un-min-h-100vh
    un-block
  >
    <ProgressBarHeader
      v-if="props.title"
      :id="props.title"
      :title="props.title"
      :intro="props.showIntro ? props.intro : ''"
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
          un-text="neutral-600 dark:neutral-400 2xl"
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
          >
            <div
              un-text="neutral-500 dark:neutral-400 base"
              un-mr-2
              un-whitespace-nowrap
            >
              {{ dateFormatter
                ? dateFormatter(post.created) : new Date(post.created).toLocaleDateString(locale, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                }) }}
            </div>
            <LinkUnderline
              :href="post.url"
              :text="post.title"
              :tooltip="true"
              :tooltip-text="post.title"
              un-text="neutral-700 dark:neutral-300 hover:neutral-950 dark:hover:neutral-50 2xl"
              un-before="bg-emerald-600 dark:bg-emerald-600/80"
              un-text-align="right"
            >
              <template #tooltipAddons>
                <TooltipPostInfo :post="post" />
              </template>
            </LinkUnderline>
          </div>
          <!-- Post excerpt -->
          <div
            v-show="excerptVisible && post.excerpt"
            un-text-neutral-500
            class="markdown-rendered"
            v-html="post.excerpt?.replace(/<p>|<\/p>/g, '')"
          />
        </div>
      </div>
    </div>
    <slot
      name="empty-message-addons"
    />
  </un-page-content>
</template>
