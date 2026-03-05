<template>
  <UApp>
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage :transition="{ name: 'slide', mode: 'out-in' }" />
    </NuxtLayout>
  </UApp>
</template>
