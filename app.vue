<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtPage />
  </div>
</template>

<script setup>
// Apply auth middleware globally
useNuxtApp().hook('page:start', () => {
  // This will run on every page navigation
});
</script>
