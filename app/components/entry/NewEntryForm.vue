<template>
  <UForm :schema="schema" :state="state" class="new-entry-form" @submit="submit">
    <div v-if="loadingEntry" class="new-entry-form__loading">
      <UIcon name="i-lucide-loader-2" class="animate-spin" />
    </div>
    <template v-else>
      <UFormField label="Title" name="title" required>
        <UInput v-model="state.title" placeholder="My entry" @input="autoSlug" />
      </UFormField>

      <UFormField label="Slug" name="slug" required>
        <UInput v-model="state.slug" placeholder="my-entry" :ui="{ base: 'font-mono text-sm' }" />
      </UFormField>

      <EntryForm v-if="fields.length" :fields="fields" :values="fieldValues" :locale="locale"
        @update:values="fieldValues = $event" />

      <div class="new-entry-form__actions">
        <UButton type="submit" :loading="pending">{{ entry ? 'Save' : 'Create entry' }}</UButton>
        <UButton variant="ghost" type="button" @click="$emit('cancel')">Cancel</UButton>
      </div>
    </template>
  </UForm>
</template>

<script lang="ts" setup>
import { z } from 'zod'

const props = defineProps<{
  locale: string
  parentId?: string | null
  fields?: any[]
  entry?: { id: string; title: string; slug: string } | null
}>()
const emit = defineEmits<{ created: [entry: any]; updated: [entry: any]; cancel: [] }>()

const schema = z.object({
  title: z.string().min(1, 'Required'),
  slug: z.string().min(1).regex(/^[a-z0-9-_]+$/, 'Lowercase letters, numbers, hyphens only'),
})
const state = reactive({
  title: props.entry?.title ?? '',
  slug: props.entry?.slug ?? '',
})
const fieldValues = ref<any[]>([])
const pending = ref(false)
const loadingEntry = ref(!!props.entry)
const toast = useToast()
const fields = computed(() => props.fields ?? [])

// In edit mode, fetch full entry data to get fieldValues
onMounted(async () => {
  if (!props.entry) return
  try {
    const data = await $fetch<any>(`/api/entries/${props.entry.id}`)
    fieldValues.value = data.fieldValues ?? []
  }
  finally { loadingEntry.value = false }
})

function autoSlug() {
  if (!props.entry) {
    state.slug = state.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  }
}

async function submit() {
  pending.value = true
  try {
    if (props.entry) {
      const updated = await $fetch(`/api/entries/${props.entry.id}`, {
        method: 'PATCH',
        body: { title: state.title, slug: state.slug },
      })
      if (fieldValues.value.length) {
        await $fetch(`/api/entries/${props.entry.id}/values`, {
          method: 'PUT',
          body: { localeCode: props.locale, values: fieldValues.value },
        })
      }
      emit('updated', updated)
    }
    else {
      const entry = await $fetch<{ id: string }>('/api/entries', {
        method: 'POST',
        body: { title: state.title, slug: state.slug, localeCode: props.locale, parentId: props.parentId ?? null },
      })
      if (fieldValues.value.length) {
        await $fetch(`/api/entries/${entry.id}/values`, {
          method: 'PUT',
          body: { localeCode: props.locale, values: fieldValues.value },
        })
      }
      emit('created', entry)
    }
  }
  catch (e: any) {
    toast.add({ title: 'Error', description: e.data?.message ?? 'Operation failed', color: 'error' })
  }
  finally { pending.value = false }
}
</script>

<style lang="scss" scoped>
.new-entry-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;

  &__actions {
    display: flex;
    gap: 0.5rem;
    justify-content: flex-end;
    margin-top: 0.25rem;
  }

  &__loading {
    display: flex;
    justify-content: center;
    padding: 2rem;
    opacity: 0.4;
  }
}
</style>
