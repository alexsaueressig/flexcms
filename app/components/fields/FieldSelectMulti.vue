<template>
  <USelectMenu :model-value="selected" :items="options" multiple placeholder="Select options"
    @update:model-value="onUpdate" />
</template>

<script lang="ts" setup>
const props = defineProps<{ field: any; modelValue: unknown }>()
const emit = defineEmits<{ 'update:modelValue': [v: string] }>()

const options = computed(() => props.field.config.choices ?? [])

const selected = computed(() => {
  try {
    const v = props.modelValue as string
    return v ? JSON.parse(v) : []
  }
  catch { return [] }
})

function onUpdate(v: string[]) {
  emit('update:modelValue', JSON.stringify(v))
}
</script>
