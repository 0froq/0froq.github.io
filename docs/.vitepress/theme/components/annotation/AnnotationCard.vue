<script setup lang="ts">
import type { ResolvedAnnotation } from '../../types/annotation'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import PaperEdgeSurface from '@/ui/paper/PaperEdgeSurface.vue'
import { paperEdgeFromId } from '~/composables/usePaperEdge'
import { renderMdBlock } from '~/utils/renderMdBlock'

const props = withDefaults(defineProps<{
  /** 批注列表（同一卡片内渲染全部；单条传 [ann]） */
  anns: ResolvedAnnotation[]
  /** 回复列表（挂在首条批注的线程下） */
  replies?: ResolvedAnnotation[]
  /** 当前高亮 id（hover 正文/卡片联动；在 anns 内则卡片高亮） */
  activeCommentId?: string | null
  /** 正文截断（Rail 3 行 + 更多；List 传 false 全文） */
  truncate?: boolean
  /** 显示引用快照 + 回到原文箭头（List 模式） */
  showAnchor?: boolean
  /** 紧凑模式（List 小头像） */
  compact?: boolean
  /** 纸面胶带 backdrop blur；叠卡场景可关 */
  backdropBlur?: boolean
}>(), {
  replies: () => [],
  activeCommentId: null,
  truncate: true,
  showAnchor: false,
  compact: false,
  backdropBlur: true,
})

const emit = defineEmits<{
  /** 点击某条批注/回复 → 打开回复浮层（el = 点击目标，用于定位浮层） */
  reply: [ann: ResolvedAnnotation, el: HTMLElement]
  /** 回到原文（箭头图标点击） */
  select: [ann: ResolvedAnnotation]
  /** 卡片 hover 状态（Rail 联动正文高亮） */
  hover: [commentId: string | null]
}>()

const { t } = useI18n({ useScope: 'global' })

/** activeCommentId 是否属于本卡片（hover 正文/卡片联动高亮） */
const isActive = computed(() =>
  props.anns.some(a => a.commentId === props.activeCommentId),
)

const edgeId = computed(() => props.anns[0]?.commentId ?? 'annotation-card')
const edge = computed(() => paperEdgeFromId(edgeId.value))

function formatTime(iso: string): string {
  const date = new Date(iso)
  const days = Math.floor((Date.now() - date.getTime()) / 86400000)
  if (days <= 0)
    return t('time.today')
  if (days < 7)
    return t('time.daysAgo', { count: days }, days)
  const month = date.getMonth() + 1
  const day = date.getDate()
  if (date.getFullYear() === new Date().getFullYear())
    return t('time.thisYear', { month, day })
  return t('time.full', { year: date.getFullYear(), month, day })
}

function statusLabel(state: ResolvedAnnotation['matchState']): string {
  if (state === 'exact' || state === 'article')
    return ''
  return t(`status.${state}`)
}

// ---- 正文截断（truncate 模式）----
const expanded = ref<Set<string>>(new Set())

const isExpanded = (id: string) => expanded.value.has(id)

function bodyPreview(ann: ResolvedAnnotation): string {
  return ann.data.text.length > 90 ? `${ann.data.text.slice(0, 90)}…` : ann.data.text
}

const needsTruncate = (ann: ResolvedAnnotation): boolean => ann.data.text.length > 90

function toggleExpand(id: string) {
  const next = new Set(expanded.value)
  if (next.has(id))
    next.delete(id)
  else
    next.add(id)
  expanded.value = next
}

// ---- 回复条目 hover（粒度视觉反馈）----
const hoveredReplyId = ref<string | null>(null)

const sortedReplies = computed(() =>
  [...props.replies].sort((a, b) =>
    new Date(a.data.createdAt).getTime() - new Date(b.data.createdAt).getTime(),
  ),
)

function hoverReply(reply: ResolvedAnnotation) {
  hoveredReplyId.value = reply.commentId
}

function clearReplyHover() {
  hoveredReplyId.value = null
}

/** 渲染回复正文：
 * 新格式（replyTo 快照）→ 动态生成 `> 引用` + `@作者` 前缀（text 是纯正文）
 * 旧格式（text 内嵌引用）→ 原样 markdown 渲染（兼容历史数据） */
function renderReplyBody(reply: ResolvedAnnotation): string {
  if (reply.data.replyTo) {
    const r = reply.data.replyTo
    return renderMdBlock(`> ${r.text}\n\n@${r.author} ${reply.data.text}`)
  }
  return renderMdBlock(reply.data.text)
}
</script>

