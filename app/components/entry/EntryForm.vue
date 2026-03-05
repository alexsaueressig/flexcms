<template>
  <div class="entry-form">
    <EntryFormField v-for="field in visibleFields" :key="field.id" :field="field"
      :component="fieldComponent(field.type)" :type-label="typeLabel(field.type)" :model-value="getValue(field.id)"
      @update:model-value="setValue(field.id, field.type, $event)" />
  </div>
</template>

<script lang="ts" setup>
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

const { fieldComponent, typeLabel } = useFieldTypes()
const visibleFields = computed(() => props.fields.filter(f => !f.isHidden))
const localValues = ref<FieldValue[]>([...props.values])
watch(() => props.values, (v) => { localValues.value = [...v] })

function getValue(fieldId: string): unknown {
  const v = localValues.value.find(x => x.blueprintFieldId === fieldId)
  if (!v) return null
  return v.valueText ?? v.valueNumber ?? v.valueBool ?? v.valueJson ?? v.valueMedia ?? null
}

function setValue(fieldId: string, type: string, value: unknown) {
  const patch: FieldValue = { blueprintFieldId: fieldId }

  if (['STRING', 'RICH_TEXT', 'SELECT_SINGLE', 'SELECT_MULTI', 'TAGS', 'COLOR'].includes(type))
    patch.valueText = value as string
  else if (type === 'NUMBER') patch.valueNumber = value as number
  else if (type === 'BOOLEAN') patch.valueBool = value as boolean
  else if (['MEDIA_IMAGE', 'MEDIA_VIDEO', 'MEDIA_FILE'].includes(type)) patch.valueMedia = value as string
  else patch.valueJson = value

  const idx = localValues.value.findIndex(x => x.blueprintFieldId === fieldId)
  if (idx >= 0) localValues.value[idx] = { ...localValues.value[idx], ...patch }
  else localValues.value.push(patch)

  emit('update:values', localValues.value)
}
</script>

<style lang="scss" scoped>
.entry-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}
</style>
