<template>
  <div class="field-media">
    <div v-if="currentUrl" class="field-media__preview">
      <img v-if="isImage" :src="currentUrl" class="field-media__img" />
      <div v-else class="field-media__file">
        <UIcon name="i-lucide-paperclip" />
        <a :href="currentUrl" target="_blank" class="field-media__file-link">View file</a>
      </div>
      <UButton size="xs" variant="ghost" color="error" icon="i-lucide-x" @click="clear" />
    </div>

    <div
      class="field-media__dropzone"
      :class="{ 'field-media__dropzone--dragover': dragover }"
      @dragover.prevent="dragover = true"
      @dragleave="dragover = false"
      @drop.prevent="onDrop"
      @click="fileInput?.click()"
    >
      <UIcon :name="isImage ? 'i-lucide-image' : 'i-lucide-upload'" class="field-media__icon" />
      <span class="field-media__hint">Drop file here or click to browse</span>
      <input ref="fileInput" type="file" class="field-media__hidden-input" :accept="acceptAttr" @change="onFileChange" />
    </div>

    <div v-if="uploading" class="field-media__progress">
      <UProgress :value="uploadProgress" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import { initializeApp, getApps } from 'firebase/app'

const props = defineProps<{ field: any; modelValue: unknown }>()
const emit = defineEmits<{ 'update:modelValue': [v: string] }>()

const config = useRuntimeConfig()
const currentUrl = computed(() => props.modelValue as string ?? '')
const dragover = ref(false)
const uploading = ref(false)
const uploadProgress = ref(0)
const fileInput = ref<HTMLInputElement | null>(null)

const isImage = computed(() => props.field.type === 'MEDIA_IMAGE')

const acceptAttr = computed(() => {
  if (props.field.type === 'MEDIA_IMAGE') return 'image/*'
  if (props.field.type === 'MEDIA_VIDEO') return 'video/*'
  return '*/*'
})

function getFirebase() {
  if (getApps().length) return getApps()[0]!
  return initializeApp({
    apiKey: config.public.firebaseApiKey,
    authDomain: config.public.firebaseAuthDomain,
    projectId: config.public.firebaseProjectId,
    storageBucket: config.public.firebaseStorageBucket,
    appId: config.public.firebaseAppId,
  })
}

async function upload(file: File) {
  uploading.value = true
  uploadProgress.value = 0
  try {
    // Get signed URL from server
    const { storagePath } = await $fetch<{ storagePath: string; publicUrl: string }>('/api/media/signed-url', {
      method: 'POST',
      body: { fileName: file.name, mimeType: file.type, sizeBytes: file.size },
    })

    // Upload via Firebase client SDK
    const app = getFirebase()
    const storage = getStorage(app)
    const fileRef = storageRef(storage, storagePath)
    const task = uploadBytesResumable(fileRef, file)

    await new Promise<void>((resolve, reject) => {
      task.on(
        'state_changed',
        snap => { uploadProgress.value = Math.round((snap.bytesTransferred / snap.totalBytes) * 100) },
        reject,
        resolve,
      )
    })

    const downloadURL = await getDownloadURL(fileRef)
    emit('update:modelValue', downloadURL)
  }
  finally { uploading.value = false }
}

function onFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) upload(file)
}

function onDrop(e: DragEvent) {
  dragover.value = false
  const file = e.dataTransfer?.files[0]
  if (file) upload(file)
}

function clear() { emit('update:modelValue', '') }
</script>

<style lang="scss" scoped>
.field-media {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;

  &__preview {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
  }

  &__img {
    max-height: 180px;
    max-width: 100%;
    border-radius: 0.5rem;
    border: 1px solid var(--ui-border);
    object-fit: cover;
  }

  &__file { display: flex; align-items: center; gap: 0.375rem; font-size: 0.875rem; }
  &__file-link { color: inherit; }

  &__dropzone {
    border: 2px dashed var(--ui-border);
    border-radius: 0.5rem;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    transition: border-color 0.15s, background 0.15s;

    &:hover, &--dragover {
      border-color: var(--ui-color-primary-500);
      background: var(--ui-bg-elevated);
    }
  }

  &__icon { font-size: 1.5rem; opacity: 0.4; }
  &__hint { font-size: 0.8125rem; opacity: 0.55; }
  &__hidden-input { display: none; }
  &__progress { padding-top: 0.25rem; }
}
</style>
