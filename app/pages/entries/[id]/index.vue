<template>
    <div class="entry-detail">
        <div v-if="pending" class="entry-detail__loading">
            <UIcon name="i-lucide-loader-2" class="animate-spin" />
        </div>

        <template v-else-if="entry">
            <!-- Header -->
            <div class="entry-detail__header">
                <div class="entry-detail__breadcrumb">
                    <NuxtLink :to="localePath('/')" class="entry-detail__bc-link">{{ $t('entries.title') }}</NuxtLink>
                    <UIcon name="i-lucide-chevron-right" class="entry-detail__bc-sep" />
                    <span v-if="entry.parent">
                        <NuxtLink :to="localePath(`/entries/${entry.parent.id}`)" class="entry-detail__bc-link">
                            {{ entry.parent.title }}
                        </NuxtLink>
                        <UIcon name="i-lucide-chevron-right" class="entry-detail__bc-sep" />
                    </span>
                    <span>{{ entry.title }}</span>
                </div>

                <div class="entry-detail__actions">
                    <UButton v-if="fieldSchema?.fields?.length" icon="i-lucide-edit-3" variant="outline" color="neutral"
                        size="sm" :to="localePath(`/entries/${id}/edit`)">
                        {{ $t('entries.editFields') }}
                    </UButton>
                    <UButton icon="i-lucide-archive" variant="ghost" color="neutral" size="sm"
                        :to="localePath('/archive')" />
                </div>
            </div>

            <!-- Children list (default view) -->
            <EntryChildren :entry-id="entry.id" :blueprint="blueprint" @open-blueprint="showBlueprint = true" />

            <!-- Blueprint modal -->
            <UModal v-model:open="showBlueprint" :title="$t('blueprint.title')"
                :description="$t('blueprint.description')">
                <template #body>
                    <BlueprintEditor :entry-id="entry.id" :existing="blueprint" @saved="onBlueprintSaved" />
                </template>
            </UModal>
        </template>

        <div v-else class="entry-detail__not-found">
            {{ $t('entries.notFound') }}
        </div>
    </div>
</template>

<script lang="ts" setup>
definePageMeta({ middleware: 'auth' })

const route = useRoute()
const localePath = useLocalePath()
const id = computed(() => String(route.params.id))
const showBlueprint = ref(false)

const { data, pending, refresh } = await useFetch(() => `/api/entries/${id.value}`)
const entry = computed(() => data.value as any)
const blueprint = computed(() => entry.value?.blueprint ?? null)
const fieldSchema = computed(() => entry.value?.fieldSchema ?? null)

async function onBlueprintSaved() {
    showBlueprint.value = false
    await refresh()
}
</script>

<style lang="scss" scoped>
.entry-detail {
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
        flex-wrap: wrap;
    }

    &__bc-link {
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

    &__not-found {
        padding: 3rem;
        text-align: center;
        opacity: 0.5;
    }
}
</style>
