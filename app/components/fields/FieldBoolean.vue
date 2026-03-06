<template>
  <USwitch
    :model-value="modelValue as boolean ?? false"
    :label="modelValue ? (field.config.labelTrue ?? 'Yes') : (field.config.labelFalse ?? 'No')"
    @update:model-value="$emit('update:modelValue', $event)"
  />
</template>

<script lang="ts" setup>
defineProps<{ field: any; modelValue: unknown }>()
defineEmits<{ 'update:modelValue': [v: boolean] }>()
</script>
