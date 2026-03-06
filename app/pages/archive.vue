<template>
    <div class="archive-page">
        <div class="archive-page__header">
            <h1 class="archive-page__title">{{ $t('archive.title') }}</h1>
        </div>

        <UTable :data="items" :columns="columns" :loading="pending">
            <template #title-cell="{ row }">
                <span>{{ row.original.title }}</span>
                <span class="archive-page__slug">{{ row.original.slug }}</span>
            </template>
            <template #archivedAt-cell="{ row }">
                {{ row.original.archivedAt ? new Date(row.original.archivedAt).toLocaleDateString() : '—' }}
            </template>
            <template #authorName-cell="{ row }">
                {{ row.original.authorName ?? '—' }}
            </template>
            <template #actions-cell="{ row }">
                <div class="archive-page__actions">
                    <UButton size="xs" variant="outline" @click="restoreTarget = row.original.id">{{
                        $t('entries.restore') }}</UButton>
                    <UButton size="xs" variant="ghost" color="error" :loading="deleteTarget === row.original.id && deleting" @click="confirm(row.original.id)">{{
                        $t('common.delete') }}</UButton>
                </div>
            </template>
        </UTable>

        <div class="archive-page__pagination">
            <span class="archive-page__total">{{ $t('entries.count', { count: total }) }}</span>
            <div class="archive-page__pagination-controls">
                <UPagination v-model:page="page" :total="total" :items-per-page="pageSize" />
                <USelect v-model="selectedPageSize" :items="pageSizeOptions" size="sm"
                    class="archive-page__page-size" />
            </div>
        </div>

        <UModal v-model:open="restoreTarget" :title="$t('archive.restoreTitle')">
            <template #body>
                <p>{{ $t('archive.restoreDescription') }}</p>
            </template>
            <template #footer>
                <UButton color="primary" :loading="restoring" @click="doRestore">{{ $t('entries.restore') }}</UButton>
                <UButton variant="ghost" @click="restoreTarget = null">{{ $t('entries.cancel') }}</UButton>
            </template>
        </UModal>

        <UModal v-model:open="deleteTarget" :title="$t('archive.deleteTitle')">
            <template #body>
                <p>{{ $t('archive.deleteDescription') }}</p>
            </template>
            <template #footer>
                <UButton color="error" :loading="deleting" @click="doDelete">{{ $t('entries.delete') }}</UButton>
                <UButton variant="ghost" @click="deleteTarget = null">{{ $t('entries.cancel') }}</UButton>
            </template>
        </UModal>
    </div>
</template>

<script lang="ts" setup>
import { useEntriesStore } from '~/stores/entries'

definePageMeta({ middleware: 'auth' })

const { t } = useI18n()
const deleteTarget = ref<string | null>(null)
const restoreTarget = ref<string | null>(null)
const restoring = ref(false)
const deleting = ref(false)
const toast = useToast()
const page = ref(1)

const { pageSize, pageSizeOptions, setPageSize } = usePageSize()

const selectedPageSize = computed({
    get: () => pageSize.value,
    set: (val: number) => {
        page.value = 1
        setPageSize(val)
    },
})

const offset = computed(() => (page.value - 1) * pageSize.value)

const entriesStore = useEntriesStore()

const { data, pending, refresh } = await useFetch('/api/entries', {
    params: computed(() => ({ archived: true, limit: pageSize.value, offset: offset.value })),
    watch: [offset, pageSize],
})

const items = computed(() => (data.value as any)?.items ?? [])
const total = computed(() => (data.value as any)?.total ?? 0)

const columns = computed(() => [
    { accessorKey: 'title', header: t('table.entry') },
    { accessorKey: 'archivedAt', header: t('table.archivedOn') },
    { accessorKey: 'authorName', header: t('table.author') },
    { accessorKey: 'actions', header: '' },
])

async function doRestore() {
    if (!restoreTarget.value) return
    restoring.value = true
    try {
        await $fetch(`/api/entries/${restoreTarget.value}/restore`, { method: 'PATCH' })
        toast.add({ title: t('archive.restored'), color: 'success' })
        entriesStore.refreshTree()
        refresh()
        restoreTarget.value = null
    } finally {
        restoring.value = false
    }
}

function confirm(id: string) {
    deleteTarget.value = id
}

async function doDelete() {
    if (!deleteTarget.value) return
    deleting.value = true
    try {
        await $fetch(`/api/entries/${deleteTarget.value}/permanent`, { method: 'DELETE' })
        toast.add({ title: t('archive.deleted'), color: 'success' })
        refresh()
        deleteTarget.value = null
    } finally {
        deleting.value = false
    }
}
</script>

<style lang="scss" scoped>
.archive-page {
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

    &__pagination {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    &__pagination-controls {
        display: flex;
        align-items: center;
        gap: 0.75rem;
    }

    &__page-size {
        width: 5rem;
    }

    &__total {
        font-size: 0.875rem;
        opacity: 0.5;
    }

    &__slug {
        display: block;
        font-size: 0.75rem;
        opacity: 0.5;
        font-family: var(--font-mono);
    }

    &__actions {
        display: flex;
        gap: 0.375rem;
    }
}
</style>
