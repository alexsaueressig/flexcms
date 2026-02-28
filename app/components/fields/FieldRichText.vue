<template>
  <div class="tiptap-editor">
    <div v-if="editor" class="tiptap-toolbar">
      <UButton
        v-for="action in toolbarActions"
        :key="action.label"
        size="xs"
        variant="ghost"
        :color="action.isActive() ? 'primary' : 'neutral'"
        :icon="action.icon"
        :title="action.label"
        @click="action.run()"
      />
    </div>
    <EditorContent :editor="editor" />
  </div>
</template>

<script lang="ts" setup>
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'

const props = defineProps<{ field: any; modelValue: unknown }>()
const emit = defineEmits<{ 'update:modelValue': [v: string] }>()

const editor = useEditor({
  content: (props.modelValue as string) ?? '',
  extensions: [
    StarterKit,
    Underline,
    Link.configure({ openOnClick: false }),
    Placeholder.configure({ placeholder: 'Start writing…' }),
  ],
  onUpdate: ({ editor }) => emit('update:modelValue', editor.getHTML()),
})

onBeforeUnmount(() => editor.value?.destroy())

const toolbarActions = computed(() => {
  const e = editor.value
  if (!e) return []
  return [
    { label: 'Bold', icon: 'i-lucide-bold', isActive: () => e.isActive('bold'), run: () => e.chain().focus().toggleBold().run() },
    { label: 'Italic', icon: 'i-lucide-italic', isActive: () => e.isActive('italic'), run: () => e.chain().focus().toggleItalic().run() },
    { label: 'Underline', icon: 'i-lucide-underline', isActive: () => e.isActive('underline'), run: () => e.chain().focus().toggleUnderline().run() },
    { label: 'Bullet list', icon: 'i-lucide-list', isActive: () => e.isActive('bulletList'), run: () => e.chain().focus().toggleBulletList().run() },
    { label: 'Ordered list', icon: 'i-lucide-list-ordered', isActive: () => e.isActive('orderedList'), run: () => e.chain().focus().toggleOrderedList().run() },
    { label: 'Code', icon: 'i-lucide-code', isActive: () => e.isActive('code'), run: () => e.chain().focus().toggleCode().run() },
  ]
})
</script>

<style lang="scss" scoped>
.tiptap-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.125rem;
  padding: 0.375rem;
  border-bottom: 1px solid var(--ui-border);
  background: var(--ui-bg-muted);
  border-radius: 0.5rem 0.5rem 0 0;
}
.tiptap-editor {
  border: 1px solid var(--ui-border);
  border-radius: 0.5rem;
  overflow: hidden;
}
</style>
