<template>
  <div class="field-tags">
    <div class="field-tags__list">
      <UBadge
        v-for="(tag, i) in tags"
        :key="i"
        :label="tag"
        color="neutral"
        variant="solid"
        class="field-tags__chip"
      >
        <template #trailing>
          <UButton size="2xs" icon="i-lucide-x" variant="ghost" color="neutral" @click="remove(i)" />
        </template>
      </UBadge>
    </div>
    <UInput
      v-model="inputVal"
      placeholder="Add tag and press Enter"
      @keydown.enter.prevent="add"
      @keydown.comma.prevent="add"
    />
  </div>
</template>

<script lang="ts" setup>
const props = defineProps<{ field: any; modelValue: unknown }>()
const emit = defineEmits<{ 'update:modelValue': [v: string] }>()

const tags = ref<string[]>([])
watch(() => props.modelValue, (v) => {
  try { tags.value = v ? JSON.parse(v as string) : [] }
  catch { tags.value = [] }
}, { immediate: true })

const inputVal = ref('')

function add() {
  const t = inputVal.value.trim()
  if (t && !tags.value.includes(t)) {
    tags.value = [...tags.value, t]
    emit('update:modelValue', JSON.stringify(tags.value))
  }
  inputVal.value = ''
}

function remove(i: number) {
  tags.value = tags.value.filter((_, idx) => idx !== i)
  emit('update:modelValue', JSON.stringify(tags.value))
}
</script>

<style lang="scss" scoped>
.field-tags {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  &__list { display: flex; flex-wrap: wrap; gap: 0.375rem; }
  &__chip { display: flex; align-items: center; gap: 0.25rem; }
}
</style>
