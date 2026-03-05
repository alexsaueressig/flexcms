<template>
    <div class="entry-edit">
        <div v-if="pending" class="entry-edit__loading">
            <UIcon name="i-lucide-loader-2" class="animate-spin" />
        </div>

        <template v-else-if="entry">
            <!-- Header -->
            <div class="entry-edit__header">
                <div class="entry-edit__breadcrumb">
                    <NuxtLink :to="`/${locale}/entries/${id}`" class="entry-edit__bc-link">
                        <UIcon name="i-lucide-arrow-left" />
                        {{ entry.title }}
                    </NuxtLink>
                    <UIcon name="i-lucide-chevron-right" class="entry-edit__bc-sep" />
                    <span>Edit fields</span>
                </div>

                <div class="entry-edit__actions">
                    <UButton v-if="fieldSchema?.fields?.length" icon="i-lucide-wand-2" variant="outline" color="neutral"
                        size="sm" :loading="magicLoading" @click="magicPopulate">
                        Magic populate
                    </UButton>
                    <UButton icon="i-lucide-save" size="sm" :loading="saving" @click="save">Save</UButton>
                </div>
            </div>

            <!-- Fields -->
            <div v-if="!fieldSchema" class="entry-edit__empty">
                <UIcon name="i-lucide-layout-template" />
                <p>No field schema defined on the parent entry.</p>
                <UButton v-if="entry.parent" icon="i-lucide-external-link" size="sm" variant="outline"
                    :to="`/${locale}/entries/${entry.parent.id}`">
                    Go to parent blueprint
                </UButton>
            </div>

            <div v-else-if="!fieldSchema.fields?.length" class="entry-edit__empty">
                <UIcon name="i-lucide-layout-template" />
                <p>The parent blueprint has no fields yet.</p>
            </div>

            <EntryForm v-else :fields="fieldSchema.fields" :values="fieldValues" :locale="locale"
                @update:values="fieldValues = $event" />
        </template>

        <div v-else class="entry-edit__empty">Entry not found.</div>
    </div>
</template>

<script lang="ts" setup>
import { useMagicPopulate } from '~/composables/useMagicPopulate'

definePageMeta({ middleware: 'auth' })

const route = useRoute()
const locale = computed(() => String(route.params.locale))
const id = computed(() => String(route.params.id))
const saving = ref(false)
const toast = useToast()

const { data, pending, refresh } = await useFetch(() => `/api/entries/${id.value}`)
const entry = computed(() => data.value as any)
const fieldSchema = computed(() => entry.value?.fieldSchema ?? null)

const fieldValues = ref<any[]>([])
watch(entry, (e) => {
    if (e) fieldValues.value = e.fieldValues ?? []
}, { immediate: true })

async function save() {
    saving.value = true
    try {
        await $fetch(`/api/entries/${id.value}/values`, {
            method: 'PUT',
            body: { localeCode: locale.value, values: fieldValues.value },
        })
        toast.add({ title: 'Saved', color: 'success' })
    }
    catch { toast.add({ title: 'Save failed', color: 'error' }) }
    finally { saving.value = false }
}

const { loading: magicLoading, populate } = useMagicPopulate(id.value, locale.value)
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
