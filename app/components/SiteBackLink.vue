<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const { clear } = useIssueArticleReturn()

const back = computed(() => resolveArticleBackTarget(route.path))

function goBack() {
  const { to } = resolveArticleBackTarget(route.path)
  clear()
  router.push(to)
}
</script>

<template>
  <SiteChromeNav
    :aria-label="`Back to ${back.label}`"
    @click="goBack"
  >
    ← {{ back.label }}
  </SiteChromeNav>
</template>
