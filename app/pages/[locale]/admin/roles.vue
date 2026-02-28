<template>
  <div class="roles-page">
    <div class="roles-page__header">
      <h1 class="roles-page__title">Roles & Permissions</h1>
      <UButton icon="i-lucide-plus" @click="showNew = true">New role</UButton>
    </div>

    <div class="roles-page__grid">
      <div
        v-for="role in roles"
        :key="role.id"
        class="roles-page__card"
      >
        <div class="roles-page__card-header">
          <div>
            <h3 class="roles-page__role-name">{{ role.name }}</h3>
            <p v-if="role.description" class="roles-page__role-desc">{{ role.description }}</p>
          </div>
          <UBadge v-if="role.isSystem" label="System" color="neutral" size="xs" />
          <UButton
            v-if="!role.isSystem"
            size="xs"
            variant="ghost"
            color="error"
            icon="i-lucide-trash-2"
            @click="deleteRole(role.id)"
          />
        </div>

        <div class="roles-page__perms">
          <div class="roles-page__perm-row roles-page__perm-header">
            <span>Global permission</span>
            <div class="roles-page__perm-flags">
              <span>View</span><span>Create</span><span>Edit</span><span>Archive</span>
            </div>
          </div>
          <div class="roles-page__perm-row">
            <span class="roles-page__perm-scope">All entries</span>
            <div class="roles-page__perm-flags">
              <UCheckbox v-model="rolePermMap[role.id].canView" @change="savePerms(role.id)" />
              <UCheckbox v-model="rolePermMap[role.id].canCreate" @change="savePerms(role.id)" />
              <UCheckbox v-model="rolePermMap[role.id].canEdit" @change="savePerms(role.id)" />
              <UCheckbox v-model="rolePermMap[role.id].canArchive" @change="savePerms(role.id)" />
            </div>
          </div>
        </div>

        <div class="roles-page__users-count">
          {{ role._count?.users ?? 0 }} user{{ role._count?.users === 1 ? '' : 's' }}
        </div>
      </div>
    </div>

    <UModal v-model:open="showNew" title="New role">
      <template #body>
        <UForm :state="newRole" @submit="createRole">
          <UFormField label="Name"><UInput v-model="newRole.name" /></UFormField>
          <UFormField label="Description"><UInput v-model="newRole.description" /></UFormField>
          <div class="roles-page__modal-actions">
            <UButton type="submit" :loading="creating">Create</UButton>
            <UButton variant="ghost" @click="showNew = false">Cancel</UButton>
          </div>
        </UForm>
      </template>
    </UModal>
  </div>
</template>

<script lang="ts" setup>
definePageMeta({ middleware: 'auth' })

const showNew = ref(false)
const creating = ref(false)
const newRole = reactive({ name: '', description: '' })
const toast = useToast()

const { data, refresh } = await useFetch('/api/roles')
const roles = computed(() => data.value as any[] ?? [])

// Build a reactive permission map per role (global permissions only)
const rolePermMap = ref<Record<string, { canView: boolean; canCreate: boolean; canEdit: boolean; canArchive: boolean }>>({})

watch(roles, (rs) => {
  for (const role of rs) {
    const globalPerm = role.permissions?.find((p: any) => !p.entryId)
    rolePermMap.value[role.id] = {
      canView: globalPerm?.canView ?? false,
      canCreate: globalPerm?.canCreate ?? false,
      canEdit: globalPerm?.canEdit ?? false,
      canArchive: globalPerm?.canArchive ?? false,
    }
  }
}, { immediate: true })

async function savePerms(roleId: string) {
  const p = rolePermMap.value[roleId]
  await $fetch(`/api/roles/${roleId}/permissions`, {
    method: 'PUT',
    body: { permissions: [{ entryId: null, ...p }] },
  })
  toast.add({ title: 'Permissions updated', color: 'success' })
}

async function createRole() {
  creating.value = true
  try {
    await $fetch('/api/roles', { method: 'POST', body: newRole })
    toast.add({ title: 'Role created', color: 'success' })
    showNew.value = false
    refresh()
  }
  finally { creating.value = false }
}

async function deleteRole(id: string) {
  await $fetch(`/api/roles/${id}`, { method: 'DELETE' })
  refresh()
}
</script>

<style lang="scss" scoped>
.roles-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;

  &__header { display: flex; align-items: center; justify-content: space-between; }
  &__title { font-size: 1.5rem; font-weight: 700; margin: 0; }

  &__grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap: 1rem; }

  &__card {
    border: 1px solid var(--ui-border);
    border-radius: 0.75rem;
    padding: 1.125rem;
    display: flex;
    flex-direction: column;
    gap: 0.875rem;
    background: var(--ui-bg);
  }

  &__card-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 0.5rem;
  }

  &__role-name { font-weight: 600; margin: 0; }
  &__role-desc { font-size: 0.8125rem; opacity: 0.55; margin: 0.125rem 0 0; }

  &__perms { border-top: 1px solid var(--ui-border); padding-top: 0.75rem; display: flex; flex-direction: column; gap: 0.375rem; }

  &__perm-row { display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; font-size: 0.8125rem; }
  &__perm-header { opacity: 0.5; font-weight: 600; font-size: 0.75rem; }
  &__perm-flags { display: flex; gap: 1.25rem; }
  &__perm-scope { opacity: 0.7; }

  &__users-count { font-size: 0.75rem; opacity: 0.45; }

  &__modal-actions { display: flex; gap: 0.5rem; justify-content: flex-end; margin-top: 1rem; }
}
</style>
