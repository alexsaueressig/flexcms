export function usePreferences(entryId?: string | null) {
  const prefs = ref<Record<string, unknown>>({})
  const loaded = ref(false)

  async function load() {
    const params = entryId ? { entryId } : {}
    prefs.value = await $fetch<Record<string, unknown>>('/api/preferences', { params })
    loaded.value = true
  }

  async function set(key: string, value: unknown) {
    prefs.value[key] = value
    await $fetch('/api/preferences', {
      method: 'PUT',
      body: { entryId: entryId ?? null, prefs: { [key]: value } },
    })
  }

  function get<T = unknown>(key: string, fallback?: T): T {
    return (prefs.value[key] as T) ?? fallback!
  }

  onMounted(load)

  return { prefs, loaded, get, set }
}
