
<template>
  <div class="entry-form">
    <VueDraggable
      v-model="sortableFields"
      handle=".entry-form__drag-handle"
      class="entry-form__fields"
    >
      <div v-for="field in sortableFields" :key="field.id" class="entry-form__field-wrap">
        <div class="entry-form__field-header">
          <UIcon name="i-lucide-grip-vertical" class="entry-form__drag-handle" />
          <span class="entry-form__field-label">
            {{ field.label }}
            <span v-if="field.isRequired" class="entry-form__required">*</span>
          </span>
          <UBadge :label="typeLabel(field.type)" size="xs" color="neutral" variant="subtle" />
        </div>

        <component
          :is="fieldComponent(field.type)"
          :field="field"
          :model-value="getValue(field.id)"
          @update:model-value="setValue(field.id, field.type, $event)"
        />
      </div>
    </VueDraggable>
  </div>
</template>

<script lang="ts" setup>
import { VueDraggable } from 'vue-draggable-plus'
import FieldString from '~/components/fields/FieldString.vue'
import FieldRichText from '~/components/fields/FieldRichText.vue'
import FieldNumber from '~/components/fields/FieldNumber.vue'
import FieldBoolean from '~/components/fields/FieldBoolean.vue'
import FieldMedia from '~/components/fields/FieldMedia.vue'
import FieldDateTime from '~/components/fields/FieldDateTime.vue'
import FieldDateRange from '~/components/fields/FieldDateRange.vue'
import FieldSelectSingle from '~/components/fields/FieldSelectSingle.vue'
import FieldSelectMulti from '~/components/fields/FieldSelectMulti.vue'
import FieldTags from '~/components/fields/FieldTags.vue'
import FieldRelation from '~/components/fields/FieldRelation.vue'
import FieldGeo from '~/components/fields/FieldGeo.vue'
import FieldJson from '~/components/fields/FieldJson.vue'
import FieldColor from '~/components/fields/FieldColor.vue'

interface FieldDef {
  id: string
  label: string
  key: string
  type: string
  isRequired: boolean
  isHidden: boolean
  config: Record<string, any>
}

interface FieldValue {
  blueprintFieldId: string
  valueText?: string | null
  valueNumber?: number | null
  valueBool?: boolean | null
  valueJson?: unknown
  valueMedia?: string | null
}

const props = defineProps<{
  fields: FieldDef[]
  values: FieldValue[]
  locale: string
}>()

const emit = defineEmits<{
  'update:values': [values: FieldValue[]]
}>()

// Allow drag-reorder of visible fields (does not persist field order — that's the blueprint editor's job)
const sortableFields = ref<FieldDef[]>([...props.fields.filter(f => !f.isHidden)])
watch(() => props.fields, (f) => { sortableFields.value = f.filter(x => !x.isHidden) })

const localValues = ref<FieldValue[]>([...props.values])
watch(() => props.values, (v) => { localValues.value = [...v] })

function getValue(fieldId: string): unknown {
  const v = localValues.value.find(x => x.blueprintFieldId === fieldId)
  if (!v) return null
  return v.valueText ?? v.valueNumber ?? v.valueBool ?? v.valueJson ?? v.valueMedia ?? null
}

function setValue(fieldId: string, type: string, value: unknown) {
  const patch: FieldValue = { blueprintFieldId: fieldId }

  if (['STRING', 'RICH_TEXT', 'SELECT_SINGLE', 'SELECT_MULTI', 'TAGS', 'COLOR'].includes(type)) {
    patch.valueText = value as string
  }
  else if (type === 'NUMBER') patch.valueNumber = value as number
  else if (type === 'BOOLEAN') patch.valueBool = value as boolean
  else if (['MEDIA_IMAGE', 'MEDIA_VIDEO', 'MEDIA_FILE'].includes(type)) patch.valueMedia = value as string
  else patch.valueJson = value

  const idx = localValues.value.findIndex(x => x.blueprintFieldId === fieldId)
  if (idx >= 0) localValues.value[idx] = { ...localValues.value[idx], ...patch }
  else localValues.value.push(patch)

  emit('update:values', localValues.value)
}

const componentMap: Record<string, any> = {
  STRING: FieldString,
  RICH_TEXT: FieldRichText,
  NUMBER: FieldNumber,
  BOOLEAN: FieldBoolean,
  MEDIA_IMAGE: FieldMedia,
  MEDIA_VIDEO: FieldMedia,
  MEDIA_FILE: FieldMedia,
  DATETIME: FieldDateTime,
  DATE_RANGE: FieldDateRange,
  SELECT_SINGLE: FieldSelectSingle,
  SELECT_MULTI: FieldSelectMulti,
  TAGS: FieldTags,
  RELATION_ONE: FieldRelation,
  RELATION_MANY: FieldRelation,
  GEO: FieldGeo,
  JSON: FieldJson,
  COLOR: FieldColor,
}

function fieldComponent(type: string) {
  return componentMap[type] ?? FieldString
}

const typeLabelMap: Record<string, string> = {
  STRING: 'Text', RICH_TEXT: 'Rich text', NUMBER: 'Number', BOOLEAN: 'Boolean',
  MEDIA_IMAGE: 'Image', MEDIA_VIDEO: 'Video', MEDIA_FILE: 'File',
  DATETIME: 'Date/time', DATE_RANGE: 'Date range',
  SELECT_SINGLE: 'Select', SELECT_MULTI: 'Multi-select',
  TAGS: 'Tags', RELATION_ONE: 'Relation', RELATION_MANY: 'Relations',
  GEO: 'Geo', JSON: 'JSON', COLOR: 'Color',
}
function typeLabel(type: string): string { return typeLabelMap[type] ?? type }
</script>

<style lang="scss" scoped>
.entry-form {
  &__fields { display: flex; flex-direction: column; gap: 1.25rem; }

  &__field-wrap {
    border: 1px solid var(--ui-border);
    border-radius: 0.75rem;
    padding: 1rem 1.125rem;
    background: var(--ui-bg);
    transition: border-color 0.15s;

    &:hover { border-color: var(--ui-border-accented); }
  }

  &__field-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.625rem;
  }

  &__drag-handle {
    cursor: grab;
    opacity: 0.35;
    flex-shrink: 0;
    &:hover { opacity: 0.7; }
    &:active { cursor: grabbing; }
  }

  &__field-label {
    font-size: 0.875rem;
    font-weight: 600;
    flex: 1;
  }

  &__required { color: var(--ui-color-error-500); margin-left: 2px; }
}
</style>
