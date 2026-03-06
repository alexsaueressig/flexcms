<template>
    <UModal v-model:open="open" title="Link entry">
        <template #body>
            <UInput v-model="search" icon="i-lucide-search" placeholder="Search entries…" />
            <ul class="relation-picker__list">
                <li v-for="e in searchResults" :key="e.id" class="relation-picker__item" @click="$emit('select', e)">
                    {{ e.title }}
                    <span class="relation-picker__slug">{{ e.slug }}</span>
                </li>
            </ul>
        </template>
    </UModal>
</template>

<script lang="ts" setup>
const props = defineProps<{ parentId?: string }>()
defineEmits<{ select: [entry: any] }>()
const open = defineModel<boolean>('open')
const search = ref('')

const { data } = useFetch('/api/search', {
    params: computed(() => ({
        q: search.value || '',
        limit: 20,
        ...(props.parentId ? { parentId: props.parentId } : {}),
    })),
    watch: [search, () => props.parentId],
})
const searchResults = computed(() => (data.value as any[]) ?? [])
</script>

<style lang="scss" scoped>
.relation-picker {
    &__list {
        list-style: none;
        padding: 0;
        margin: 0.75rem 0 0;
        border-top: 1px solid var(--ui-border);
    }

    &__item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.5rem 0.25rem;
        cursor: pointer;
        font-size: 0.875rem;
        border-radius: 0.375rem;
        transition: background 0.1s;

        &:hover {
            background: var(--ui-bg-muted);
        }
    }

    &__slug {
        font-family: var(--font-mono);
        font-size: 0.75rem;
        opacity: 0.45;
    }
}
</style>
