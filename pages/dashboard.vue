<template>
  <div class="min-h-screen bg-gray-100">
    <header class="bg-white shadow">
      <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center">
          <h1 class="text-3xl font-bold text-gray-900">Dashboard</h1>
          
          <!-- Mobile menu button -->
          <div class="flex md:hidden">
            <button 
              @click="mobileMenuOpen = !mobileMenuOpen" 
              type="button" 
              class="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
              aria-controls="mobile-menu"
              :aria-expanded="mobileMenuOpen"
            >
              <span class="sr-only">Toggle menu</span>
              <svg 
                v-if="!mobileMenuOpen"
                class="block h-6 w-6" 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <svg 
                v-else
                class="block h-6 w-6" 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <!-- Desktop menu -->
          <div class="hidden md:flex md:items-center">
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
        
        <!-- Mobile menu -->
        <div v-if="mobileMenuOpen" class="pt-2 pb-3 space-y-2 md:hidden">
          <div class="flex flex-col space-y-2">
            <span class="block px-3 py-2 text-base font-medium text-gray-700">
              Welcome, {{ authStore.user?.username }}
            </span>
            <NuxtLink 
              v-if="authStore.isAdmin"
              to="/admin" 
              class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
            >
              Admin Panel
            </NuxtLink>
            <button 
              @click="logout" 
              class="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Logout
            </button>
          </div>
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
            
            <!-- Dashboard content -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div class="bg-white overflow-hidden shadow rounded-lg">
                <div class="px-4 py-5 sm:p-6">
                  <h3 class="text-lg font-medium text-gray-900">Generate Quiz</h3>
                  <p class="mt-1 text-sm text-gray-500">
                    Create a new quiz from text or files.
                  </p>
                  <div class="mt-4">
                    <NuxtLink
                      to="/quiz/create"
                      class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Create Quiz
                    </NuxtLink>
                  </div>
                </div>
              </div>
              
              <div class="bg-white overflow-hidden shadow rounded-lg">
                <div class="px-4 py-5 sm:p-6">
                  <h3 class="text-lg font-medium text-gray-900">My Quizzes</h3>
                  <p class="mt-1 text-sm text-gray-500">
                    View and practice your saved quiz decks.
                  </p>
                  <div class="mt-4">
                    <NuxtLink
                      to="/quiz"
                      class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      View Quizzes
                    </NuxtLink>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Recent Activity -->
            <div class="mt-8">
              <h3 class="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
              <div v-if="loading" class="text-center py-8">
                <p class="text-gray-500">Loading your recent activity...</p>
              </div>
              <div v-else-if="recentActivity.length === 0" class="bg-white overflow-hidden shadow rounded-lg">
                <div class="px-4 py-5 sm:p-6 text-center">
                  <p class="text-gray-500">No recent activity found.</p>
                  <p class="text-gray-500 mt-2">Start creating and practicing quizzes to see your activity here.</p>
                </div>
              </div>
              <div v-else class="bg-white overflow-hidden shadow rounded-lg divide-y divide-gray-200">
                <div v-for="activity in recentActivity" :key="activity.id" class="px-4 py-4 sm:px-6">
                  <div class="flex items-center justify-between">
                    <p class="text-sm font-medium text-indigo-600 truncate">
                      <NuxtLink 
                        v-if="activity.quizId" 
                        :to="`/quiz/view/${activity.quizId}`" 
                        class="hover:underline"
                      >
                        {{ activity.title }}
                      </NuxtLink>
                      <span v-else>{{ activity.title }}</span>
                    </p>
                    <div class="ml-2 flex-shrink-0 flex">
                      <p 
                        class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                        :class="{
                          'bg-green-100 text-green-800': activity.type === 'Created',
                          'bg-blue-100 text-blue-800': activity.type === 'Practiced',
                          'bg-yellow-100 text-yellow-800': activity.type === 'Edited',
                          'bg-red-100 text-red-800': activity.type === 'Deleted'
                        }"
                      >
                        {{ activity.type }}
                      </p>
                    </div>
                  </div>
                  <div class="mt-2 sm:flex sm:justify-between">
                    <div class="sm:flex">
                      <p class="flex items-center text-sm text-gray-500">
                        {{ activity.description }}
                      </p>
                    </div>
                    <div class="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                      <svg class="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" />
                      </svg>
                      <p>
                        {{ formatDate(activity.date) }}
                      </p>
                    </div>
                  </div>
                  <!-- Show additional details for practice activities -->
                  <div v-if="activity.type === 'Practiced' && activity.timeSpent" class="mt-2 text-sm text-gray-500">
                    <span class="mr-4">Time spent: {{ formatTime(activity.timeSpent) }}</span>
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
const mobileMenuOpen = ref(false);

const loading = ref(true);
const recentActivity = ref([]);

const logout = () => {
  authStore.logout();
  router.push('/login');
};

// Format date
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// Format time spent (in seconds) to a readable format
const formatTime = (seconds) => {
  if (!seconds) return '0m';
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes === 0) {
    return `${remainingSeconds}s`;
  } else if (remainingSeconds === 0) {
    return `${minutes}m`;
  } else {
    return `${minutes}m ${remainingSeconds}s`;
  }
};

// Fetch recent activity
const fetchRecentActivity = async () => {
  try {
    loading.value = true;
    
    const response = await fetch('/api/user/activity', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authStore.token}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      recentActivity.value = data.activities;
    } else {
      // If API not implemented yet, show sample data
      recentActivity.value = [
        {
          id: 1,
          title: 'JavaScript Basics Quiz',
          type: 'Created',
          description: 'Created a new quiz with 10 questions',
          date: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          quizId: 'sample-quiz-1'
        },
        {
          id: 2,
          title: 'HTML Fundamentals',
          type: 'Practiced',
          description: 'Score: 8/10 (80%)',
          date: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
          quizId: 'sample-quiz-2',
          timeSpent: 450 // 7.5 minutes
        },
        {
          id: 3,
          title: 'CSS Selectors',
          type: 'Edited',
          description: 'Updated quiz content and added 5 new questions',
          date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
          quizId: 'sample-quiz-3'
        },
        {
          id: 4,
          title: 'Vue.js Basics',
          type: 'Deleted',
          description: 'Removed outdated quiz',
          date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
        }
      ];
    }
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    recentActivity.value = [];
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  if (await authStore.checkAuth()) {
    fetchRecentActivity();
  } else {
    router.push('/login');
  }
});

definePageMeta({
  middleware: 'auth',
  requiresAuth: true
});
</script>
