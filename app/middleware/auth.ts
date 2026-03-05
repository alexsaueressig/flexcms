import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware(async (to) => {
  if (to.path.includes('/auth/')) return

  const auth = useAuthStore()
  if (!auth.isAuthenticated) {
    await auth.fetchMe()
  }
  if (!auth.isAuthenticated) {
    const localePath = useLocalePath()
    return navigateTo(localePath('/auth/login'))
  }
})
