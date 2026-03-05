<template>
  <USelect :model-value="modelValue as string ?? ''" :items="options" :placeholder="$t('fields.selectOption')"
    @update:model-value="$emit('update:modelValue', $event)" />
</template>

<script lang="ts" setup>
const props = defineProps<{ field: any; modelValue: unknown }>()
defineEmits<{ 'update:modelValue': [v: string] }>()
const options = computed(() => props.field.config.choices ?? [])
</script>
