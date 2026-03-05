import { useUiStore } from '~/stores/ui'

/**
 * Syncs the [locale] route param with $i18n.locale and uiStore.activeLocale,
 * so that all $t() calls and sidebar navigation reflect the current URL locale.
 */
export default defineNuxtPlugin(() => {
  const route = useRoute()
  const i18n = useNuxtApp().$i18n
  const uiStore = useUiStore()

  watch(
    () => route.params.locale as string | undefined,
    (code) => {
      if (!code) return
      const supported = (i18n as any).availableLocales as string[]
      if (supported.includes(code)) {
        ;(i18n as any).locale.value = code
        uiStore.activeLocale = code
      }
    },
    { immediate: true },
  )
})
