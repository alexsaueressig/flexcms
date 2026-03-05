<template>
  <aside class="sidebar" :class="{ 'sidebar--collapsed': uiStore.sidebarCollapsed }">
    <div class="sidebar__logo">
      <span v-if="!uiStore.sidebarCollapsed" class="sidebar__logo-text">SnapCMS</span>
      <UIcon v-else name="i-lucide-layers" class="sidebar__logo-icon" />
    </div>

    <LayoutSidebarNav :items="navItems" :collapsed="uiStore.sidebarCollapsed" />

    <LayoutSidebarContentTree v-if="!uiStore.sidebarCollapsed" @new-entry="$emit('new-entry')" />
  </aside>
</template>

<script lang="ts" setup>
import { useUiStore } from '~/stores/ui'
import { useAuthStore } from '~/stores/auth'

defineEmits<{ 'new-entry': [] }>()

const { t } = useI18n()
const uiStore = useUiStore()
const auth = useAuthStore()
const locale = computed(() => uiStore.activeLocale)

const navItems = computed(() => {
  const base = [
    { label: t('nav.entries'), icon: 'i-lucide-file-text', to: `/${locale.value}` },
    { label: t('nav.archive'), icon: 'i-lucide-archive', to: `/${locale.value}/archive` },
  ]
  if (auth.isSuperAdmin) {
    base.push(
      { label: t('nav.users'), icon: 'i-lucide-users', to: `/${locale.value}/admin/users` },
      { label: t('nav.roles'), icon: 'i-lucide-shield', to: `/${locale.value}/admin/roles` },
    )
  }
  return base
})
</script>

<style lang="scss" scoped>
.sidebar {
  width: 260px;
  height: 100vh;
  border-right: 1px solid var(--ui-border);
  background: var(--ui-bg);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  transition: width 0.2s ease;
  overflow: hidden;
  z-index: 40;

  &--collapsed {
    width: 56px;
  }

  &__logo {
    height: 56px;
    display: flex;
    align-items: center;
    padding: 0 1rem;
    border-bottom: 1px solid var(--ui-border);
    flex-shrink: 0;
  }

  &__logo-text {
    font-weight: 700;
    font-size: 1rem;
    letter-spacing: -0.02em;
  }

  &__logo-icon {
    font-size: 1.25rem;
  }

}
</style>
