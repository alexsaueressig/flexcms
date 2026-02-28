<template>
  <div>
    <NuxtLayout name="auth">
      <div class="verify-page">
        <h1 class="verify-page__title">Check your email</h1>
        <p class="verify-page__sub">
          We sent a 6-digit code to <strong>{{ email }}</strong>
        </p>

        <UForm :schema="schema" :state="state" @submit="submit">
          <UFormField label="Sign-in code" name="code">
            <UInput
              v-model="state.code"
              placeholder="000000"
              maxlength="6"
              inputmode="numeric"
              autocomplete="one-time-code"
              autofocus
              size="lg"
              class="verify-page__input"
            />
          </UFormField>

          <UButton
            type="submit"
            :loading="pending"
            class="verify-page__btn"
            size="lg"
            block
          >
            Verify code
          </UButton>
        </UForm>

        <UButton
          variant="ghost"
          color="neutral"
          size="sm"
          class="verify-page__back"
          @click="$router.back()"
        >
          ← Use a different email
        </UButton>
      </div>
    </NuxtLayout>
  </div>
</template>

<script lang="ts" setup>
import { z } from 'zod'
import { useAuthStore } from '~/stores/auth'

definePageMeta({ layout: false })

const route = useRoute()
const email = computed(() => String(route.query.email ?? ''))
const auth = useAuthStore()
const pending = ref(false)
const toast = useToast()

const schema = z.object({ code: z.string().length(6, 'Code must be 6 digits') })
const state = reactive({ code: '' })

async function submit() {
  pending.value = true
  try {
    await $fetch('/api/auth/verify-otp', {
      method: 'POST',
      body: { email: email.value, code: state.code },
    })
    await auth.fetchMe()
    await navigateTo('/en')
  }
  catch (e: any) {
    toast.add({ title: 'Invalid code', description: 'The code is incorrect or expired.', color: 'error' })
  }
  finally { pending.value = false }
}
</script>

<style lang="scss" scoped>
.verify-page {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;

  &__title {
    font-size: 1.375rem;
    font-weight: 700;
    letter-spacing: -0.02em;
    text-align: center;
    margin: 0;
  }

  &__sub {
    text-align: center;
    opacity: 0.6;
    font-size: 0.875rem;
    margin: -0.5rem 0 0;
  }

  &__input { width: 100%; letter-spacing: 0.25em; text-align: center; }

  &__btn { margin-top: 0.25rem; }

  &__back {
    width: 100%;
    justify-content: center;
    opacity: 0.6;
  }
}
</style>
