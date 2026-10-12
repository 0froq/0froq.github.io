export default defineNuxtPlugin(() => {
  const router = useRouter()

  router.beforeEach((to, from) => {
    const layerNav = isHubListingNav(to.path, from.path)
    const sameSection = samePublicationSection(to.path, from.path)
    document.documentElement.dataset.vt = layerNav ? 'layer' : 'page'
    // SectionHub plays the sheet fade. A document view transition snapshots
    // the whole page first, which stalls on the journal wheel, and leaving
    // an article never emits page:finish so the browser holds that snapshot.
    to.meta.viewTransition = !sameSection
  })
})
