<template>
    <UModal v-model:open="open" title="Delete entry" description="Are you sure? This action cannot be undone.">
        <template #body>
            <p>Delete <strong>{{ title }}</strong>?</p>
            <div class="delete-confirm__actions">
                <UButton color="error" :loading="loading" @click="$emit('confirm')">Delete</UButton>
                <UButton variant="ghost" @click="open = false">Cancel</UButton>
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
