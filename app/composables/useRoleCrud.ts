export function useRoleCrud(refreshFn: () => any) {
    const { t } = useI18n()
    const toast = useToast()

    const showNew = ref(false)
    const creating = ref(false)
    const newRole = reactive({ name: '', description: '' })

    const rolePermMap = ref<Record<string, { canView: boolean; canCreate: boolean; canEdit: boolean; canArchive: boolean }>>({})

    function syncPermMap(roles: any[]) {
        for (const role of roles) {
            const globalPerm = role.permissions?.find((p: any) => !p.entryId)
            rolePermMap.value[role.id] = {
                canView: globalPerm?.canView ?? false,
                canCreate: globalPerm?.canCreate ?? false,
                canEdit: globalPerm?.canEdit ?? false,
                canArchive: globalPerm?.canArchive ?? false,
            }
        }
    }

    async function savePerms(roleId: string) {
        const p = rolePermMap.value[roleId]
        await $fetch(`/api/roles/${roleId}/permissions`, {
            method: 'PUT',
            body: { permissions: [{ entryId: null, ...p }] },
        })
        toast.add({ title: t('roles.permissionsUpdated'), color: 'success' })
    }

    async function createRole() {
        creating.value = true
        try {
            await $fetch('/api/roles', { method: 'POST', body: newRole })
            toast.add({ title: t('roles.created'), color: 'success' })
            showNew.value = false
            refreshFn()
        }
        finally { creating.value = false }
    }

    async function deleteRole(id: string) {
        await $fetch(`/api/roles/${id}`, { method: 'DELETE' })
        refreshFn()
    }

    return {
        showNew, creating, newRole, rolePermMap,
        syncPermMap, savePerms, createRole, deleteRole,
    }
}
