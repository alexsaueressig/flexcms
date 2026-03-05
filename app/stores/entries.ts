import { defineStore } from 'pinia'

interface EntryNode {
  id: string
  title: string
  slug: string
  localeCode: string
  order: number
  isArchived: boolean
  _count?: { children: number }
  children?: EntryNode[]
}

export const useEntriesStore = defineStore('entries', () => {
  // Flat cache: id → entry
  const cache = ref<Record<string, EntryNode>>({})
  // Which entry IDs have their children loaded
  const loadedChildren = ref<Set<string>>(new Set())
  // Which tree nodes are explicitly collapsed (all others are expanded by default)
  const collapsed = ref<Set<string>>(new Set())

  function setEntry(entry: EntryNode) {
    cache.value[entry.id] = entry
  }

  function getEntry(id: string): EntryNode | undefined {
    return cache.value[id]
  }

  function toggleExpand(id: string) {
    if (collapsed.value.has(id)) {
      collapsed.value.delete(id)
    }
    else {
      collapsed.value.add(id)
    }
  }

  function isExpanded(id: string): boolean {
    return !collapsed.value.has(id)
  }

  function invalidate(id: string) {
    delete cache.value[id]
    loadedChildren.value.delete(id)
  }

  // Increment to signal the sidebar tree should reload
  const treeVersion = ref(0)
  function refreshTree() {
    treeVersion.value++
  }

  return { cache, loadedChildren, collapsed, treeVersion, setEntry, getEntry, toggleExpand, isExpanded, invalidate, refreshTree }
})
