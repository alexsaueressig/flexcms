<template>
    <div class="entry-form-field">
        <div class="entry-form-field__header">
            <span class="entry-form-field__label">
                {{ field.label }}<span v-if="field.isRequired" class="entry-form-field__required">*</span>
            </span>
            <UBadge :label="typeLabel" size="xs" color="neutral" variant="subtle" />
        </div>
        <component :is="component" :field="field" :model-value="modelValue"
            @update:model-value="$emit('update:modelValue', $event)" />
    </div>
</template>

<script lang="ts" setup>
defineProps<{
    field: { id: string; label: string; type: string; isRequired: boolean; isHidden: boolean; config: Record<string, any> }
    component: any
    typeLabel: string
    modelValue: unknown
}>()
defineEmits<{ 'update:modelValue': [v: unknown] }>()
</script>

<style lang="scss" scoped>
.entry-form-field {
    border: 1px solid var(--ui-border);
    border-radius: 0.75rem;
    padding: 1rem 1.125rem;
    background: var(--ui-bg);
    transition: border-color 0.15s;

    &:hover {
        border-color: var(--ui-border-accented);
    }

    &__header {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 0.625rem;
    }

    &__label {
        font-size: 0.875rem;
        font-weight: 600;
        flex: 1;
    }

    &__required {
        color: var(--ui-color-error-500);
        margin-left: 2px;
    }
}
</style>
