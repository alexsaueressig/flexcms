<template>
  <div class="field-geo">
    <UInput
      v-model="addressInput"
      placeholder="Search address…"
      icon="i-lucide-map-pin"
      @input="onInput"
      @focus="showSuggestions = true"
    />

    <ul v-if="showSuggestions && suggestions.length" class="field-geo__suggestions">
      <li
        v-for="s in suggestions"
        :key="s.place_id"
        class="field-geo__suggestion"
        @click="selectSuggestion(s)"
      >
        {{ s.description }}
      </li>
    </ul>

    <div v-if="coords" class="field-geo__coords">
      <UBadge color="neutral" variant="subtle">{{ coords.lat.toFixed(6) }}, {{ coords.lng.toFixed(6) }}</UBadge>
    </div>
  </div>
</template>

<script lang="ts" setup>
const props = defineProps<{ field: any; modelValue: unknown }>()
const emit = defineEmits<{ 'update:modelValue': [v: unknown] }>()
const config = useRuntimeConfig()

const parsed = computed(() => props.modelValue as any ?? null)
const addressInput = ref(parsed.value?.address ?? '')
const coords = ref<{ lat: number; lng: number } | null>(
  parsed.value?.lat != null ? { lat: parsed.value.lat, lng: parsed.value.lng } : null,
)
const suggestions = ref<any[]>([])
const showSuggestions = ref(false)
let autocompleteService: any = null

async function initGoogle() {
  if (typeof window === 'undefined' || !config.public.googlePlacesApiKey) return
  if ((window as any).google?.maps?.places) {
    autocompleteService = new (window as any).google.maps.places.AutocompleteService()
    return
  }
  const script = document.createElement('script')
  script.src = `https://maps.googleapis.com/maps/api/js?key=${config.public.googlePlacesApiKey}&libraries=places`
  script.onload = () => {
    autocompleteService = new (window as any).google.maps.places.AutocompleteService()
  }
  document.head.appendChild(script)
}

onMounted(initGoogle)

const debouncedSearch = useDebounceFn(async (val: string) => {
  if (!autocompleteService || val.length < 3) { suggestions.value = []; return }
  autocompleteService.getPlacePredictions(
    { input: val, types: props.field.config.types ?? ['geocode'] },
    (preds: any) => { suggestions.value = preds ?? [] },
  )
}, 350)

function onInput() { debouncedSearch(addressInput.value) }

function selectSuggestion(s: any) {
  addressInput.value = s.description
  showSuggestions.value = false
  suggestions.value = []

  // Geocode to get lat/lng
  const geocoder = new (window as any).google.maps.Geocoder()
  geocoder.geocode({ placeId: s.place_id }, (results: any) => {
    if (results?.[0]) {
      const loc = results[0].geometry.location
      coords.value = { lat: loc.lat(), lng: loc.lng() }
      emit('update:modelValue', { lat: loc.lat(), lng: loc.lng(), address: s.description })
    }
  })
}
</script>

<style lang="scss" scoped>
.field-geo {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  &__suggestions {
    position: absolute;
    top: calc(100% - 0.25rem);
    left: 0;
    right: 0;
    z-index: 50;
    background: var(--ui-bg);
    border: 1px solid var(--ui-border);
    border-radius: 0.5rem;
    list-style: none;
    margin: 0;
    padding: 0.375rem;
    box-shadow: 0 8px 24px rgba(0,0,0,0.08);
    max-height: 240px;
    overflow-y: auto;
  }

  &__suggestion {
    padding: 0.5rem 0.625rem;
    border-radius: 0.375rem;
    cursor: pointer;
    font-size: 0.875rem;
    transition: background 0.1s;

    &:hover { background: var(--ui-bg-muted); }
  }

  &__coords { display: flex; }
}
</style>
