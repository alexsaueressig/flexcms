<template>
  <UInput
    :model-value="modelValue as string ?? ''"
    :placeholder="field.config.placeholder ?? ''"
    :maxlength="field.config.maxLength"
    @update:model-value="$emit('update:modelValue', $event)"
  />
</template>

<script lang="ts" setup>
defineProps<{ field: any; modelValue: unknown }>()
defineEmits<{ 'update:modelValue': [v: string] }>()
</script>
