import { defineStore } from 'pinia'

export interface AuthUser {
  id: string
  email: string
  name: string
  status: string
  lastLoginAt: string | null
  roles: { id: string; name: string }[]
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<AuthUser | null>(null)
  const pending = ref(false)

  const isAuthenticated = computed(() => !!user.value)

  async function fetchMe() {
    try {
      pending.value = true
      const data = await $fetch<AuthUser>('/api/auth/me')
      user.value = data
    }
    catch {
      user.value = null
    }
    finally {
      pending.value = false
    }
  }

  async function logout() {
    await $fetch('/api/auth/logout', { method: 'POST' })
    user.value = null
    await navigateTo('/auth/login')
  }

  function hasRole(roleName: string): boolean {
    return user.value?.roles.some(r => r.name === roleName) ?? false
  }

  const isSuperAdmin = computed(() => hasRole('Super Admin'))

  return { user, pending, isAuthenticated, isSuperAdmin, fetchMe, logout, hasRole }
})
