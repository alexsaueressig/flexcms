<template>
  <div class="entry-children">
    <div class="entry-children__header">
      <UInput v-model="search" icon="i-lucide-search" placeholder="Search children…" class="entry-children__search" />
      <UButton icon="i-lucide-plus" size="sm" @click="showNew = true">New child</UButton>
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
    </UTable>

    <UPagination v-model:page="page" :total="total" :items-per-page="limit" />

    <UModal v-model:open="showNew" title="New child entry">
      <template #body>
        <NewEntryForm :locale="locale" :parent-id="entryId" @created="onCreate" @cancel="showNew = false" />
      </template>
    </UModal>
  </div>
</template>

<script lang="ts" setup>
const props = defineProps<{ entryId: string; locale: string }>()
const search = ref('')
const page = ref(1)
const limit = 25
const showNew = ref(false)

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
]

function onCreate() {
  showNew.value = false
  refresh()
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

  &__search { max-width: 280px; }

  &__link {
    color: inherit;
    text-decoration: none;
    font-weight: 500;
    &:hover { text-decoration: underline; }
  }
}
</style>
