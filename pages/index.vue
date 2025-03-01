<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8 text-center">
      <div>
        <h1 class="text-4xl font-extrabold text-indigo-600">SmartyDeck</h1>
        <p class="mt-3 text-lg text-gray-500">
          Your intelligent quiz generation platform
        </p>
      </div>
      
      <div class="mt-8 space-y-4">
        <p class="text-gray-600">Loading...</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '~/stores/auth';
import { useRouter } from 'vue-router';

const router = useRouter();
const authStore = useAuthStore();

// Check authentication and redirect accordingly
onMounted(async () => {
  if (await authStore.checkAuth()) {
    router.push('/dashboard');
  } else {
    router.push('/login');
  }
});
</script> 