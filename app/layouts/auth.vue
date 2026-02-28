<template>
  <div class="auth-layout">
    <div class="auth-layout__card">
      <div class="auth-layout__logo">
        <span class="auth-layout__logo-text">SnapCMS</span>
      </div>
      <slot />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.auth-layout {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--ui-bg-muted);

  &__card {
    width: 100%;
    max-width: 400px;
    padding: 2.5rem;
    background: var(--ui-bg);
    border: 1px solid var(--ui-border);
    border-radius: 1rem;
    box-shadow: 0 4px 24px rgba(0,0,0,0.06);
  }

  &__logo {
    text-align: center;
    margin-bottom: 2rem;
  }

  &__logo-text {
    font-size: 1.5rem;
    font-weight: 700;
    letter-spacing: -0.03em;
  }
}
</style>
