<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtPage />
  </div>
</template>

<script setup>
import { useAuthStore } from '~/stores/auth';

// Apply auth check globally
const authStore = useAuthStore();

// This will run once when the app is initialized
onMounted(async () => {
  await authStore.checkAuth();
});

// This will run on every page navigation
useNuxtApp().hook('page:start', async () => {
  await authStore.checkAuth();
});
</script>
