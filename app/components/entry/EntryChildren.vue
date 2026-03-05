<template>
  <div class="entry-children">
    <div class="entry-children__header">
      <UInput v-model="search" icon="i-lucide-search" :placeholder="$t('entries.searchChildren')" class="entry-children__search" />
      <div class="entry-children__header-actions">
        <UButton icon="i-lucide-settings" size="sm" variant="ghost" color="neutral" @click="$emit('open-blueprint')" />
        <UModal v-model:open="showNew" :title="$t('entries.newChildTitle')"
          :description="$t('entries.newChildDescription')">
          <UButton icon="i-lucide-plus" size="sm">{{ $t('entries.newChild') }}</UButton>
          <template #body>
            <EntryNewEntryForm :locale="locale" :parent-id="entryId" :fields="blueprint?.fields ?? []"
              @created="onCreate" @cancel="showNew = false" />
          </template>
        </UModal>
      </div>
    </div>

    <UTable :data="items" :columns="columns" :loading="pending">
      <template #title-cell="{ row }">
        <NuxtLink :to="localePath(`/entries/${row.original.id}`)" class="entry-children__link">
          {{ row.original.title }}
        </NuxtLink>
      </template>
      <template #children-cell="{ row }">
        {{ row.original._count?.children ?? 0 }}
      </template>
      <template #actions-cell="{ row }">
        <div class="entry-children__row-actions">
          <UButton icon="i-lucide-edit-3" size="xs" variant="ghost" color="neutral" @click="openEdit(row.original)" />
          <UButton icon="i-lucide-trash-2" size="xs" variant="ghost" color="error"
            @click="confirmDelete(row.original)" />
        </div>
      </template>
    </UTable>

    <UPagination v-model:page="page" :total="total" :items-per-page="limit" />

    <!-- Edit modal -->
    <UModal v-model:open="showEdit" :title="$t('entries.editEntry')" :description="$t('entries.editDescription')">
      <template #body>
        <EntryNewEntryForm :key="editingEntry?.id" :locale="locale" :parent-id="entryId"
          :fields="blueprint?.fields ?? []" :entry="editingEntry" @updated="onUpdated" @cancel="showEdit = false" />
      </template>
    </UModal>

    <!-- Delete confirmation modal -->
    <EntryEntryDeleteConfirm v-model:open="showDelete" :title="deletingEntry?.title" :loading="deleting"
      @confirm="doDelete" />
  </div>
</template>

<script lang="ts" setup>
const props = defineProps<{ entryId: string; locale: string; blueprint?: any }>()
defineEmits<{ 'open-blueprint': [] }>()
const { t } = useI18n()
const localePath = useLocalePath()
const search = ref('')
const page = ref(1)
const limit = 25

const offset = computed(() => (page.value - 1) * limit)

const { data, pending, refresh } = useFetch(() => `/api/entries/${props.entryId}/children`, {
  params: computed(() => ({ locale: props.locale, limit, offset: offset.value, search: search.value || undefined })),
  watch: [() => props.locale, search, offset],
})

const items = computed(() => (data.value as any)?.items ?? [])
const total = computed(() => (data.value as any)?.total ?? 0)

const columns = computed(() => [
  { accessorKey: 'title', header: t('table.title') },
  { accessorKey: 'slug', header: t('table.slug') },
  { accessorKey: 'children', header: t('table.children') },
  { accessorKey: 'actions', header: '' },
])

const {
  showNew, showEdit, showDelete,
  editingEntry, deletingEntry, deleting,
  onCreated: onCreate, openEdit, onUpdated, confirmDelete, doDelete,
} = useEntryCrud(refresh)
</script>

<style lang="scss" scoped>
.entry-children {
  display: flex;
  flex-direction: column;
  gap: 1rem;

  &__header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    justify-content: space-between;
  }

  &__header-actions {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  &__search {
    max-width: 280px;
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
}
</style>
