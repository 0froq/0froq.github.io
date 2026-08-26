export default defineNuxtPlugin(() => {
  const router = useRouter()

  router.beforeEach((to, from) => {
    const layerNav = isHubListingNav(to.path, from.path)
    document.documentElement.dataset.vt = layerNav ? 'layer' : 'page'
    // Skip the document View Transition so reused hub chrome does not snapshot.
    to.meta.viewTransition = !layerNav
  })
})
