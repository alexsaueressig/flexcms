<template>
  <div>
    <NuxtLayout name="auth">
      <div class="login-page">
        <h1 class="login-page__title">{{ $t('auth.login') }}</h1>
        <p class="login-page__sub">{{ $t('auth.emailSubtitle') }}</p>

        <UForm :schema="schema" :state="state" @submit="submit">
          <UFormField :label="$t('auth.email')" name="email">
            <UInput v-model="state.email" type="email" placeholder="you@example.com" autocomplete="email" autofocus
              size="lg" class="login-page__input" />
          </UFormField>

          <UButton type="submit" :loading="pending" class="login-page__btn" size="lg" block>
            {{ $t('auth.sendCode') }}
          </UButton>
        </UForm>
      </div>
    </NuxtLayout>
  </div>
</template>

<script lang="ts" setup>
import { z } from 'zod'

definePageMeta({ layout: false })

const { t } = useI18n()
const schema = computed(() => z.object({ email: z.string().email(t('auth.errors.invalidEmail')) }))
const state = reactive({ email: '' })
const pending = ref(false)
const toast = useToast()

async function submit() {
  pending.value = true
  try {
    const res = await $fetch('/api/auth/send-otp', { method: 'POST', body: { email: state.email } })
    await navigateTo({ path: '/auth/verify', query: { email: state.email, ...(res.devOtp ? { otp: res.devOtp } : {}) } })
  }
  catch (e: any) {
    toast.add({ title: t('common.error'), description: e.data?.message ?? t('errors.serverError'), color: 'error' })
  }
  finally { pending.value = false }
}
</script>

<style lang="scss" scoped>
.login-page {
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
    opacity: 0.55;
    font-size: 0.875rem;
    margin: -0.5rem 0 0;
  }

  &__input {
    width: 100%;
  }

  &__btn {
    margin-top: 0.25rem;
  }
}
</style>
