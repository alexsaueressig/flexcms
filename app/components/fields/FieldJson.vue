<template>
  <div class="field-json">
    <textarea
      v-model="raw"
      class="field-json__textarea"
      :class="{ 'field-json__textarea--error': error }"
      spellcheck="false"
      @input="onInput"
    />
    <p v-if="error" class="field-json__error">{{ error }}</p>
  </div>
</template>

<script lang="ts" setup>
const props = defineProps<{ field: any; modelValue: unknown }>()
const emit = defineEmits<{ 'update:modelValue': [v: unknown] }>()

const raw = ref(
  props.modelValue != null
    ? JSON.stringify(props.modelValue, null, 2)
    : '',
)
const error = ref('')

watch(() => props.modelValue, (v) => {
  if (v != null) raw.value = JSON.stringify(v, null, 2)
})

function onInput() {
  try {
    const parsed = JSON.parse(raw.value)
    error.value = ''
    emit('update:modelValue', parsed)
  }
  catch (e: any) {
    error.value = 'Invalid JSON: ' + e.message
  }
}
</script>

<style lang="scss" scoped>
.field-json {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;

  &__textarea {
    width: 100%;
    min-height: 160px;
    font-family: var(--font-mono);
    font-size: 0.8125rem;
    line-height: 1.6;
    border: 1px solid var(--ui-border);
    border-radius: 0.5rem;
    padding: 0.75rem;
    background: var(--ui-bg);
    color: inherit;
    resize: vertical;
    outline: none;
    transition: border-color 0.15s;

    &:focus { border-color: var(--ui-color-primary-500); }
    &--error { border-color: var(--ui-color-error-500); }
  }

  &__error { font-size: 0.75rem; color: var(--ui-color-error-500); margin: 0; }
}
</style>
