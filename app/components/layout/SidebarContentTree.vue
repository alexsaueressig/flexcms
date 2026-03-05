<template>
    <div class="sidebar-tree">
        <div class="sidebar-tree__header">
            <span class="sidebar-tree__title">Content tree</span>
            <UButton icon="i-lucide-plus" size="xs" variant="ghost" color="neutral" @click="$emit('new-entry')" />
        </div>
        <LayoutEntryTreeNode v-for="entry in rootEntries" :key="entry.id" :entry="entry" />
        <div v-if="loading" class="sidebar-tree__loading">
            <UIcon name="i-lucide-loader-2" class="animate-spin" />
        </div>
    </div>
</template>

<script lang="ts" setup>
import { useUiStore } from '~/stores/ui'
import { useEntriesStore } from '~/stores/entries'

defineEmits<{ 'new-entry': [] }>()

const uiStore = useUiStore()
const entriesStore = useEntriesStore()
const locale = computed(() => uiStore.activeLocale)
const rootEntries = ref<any[]>([])
const loading = ref(false)

async function loadRoots() {
    loading.value = true
    try {
        const data = await $fetch<{ items: any[] }>('/api/entries', {
            params: { locale: locale.value, limit: 100 },
        })
        rootEntries.value = data.items
    }
    finally { loading.value = false }
}

onMounted(loadRoots)
watch(() => entriesStore.treeVersion, loadRoots)
</script>

<style lang="scss" scoped>
.sidebar-tree {
    flex: 1;
    overflow-y: auto;
    padding: 0.75rem 0.5rem;

    &__header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 0.25rem 0.5rem;
    }

    &__title {
        font-size: 0.75rem;
        font-weight: 600;
        opacity: 0.5;
        text-transform: uppercase;
        letter-spacing: 0.06em;
    }

    &__loading {
        display: flex;
        justify-content: center;
        padding: 1rem;
        opacity: 0.4;
    }
}
</style>
