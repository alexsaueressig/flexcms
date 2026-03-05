import { z } from 'zod'

export function useUserCrud(refreshFn: () => any) {
  const { t } = useI18n()
  const toast = useToast()

  const showNew = ref(false)
  const inviting = ref(false)
  const inviteSchema = z.object({ name: z.string().min(1), email: z.string().email() })
  const inviteState = reactive({ name: '', email: '', roleIds: [] as string[] })

  async function invite() {
    inviting.value = true
    try {
      await $fetch('/api/users', { method: 'POST', body: inviteState })
      toast.add({ title: t('users.invited'), color: 'success' })
      showNew.value = false
      Object.assign(inviteState, { name: '', email: '', roleIds: [] })
      refreshFn()
    }
    catch (e: any) {
      toast.add({ title: t('common.error'), description: e.data?.message, color: 'error' })
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
      await $fetch(`/api/users/${editTarget.value.id}`, {
        method: 'PATCH',
        body: { name: editTarget.value.name, status: editTarget.value.status },
      })
      toast.add({ title: t('users.updated'), color: 'success' })
      editOpen.value = false
      refreshFn()
    }
    finally { editSaving.value = false }
  }

  return {
    showNew, inviting, inviteSchema, inviteState, invite,
    editOpen, editTarget, editSaving, editUser, saveEdit,
  }
}
