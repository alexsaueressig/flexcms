<template>
  <UInput
    type="number"
    :model-value="modelValue as number ?? ''"
    :min="field.config.min"
    :max="field.config.max"
    :step="field.config.step ?? 1"
    @update:model-value="$emit('update:modelValue', Number($event))"
  >
    <template v-if="field.config.prefix" #leading>{{ field.config.prefix }}</template>
    <template v-if="field.config.suffix" #trailing>{{ field.config.suffix }}</template>
  </UInput>
</template>

<script lang="ts" setup>
defineProps<{ field: any; modelValue: unknown }>()
defineEmits<{ 'update:modelValue': [v: number] }>()
</script>
