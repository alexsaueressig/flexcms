<template>
    <div class="entries-page">
        <div class="entries-page__header">
            <h1 class="entries-page__title">{{ $t('entries.title') }}</h1>
            <UModal v-model:open="showNew" :title="$t('entries.new')" :description="$t('entries.newDescription')">
                <UButton icon="i-lucide-plus">{{ $t('entries.new') }}</UButton>
                <template #body>
                    <EntryNewEntryForm @created="onCreated" @cancel="showNew = false" />
                </template>
            </UModal>
        </div>

        <div class="entries-page__toolbar">
            <UInput v-model="search" icon="i-lucide-search" :placeholder="$t('entries.search')"
                class="entries-page__search" />
        </div>

        <UTable :data="items" :columns="columns" :loading="pending">
            <template #title-cell="{ row }">
                <NuxtLink :to="localePath(`/entries/${row.original.id}`)" class="entries-page__link">
                    {{ row.original.title }}
                </NuxtLink>
            </template>
            <template #children-cell="{ row }">
                {{ row.original._count?.children ?? 0 }}
            </template>
            <template #updatedAt-cell="{ row }">
                {{ new Date(row.original.updatedAt).toLocaleDateString() }}
            </template>
            <template #actions-cell="{ row }">
                <div class="entries-page__row-actions">
                    <UButton icon="i-lucide-edit-3" size="xs" variant="ghost" color="neutral"
                        @click="openEdit(row.original)" />
                    <UButton icon="i-lucide-trash-2" size="xs" variant="ghost" color="error"
                        @click="confirmDelete(row.original)" />
                </div>
            </template>
        </UTable>

        <div class="entries-page__pagination">
            <span class="entries-page__total">{{ $t('entries.count', { count: total }) }}</span>
            <UPagination v-model:page="page" :total="total" :items-per-page="limit" />
        </div>

        <!-- Edit modal -->
        <UModal v-model:open="showEdit" :title="$t('entries.editEntry')" :description="$t('entries.editDescription')">
            <template #body>
                <EntryNewEntryForm :key="editingEntry?.id" :entry="editingEntry" @updated="onUpdated"
                    @cancel="showEdit = false" />
            </template>
        </UModal>

        <!-- Delete confirmation -->
        <EntryDeleteConfirm v-model:open="showDelete" :title="deletingEntry?.title" :loading="deleting"
            @confirm="doDelete" />
    </div>
</template>

<script lang="ts" setup>
definePageMeta({ middleware: 'auth' })

const { t } = useI18n()
const localePath = useLocalePath()
const search = ref('')
const page = ref(1)
const limit = 25

const offset = computed(() => (page.value - 1) * limit)

const { data, pending, refresh } = await useFetch('/api/entries', {
    params: computed(() => ({
        limit,
        offset: offset.value,
        search: search.value || undefined,
    })),
    watch: [search, offset],
})

const items = computed(() => data.value?.items ?? [])
const total = computed(() => data.value?.total ?? 0)

const columns = computed(() => [
    { accessorKey: 'title', header: t('table.title') },
    { accessorKey: 'slug', header: t('table.slug') },
    { accessorKey: 'children', header: t('table.children') },
    { accessorKey: 'updatedAt', header: t('table.updated') },
    { accessorKey: 'actions', header: '' },
])

const {
    showNew, showEdit, showDelete,
    editingEntry, deletingEntry, deleting,
    onCreated, openEdit, onUpdated, confirmDelete, doDelete,
} = useEntryCrud(refresh)
</script>

<style lang="scss" scoped>
.entries-page {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;

    &__header {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    &__title {
        font-size: 1.5rem;
        font-weight: 700;
        margin: 0;
    }

    &__toolbar {
        display: flex;
        gap: 0.75rem;
    }

    &__search {
        max-width: 320px;
    }

    &__link {
        color: inherit;
        text-decoration: none;
        font-weight: 500;

        &:hover {
            text-decoration: underline;
        }
    }

    &__row-actions {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        justify-content: flex-end;
    }

    &__pagination {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    &__total {
        font-size: 0.875rem;
        opacity: 0.5;
    }
}
</style>
