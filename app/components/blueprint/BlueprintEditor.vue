<template>
  <div class="blueprint-editor">
    <div class="blueprint-editor__toolbar">
      <UButton icon="i-lucide-plus" size="sm" @click="addField">Add field</UButton>
      <UButton icon="i-lucide-save" size="sm" :loading="saving" variant="outline" @click="save">
        Save blueprint
      </UButton>
    </div>

    <div v-if="fields.length === 0" class="blueprint-editor__empty">
      <UIcon name="i-lucide-layout-template" />
      <p>No fields yet. Add one to define the content schema.</p>
    </div>

    <VueDraggable v-else v-model="fields" handle=".blueprint-field-row__handle" class="blueprint-editor__list">
      <BlueprintFieldRow v-for="(field, i) in fields" :key="field.id ?? i" :field="field" :type-options="typeOptions"
        @update:field="fields[i] = $event" @remove="fields.splice(i, 1)" />
    </VueDraggable>
  </div>
</template>

<script lang="ts" setup>
import { VueDraggable } from 'vue-draggable-plus'

const props = defineProps<{
  entryId: string
  existing: any | null
}>()

const emit = defineEmits<{ saved: [] }>()
const saving = ref(false)
const toast = useToast()

interface Field {
  id?: string
  label: string
  key: string
  type: string
  order: number
  isRequired: boolean
  isHidden: boolean
  config: Record<string, any>
}

const fields = ref<Field[]>(props.existing?.fields?.map((f: any) => ({ ...f })) ?? [])

const typeOptions = [
  { value: 'STRING', label: 'Short text' },
  { value: 'RICH_TEXT', label: 'Rich text' },
  { value: 'NUMBER', label: 'Number' },
  { value: 'BOOLEAN', label: 'Boolean' },
  { value: 'MEDIA_IMAGE', label: 'Image' },
  { value: 'MEDIA_VIDEO', label: 'Video' },
  { value: 'MEDIA_FILE', label: 'File' },
  { value: 'DATETIME', label: 'Date & time' },
  { value: 'DATE_RANGE', label: 'Date range' },
  { value: 'SELECT_SINGLE', label: 'Single select' },
  { value: 'SELECT_MULTI', label: 'Multi-select' },
  { value: 'TAGS', label: 'Tags' },
  { value: 'RELATION_ONE', label: 'Relation (one)' },
  { value: 'RELATION_MANY', label: 'Relation (many)' },
  { value: 'GEO', label: 'Geospatial' },
  { value: 'JSON', label: 'JSON blob' },
  { value: 'COLOR', label: 'Color' },
]

function addField() {
  fields.value.push({
    label: '', key: '', type: 'STRING',
    order: fields.value.length,
    isRequired: false, isHidden: false, config: {},
  })
}

async function save() {
  saving.value = true
  try {
    await $fetch(`/api/blueprints/${props.entryId}`, {
      method: 'PUT',
      body: { fields: fields.value.map((f, i) => ({ ...f, order: i })) },
    })
    toast.add({ title: 'Blueprint saved', color: 'success' })
    emit('saved')
  }
  catch (e: any) {
    toast.add({ title: 'Save failed', description: e.data?.message, color: 'error' })
  }
  finally { saving.value = false }
}
</script>

<style lang="scss" scoped>
.blueprint-editor {
  display: flex;
  flex-direction: column;
  gap: 1rem;

  &__toolbar {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }

  &__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    padding: 3rem;
    text-align: center;
    opacity: 0.5;
    border: 2px dashed var(--ui-border);
    border-radius: 0.75rem;
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 0.625rem;
  }
}
</style>
