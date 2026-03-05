import { useUiStore } from '~/stores/ui'

/**
 * Keeps uiStore.activeLocale in sync with the i18n locale managed by @nuxtjs/i18n.
 */
export default defineNuxtPlugin(() => {
  const { locale } = useNuxtApp().$i18n as any
  const uiStore = useUiStore()

  watch(locale, (code: string) => {
    uiStore.activeLocale = code
  }, { immediate: true })
})
