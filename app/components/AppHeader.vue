<script setup lang="ts">
const { section, publication, isArticle, articleTitle } = useIssueFrame()
const { titleRevealed, progressWidth, headerRef, progressTrackRef }
  = useIssueArticleChromeScroll()

const sectionLabel = computed(() => {
  if (publication.value)
    return publication.value.label
  if (section.value === 'dashboard')
    return 'Dashboard'
  return ''
})

const sectionTo = computed(() => publication.value ? `/${publication.value.slug}` : section.value === 'dashboard' ? '/dashboard' : '/')
</script>

<template>
  <header
    ref="headerRef"
    un-sticky
    un-relative
    un-top-0
    un-z-30
    un-box-border
    un-w-full
    un-min-h="[var(--site-chrome)]"
    un-flex
    un-items-center
    un-gap-4
    un-py="3"
    un-px="[var(--gutter)]"
    :un-border-b="isArticle ? '0' : 'line'"
    un-bg-paper
    :style="isArticle ? { '--progress-bar-width': progressWidth } : undefined"
  >
    <template v-if="isArticle">
      <div
        un-relative
        un-z-1
        un-flex
        un-min-w-0
        un-flex-1
        un-items-center
      >
        <SiteBackLink />
      </div>
      <span
        class="article-chrome-title"
        :data-in="titleRevealed ? '' : undefined"
        un-absolute
        un-left="1/2"
        un-z-1
        un-m-0
        un-max-w="[min(50%,36rem)]"
        un-truncate
        un-font-serif
        un-text="2xl ink"
        un-text-center
        un-pointer-events-none
        :aria-hidden="!titleRevealed"
      >{{ articleTitle }}</span>
      <div
        ref="progressTrackRef"
        class="progress-bar"
        un-absolute
        un-left-0
        un-right-0
        un-bottom-0
        un-z-0
        un-h="[2px]"
        un-w-full
        un-shrink-0
        un-leading-none
      >
        <div
          class="progress-bar-bg"
          un-absolute
          un-bottom-0
          un-left-0
          un-right-0
          un-z-0
          un-h-px
          un-w-full
          un-bg-line
        />
        <div
          class="progress-bar-inner"
          un-absolute
          un-bottom-0
          un-left-0
          un-z-1
          un-h-px
          un-bg-ink
          :style="{ width: 'var(--progress-bar-width, 0px)' }"
        />
      </div>
    </template>
    <template v-else>
      <SiteChromeNav
        to="/"
        aria-label="Home"
      >
        home
      </SiteChromeNav>
      <p
        v-if="sectionLabel"
        class="hub-label"
        un-m-0
        un-flex
        un-min-w-0
        un-flex-1
        un-flex-wrap
        un-items-baseline
        un-gap-2
        un-font-mono
        un-text="xs muted"
        un-tracking-wide
        un-uppercase
      >
        <NuxtLink
          :to="sectionTo"
          un-text="muted hover:colored-ink focus-visible:colored-ink"
        >
          {{ sectionLabel }}
        </NuxtLink>
      </p>
    </template>
  </header>
</template>

<style scoped>
.article-chrome-title { transform: translateX(-50%); opacity: 0; transition: opacity 0.2s var(--ease-out, ease); }
.article-chrome-title[data-in] { opacity: 1; }
</style>
