<template>
  <div class="archive-page">
    <div class="archive-page__header">
      <h1 class="archive-page__title">Archive</h1>
    </div>

    <UTable :data="items" :columns="columns" :loading="pending">
      <template #title-cell="{ row }">
        <span>{{ row.original.title }}</span>
        <span class="archive-page__slug">{{ row.original.slug }}</span>
      </template>
      <template #archivedAt-cell="{ row }">
        {{ row.original.archivedAt ? new Date(row.original.archivedAt).toLocaleDateString() : '—' }}
      </template>
      <template #actions-cell="{ row }">
        <div class="archive-page__actions">
          <UButton size="xs" variant="outline" @click="restore(row.original.id)">Restore</UButton>
          <UButton size="xs" variant="ghost" color="error" @click="confirm(row.original.id)">Delete</UButton>
        </div>
      </template>
    </UTable>

    <UModal v-model:open="deleteTarget" title="Delete permanently">
      <template #body>
        <p>This will permanently delete the entry and all its children. This action cannot be undone.</p>
      </template>
      <template #footer>
        <UButton color="error" @click="doDelete">Delete permanently</UButton>
        <UButton variant="ghost" @click="deleteTarget = null">Cancel</UButton>
      </template>
    </UModal>
  </div>
</template>

<script lang="ts" setup>
definePageMeta({ middleware: 'auth' })

const route = useRoute()
const locale = computed(() => String(route.params.locale))
const deleteTarget = ref<string | null>(null)
const toast = useToast()

const { data, pending, refresh } = await useFetch('/api/entries', {
  params: computed(() => ({ locale: locale.value, archived: true, limit: 100 })),
})

const items = computed(() => (data.value as any)?.items ?? [])

const columns = [
  { accessorKey: 'title', header: 'Entry' },
  { accessorKey: 'archivedAt', header: 'Archived on' },
  { accessorKey: 'actions', header: '' },
]

async function restore(id: string) {
  await $fetch(`/api/entries/${id}/restore`, { method: 'PATCH' })
  toast.add({ title: 'Entry restored', color: 'success' })
  refresh()
}

function confirm(id: string) {
  deleteTarget.value = id
}

async function doDelete() {
  // Hard delete not shown in UI – entries stay archived; admins purge via DB
  toast.add({ title: 'Not implemented', description: 'Hard delete is done by a DB admin.', color: 'warning' })
  deleteTarget.value = null
}
</script>

<style lang="scss" scoped>
.archive-page {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;

  &__header { display: flex; align-items: center; justify-content: space-between; }
  &__title { font-size: 1.5rem; font-weight: 700; margin: 0; }

  &__slug {
    display: block;
    font-size: 0.75rem;
    opacity: 0.5;
    font-family: var(--font-mono);
  }

  &__actions { display: flex; gap: 0.375rem; }
}
</style>
