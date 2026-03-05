<template>
  <header class="app-header">
    <div class="app-header__left">
      <UButton icon="i-lucide-panel-left" variant="ghost" color="neutral" size="sm" @click="uiStore.toggleSidebar()" />
    </div>

    <div class="app-header__center">
      <UButton icon="i-lucide-search" variant="outline" color="neutral" class="app-header__search-trigger"
        @click="uiStore.openSearch()">
        <span class="app-header__search-text">{{ $t('search.placeholder') }}</span>
        <UKbd value="⌘K" class="ml-auto" />
      </UButton>
    </div>

    <div class="app-header__right">
      <div class="app-header__locales">
        <NuxtLink
          v-for="loc in localeList"
          :key="loc.code"
          :to="switchLocalePath(loc.code)"
          class="app-header__locale-btn"
          :class="{ 'app-header__locale-btn--active': locale === loc.code }"
        >
          {{ localeToFlag(loc.language) }}
          <span class="app-header__locale-code">{{ loc.code.toUpperCase() }}</span>
        </NuxtLink>
      </div>
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

const { t, locale, locales } = useI18n()
const switchLocalePath = useSwitchLocalePath()
const uiStore = useUiStore()
const auth = useAuthStore()

const localeList = computed(() => (locales.value as any[]).filter(l => typeof l === 'object') as { code: string; language: string; name: string }[])

const userMenuItems = computed(() => [
  [{
    label: auth.user?.email ?? '',
    disabled: true,
  }],
  [{
    label: t('nav.logout'),
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

  &__left {
    display: flex;
    align-items: center;
  }

  &__center {
    flex: 1;
    max-width: 480px;
    margin: 0 auto;
  }

  &__search-trigger {
    width: 100%;
    justify-content: flex-start;
    gap: 0.5rem;
    font-weight: 400;
    opacity: 0.6;
  }

  &__search-text {
    flex: 1;
    text-align: left;
  }

  &__right {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-left: auto;
  }

  &__locales {
    display: flex;
    align-items: center;
    gap: 0.125rem;
    padding-right: 0.25rem;
    border-right: 1px solid var(--ui-border);
    margin-right: 0.25rem;
  }

  &__locale-btn {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.25rem 0.5rem;
    border-radius: 0.375rem;
    text-decoration: none;
    color: inherit;
    font-size: 0.8125rem;
    font-weight: 500;
    opacity: 0.5;
    transition: opacity 0.1s, background 0.1s;

    &:hover {
      opacity: 0.8;
      background: var(--ui-bg-muted);
    }

    &--active {
      opacity: 1;
      background: var(--ui-bg-elevated);
    }
  }

  &__locale-code {
    font-size: 0.75rem;
    font-weight: 600;
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
