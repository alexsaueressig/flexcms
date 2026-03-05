<template>
  <div class="blueprint-editor">
    <div class="blueprint-editor__toolbar">
      <UButton icon="i-lucide-plus" size="sm" @click="addField">{{ $t('blueprint.addField') }}</UButton>
      <UButton icon="i-lucide-save" size="sm" :loading="saving" variant="outline" @click="save">
        {{ $t('blueprint.save') }}
      </UButton>
    </div>

    <div v-if="fields.length === 0" class="blueprint-editor__empty">
      <UIcon name="i-lucide-layout-template" />
      <p>{{ $t('blueprint.emptyState') }}</p>
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
const { t } = useI18n()
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

const typeOptions = computed(() => [
  { value: 'STRING', label: t('fields.types.string') },
  { value: 'RICH_TEXT', label: t('fields.types.rich_text') },
  { value: 'NUMBER', label: t('fields.types.number') },
  { value: 'BOOLEAN', label: t('fields.types.boolean') },
  { value: 'MEDIA_IMAGE', label: t('fields.types.media_image') },
  { value: 'MEDIA_VIDEO', label: t('fields.types.media_video') },
  { value: 'MEDIA_FILE', label: t('fields.types.media_file') },
  { value: 'DATETIME', label: t('fields.types.datetime') },
  { value: 'DATE_RANGE', label: t('fields.types.date_range') },
  { value: 'SELECT_SINGLE', label: t('fields.types.select_single') },
  { value: 'SELECT_MULTI', label: t('fields.types.select_multi') },
  { value: 'TAGS', label: t('fields.types.tags') },
  { value: 'RELATION_ONE', label: t('fields.types.relation_one') },
  { value: 'RELATION_MANY', label: t('fields.types.relation_many') },
  { value: 'GEO', label: t('fields.types.geo') },
  { value: 'JSON', label: t('fields.types.json') },
  { value: 'COLOR', label: t('fields.types.color') },
])

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
    toast.add({ title: t('blueprint.saved'), color: 'success' })
    emit('saved')
  }
  catch (e: any) {
    toast.add({ title: t('blueprint.saveFailed'), description: e.data?.message, color: 'error' })
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
