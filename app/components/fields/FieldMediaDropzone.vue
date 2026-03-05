<template>
    <div class="media-dropzone" :class="{ 'media-dropzone--dragover': dragover }" @dragover.prevent="dragover = true"
        @dragleave="dragover = false" @drop.prevent="onDrop" @click="fileInput?.click()">
        <UIcon :name="isImage ? 'i-lucide-image' : 'i-lucide-upload'" class="media-dropzone__icon" />
        <span class="media-dropzone__hint">Drop file here or click to browse</span>
        <input ref="fileInput" type="file" class="media-dropzone__hidden" :accept="accept" @change="onFileChange" />
    </div>
</template>

<script lang="ts" setup>
const props = defineProps<{ accept: string; isImage: boolean }>()
const emit = defineEmits<{ file: [f: File] }>()

const dragover = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

function onFileChange(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (file) emit('file', file)
}

function onDrop(e: DragEvent) {
    dragover.value = false
    const file = e.dataTransfer?.files[0]
    if (file) emit('file', file)
}
</script>

<style lang="scss" scoped>
.media-dropzone {
    border: 2px dashed var(--ui-border);
    border-radius: 0.5rem;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    transition: border-color 0.15s, background 0.15s;

    &:hover,
    &--dragover {
        border-color: var(--ui-color-primary-500);
        background: var(--ui-bg-elevated);
    }

    &__icon {
        font-size: 1.5rem;
        opacity: 0.4;
    }

    &__hint {
        font-size: 0.8125rem;
        opacity: 0.55;
    }

    &__hidden {
        display: none;
    }
}
</style>
