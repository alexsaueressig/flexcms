<template>
  <div class="field-datetime">
    <UInput
      type="datetime-local"
      :model-value="localDatetime"
      @update:model-value="onUpdate"
    />
    <USelect
      v-if="field.config.includeTime !== false"
      :model-value="timezone"
      :options="commonTimezones"
      class="field-datetime__tz"
      @update:model-value="timezone = $event; onUpdate(localDatetime)"
    />
  </div>
</template>

<script lang="ts" setup>
const props = defineProps<{ field: any; modelValue: unknown }>()
const emit = defineEmits<{ 'update:modelValue': [v: unknown] }>()

const parsed = computed(() => {
  if (!props.modelValue) return null
  return typeof props.modelValue === 'object' ? props.modelValue as any : null
})

const localDatetime = ref(parsed.value?.datetime?.slice(0, 16) ?? '')
const timezone = ref(parsed.value?.timezone ?? 'UTC')

const commonTimezones = [
  'UTC', 'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
  'America/Sao_Paulo', 'Europe/London', 'Europe/Paris', 'Europe/Berlin',
  'Asia/Tokyo', 'Asia/Shanghai', 'Asia/Kolkata', 'Australia/Sydney',
]

function onUpdate(val: string) {
  emit('update:modelValue', { datetime: val ? new Date(val).toISOString() : null, timezone: timezone.value })
}
</script>

<style lang="scss" scoped>
.field-datetime { display: flex; gap: 0.5rem; align-items: center; }
.field-datetime__tz { min-width: 200px; }
</style>
