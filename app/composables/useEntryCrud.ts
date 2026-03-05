import { useEntriesStore } from '~/stores/entries'

export function useEntryCrud(refreshFn: () => Promise<any> | any) {
  const entriesStore = useEntriesStore()

  const showNew = ref(false)
  const showEdit = ref(false)
  const showDelete = ref(false)
  const editingEntry = ref<any>(null)
  const deletingEntry = ref<any>(null)
  const deleting = ref(false)

  async function onCreated() {
    showNew.value = false
    entriesStore.refreshTree()
    await refreshFn()
  }

  function openEdit(entry: any) {
    editingEntry.value = entry
    showEdit.value = true
  }

  async function onUpdated() {
    showEdit.value = false
    entriesStore.refreshTree()
    await refreshFn()
  }

  function confirmDelete(entry: any) {
    deletingEntry.value = entry
    showDelete.value = true
  }

  async function doDelete() {
    if (!deletingEntry.value) return
    deleting.value = true
    try {
      await $fetch(`/api/entries/${deletingEntry.value.id}`, { method: 'DELETE' })
      showDelete.value = false
      entriesStore.refreshTree()
      refreshFn()
    }
    finally { deleting.value = false }
  }

  return {
    showNew, showEdit, showDelete,
    editingEntry, deletingEntry, deleting,
    onCreated, openEdit, onUpdated, confirmDelete, doDelete,
  }
}
