<template>
    <UModal v-model:open="open" :title="$t('entries.deleteEntry')" :description="$t('entries.deleteDescription')">
        <template #body>
            <p>{{ $t('entries.confirmDeleteMsg', { title }) }}</p>
            <div class="delete-confirm__actions">
                <UButton color="error" :loading="loading" @click="$emit('confirm')">{{ $t('common.delete') }}</UButton>
                <UButton variant="ghost" @click="open = false">{{ $t('entries.cancel') }}</UButton>
            </div>
        </template>
    </UModal>
</template>

<script lang="ts" setup>
defineProps<{ title?: string; loading?: boolean }>()
defineEmits<{ confirm: [] }>()
const open = defineModel<boolean>('open')
</script>

<style lang="scss" scoped>
.delete-confirm__actions {
    display: flex;
    gap: 0.5rem;
    justify-content: flex-end;
    margin-top: 1rem;
}
</style>
