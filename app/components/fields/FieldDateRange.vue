<template>
  <div class="field-daterange">
    <UInput type="date" :model-value="start" placeholder="Start" @update:model-value="start = $event; emit()" />
    <span class="field-daterange__sep">→</span>
    <UInput type="date" :model-value="end" placeholder="End" @update:model-value="end = $event; emit()" />
  </div>
</template>

<script lang="ts" setup>
const props = defineProps<{ field: any; modelValue: unknown }>()
const emitFn = defineEmits<{ 'update:modelValue': [v: unknown] }>()

const parsed = computed(() => props.modelValue as any)
const start = ref(parsed.value?.start?.slice(0, 10) ?? '')
const end = ref(parsed.value?.end?.slice(0, 10) ?? '')

function emit() { emitFn('update:modelValue', { start: start.value, end: end.value }) }
</script>

<style lang="scss" scoped>
.field-daterange { display: flex; align-items: center; gap: 0.5rem; }
.field-daterange__sep { opacity: 0.4; font-size: 0.875rem; }
</style>
