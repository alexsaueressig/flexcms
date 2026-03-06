<template>
  <div class="entry-children">
    <div class="entry-children__header">
      <UInput v-model="search" icon="i-lucide-search" :placeholder="$t('entries.searchChildren')"
        class="entry-children__search" />
      <div class="entry-children__header-actions">
        <UButton icon="i-lucide-settings" size="sm" variant="ghost" color="neutral" @click="$emit('open-blueprint')" />
        <UModal v-model:open="showNew" :title="$t('entries.newChildTitle')"
          :description="$t('entries.newChildDescription')">
          <UButton icon="i-lucide-plus" size="sm">{{ $t('entries.newChild') }}</UButton>
          <template #body>
            <EntryNewEntryForm :parent-id="entryId" :fields="blueprint?.fields ?? []" @created="onCreate"
              @cancel="showNew = false" />
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
          <UButton icon="i-lucide-edit-3" size="xs" variant="ghost" color="neutral"
            :to="localePath(`/entries/${row.original.id}/edit`)" />
          <UButton icon="i-lucide-trash-2" size="xs" variant="ghost" color="error"
            @click="confirmDelete(row.original)" />
        </div>
      </template>
    </UTable>

    <div class="entry-children__pagination">
      <UPagination v-model:page="page" :total="total" :items-per-page="pageSize" />
      <USelect v-model="selectedPageSize" :items="pageSizeOptions" size="sm"
        class="entry-children__page-size" />
    </div>

    <!-- Delete confirmation modal -->
    <EntryDeleteConfirm v-model:open="showDelete" :title="deletingEntry?.title" :loading="deleting"
      @confirm="doDelete" />
  </div>
</template>

<script lang="ts" setup>
const props = defineProps<{ entryId: string; blueprint?: any }>()
defineEmits<{ 'open-blueprint': [] }>()
const { t } = useI18n()
const localePath = useLocalePath()
const search = ref('')
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

const { data, pending, refresh } = useFetch(() => `/api/entries/${props.entryId}/children`, {
  params: computed(() => ({ limit: pageSize.value, offset: offset.value, search: search.value || undefined })),
  watch: [search, offset, pageSize],
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
  showNew, showDelete,
  deletingEntry, deleting,
  onCreated: onCreate, confirmDelete, doDelete,
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

  &__pagination {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    justify-content: flex-end;
  }

  &__page-size {
    width: 5rem;
  }
}
</style>
