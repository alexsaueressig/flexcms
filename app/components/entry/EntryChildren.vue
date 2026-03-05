<template>
  <div class="entry-children">
    <div class="entry-children__header">
      <UInput v-model="search" icon="i-lucide-search" placeholder="Search children…" class="entry-children__search" />
      <div class="entry-children__header-actions">
        <UButton icon="i-lucide-settings" size="sm" variant="ghost" color="neutral" @click="$emit('open-blueprint')" />
        <UModal v-model:open="showNew" title="New child entry"
          description="Fill in the details to create a new child entry.">
          <UButton icon="i-lucide-plus" size="sm">New child</UButton>
          <template #body>
            <EntryNewEntryForm :locale="locale" :parent-id="entryId" :fields="blueprint?.fields ?? []"
              @created="onCreate" @cancel="showNew = false" />
          </template>
        </UModal>
      </div>
    </div>

    <UTable :data="items" :columns="columns" :loading="pending">
      <template #title-cell="{ row }">
        <NuxtLink :to="`/${locale}/entries/${row.original.id}`" class="entry-children__link">
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
    <UModal v-model:open="showEdit" title="Edit entry" description="Update the entry details.">
      <template #body>
        <EntryNewEntryForm :key="editingEntry?.id" :locale="locale" :parent-id="entryId"
          :fields="blueprint?.fields ?? []" :entry="editingEntry" @updated="onUpdated" @cancel="showEdit = false" />
      </template>
    </UModal>

    <!-- Delete confirmation modal -->
    <UModal v-model:open="showDelete" title="Delete entry" description="Are you sure? This action cannot be undone.">
      <template #body>
        <p>Delete <strong>{{ deletingEntry?.title }}</strong>?</p>
        <div class="entry-children__delete-actions">
          <UButton color="error" :loading="deleting" @click="doDelete">Delete</UButton>
          <UButton variant="ghost" @click="showDelete = false">Cancel</UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script lang="ts" setup>
import { useEntriesStore } from '~/stores/entries'

const props = defineProps<{ entryId: string; locale: string; blueprint?: any }>()
defineEmits<{ 'open-blueprint': [] }>()
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

const { data, pending, refresh } = useFetch(() => `/api/entries/${props.entryId}/children`, {
  params: computed(() => ({ locale: props.locale, limit, offset: offset.value, search: search.value || undefined })),
  watch: [search, offset],
})

const items = computed(() => (data.value as any)?.items ?? [])
const total = computed(() => (data.value as any)?.total ?? 0)

const columns = [
  { accessorKey: 'title', header: 'Title' },
  { accessorKey: 'slug', header: 'Slug' },
  { accessorKey: 'children', header: 'Children' },
  { accessorKey: 'actions', header: '' },
]

async function onCreate() {
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

  &__delete-actions {
    display: flex;
    gap: 0.5rem;
    justify-content: flex-end;
    margin-top: 1rem;
  }
}
</style>
