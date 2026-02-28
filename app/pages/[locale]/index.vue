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
        <UButton icon="i-lucide-archive" size="xs" variant="ghost" color="neutral" @click="archive(row.original.id)" />
      </template>
    </UTable>

    <div class="entries-page__pagination">
      <span class="entries-page__total">{{ total }} entries</span>
      <UPagination v-model:page="page" :total="total" :items-per-page="limit" />
    </div>
  </div>
</template>

<script lang="ts" setup>
definePageMeta({ middleware: 'auth' })

const route = useRoute()
const locale = computed(() => String(route.params.locale))
const search = ref('')
const page = ref(1)
const limit = 25
const showNew = ref(false)

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
  refresh()
}

function onCreated() {
  showNew.value = false
  refresh()
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