<template>
  <div
    class="annotation-card"
    :class="{ 'annotation-card-active': isActive }"
    :style="{ '--card-tilt': edge.tilt }"
    un-relative
    un-isolation-isolate
    un-transition
    un-ease-in-out
    un-p-2
    un-pt-4
    @mouseenter="emit('hover', anns[0]?.commentId ?? null)"
    @mouseleave="emit('hover', null)"
  >
    <PaperEdgeSurface
      :edge-id="edgeId"
      :backdrop-blur="backdropBlur"
      un-fill="neutral-50/60 dark:neutral-800/60"
      un-stroke="neutral-400 dark:neutral-700"
    />

    <!-- 内容直接叠在纸面上；回复不单独包纸边 -->
    <div
      un-relative
      un-z-1
    >
      <!-- 批注列表：同一卡片内全部批注，相同样式遍历渲染 -->
      <div
        v-for="item in anns"
        :key="item.commentId"
        un-p-2
        un-rounded-xs
        un-transition
        un-ease-in-out
        un-hover="translate-x-2"
        un-cursor-pointer
        @click.stop="emit('reply', item, $event.currentTarget as HTMLElement)"
      >
        <!-- 作者行 -->
        <div
          un-flex
          un-items-center
          un-gap-2
          un-mb-1
        >
          <img
            v-if="item.author.avatarUrl"
            :src="item.author.avatarUrl"
            un-w-6
            un-h-6
            un-shrink-0
            un-border="1 solid neutral-200 dark:neutral-700"
            un-rounded-full
          >
          <span
            v-else
            un-w-6
            un-h-6
            un-shrink-0
            un-border="1 solid neutral-200 dark:neutral-700"
            un-rounded-full
            un-bg="neutral-200 dark:neutral-700"
            un-flex
            un-items-center
            un-justify-center
            un-text="neutral-500"
          >
            {{ item.author.login.slice(0, 1).toUpperCase() }}
          </span>
          <span
            un-text-xs
            un-font-semibold
            un-text="neutral-700 dark:neutral-300"
          >
            {{ item.author.login }}
          </span>
          <span
            un-text="xs neutral-400 dark:neutral-500"
          >
            · {{ formatTime(item.data.createdAt) }}
          </span>
          <span
            v-if="item.matchState !== 'article' && statusLabel(item.matchState)"
            un-text="xs amber-600 dark:amber-400"
            un-ml-auto
          >
            {{ statusLabel(item.matchState) }}
          </span>
        </div>

        <!-- 引用快照（List 模式）+ 回到原文箭头 -->
        <div
          v-if="showAnchor && item.data.anchor"
          un-text-xs
          un-text="neutral-400 dark:neutral-600"
          un-border="l-2 neutral-400 dark:neutral-600"
          un-pl-2
          un-mb-1
          un-ml-8
          un-leading-relaxed
          un-flex
          un-items-center
          un-justify-between
          un-gap-4
        >
          <span>
            {{ item.data.anchor.selected.slice(0, 80) }}{{ item.data.anchor.selected.length > 80 ? '…' : '' }}
          </span>
          <un-i-solar-arrow-to-top-left-line-duotone
            v-if="item.domRange"
            un-cursor-pointer
            un-transition
            un-text="xs neutral-400 hover:neutral-600 dark:neutral-600 dark:hover:neutral-400"
            @click.stop="emit('select', item)"
          />
        </div>

        <!-- 批注正文：truncate 模式 3 行截断 + 行内展开，否则全文 -->
        <p
          un-ml-8
          un-text-sm
          un-text="neutral-700 dark:neutral-300"
          un-leading-relaxed
          un-whitespace-pre-wrap
        >
          <template v-if="truncate">
            {{ isExpanded(item.commentId) ? item.data.text : bodyPreview(item) }}
            <button
              v-if="needsTruncate(item)"
              un-text="xs neutral-400 hover:neutral-600 dark:neutral-500 dark:hover:neutral-300"
              un-ml-1
              @click.stop="toggleExpand(item.commentId)"
            >
              {{ isExpanded(item.commentId) ? t('expand.collapse') : t('expand.more') }}
            </button>
          </template>
          <template v-else>
            {{ item.data.text }}
          </template>
        </p>
      </div>

      <!-- 回复列表（缩进 + 竖线；点击回复该回复） -->
      <div
        v-for="reply in sortedReplies"
        :key="reply.commentId"
        un-ml-10
        un-p-1
        un-rounded-xs
        un-cursor-pointer
        un-transition
        un-ease-in-out
        un-hover="translate-x-2"
        @mouseenter="hoverReply(reply)"
        @mouseleave="clearReplyHover"
        @click.stop="emit('reply', reply, $event.currentTarget as HTMLElement)"
      >
        <div
          un-flex
          un-items-center
          un-gap-1.5
          un-mb-0.5
        >
          <img
            v-if="reply.author.avatarUrl"
            :src="reply.author.avatarUrl"
            un-w-4
            un-h-4
            un-shrink-0
            un-border="1 solid neutral-200 dark:neutral-700"
            un-rounded-full
          >
          <span
            un-text="xs neutral-600 dark:neutral-300"
            un-font-medium
          >
            {{ reply.author.login }}
          </span>
          <span
            un-text="xs neutral-400 dark:neutral-500"
          >
            · {{ formatTime(reply.data.createdAt) }}
          </span>
        </div>
        <div
          class="annotation-reply-body"
          un-ml-6
          un-text="xs neutral-700 dark:neutral-300"
          un-leading-relaxed
          v-html="renderReplyBody(reply)"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ---- 便签卡：SVG 纸边 + 稳定随机倾角 ---- */
.annotation-card {
  --uno: 'relative bg-transparent';
  transform: rotate(var(--card-tilt, 0deg)) translateX(0);
  transform-origin: 50% 0;
}

.annotation-card:hover,
.annotation-card-active {
  transform: rotate(var(--card-tilt, 0deg)) translateX(0.5rem);
}

/* 描边跟纸边走（同一 displacement）；hover 加深 */
.annotation-card:hover :deep(.paper-edge-fill),
.annotation-card-active :deep(.paper-edge-fill) {
  --uno: 'stroke-neutral-700';
  --uno: 'dark:stroke-neutral-400';
}
</style>
