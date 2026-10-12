export function useShareCard() {
  const route = useRoute()
  const url = computed(() => canonicalUrl(route.path))

  useSeoMeta({
    ogUrl: url,
    ogSiteName: SITE_NAME,
    ogImage: OG_IMAGE_URL,
    ogImageSecureUrl: OG_IMAGE_URL,
    ogImageWidth: 1200,
    ogImageHeight: 630,
    ogImageType: 'image/png',
    ogImageAlt: SITE_NAME,
    twitterCard: 'summary_large_image',
    twitterImage: OG_IMAGE_URL,
    twitterImageAlt: SITE_NAME,
    twitterSite: TWITTER_HANDLE,
  })

  useHead(() => ({
    link: [{ rel: 'canonical', href: url.value }],
  }))
}
