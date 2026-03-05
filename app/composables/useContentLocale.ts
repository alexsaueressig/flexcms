export function useContentLocale() {
  const { locale } = useI18n()
  const { data } = useFetch('/api/locales')
  const locales = computed(() => (data.value as any[]) ?? [])
  const contentLocale = ref(locale.value)
  return { contentLocale, locales }
}
