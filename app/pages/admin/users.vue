<template>
    <div class="users-page">
        <div class="users-page__header">
            <h1 class="users-page__title">{{ $t('users.title') }}</h1>
            <UButton icon="i-lucide-user-plus" @click="showNew = true">{{ $t('users.invite') }}</UButton>
        </div>

        <UTable :data="items" :columns="columns" :loading="pending">
            <template #name-cell="{ row }">
                <div>
                    <div class="users-page__name">{{ row.original.name }}</div>
                    <div class="users-page__email">{{ row.original.email }}</div>
                </div>
            </template>
            <template #roles-cell="{ row }">
                <div class="users-page__roles">
                    <UBadge v-for="r in row.original.roles" :key="r.role.id" :label="r.role.name" color="neutral"
                        variant="subtle" size="xs" />
                </div>
            </template>
            <template #status-cell="{ row }">
                <UBadge :label="row.original.status" :color="row.original.status === 'ACTIVE' ? 'success' : 'neutral'"
                    variant="subtle" size="xs" />
            </template>
            <template #actions-cell="{ row }">
                <UButton size="xs" variant="ghost" icon="i-lucide-edit" @click="editUser(row.original)" />
            </template>
        </UTable>

        <!-- Invite Modal -->
        <UModal v-model:open="showNew" :title="$t('users.inviteTitle')">
            <template #body>
                <UForm :schema="inviteSchema" :state="inviteState" @submit="invite">
                    <UFormField :label="$t('users.name')" name="name">
                        <UInput v-model="inviteState.name" :placeholder="$t('users.namePlaceholder')" />
                    </UFormField>
                    <UFormField :label="$t('users.email')" name="email">
                        <UInput v-model="inviteState.email" type="email" :placeholder="$t('users.emailPlaceholder')" />
                    </UFormField>
                    <USelectMenu v-model="inviteState.roleIds" :items="roleOptions" multiple
                        :placeholder="$t('users.assignRoles')" />
                    <div class="users-page__modal-actions">
                        <UButton type="submit" :loading="inviting">{{ $t('common.invite') }}</UButton>
                        <UButton variant="ghost" type="button" @click="showNew = false">{{ $t('entries.cancel') }}
                        </UButton>
                    </div>
                </UForm>
            </template>
        </UModal>

        <!-- Edit Modal -->
        <UModal v-model:open="editOpen" :title="$t('users.editTitle')">
            <template #body>
                <UForm v-if="editTarget" :state="editTarget" @submit="saveEdit">
                    <UFormField :label="$t('users.name')">
                        <UInput v-model="editTarget.name" />
                    </UFormField>
                    <UFormField :label="$t('table.status')">
                        <USelect v-model="editTarget.status"
                            :items="[{ label: t('users.statusActive'), value: 'ACTIVE' }, { label: t('users.statusInactive'), value: 'INACTIVE' }]" />
                    </UFormField>
                    <div class="users-page__modal-actions">
                        <UButton type="submit" :loading="editSaving">{{ $t('common.save') }}</UButton>
                        <UButton variant="ghost" @click="editOpen = false">{{ $t('entries.cancel') }}</UButton>
                    </div>
                </UForm>
            </template>
        </UModal>
    </div>
</template>

<script lang="ts" setup>
definePageMeta({ middleware: 'auth' })

const { t } = useI18n()

const { data, pending, refresh } = await useFetch('/api/users')
const items = computed(() => (data.value as any)?.items ?? [])

const { data: rolesData } = await useFetch('/api/roles')
const roleOptions = computed(() => (rolesData.value as any[])?.map(r => ({ label: r.name, value: r.id })) ?? [])

const {
    showNew, inviting, inviteSchema, inviteState, invite,
    editOpen, editTarget, editSaving, editUser, saveEdit,
} = useUserCrud(refresh)

const columns = computed(() => [
    { accessorKey: 'name', header: t('table.user') },
    { accessorKey: 'roles', header: t('table.roles') },
    { accessorKey: 'status', header: t('table.status') },
    { accessorKey: 'actions', header: '' },
])
</script>

<style lang="scss" scoped>
.users-page {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;

    &__header {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    &__title {
        font-size: 1.5rem;
        font-weight: 700;
        margin: 0;
    }

    &__name {
        font-weight: 500;
        font-size: 0.875rem;
    }

    &__email {
        font-size: 0.75rem;
        opacity: 0.55;
    }

    &__roles {
        display: flex;
        flex-wrap: wrap;
        gap: 0.25rem;
    }

    &__modal-actions {
        display: flex;
        gap: 0.5rem;
        justify-content: flex-end;
        margin-top: 1rem;
    }
}
</style>
