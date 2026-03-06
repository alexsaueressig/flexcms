const PAGE_SIZE_OPTIONS = [10, 25, 50, 100]
const DEFAULT_PAGE_SIZE = 25

export function usePageSize() {
    const pageSize = useState<number>('pageSize', () => DEFAULT_PAGE_SIZE)
    const loaded = useState<boolean>('pageSizeLoaded', () => false)

    async function load() {
        if (loaded.value) return
        const prefs = await $fetch<Record<string, unknown>>('/api/preferences', { params: {} })
        const saved = prefs?.pageSize
        if (typeof saved === 'number' && PAGE_SIZE_OPTIONS.includes(saved)) {
            pageSize.value = saved
        }
        loaded.value = true
    }

    async function setPageSize(val: number) {
        pageSize.value = val
        await $fetch('/api/preferences', {
            method: 'PUT',
            body: { entryId: null, prefs: { pageSize: val } },
        })
    }

    onMounted(load)

    return {
        pageSize,
        pageSizeOptions: PAGE_SIZE_OPTIONS,
        setPageSize,
    }
}
