<template>
  <div class="tree-node">
    <NuxtLink
      :to="`/${locale}/entries/${entry.id}`"
      class="tree-node__row"
      active-class="tree-node__row--active"
    >
      <UButton
        v-if="entry._count && entry._count.children > 0"
        :icon="isExpanded ? 'i-lucide-chevron-down' : 'i-lucide-chevron-right'"
        variant="ghost"
        color="neutral"
        size="2xs"
        class="tree-node__chevron"
        @click.prevent="toggle"
      />
      <span v-else class="tree-node__spacer" />
      <UIcon name="i-lucide-file-text" class="tree-node__icon" />
      <span class="tree-node__title">{{ entry.title }}</span>
      <UBadge v-if="entry._count?.children" :label="String(entry._count.children)" size="xs" color="neutral" variant="subtle" />
    </NuxtLink>

    <div v-if="isExpanded" class="entry-tree-indent">
      <div v-if="loading" class="tree-node__loading">
        <UIcon name="i-lucide-loader-2" class="animate-spin" />
      </div>
      <EntryTreeNode
        v-for="child in children"
        :key="child.id"
        :entry="child"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useUiStore } from '~/stores/ui'
import { useEntriesStore } from '~/stores/entries'

const props = defineProps<{
  entry: {
    id: string
    title: string
    slug: string
    localeCode: string
    _count?: { children: number }
  }
}>()

const uiStore = useUiStore()
const entriesStore = useEntriesStore()
const locale = computed(() => uiStore.activeLocale)
const isExpanded = computed(() => entriesStore.isExpanded(props.entry.id))
const children = ref<any[]>([])
const loading = ref(false)

async function toggle() {
  entriesStore.toggleExpand(props.entry.id)
  if (entriesStore.isExpanded(props.entry.id) && !children.value.length) {
    loading.value = true
    try {
      const data = await $fetch<{ items: any[] }>(`/api/entries/${props.entry.id}/children`, {
        params: { locale: locale.value, limit: 100 },
      })
      children.value = data.items
    }
    finally { loading.value = false }
  }
}
</script>

<style lang="scss" scoped>
.tree-node {
  &__row {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.3125rem 0.25rem;
    border-radius: 0.375rem;
    text-decoration: none;
    color: inherit;
    font-size: 0.8125rem;
    cursor: pointer;
    transition: background 0.1s;

    &:hover { background: var(--ui-bg-muted); }
    &--active { background: var(--ui-bg-elevated); font-weight: 500; }
  }

  &__chevron { flex-shrink: 0; }

  &__spacer { width: 24px; flex-shrink: 0; }

  &__icon { font-size: 0.875rem; opacity: 0.5; flex-shrink: 0; }

  &__title {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__loading {
    display: flex;
    justify-content: center;
    padding: 0.5rem;
    opacity: 0.4;
    font-size: 0.75rem;
  }
}
</style>
