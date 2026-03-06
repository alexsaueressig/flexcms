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
                    <UButton size="xs" variant="ghost" color="error" @click="confirm(row.original.id)">{{
                        $t('common.delete') }}</UButton>
                </div>
            </template>
        </UTable>

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
                <UButton color="error" @click="doDelete">{{ $t('entries.delete') }}</UButton>
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
const toast = useToast()

const entriesStore = useEntriesStore()

const { data, pending, refresh } = await useFetch('/api/entries', {
    params: computed(() => ({ archived: true, limit: 100 })),
})

const items = computed(() => (data.value as any)?.items ?? [])

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
    toast.add({ title: t('archive.notImplemented'), description: t('archive.hardDeleteNote'), color: 'warning' })
    deleteTarget.value = null
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
