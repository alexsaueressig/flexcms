import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware(async (to) => {
  if (to.path.startsWith('/auth')) return

  const auth = useAuthStore()
  if (!auth.isAuthenticated) {
    await auth.fetchMe()
  }
  if (!auth.isAuthenticated) {
    return navigateTo('/auth/login')
  }
})
