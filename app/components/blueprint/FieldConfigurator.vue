<template>
  <div class="field-cfg">
    <!-- Choices editor for SELECT fields -->
    <template v-if="type === 'SELECT_SINGLE' || type === 'SELECT_MULTI'">
      <div class="field-cfg__label">Choices</div>
      <div
        v-for="(choice, i) in choices"
        :key="i"
        class="field-cfg__choice-row"
      >
        <UInput v-model="choice.label" placeholder="Label" size="sm" />
        <UInput v-model="choice.value" placeholder="value" size="sm" :ui="{ base: 'font-mono text-xs' }" />
        <UButton icon="i-lucide-x" size="xs" variant="ghost" color="error" @click="removeChoice(i)" />
      </div>
      <UButton icon="i-lucide-plus" size="xs" variant="ghost" @click="addChoice">Add choice</UButton>
    </template>

    <!-- Number config -->
    <template v-else-if="type === 'NUMBER'">
      <div class="field-cfg__row">
        <UFormField label="Min"><UInput v-model.number="model.min" type="number" size="sm" /></UFormField>
        <UFormField label="Max"><UInput v-model.number="model.max" type="number" size="sm" /></UFormField>
        <UFormField label="Step"><UInput v-model.number="model.step" type="number" size="sm" /></UFormField>
      </div>
    </template>

    <!-- String config -->
    <template v-else-if="type === 'STRING'">
      <div class="field-cfg__row">
        <UFormField label="Max length"><UInput v-model.number="model.maxLength" type="number" size="sm" /></UFormField>
        <UFormField label="Placeholder"><UInput v-model="model.placeholder" size="sm" /></UFormField>
      </div>
    </template>

    <!-- Relation config -->
    <template v-else-if="type === 'RELATION_ONE' || type === 'RELATION_MANY'">
      <UFormField label="Related blueprint entry ID (optional)">
        <UInput v-model="model.relatedBlueprintEntryId" size="sm" placeholder="Entry ID" />
      </UFormField>
    </template>
  </div>
</template>

<script lang="ts" setup>
const props = defineProps<{ type: string; modelValue: Record<string, any> }>()
const emit = defineEmits<{ 'update:modelValue': [v: Record<string, any>] }>()

const model = computed({
  get: () => props.modelValue ?? {},
  set: (v) => emit('update:modelValue', v),
})

const choices = computed({
  get: () => model.value.choices ?? [],
  set: (v) => emit('update:modelValue', { ...model.value, choices: v }),
})

function addChoice() {
  emit('update:modelValue', {
    ...model.value,
    choices: [...choices.value, { label: '', value: '' }],
  })
}
function removeChoice(i: number) {
  emit('update:modelValue', {
    ...model.value,
    choices: choices.value.filter((_: any, idx: number) => idx !== i),
  })
}
</script>

<style lang="scss" scoped>
.field-cfg {
  border-top: 1px solid var(--ui-border);
  padding-top: 0.625rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  &__label { font-size: 0.75rem; font-weight: 600; opacity: 0.6; }

  &__choice-row {
    display: flex;
    gap: 0.375rem;
    align-items: center;
  }

  &__row {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
  }
}
</style>
