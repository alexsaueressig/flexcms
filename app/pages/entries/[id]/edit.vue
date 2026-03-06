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

                    <!-- Publish controls (only for users with canPublish) -->
                    <UDropdownMenu v-if="authStore.canPublish" :items="publishMenuItems">
                        <UButton size="sm" :color="statusBadgeColor" variant="subtle" :loading="publishing"
                            trailing-icon="i-lucide-chevron-down" class="entry-edit__status-btn">
                            <span class="entry-edit__status-dot" :class="`entry-edit__status-dot--${currentStatus}`" />
                            {{ $t(`entries.status.${currentStatus}`) }}
                        </UButton>
                    </UDropdownMenu>

                    <UButton icon="i-lucide-save" size="sm" :loading="saving" @click="save">{{ $t('entries.save') }}
                    </UButton>
                    <UButton icon="i-lucide-edit-3" size="sm" variant="outline" color="neutral" @click="showBlueprint = true">
                        {{ $t('entries.editFields') }}
                    </UButton>
                </div>
            </div>

            <!-- Blueprint modal -->
            <UModal v-model:open="showBlueprint" :title="$t('blueprint.title')" :description="$t('blueprint.description')">
                <template #body>
                    <BlueprintEditor :entry-id="id" :existing="blueprint" @saved="onBlueprintSaved" />
                </template>
            </UModal>

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

            <EntryForm v-else :fields="fieldSchema.fields" :values="fieldValues" :relations="fieldRelations"
                :locale="contentLocale" @update:values="fieldValues = $event"
                @update:relations="fieldRelations = $event" />
        </template>

        <div v-else class="entry-edit__empty">{{ $t('entries.notFound') }}</div>
    </div>
</template>

<script lang="ts" setup>
import { useAuthStore } from '~/stores/auth'

definePageMeta({ middleware: 'auth' })

const { t } = useI18n()
const localePath = useLocalePath()
const route = useRoute()
const id = computed(() => String(route.params.id))
const saving = ref(false)
const publishing = ref(false)
const showBlueprint = ref(false)
const toast = useToast()
const authStore = useAuthStore()

const { contentLocale, locales: dbLocales } = useContentLocale()

const { data, pending, refresh } = await useFetch(() => `/api/entries/${id.value}`)
const entry = computed(() => data.value as any)
const blueprint = computed(() => entry.value?.blueprint ?? null)
const fieldSchema = computed(() => entry.value?.fieldSchema ?? null)

const fieldValues = ref<any[]>([])
const fieldRelations = ref<any[]>([])
watch([entry, contentLocale], ([e]) => {
    if (e) {
        fieldValues.value = (e.fieldValues ?? []).filter((v: any) => v.localeCode === contentLocale.value)
        const rels = e.relationsFrom ?? []
        const grouped = new Map<string, string[]>()
        for (const r of rels) {
            const ids = grouped.get(r.blueprintFieldId) ?? []
            ids.push(r.targetEntryId)
            grouped.set(r.blueprintFieldId, ids)
        }
        fieldRelations.value = [...grouped.entries()].map(([blueprintFieldId, targetEntryIds]) => ({
            blueprintFieldId, targetEntryIds,
        }))
    }
}, { immediate: true })

// Publish status for the current locale
const currentLocaleRecord = computed(() =>
    (entry.value?.locales ?? []).find((l: any) => l.localeCode === contentLocale.value),
)
const currentStatus = computed(() => currentLocaleRecord.value?.publishStatus?.toLowerCase() ?? 'draft')
const statusBadgeColor = computed(() => {
    if (currentStatus.value === 'published') return 'success'
    if (currentStatus.value === 'scheduled') return 'info'
    return 'neutral'
})

const publishMenuItems = computed(() => {
    const items = []
    if (currentStatus.value !== 'published') {
        items.push({ label: t('entries.publishAction'), icon: 'i-lucide-send', onSelect: () => doPublish('publish') })
    }
    if (currentStatus.value === 'published' || currentStatus.value === 'scheduled') {
        items.push({ label: t('entries.unpublishAction'), icon: 'i-lucide-eye-off', onSelect: () => doPublish('unpublish') })
    }
    return items
})

async function doPublish(action: 'publish' | 'unpublish') {
    publishing.value = true
    try {
        await $fetch(`/api/entries/${id.value}/publish`, {
            method: 'PATCH',
            body: { localeCode: contentLocale.value, action },
        })
        toast.add({ title: action === 'publish' ? t('entries.published') : t('entries.unpublished'), color: 'success' })
        await refresh()
    }
    catch { toast.add({ title: t('common.error'), color: 'error' }) }
    finally { publishing.value = false }
}

async function onBlueprintSaved() {
    showBlueprint.value = false
    await refresh()
}

async function save() {
    saving.value = true
    try {
        await $fetch(`/api/entries/${id.value}/values`, {
            method: 'PUT',
            body: { localeCode: contentLocale.value, values: fieldValues.value, relations: fieldRelations.value },
        })
        toast.add({ title: t('entries.saved'), color: 'success' })
    }
    catch { toast.add({ title: t('entries.saveFailed'), color: 'error' }) }
    finally { saving.value = false }
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

    &__status-btn {
        cursor: pointer;
    }

    &__status-dot {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        flex-shrink: 0;

        &--draft     { background: var(--color-neutral-400); }
        &--published { background: var(--color-success-500); }
        &--scheduled { background: var(--color-info-500); }
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
