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
  // Which tree nodes are expanded
  const expanded = ref<Set<string>>(new Set())

  function setEntry(entry: EntryNode) {
    cache.value[entry.id] = entry
  }

  function getEntry(id: string): EntryNode | undefined {
    return cache.value[id]
  }

  function toggleExpand(id: string) {
    if (expanded.value.has(id)) {
      expanded.value.delete(id)
    }
    else {
      expanded.value.add(id)
    }
  }

  function isExpanded(id: string): boolean {
    return expanded.value.has(id)
  }

  function invalidate(id: string) {
    delete cache.value[id]
    loadedChildren.value.delete(id)
  }

  return { cache, loadedChildren, expanded, setEntry, getEntry, toggleExpand, isExpanded, invalidate }
})
