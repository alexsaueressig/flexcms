<template>
  <aside class="sidebar" :class="{ 'sidebar--collapsed': uiStore.sidebarCollapsed }">
    <div class="sidebar__logo">
      <span v-if="!uiStore.sidebarCollapsed" class="sidebar__logo-text">SnapCMS</span>
      <UIcon v-else name="i-lucide-layers" class="sidebar__logo-icon" />
    </div>

    <nav class="sidebar__nav">
      <UTooltip
        v-for="item in navItems"
        :key="item.to"
        :text="uiStore.sidebarCollapsed ? item.label : ''"
        placement="right"
      >
        <NuxtLink :to="item.to" class="sidebar__nav-item" active-class="sidebar__nav-item--active">
          <UIcon :name="item.icon" class="sidebar__nav-icon" />
          <span v-if="!uiStore.sidebarCollapsed" class="sidebar__nav-label">{{ item.label }}</span>
        </NuxtLink>
      </UTooltip>
    </nav>

    <div v-if="!uiStore.sidebarCollapsed" class="sidebar__tree">
      <div class="sidebar__tree-header">
        <span class="sidebar__tree-title">Content tree</span>
        <UButton
          icon="i-lucide-plus"
          size="xs"
          variant="ghost"
          color="neutral"
          @click="$emit('new-entry')"
        />
      </div>
      <EntryTreeNode
        v-for="entry in rootEntries"
        :key="entry.id"
        :entry="entry"
      />
      <div v-if="loadingRoots" class="sidebar__tree-loading">
        <UIcon name="i-lucide-loader-2" class="animate-spin" />
      </div>
    </div>
  </aside>
</template>

<script lang="ts" setup>
import { useUiStore } from '~/stores/ui'
import { useAuthStore } from '~/stores/auth'

defineEmits<{ 'new-entry': [] }>()

const uiStore = useUiStore()
const auth = useAuthStore()
const locale = computed(() => uiStore.activeLocale)

const navItems = computed(() => {
  const base = [
    { label: 'Entries', icon: 'i-lucide-file-text', to: `/${locale.value}` },
    { label: 'Archive', icon: 'i-lucide-archive', to: `/${locale.value}/archive` },
  ]
  if (auth.isSuperAdmin) {
    base.push(
      { label: 'Users', icon: 'i-lucide-users', to: `/${locale.value}/admin/users` },
      { label: 'Roles', icon: 'i-lucide-shield', to: `/${locale.value}/admin/roles` },
    )
  }
  return base
})

const rootEntries = ref<any[]>([])
const loadingRoots = ref(false)

async function loadRoots() {
  loadingRoots.value = true
  try {
    const data = await $fetch<{ items: any[] }>('/api/entries', {
      params: { locale: locale.value, limit: 100 },
    })
    rootEntries.value = data.items
  }
  finally { loadingRoots.value = false }
}

onMounted(loadRoots)
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

  &--collapsed { width: 56px; }

  &__logo {
    height: 56px;
    display: flex;
    align-items: center;
    padding: 0 1rem;
    border-bottom: 1px solid var(--ui-border);
    flex-shrink: 0;
  }

  &__logo-text { font-weight: 700; font-size: 1rem; letter-spacing: -0.02em; }
  &__logo-icon { font-size: 1.25rem; }

  &__nav {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
    padding: 0.75rem 0.5rem;
    border-bottom: 1px solid var(--ui-border);
  }

  &__nav-item {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    padding: 0.5rem 0.625rem;
    border-radius: 0.5rem;
    text-decoration: none;
    color: inherit;
    font-size: 0.875rem;
    font-weight: 500;
    opacity: 0.7;
    transition: opacity 0.1s, background 0.1s;

    &:hover { opacity: 1; background: var(--ui-bg-muted); }
    &--active { opacity: 1; background: var(--ui-bg-elevated); }
  }

  &__nav-icon { font-size: 1rem; flex-shrink: 0; }
  &__nav-label { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

  &__tree {
    flex: 1;
    overflow-y: auto;
    padding: 0.75rem 0.5rem;
  }

  &__tree-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 0.25rem 0.5rem;
  }

  &__tree-title { font-size: 0.75rem; font-weight: 600; opacity: 0.5; text-transform: uppercase; letter-spacing: 0.06em; }

  &__tree-loading {
    display: flex;
    justify-content: center;
    padding: 1rem;
    opacity: 0.4;
  }
}
</style>
