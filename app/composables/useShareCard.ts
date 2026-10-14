import type { MaybeRefOrGetter } from 'vue'

export interface ShareCardInput {
  title?: MaybeRefOrGetter<string | undefined>
  description?: MaybeRefOrGetter<string | undefined>
  type?: MaybeRefOrGetter<'website' | 'article' | undefined>
  /**
   * Share image path or https URL.
   * `false` when defineOgImage owns `og:image`.
   * Omitted routes use `/og.png` on the Worker origin.
   */
  image?: MaybeRefOrGetter<string | false | undefined>
}

function filled(value: string | undefined, fallback: string): string {
  const text = value?.trim()
  return text || fallback
}

/**
 * Open Graph / Twitter tags for the current route.
 * `og:url` stays on froq.me. Image URLs use the Worker origin.
 */
export function useShareCard(input: ShareCardInput = {}): void {
  const route = useRoute()

  const title = computed(() => filled(toValue(input.title), SITE_NAME))
  const description = computed(() => filled(toValue(input.description), SITE_DESCRIPTION))
  const type = computed(() => toValue(input.type) ?? 'website')
  const url = computed(() => canonicalUrl(route.path))
  const skipImage = toValue(input.image) === false
  const image = computed(() => {
    const value = toValue(input.image)
    if (value === false || !value)
      return absoluteImageUrl(OG_IMAGE_PATH)
    return absoluteImageUrl(value)
  })

  useSeoMeta({
    description: () => description.value,
    ogTitle: () => title.value,
    ogDescription: () => description.value,
    ogUrl: () => url.value,
    ogType: () => type.value,
    ogSiteName: SITE_NAME,
    twitterCard: 'summary_large_image',
    twitterTitle: () => title.value,
    twitterDescription: () => description.value,
    twitterSite: TWITTER_HANDLE,
  })

  if (!skipImage) {
    useSeoMeta({
      ogImage: () => image.value,
      ogImageSecureUrl: () => image.value,
      ogImageType: 'image/png',
      ogImageWidth: OG_IMAGE_WIDTH,
      ogImageHeight: OG_IMAGE_HEIGHT,
      ogImageAlt: () => title.value,
      twitterImage: () => image.value,
      twitterImageAlt: () => title.value,
    })
  }

  useHead({
    link: [{ rel: 'canonical', href: () => url.value }],
  })
}
