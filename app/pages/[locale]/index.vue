<template>
  <div class="entries-page">
    <div class="entries-page__header">
      <h1 class="entries-page__title">Entries</h1>
      <UModal v-model:open="showNew" title="New entry" description="Fill in the details to create a new entry.">
        <UButton icon="i-lucide-plus">New entry</UButton>
        <template #body>
          <EntryNewEntryForm :locale="locale" @created="onCreated" @cancel="showNew = false" />
        </template>
      </UModal>
    </div>

    <div class="entries-page__toolbar">
      <UInput v-model="search" icon="i-lucide-search" placeholder="Search entries…" class="entries-page__search" />
    </div>

    <UTable :data="items" :columns="columns" :loading="pending">
      <template #title-cell="{ row }">
        <NuxtLink :to="`/${locale}/entries/${row.original.id}`" class="entries-page__link">
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
          <UButton icon="i-lucide-edit-3" size="xs" variant="ghost" color="neutral" @click="openEdit(row.original)" />
          <UButton icon="i-lucide-trash-2" size="xs" variant="ghost" color="error"
            @click="confirmDelete(row.original)" />
        </div>
      </template>
    </UTable>

    <div class="entries-page__pagination">
      <span class="entries-page__total">{{ total }} entries</span>
      <UPagination v-model:page="page" :total="total" :items-per-page="limit" />
    </div>

    <!-- Edit modal -->
    <UModal v-model:open="showEdit" title="Edit entry" description="Update the entry details.">
      <template #body>
        <EntryNewEntryForm :key="editingEntry?.id" :locale="locale" :entry="editingEntry" @updated="onUpdated"
          @cancel="showEdit = false" />
      </template>
    </UModal>

    <!-- Delete confirmation modal -->
    <UModal v-model:open="showDelete" title="Delete entry" description="Are you sure? This action cannot be undone.">
      <template #body>
        <p>Delete <strong>{{ deletingEntry?.title }}</strong>?</p>
        <div class="entries-page__delete-actions">
          <UButton color="error" :loading="deleting" @click="doDelete">Delete</UButton>
          <UButton variant="ghost" @click="showDelete = false">Cancel</UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script lang="ts" setup>
import { useEntriesStore } from '~/stores/entries'

definePageMeta({ middleware: 'auth' })

const route = useRoute()
const locale = computed(() => String(route.params.locale))
const search = ref('')
const page = ref(1)
const limit = 25
const showNew = ref(false)
const showEdit = ref(false)
const showDelete = ref(false)
const editingEntry = ref<any>(null)
const deletingEntry = ref<any>(null)
const deleting = ref(false)
const entriesStore = useEntriesStore()

const offset = computed(() => (page.value - 1) * limit)

const { data, pending, refresh } = await useFetch('/api/entries', {
  params: computed(() => ({
    locale: locale.value,
    limit,
    offset: offset.value,
    search: search.value || undefined,
  })),
  watch: [locale, search, offset],
})

const items = computed(() => data.value?.items ?? [])
const total = computed(() => data.value?.total ?? 0)

const columns = [
  { accessorKey: 'title', header: 'Title' },
  { accessorKey: 'slug', header: 'Slug' },
  { accessorKey: 'children', header: 'Children' },
  { accessorKey: 'updatedAt', header: 'Updated' },
  { accessorKey: 'actions', header: '' },
]

async function archive(id: string) {
  await $fetch(`/api/entries/${id}`, { method: 'DELETE' })
  entriesStore.refreshTree()
  await refresh()
}

async function onCreated() {
  showNew.value = false
  entriesStore.refreshTree()
  await refresh()
}

function openEdit(entry: any) {
  editingEntry.value = entry
  showEdit.value = true
}

async function onUpdated() {
  showEdit.value = false
  entriesStore.refreshTree()
  await refresh()
}

function confirmDelete(entry: any) {
  deletingEntry.value = entry
  showDelete.value = true
}

async function doDelete() {
  if (!deletingEntry.value) return
  deleting.value = true
  try {
    await $fetch(`/api/entries/${deletingEntry.value.id}`, { method: 'DELETE' })
    showDelete.value = false
    entriesStore.refreshTree()
    refresh()
  }
  finally { deleting.value = false }
}
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

  &__delete-actions {
    display: flex;
    gap: 0.5rem;
    justify-content: flex-end;
    margin-top: 1rem;
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
