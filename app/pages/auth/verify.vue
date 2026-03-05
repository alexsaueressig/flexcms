<template>
  <div>
    <NuxtLayout name="auth">
      <div class="verify-page">
        <h1 class="verify-page__title">{{ $t('auth.checkEmail') }}</h1>
        <p class="verify-page__sub">
          {{ $t('auth.codeSentTo') }} <strong>{{ email }}</strong>
        </p>

        <p v-if="devOtp" class="verify-page__dev-otp">DEV — OTP: <strong>{{ devOtp }}</strong></p>

        <UForm :schema="schema" :state="state" @submit="submit">
          <UFormField :label="$t('auth.signInCode')" name="code">
            <UInput v-model="state.code" placeholder="000000" maxlength="6" inputmode="numeric"
              autocomplete="one-time-code" autofocus size="lg" class="verify-page__input" />
          </UFormField>

          <UButton type="submit" :loading="pending" class="verify-page__btn" size="lg" block>
            {{ $t('auth.verifyCode') }}
          </UButton>
        </UForm>

        <UButton variant="ghost" color="neutral" size="sm" class="verify-page__back" @click="$router.back()">
          ← {{ $t('auth.differentEmail') }}
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
const devOtp = computed(() => route.query.otp ? String(route.query.otp) : null)
const auth = useAuthStore()
const pending = ref(false)
const toast = useToast()

const { t } = useI18n()
const schema = computed(() => z.object({ code: z.string().length(6, t('auth.errors.codeLength')) }))
const state = reactive({ code: '' })

async function submit() {
  pending.value = true
  try {
    await $fetch('/api/auth/verify-otp', {
      method: 'POST',
      body: { email: email.value, code: state.code },
    })
    await auth.fetchMe()
    const { locale } = useI18n()
    await navigateTo(`/${locale.value}`)
  }
  catch (e: any) {
    toast.add({ title: t('auth.errors.invalidCodeTitle'), description: t('auth.errors.invalidCodeDesc'), color: 'error' })
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

  &__input {
    width: 100%;
    letter-spacing: 0.25em;
    text-align: center;
  }

  &__dev-otp {
    text-align: center;
    font-size: 0.875rem;
    color: #f59e0b;
    margin: 0;
  }

  &__btn {
    margin-top: 0.25rem;
  }

  &__back {
    width: 100%;
    justify-content: center;
    opacity: 0.6;
  }
}
</style>
