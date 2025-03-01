<template>
  <div class="min-h-screen bg-gray-100">
    <header class="bg-white shadow">
      <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <h1 class="text-3xl font-bold text-gray-900">Dashboard</h1>
        <div class="flex items-center">
          <NuxtLink 
            v-if="authStore.isAdmin"
            to="/admin" 
            class="mr-4 inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Admin Panel
          </NuxtLink>
          <span class="mr-4">Welcome, {{ authStore.user?.username }}</span>
          <button 
            @click="logout" 
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
    
    <main>
      <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <!-- User dashboard content -->
        <div class="px-4 py-6 sm:px-0">
          <div class="border-4 border-dashed border-gray-200 rounded-lg p-6">
            <h2 class="text-2xl font-bold mb-4">Welcome to SmartyDeck</h2>
            <p class="mb-4">Your intelligent quiz generation platform.</p>
            
            <!-- Dashboard content will go here -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div class="bg-white overflow-hidden shadow rounded-lg">
                <div class="px-4 py-5 sm:p-6">
                  <h3 class="text-lg font-medium text-gray-900">Generate Quiz</h3>
                  <p class="mt-1 text-sm text-gray-500">
                    Create a new quiz from text or files.
                  </p>
                  <div class="mt-4">
                    <button
                      class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Create Quiz
                    </button>
                  </div>
                </div>
              </div>
              
              <div class="bg-white overflow-hidden shadow rounded-lg">
                <div class="px-4 py-5 sm:p-6">
                  <h3 class="text-lg font-medium text-gray-900">My Decks</h3>
                  <p class="mt-1 text-sm text-gray-500">
                    View and practice your saved quiz decks.
                  </p>
                  <div class="mt-4">
                    <button
                      class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      View Decks
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '~/stores/auth';
import { useRouter } from 'vue-router';

const router = useRouter();
const authStore = useAuthStore();

// Check if user is authenticated
onMounted(async () => {
  if (!(await authStore.checkAuth())) {
    router.push('/login');
  }
});

const logout = () => {
  authStore.logout();
  router.push('/login');
};
</script> 