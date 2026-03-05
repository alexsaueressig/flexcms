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

    <FieldsFieldMediaDropzone :accept="acceptAttr" :is-image="isImage" @file="upload" />

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
const uploading = ref(false)
const uploadProgress = ref(0)

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
    const { storagePath } = await $fetch<{ storagePath: string; publicUrl: string }>('/api/media/signed-url', {
      method: 'POST',
      body: { fileName: file.name, mimeType: file.type, sizeBytes: file.size },
    })
    const app = getFirebase()
    const storage = getStorage(app)
    const fileRef = storageRef(storage, storagePath)
    const task = uploadBytesResumable(fileRef, file)
    await new Promise<void>((resolve, reject) => {
      task.on('state_changed',
        snap => { uploadProgress.value = Math.round((snap.bytesTransferred / snap.totalBytes) * 100) },
        reject, resolve,
      )
    })
    const downloadURL = await getDownloadURL(fileRef)
    emit('update:modelValue', downloadURL)
  }
  finally { uploading.value = false }
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

  &__file {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    font-size: 0.875rem;
  }

  &__file-link {
    color: inherit;
  }

  &__progress {
    padding-top: 0.25rem;
  }
}
</style>
