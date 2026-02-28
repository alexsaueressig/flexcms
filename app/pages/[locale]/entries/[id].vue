<template>
  <div class="entry-detail">
    <div v-if="pending" class="entry-detail__loading">
      <UIcon name="i-lucide-loader-2" class="animate-spin" />
    </div>

    <template v-else-if="entry">
      <!-- Header -->
      <div class="entry-detail__header">
        <div class="entry-detail__breadcrumb">
          <NuxtLink :to="`/${locale}`" class="entry-detail__bc-link">Entries</NuxtLink>
          <UIcon name="i-lucide-chevron-right" class="entry-detail__bc-sep" />
          <span v-if="entry.parent">
            <NuxtLink :to="`/${locale}/entries/${entry.parent.id}`" class="entry-detail__bc-link">
              {{ entry.parent.title }}
            </NuxtLink>
            <UIcon name="i-lucide-chevron-right" class="entry-detail__bc-sep" />
          </span>
          <span>{{ entry.title }}</span>
        </div>

        <div class="entry-detail__actions">
          <UButton
            v-if="blueprint?.fields.length"
            icon="i-lucide-wand-2"
            variant="outline"
            color="neutral"
            size="sm"
            :loading="magicLoading"
            @click="magicPopulate"
          >
            Magic populate
          </UButton>
          <UButton icon="i-lucide-save" size="sm" :loading="saving" @click="save">Save</UButton>
          <UButton icon="i-lucide-archive" variant="ghost" color="neutral" size="sm" @click="archiveEntry">Archive</UButton>
        </div>
      </div>

      <!-- Tabs -->
      <UTabs v-model="activeTab" :items="tabs" class="entry-detail__tabs">
        <template #content="{ item }">
          <!-- Fields tab -->
          <div v-if="item.value === 'fields'" class="entry-detail__panel">
            <div v-if="!blueprint" class="entry-detail__no-blueprint">
              <UIcon name="i-lucide-layout-template" />
              <p>No blueprint defined. Go to the <strong>Blueprint</strong> tab to add fields.</p>
            </div>
            <EntryForm
              v-else
              :fields="blueprint.fields"
              :values="fieldValues"
              :locale="locale"
              @update:values="fieldValues = $event"
            />
          </div>

          <!-- Children tab -->
          <div v-if="item.value === 'children'" class="entry-detail__panel">
            <EntryChildren :entry-id="entry.id" :locale="locale" />
          </div>

          <!-- Blueprint tab -->
          <div v-if="item.value === 'blueprint'" class="entry-detail__panel">
            <BlueprintEditor :entry-id="entry.id" :existing="blueprint" @saved="refreshBlueprint" />
          </div>
        </template>
      </UTabs>
    </template>

    <div v-else class="entry-detail__not-found">
      Entry not found.
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useMagicPopulate } from '~/composables/useMagicPopulate'

definePageMeta({ middleware: 'auth' })

const route = useRoute()
const locale = computed(() => String(route.params.locale))
const id = computed(() => String(route.params.id))
const saving = ref(false)
const activeTab = ref('fields')
const toast = useToast()

const tabs = [
  { label: 'Fields', value: 'fields', icon: 'i-lucide-edit-3' },
  { label: 'Children', value: 'children', icon: 'i-lucide-git-branch' },
  { label: 'Blueprint', value: 'blueprint', icon: 'i-lucide-layout-template' },
]

const { data, pending, refresh } = await useFetch(() => `/api/entries/${id.value}`)
const entry = computed(() => data.value as any)
const blueprint = computed(() => entry.value?.blueprint ?? null)

const fieldValues = ref<any[]>([])
watch(entry, (e) => {
  if (e) fieldValues.value = e.fieldValues ?? []
}, { immediate: true })

async function save() {
  saving.value = true
  try {
    await $fetch(`/api/entries/${id.value}/values`, {
      method: 'PUT',
      body: { localeCode: locale.value, values: fieldValues.value },
    })
    toast.add({ title: 'Saved', color: 'success' })
  }
  catch {
    toast.add({ title: 'Save failed', color: 'error' })
  }
  finally { saving.value = false }
}

async function refreshBlueprint() {
  await refresh()
}

async function archiveEntry() {
  await $fetch(`/api/entries/${id.value}`, { method: 'DELETE' })
  await navigateTo(`/${locale.value}`)
}

const { loading: magicLoading, populate } = useMagicPopulate(id.value, locale.value)
async function magicPopulate() {
  if (!blueprint.value?.fields) return
  await populate(blueprint.value.fields, fieldValues.value)
  await refresh()
}
</script>

<style lang="scss" scoped>
.entry-detail {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;

  &__loading {
    display: flex;
    justify-content: center;
    padding: 4rem;
    opacity: 0.4;
  }

  &__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
    flex-wrap: wrap;
  }

  &__breadcrumb {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.875rem;
    opacity: 0.7;
    flex-wrap: wrap;
  }

  &__bc-link {
    color: inherit;
    text-decoration: none;
    &:hover { text-decoration: underline; }
  }

  &__bc-sep { opacity: 0.4; }

  &__actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  &__tabs { margin-top: 0.5rem; }

  &__panel { padding-top: 1rem; }

  &__no-blueprint {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    padding: 3rem;
    text-align: center;
    opacity: 0.5;
  }

  &__not-found {
    padding: 3rem;
    text-align: center;
    opacity: 0.5;
  }
}
</style>
