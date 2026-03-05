import { defineStore } from 'pinia'

export const useUiStore = defineStore('ui', () => {
  const sidebarCollapsed = ref(false)
  const globalSearchOpen = ref(false)
  const globalSearchQuery = ref('')
  const activeLocale = ref('en')

  function toggleSidebar() { sidebarCollapsed.value = !sidebarCollapsed.value }
  function openSearch() { globalSearchOpen.value = true }
  function closeSearch() {
    globalSearchOpen.value = false
    globalSearchQuery.value = ''
  }

  return {
    sidebarCollapsed, globalSearchOpen, globalSearchQuery, activeLocale,
    toggleSidebar, openSearch, closeSearch,
  }
})
