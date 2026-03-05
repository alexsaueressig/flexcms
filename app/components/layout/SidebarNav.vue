<template>
    <nav class="sidebar-nav">
        <UTooltip v-for="item in items" :key="item.to" :text="collapsed ? item.label : ''" placement="right">
            <NuxtLink :to="item.to" class="sidebar-nav__item" active-class="sidebar-nav__item--active">
                <UIcon :name="item.icon" class="sidebar-nav__icon" />
                <span v-if="!collapsed" class="sidebar-nav__label">{{ item.label }}</span>
            </NuxtLink>
        </UTooltip>
    </nav>
</template>

<script lang="ts" setup>
defineProps<{
    items: { label: string; icon: string; to: string }[]
    collapsed: boolean
}>()
</script>

<style lang="scss" scoped>
.sidebar-nav {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
    padding: 0.75rem 0.5rem;
    border-bottom: 1px solid var(--ui-border);

    &__item {
        display: flex;
        align-items: center;
        gap: 0.625rem;
        padding: 0.5rem 0.625rem;
        border-radius: 0.5rem;
        text-decoration: none;
        color: inherit;
        font-size: 0.875rem;
        font-weight: 500;
        opacity: 0.7;
        transition: opacity 0.1s, background 0.1s;

        &:hover {
            opacity: 1;
            background: var(--ui-bg-muted);
        }

        &--active {
            opacity: 1;
            background: var(--ui-bg-elevated);
        }
    }

    &__icon {
        font-size: 1rem;
        flex-shrink: 0;
    }

    &__label {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
}
</style>
