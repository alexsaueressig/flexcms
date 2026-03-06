<template>
    <div class="blueprint-field-row">
        <UIcon name="i-lucide-grip-vertical" class="blueprint-field-row__handle" />
        <div class="blueprint-field-row__body">
            <div class="blueprint-field-row__inputs">
                <UInput v-model="local.label" :placeholder="$t('blueprint.fieldLabel')" class="blueprint-field-row__label" @input="autoKey" />
                <UInput v-model="local.key" :placeholder="$t('blueprint.fieldKey')" :ui="{ base: 'font-mono text-sm' }"
                    class="blueprint-field-row__key" />
                <USelect v-model="local.type" :items="typeOptions" class="blueprint-field-row__type" />
                <UTooltip :text="$t('blueprint.fieldRequired')">
                    <UCheckbox v-model="local.isRequired" />
                </UTooltip>
                <UButton icon="i-lucide-trash-2" size="xs" variant="ghost" color="error" @click="$emit('remove')" />
            </div>
            <BlueprintFieldConfigurator v-if="needsConfig" v-model="local.config" :type="local.type" />
        </div>
    </div>
</template>

<script lang="ts" setup>
interface Field {
    id?: string
    label: string
    key: string
    type: string
    order: number
    isRequired: boolean
    isHidden: boolean
    config: Record<string, any>
}

const props = defineProps<{
    field: Field
    typeOptions: { value: string; label: string }[]
}>()

const emit = defineEmits<{ 'update:field': [f: Field]; remove: [] }>()

const local = ref<Field>({ ...props.field })

watch(() => props.field, v => {
  if (JSON.stringify(v) !== JSON.stringify(local.value)) {
    local.value = { ...v, config: { ...v.config } }
  }
}, { deep: true })

watch(local, v => emit('update:field', { ...v, config: { ...v.config } }), { deep: true })

const needsConfig = computed(() =>
    ['SELECT_SINGLE', 'SELECT_MULTI', 'RELATION_ONE', 'RELATION_MANY', 'NUMBER', 'STRING'].includes(local.value.type),
)

function autoKey() {
    if (!local.value.id) {
        local.value.key = local.value.label.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/(^_|_$)/g, '')
    }
}
</script>

<style lang="scss" scoped>
.blueprint-field-row {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
    border: 1px solid var(--ui-border);
    border-radius: 0.75rem;
    padding: 0.875rem;
    background: var(--ui-bg);

    &__handle {
        cursor: grab;
        opacity: 0.35;
        margin-top: 0.5rem;
        flex-shrink: 0;

        &:hover {
            opacity: 0.7;
        }
    }

    &__body {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    &__inputs {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        flex-wrap: wrap;
    }

    &__label {
        flex: 2;
        min-width: 140px;
    }

    &__key {
        flex: 1.5;
        min-width: 120px;
    }

    &__type {
        flex: 1;
        min-width: 140px;
    }
}
</style>
