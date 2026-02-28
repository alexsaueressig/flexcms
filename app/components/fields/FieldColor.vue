<template>
  <div class="field-color">
    <input
      type="color"
      :value="modelValue as string ?? '#000000'"
      class="field-color__swatch"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
    <UInput
      :model-value="modelValue as string ?? ''"
      class="field-color__text"
      :ui="{ base: 'font-mono' }"
      maxlength="9"
      @update:model-value="$emit('update:modelValue', $event)"
    />
  </div>
</template>

<script lang="ts" setup>
defineProps<{ field: any; modelValue: unknown }>()
defineEmits<{ 'update:modelValue': [v: string] }>()
</script>

<style lang="scss" scoped>
.field-color {
  display: flex;
  align-items: center;
  gap: 0.625rem;

  &__swatch {
    width: 40px;
    height: 40px;
    border-radius: 0.5rem;
    border: 1px solid var(--ui-border);
    cursor: pointer;
    padding: 2px;
    background: none;
    flex-shrink: 0;
  }

  &__text { width: 120px; }
}
</style>
