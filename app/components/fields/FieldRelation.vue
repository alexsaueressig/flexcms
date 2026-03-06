<template>
  <div class="field-relation">
    <div class="field-relation__selected">
      <div v-for="entry in selectedEntries" :key="entry.id" class="field-relation__chip">
        <UIcon name="i-lucide-link" class="field-relation__chip-icon" />
        <span>{{ entry.title }}</span>
        <UButton size="2xs" icon="i-lucide-x" variant="ghost" color="neutral" @click="removeEntry(entry.id)" />
      </div>
    </div>

    <UButton v-if="canAddMore" size="sm" variant="outline" color="neutral" icon="i-lucide-plus"
      @click="pickerOpen = true">
      Link entry
    </UButton>

    <FieldsFieldRelationPicker v-model:open="pickerOpen" :parent-id="field.config?.relatedBlueprintEntryId" @select="selectEntry" />
  </div>
</template>

<script lang="ts" setup>
const props = defineProps<{ field: any; modelValue: unknown }>()
const emit = defineEmits<{ 'update:modelValue': [v: string[]] }>()

const pickerOpen = ref(false)
const selectedEntries = ref<any[]>([])
const isMany = computed(() => props.field.type === 'RELATION_MANY')
const canAddMore = computed(() => isMany.value || selectedEntries.value.length === 0)

// Initialize from modelValue (array of IDs) — resolve entry titles
watch(() => props.modelValue, async (val) => {
  const ids = Array.isArray(val) ? val : []
  if (!ids.length) { selectedEntries.value = []; return }
  // Avoid overwriting if IDs match
  const currentIds = selectedEntries.value.map(e => e.id)
  if (ids.length === currentIds.length && ids.every((id, i) => id === currentIds[i])) return
  // Fetch entry details for each ID
  const entries = await Promise.all(
    ids.map(id => $fetch(`/api/entries/${id}`).catch(() => null)),
  )
  selectedEntries.value = entries
    .filter(Boolean)
    .map((e: any) => ({ id: e.id, title: e.title }))
}, { immediate: true })

function selectEntry(e: any) {
  selectedEntries.value = isMany.value
    ? [...selectedEntries.value.filter(x => x.id !== e.id), e]
    : [e]
  pickerOpen.value = false
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

  &__selected {
    display: flex;
    flex-wrap: wrap;
    gap: 0.375rem;
  }

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

  &__chip-icon {
    opacity: 0.5;
    font-size: 0.75rem;
  }
}
</style>
