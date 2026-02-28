<template>
  <header class="app-header">
    <div class="app-header__left">
      <UButton
        icon="i-lucide-panel-left"
        variant="ghost"
        color="neutral"
        size="sm"
        @click="uiStore.toggleSidebar()"
      />
    </div>

    <div class="app-header__center">
      <UButton
        icon="i-lucide-search"
        variant="outline"
        color="neutral"
        class="app-header__search-trigger"
        @click="uiStore.openSearch()"
      >
        <span class="app-header__search-text">Search…</span>
        <UKbd value="⌘K" class="ml-auto" />
      </UButton>
    </div>

    <div class="app-header__right">
      <UColorModeButton />
      <UDropdownMenu :items="userMenuItems">
        <UButton variant="ghost" color="neutral" size="sm">
          <UAvatar :name="auth.user?.name" size="xs" />
          <span class="app-header__user-name">{{ auth.user?.name }}</span>
        </UButton>
      </UDropdownMenu>
    </div>
  </header>
</template>

<script lang="ts" setup>
import { useUiStore } from '~/stores/ui'
import { useAuthStore } from '~/stores/auth'

const uiStore = useUiStore()
const auth = useAuthStore()

const userMenuItems = computed(() => [
  [{
    label: auth.user?.email ?? '',
    disabled: true,
  }],
  [{
    label: 'Sign out',
    icon: 'i-lucide-log-out',
    onSelect: () => auth.logout(),
  }],
])

// Global keyboard shortcut
onMounted(() => {
  const handler = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault()
      uiStore.openSearch()
    }
  }
  window.addEventListener('keydown', handler)
  onUnmounted(() => window.removeEventListener('keydown', handler))
})
</script>

<style lang="scss" scoped>
.app-header {
  height: 56px;
  border-bottom: 1px solid var(--ui-border);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0 1rem;
  flex-shrink: 0;
  background: var(--ui-bg);

  &__left { display: flex; align-items: center; }

  &__center { flex: 1; max-width: 480px; margin: 0 auto; }

  &__search-trigger {
    width: 100%;
    justify-content: flex-start;
    gap: 0.5rem;
    font-weight: 400;
    opacity: 0.6;
  }

  &__search-text { flex: 1; text-align: left; }

  &__right {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-left: auto;
  }

  &__user-name {
    max-width: 120px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 0.875rem;
  }
}
</style>
