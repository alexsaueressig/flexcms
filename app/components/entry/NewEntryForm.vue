<template>
  <UForm :schema="schema" :state="state" class="new-entry-form" @submit="submit">
    <UFormField label="Title" name="title" required>
      <UInput v-model="state.title" placeholder="My entry" @input="autoSlug" />
    </UFormField>

    <UFormField label="Slug" name="slug" required>
      <UInput v-model="state.slug" placeholder="my-entry" :ui="{ base: 'font-mono text-sm' }" />
    </UFormField>

    <div class="new-entry-form__actions">
      <UButton type="submit" :loading="pending">Create entry</UButton>
      <UButton variant="ghost" type="button" @click="$emit('cancel')">Cancel</UButton>
    </div>
  </UForm>
</template>

<script lang="ts" setup>
import { z } from 'zod'

const props = defineProps<{ locale: string; parentId?: string | null }>()
const emit = defineEmits<{ created: [entry: any]; cancel: [] }>()

const schema = z.object({
  title: z.string().min(1, 'Required'),
  slug: z.string().min(1).regex(/^[a-z0-9-_]+$/, 'Lowercase letters, numbers, hyphens only'),
})
const state = reactive({ title: '', slug: '' })
const pending = ref(false)
const toast = useToast()

function autoSlug() {
  state.slug = state.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

async function submit() {
  pending.value = true
  try {
    const entry = await $fetch('/api/entries', {
      method: 'POST',
      body: { title: state.title, slug: state.slug, localeCode: props.locale, parentId: props.parentId ?? null },
    })
    emit('created', entry)
  }
  catch (e: any) {
    toast.add({ title: 'Error', description: e.data?.message ?? 'Failed to create entry', color: 'error' })
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
}
</style>
