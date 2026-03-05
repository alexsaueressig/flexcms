<template>
    <div class="entry-edit">
        <div v-if="pending" class="entry-edit__loading">
            <UIcon name="i-lucide-loader-2" class="animate-spin" />
        </div>

        <template v-else-if="entry">
            <!-- Header -->
            <div class="entry-edit__header">
                <div class="entry-edit__breadcrumb">
                    <NuxtLink :to="localePath(`/entries/${id}`)" class="entry-edit__bc-link">
                        <UIcon name="i-lucide-arrow-left" />
                        {{ entry.title }}
                    </NuxtLink>
                    <UIcon name="i-lucide-chevron-right" class="entry-edit__bc-sep" />
                    <span>{{ $t('entries.editFields') }}</span>
                </div>

                <div class="entry-edit__actions">
                    <EntryContentLocaleSwitcher v-model="contentLocale" :locales="dbLocales" />
                    <UButton v-if="fieldSchema?.fields?.length" icon="i-lucide-wand-2" variant="outline" color="neutral"
                        size="sm" :loading="magicLoading" @click="magicPopulate">
                        {{ $t('entries.magicPopulate') }}
                    </UButton>
                    <UButton icon="i-lucide-save" size="sm" :loading="saving" @click="save">{{ $t('entries.save') }}
                    </UButton>
                </div>
            </div>

            <!-- Fields -->
            <div v-if="!fieldSchema" class="entry-edit__empty">
                <UIcon name="i-lucide-layout-template" />
                <p>{{ $t('blueprint.noSchema') }}</p>
                <UButton v-if="entry.parent" icon="i-lucide-external-link" size="sm" variant="outline"
                    :to="localePath(`/entries/${entry.parent.id}`)">
                    {{ $t('blueprint.goToParent') }}
                </UButton>
            </div>

            <div v-else-if="!fieldSchema.fields?.length" class="entry-edit__empty">
                <UIcon name="i-lucide-layout-template" />
                <p>{{ $t('blueprint.noSchemaFields') }}</p>
            </div>

            <EntryForm v-else :fields="fieldSchema.fields" :values="fieldValues" :locale="contentLocale"
                @update:values="fieldValues = $event" />
        </template>

        <div v-else class="entry-edit__empty">{{ $t('entries.notFound') }}</div>
    </div>
</template>

<script lang="ts" setup>
import { useMagicPopulate } from '~/composables/useMagicPopulate'

definePageMeta({ middleware: 'auth' })

const { t } = useI18n()
const localePath = useLocalePath()
const route = useRoute()
const id = computed(() => String(route.params.id))
const saving = ref(false)
const toast = useToast()

const { contentLocale, locales: dbLocales } = useContentLocale()

const { data, pending, refresh } = await useFetch(() => `/api/entries/${id.value}`)
const entry = computed(() => data.value as any)
const fieldSchema = computed(() => entry.value?.fieldSchema ?? null)

const fieldValues = ref<any[]>([])
watch([entry, contentLocale], ([e]) => {
    if (e) fieldValues.value = (e.fieldValues ?? []).filter((v: any) => v.localeCode === contentLocale.value)
}, { immediate: true })

async function save() {
    saving.value = true
    try {
        await $fetch(`/api/entries/${id.value}/values`, {
            method: 'PUT',
            body: { localeCode: contentLocale.value, values: fieldValues.value },
        })
        toast.add({ title: t('entries.saved'), color: 'success' })
    }
    catch { toast.add({ title: t('entries.saveFailed'), color: 'error' }) }
    finally { saving.value = false }
}

const { loading: magicLoading, populate } = useMagicPopulate(id.value, contentLocale)
async function magicPopulate() {
    if (!fieldSchema.value?.fields) return
    await populate(fieldSchema.value.fields, fieldValues.value)
    await refresh()
}
</script>

<style lang="scss" scoped>
.entry-edit {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;

    &__loading {
        display: flex;
        justify-content: center;
        padding: 4rem;
        opacity: 0.4;
    }

    &__header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 1rem;
        flex-wrap: wrap;
    }

    &__breadcrumb {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        font-size: 0.875rem;
        opacity: 0.7;
    }

    &__bc-link {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        color: inherit;
        text-decoration: none;

        &:hover {
            text-decoration: underline;
        }
    }

    &__bc-sep {
        opacity: 0.4;
    }

    &__actions {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        flex-wrap: wrap;
    }

    &__empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
        padding: 3rem;
        text-align: center;
        opacity: 0.5;
    }
}
</style>
