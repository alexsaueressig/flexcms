<template>
  <div class="app-shell">
    <AppSidebar />
    <div class="app-shell__main" :class="{ 'app-shell__main--collapsed': uiStore.sidebarCollapsed }">
      <AppHeader />
      <main class="app-shell__content">
        <slot />
      </main>
    </div>
    <AppSearchModal v-if="uiStore.globalSearchOpen" />
  </div>
</template>

<script lang="ts" setup>
import { useUiStore } from '~/stores/ui'

const uiStore = useUiStore()
</script>

<style lang="scss" scoped>
.app-shell {
  display: flex;
  height: 100vh;
  overflow: hidden;

  &__main {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    margin-left: 260px;
    transition: margin-left 0.2s ease;

    &--collapsed {
      margin-left: 56px;
    }
  }

  &__content {
    flex: 1;
    overflow-y: auto;
    padding: 1.5rem 2rem;
  }
}
</style>
