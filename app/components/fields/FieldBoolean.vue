<template>
  <div class="field-boolean">
    <UToggle
      :model-value="modelValue as boolean ?? false"
      @update:model-value="$emit('update:modelValue', $event)"
    />
    <span class="field-boolean__label">
      {{ modelValue ? (field.config.labelTrue ?? 'Yes') : (field.config.labelFalse ?? 'No') }}
    </span>
  </div>
</template>

<script lang="ts" setup>
defineProps<{ field: any; modelValue: unknown }>()
defineEmits<{ 'update:modelValue': [v: boolean] }>()
</script>

<style lang="scss" scoped>
.field-boolean { display: flex; align-items: center; gap: 0.625rem; }
.field-boolean__label { font-size: 0.875rem; opacity: 0.7; }
</style>
