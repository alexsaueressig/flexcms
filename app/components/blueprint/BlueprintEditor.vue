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

    <VueDraggable v-else v-model="fields" handle=".blueprint-editor__handle" class="blueprint-editor__list">
      <div v-for="(field, i) in fields" :key="field.id ?? i" class="blueprint-editor__field">
        <UIcon name="i-lucide-grip-vertical" class="blueprint-editor__handle" />

        <div class="blueprint-editor__field-body">
          <div class="blueprint-editor__field-row">
            <UInput v-model="field.label" placeholder="Label" class="blueprint-editor__label" @input="autoKey(i)" />
            <UInput v-model="field.key" placeholder="key" :ui="{ base: 'font-mono text-sm' }"
              class="blueprint-editor__key" />
            <USelect v-model="field.type" :items="typeOptions" class="blueprint-editor__type" />
            <div class="blueprint-editor__flags">
              <UTooltip text="Required">
                <UCheckbox v-model="field.isRequired" />
              </UTooltip>
            </div>
            <UButton icon="i-lucide-trash-2" size="xs" variant="ghost" color="error" @click="removeField(i)" />
          </div>

          <!-- Type-specific config -->
          <BlueprintFieldConfigurator v-if="needsConfig(field.type)" v-model="field.config" :type="field.type" />
        </div>
      </div>
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

function removeField(i: number) { fields.value.splice(i, 1) }

function autoKey(i: number) {
  const f = fields.value[i]
  if (f && !f.id) { // Only auto-fill key for new fields
    f.key = f.label.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/(^_|_$)/g, '')
  }
}

function needsConfig(type: string): boolean {
  return ['SELECT_SINGLE', 'SELECT_MULTI', 'RELATION_ONE', 'RELATION_MANY', 'NUMBER', 'STRING'].includes(type)
}

async function save() {
  saving.value = true
  try {
    await $fetch(`/api/blueprints/${props.entryId}`, {
      method: 'PUT',
      body: {
        fields: fields.value.map((f, i) => ({ ...f, order: i })),
      },
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

  &__field {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
    border: 1px solid var(--ui-border);
    border-radius: 0.75rem;
    padding: 0.875rem;
    background: var(--ui-bg);
  }

  &__handle {
    cursor: grab;
    opacity: 0.35;
    margin-top: 0.5rem;
    flex-shrink: 0;

    &:hover {
      opacity: 0.7;
    }
  }

  &__field-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  &__field-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  &__label {
    flex: 2;
    min-width: 140px;
  }

  &__key {
    flex: 1.5;
    min-width: 120px;
  }

  &__type {
    flex: 1;
    min-width: 140px;
  }

  &__flags {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }
}
</style>
