<template>
  <div class="content-locale-switcher">
    <button
      v-for="loc in locales"
      :key="loc.code"
      class="content-locale-switcher__btn"
      :class="{ 'content-locale-switcher__btn--active': modelValue === loc.code }"
      type="button"
      :title="loc.name"
      @click="$emit('update:modelValue', loc.code)"
    >
      <span class="content-locale-switcher__flag">{{ localeToFlag(loc.language) }}</span>
      <span class="content-locale-switcher__code">{{ loc.code.toUpperCase() }}</span>
    </button>
  </div>
</template>

<script lang="ts" setup>
defineProps<{
  modelValue: string
  locales: { code: string; language: string; name: string }[]
}>()
defineEmits<{ 'update:modelValue': [code: string] }>()
</script>

<style lang="scss" scoped>
.content-locale-switcher {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  background: var(--ui-bg-muted);
  border-radius: 0.5rem;
  padding: 0.25rem;

  &__btn {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.25rem 0.5rem;
    border-radius: 0.375rem;
    border: none;
    background: transparent;
    color: inherit;
    cursor: pointer;
    font-size: 0.8125rem;
    font-weight: 500;
    opacity: 0.55;
    transition: opacity 0.1s, background 0.1s;

    &:hover {
      opacity: 0.8;
      background: var(--ui-bg-elevated);
    }

    &--active {
      opacity: 1;
      background: var(--ui-bg);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
    }
  }

  &__flag {
    font-size: 1rem;
    line-height: 1;
  }

  &__code {
    font-size: 0.75rem;
    font-weight: 600;
  }
}
</style>
