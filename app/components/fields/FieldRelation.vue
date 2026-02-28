<template>
  <div class="field-relation">
    <div class="field-relation__selected">
      <div
        v-for="entry in selectedEntries"
        :key="entry.id"
        class="field-relation__chip"
      >
        <UIcon name="i-lucide-link" class="field-relation__chip-icon" />
        <span>{{ entry.title }}</span>
        <UButton size="2xs" icon="i-lucide-x" variant="ghost" color="neutral" @click="removeEntry(entry.id)" />
      </div>
    </div>

    <UButton
      v-if="canAddMore"
      size="sm"
      variant="outline"
      color="neutral"
      icon="i-lucide-plus"
      @click="open = true"
    >
      Link entry
    </UButton>

    <UModal v-model:open="open" title="Link entry">
      <template #body>
        <UInput v-model="search" icon="i-lucide-search" placeholder="Search entries…" />
        <ul class="field-relation__list">
          <li
            v-for="e in searchResults"
            :key="e.id"
            class="field-relation__list-item"
            @click="selectEntry(e)"
          >
            {{ e.title }}
            <span class="field-relation__list-slug">{{ e.slug }}</span>
          </li>
        </ul>
      </template>
    </UModal>
  </div>
</template>

<script lang="ts" setup>
const props = defineProps<{ field: any; modelValue: unknown }>()
const emit = defineEmits<{ 'update:modelValue': [v: string[]] }>()

const open = ref(false)
const search = ref('')
const selectedEntries = ref<any[]>([])

const isMany = computed(() => props.field.type === 'RELATION_MANY')
const canAddMore = computed(() => isMany.value || selectedEntries.value.length === 0)

const { data: searchData } = useFetch('/api/search', {
  params: computed(() => ({ q: search.value || '__all__', limit: 20 })),
  watch: [search],
})
const searchResults = computed(() => (searchData.value as any[]) ?? [])

function selectEntry(e: any) {
  if (!isMany.value) {
    selectedEntries.value = [e]
  }
  else if (!selectedEntries.value.find(x => x.id === e.id)) {
    selectedEntries.value = [...selectedEntries.value, e]
  }
  open.value = false
  emitUpdate()
}

function removeEntry(id: string) {
  selectedEntries.value = selectedEntries.value.filter(e => e.id !== id)
  emitUpdate()
}

function emitUpdate() {
  emit('update:modelValue', selectedEntries.value.map(e => e.id))
}
</script>

<style lang="scss" scoped>
.field-relation {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  &__selected { display: flex; flex-wrap: wrap; gap: 0.375rem; }

  &__chip {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.25rem 0.5rem;
    background: var(--ui-bg-elevated);
    border: 1px solid var(--ui-border);
    border-radius: 9999px;
    font-size: 0.8125rem;
  }

  &__chip-icon { opacity: 0.5; font-size: 0.75rem; }

  &__list { list-style: none; padding: 0; margin: 0.75rem 0 0; border-top: 1px solid var(--ui-border); }

  &__list-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.5rem 0.25rem;
    cursor: pointer;
    font-size: 0.875rem;
    border-radius: 0.375rem;
    transition: background 0.1s;

    &:hover { background: var(--ui-bg-muted); }
  }

  &__list-slug { font-family: var(--font-mono); font-size: 0.75rem; opacity: 0.45; }
}
</style>
