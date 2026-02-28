<template>
  <UModal :open="true" @close="uiStore.closeSearch()" :ui="{ width: 'max-w-xl' }">
    <template #content>
      <div class="search-modal">
        <div class="search-modal__input-wrap">
          <UIcon name="i-lucide-search" class="search-modal__icon" />
          <input
            ref="inputRef"
            v-model="query"
            placeholder="Search entries…"
            class="search-modal__input"
            @keydown.escape="uiStore.closeSearch()"
          />
          <UKbd value="esc" />
        </div>

        <div v-if="pending" class="search-modal__state">
          <UIcon name="i-lucide-loader-2" class="animate-spin" />
        </div>

        <div v-else-if="results.length === 0 && query.length > 1" class="search-modal__state">
          No results for "{{ query }}"
        </div>

        <ul v-else class="search-modal__results">
          <li
            v-for="entry in results"
            :key="entry.id"
            class="search-modal__result"
            @click="go(entry)"
          >
            <div class="search-modal__result-title">{{ entry.title }}</div>
            <div v-if="entry.parent" class="search-modal__result-parent">
              {{ entry.parent.title }} /
            </div>
          </li>
        </ul>
      </div>
    </template>
  </UModal>
</template>

<script lang="ts" setup>
import { useUiStore } from '~/stores/ui'

const uiStore = useUiStore()
const query = ref('')
const results = ref<any[]>([])
const pending = ref(false)
const inputRef = ref<HTMLInputElement | null>(null)
const locale = uiStore.activeLocale

const { pause, resume } = useThrottleFn(async () => {
  if (query.value.length < 2) { results.value = []; return }
  pending.value = true
  try {
    results.value = await $fetch('/api/search', { params: { q: query.value, locale } })
  }
  finally { pending.value = false }
}, 300)

watch(query, () => resume())

onMounted(() => nextTick(() => inputRef.value?.focus()))

function go(entry: any) {
  navigateTo(`/${locale}/entries/${entry.id}`)
  uiStore.closeSearch()
}
</script>

<style lang="scss" scoped>
.search-modal {
  padding: 0;

  &__input-wrap {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.875rem 1rem;
    border-bottom: 1px solid var(--ui-border);
  }

  &__icon { opacity: 0.5; flex-shrink: 0; }

  &__input {
    flex: 1;
    border: none;
    outline: none;
    font-size: 1rem;
    background: transparent;
    color: inherit;
    font-family: inherit;

    &::placeholder { opacity: 0.4; }
  }

  &__state {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    opacity: 0.5;
    font-size: 0.875rem;
  }

  &__results {
    list-style: none;
    margin: 0;
    padding: 0.5rem;
    max-height: 380px;
    overflow-y: auto;
  }

  &__result {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
    padding: 0.625rem 0.75rem;
    border-radius: 0.5rem;
    cursor: pointer;
    transition: background 0.1s;

    &:hover { background: var(--ui-bg-muted); }
  }

  &__result-title { font-size: 0.9375rem; font-weight: 500; }

  &__result-parent { font-size: 0.75rem; opacity: 0.5; }
}
</style>
