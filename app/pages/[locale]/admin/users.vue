<template>
  <div class="users-page">
    <div class="users-page__header">
      <h1 class="users-page__title">Users</h1>
      <UButton icon="i-lucide-user-plus" @click="showNew = true">Invite user</UButton>
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
          <UBadge
            v-for="r in row.original.roles"
            :key="r.role.id"
            :label="r.role.name"
            color="neutral"
            variant="subtle"
            size="xs"
          />
        </div>
      </template>
      <template #status-cell="{ row }">
        <UBadge
          :label="row.original.status"
          :color="row.original.status === 'ACTIVE' ? 'success' : 'neutral'"
          variant="subtle"
          size="xs"
        />
      </template>
      <template #actions-cell="{ row }">
        <UButton size="xs" variant="ghost" icon="i-lucide-edit" @click="editUser(row.original)" />
      </template>
    </UTable>

    <!-- Invite Modal -->
    <UModal v-model:open="showNew" title="Invite user">
      <template #body>
        <UForm :schema="inviteSchema" :state="inviteState" @submit="invite">
          <UFormField label="Name" name="name">
            <UInput v-model="inviteState.name" placeholder="Jane Smith" />
          </UFormField>
          <UFormField label="Email" name="email">
            <UInput v-model="inviteState.email" type="email" placeholder="jane@example.com" />
          </UFormField>
          <USelectMenu v-model="inviteState.roleIds" :options="roleOptions" multiple placeholder="Assign roles" />
          <div class="users-page__modal-actions">
            <UButton type="submit" :loading="inviting">Invite</UButton>
            <UButton variant="ghost" type="button" @click="showNew = false">Cancel</UButton>
          </div>
        </UForm>
      </template>
    </UModal>

    <!-- Edit Modal -->
    <UModal v-model:open="editOpen" title="Edit user">
      <template #body>
        <UForm v-if="editTarget" :state="editTarget" @submit="saveEdit">
          <UFormField label="Name"><UInput v-model="editTarget.name" /></UFormField>
          <UFormField label="Status">
            <USelect v-model="editTarget.status" :options="[{label:'Active',value:'ACTIVE'},{label:'Inactive',value:'INACTIVE'}]" />
          </UFormField>
          <div class="users-page__modal-actions">
            <UButton type="submit" :loading="editSaving">Save</UButton>
            <UButton variant="ghost" @click="editOpen = false">Cancel</UButton>
          </div>
        </UForm>
      </template>
    </UModal>
  </div>
</template>

<script lang="ts" setup>
import { z } from 'zod'

definePageMeta({ middleware: 'auth' })

const { data, pending, refresh } = await useFetch('/api/users')
const items = computed(() => (data.value as any)?.items ?? [])

const { data: rolesData } = await useFetch('/api/roles')
const roleOptions = computed(() => (rolesData.value as any[])?.map(r => ({ label: r.name, value: r.id })) ?? [])

const showNew = ref(false)
const inviting = ref(false)
const toast = useToast()

const inviteSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
})
const inviteState = reactive({ name: '', email: '', roleIds: [] as string[] })

async function invite() {
  inviting.value = true
  try {
    await $fetch('/api/users', { method: 'POST', body: inviteState })
    toast.add({ title: 'User invited', color: 'success' })
    showNew.value = false
    Object.assign(inviteState, { name: '', email: '', roleIds: [] })
    refresh()
  }
  catch (e: any) {
    toast.add({ title: 'Error', description: e.data?.message, color: 'error' })
  }
  finally { inviting.value = false }
}

const editOpen = ref(false)
const editTarget = ref<any>(null)
const editSaving = ref(false)

function editUser(u: any) {
  editTarget.value = { ...u }
  editOpen.value = true
}

async function saveEdit() {
  editSaving.value = true
  try {
    await $fetch(`/api/users/${editTarget.value.id}`, { method: 'PATCH', body: { name: editTarget.value.name, status: editTarget.value.status } })
    toast.add({ title: 'User updated', color: 'success' })
    editOpen.value = false
    refresh()
  }
  finally { editSaving.value = false }
}

const columns = [
  { accessorKey: 'name', header: 'User' },
  { accessorKey: 'roles', header: 'Roles' },
  { accessorKey: 'status', header: 'Status' },
  { accessorKey: 'actions', header: '' },
]
</script>

<style lang="scss" scoped>
.users-page {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;

  &__header { display: flex; align-items: center; justify-content: space-between; }
  &__title { font-size: 1.5rem; font-weight: 700; margin: 0; }

  &__name { font-weight: 500; font-size: 0.875rem; }
  &__email { font-size: 0.75rem; opacity: 0.55; }

  &__roles { display: flex; flex-wrap: wrap; gap: 0.25rem; }

  &__modal-actions {
    display: flex;
    gap: 0.5rem;
    justify-content: flex-end;
    margin-top: 1rem;
  }
}
</style>
