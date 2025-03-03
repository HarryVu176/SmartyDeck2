<template>
  <div class="min-h-screen bg-gray-100">
    <header class="bg-white shadow">
      <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <h1 class="text-3xl font-bold text-gray-900">My Quizzes</h1>
        <div class="flex items-center space-x-4">
          <NuxtLink 
            to="/dashboard" 
            class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Back to Dashboard
          </NuxtLink>
          <NuxtLink 
            to="/quiz/create" 
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Create New Quiz
          </NuxtLink>
        </div>
      </div>
    </header>
    
    <main>
      <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div class="px-4 py-6 sm:px-0">
          <!-- Search and Filter -->
          <div class="bg-white shadow overflow-hidden sm:rounded-lg p-6 mb-6">
            <div class="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div class="w-full md:w-1/3">
                <label for="search" class="sr-only">Search</label>
                <div class="relative rounded-md shadow-sm">
                  <input
                    id="search"
                    type="text"
                    v-model="searchQuery"
                    class="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-4 pr-10 sm:text-sm border-gray-300 rounded-md"
                    placeholder="Search quizzes..."
                  />
                  <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div class="flex space-x-4">
                <div>
                  <label for="sort-by" class="block text-sm font-medium text-gray-700">Sort by</label>
                  <select
                    id="sort-by"
                    v-model="sortBy"
                    class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  >
                    <option value="createdAt">Date Created</option>
                    <option value="title">Title</option>
                    <option value="questionsCount">Number of Questions</option>
                  </select>
                </div>
                
                <div>
                  <label for="sort-order" class="block text-sm font-medium text-gray-700">Order</label>
                  <select
                    id="sort-order"
                    v-model="sortOrder"
                    class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  >
                    <option value="desc">Descending</option>
                    <option value="asc">Ascending</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Loading State -->
          <div v-if="loading" class="text-center py-12">
            <svg class="animate-spin h-10 w-10 text-indigo-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p class="text-gray-600">Loading your quizzes...</p>
          </div>
          
          <!-- No Quizzes -->
          <div v-else-if="quizzes.length === 0" class="text-center py-12 bg-white shadow overflow-hidden sm:rounded-lg">
            <svg class="h-16 w-16 text-gray-400 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 class="text-lg font-medium text-gray-900 mb-2">No quizzes found</h3>
            <p class="text-gray-500 mb-6">You haven't created any quizzes yet.</p>
            <NuxtLink 
              to="/quiz/create" 
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Create Your First Quiz
            </NuxtLink>
          </div>
          
          <!-- Quiz List -->
          <div v-else class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div 
              v-for="quiz in filteredQuizzes" 
              :key="quiz._id"
              class="bg-white overflow-hidden shadow rounded-lg"
            >
              <div class="p-6">
                <div class="flex items-start justify-between">
                  <h3 class="text-lg font-medium text-gray-900 truncate" :title="quiz.title">
                    {{ quiz.title }}
                  </h3>
                  <span 
                    v-if="quiz.isPublic" 
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                  >
                    Public
                  </span>
                </div>
                
                <p v-if="quiz.description" class="mt-2 text-sm text-gray-500 line-clamp-2" :title="quiz.description">
                  {{ quiz.description }}
                </p>
                
                <div class="mt-4 flex items-center text-sm text-gray-500">
                  <svg class="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                  </svg>
                  {{ quiz.questions.length }} questions
                </div>
                
                <div class="mt-2 flex items-center text-sm text-gray-500">
                  <svg class="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" />
                  </svg>
                  Created {{ formatDate(quiz.createdAt) }}
                </div>
                
                <div v-if="quiz.tags && quiz.tags.length > 0" class="mt-4">
                  <div class="flex flex-wrap gap-2">
                    <span 
                      v-for="(tag, index) in quiz.tags" 
                      :key="index"
                      class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800"
                    >
                      {{ tag }}
                    </span>
                  </div>
                </div>
                
                <div class="mt-6 flex space-x-3">
                <button
                    @click="practiceQuiz(quiz._id)"
                    class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    Practice
                </button>
                <button
                    @click="viewQuiz(quiz._id)"
                    class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    View
                </button>
                <button
                    @click="editQuiz(quiz._id)"
                    class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    Edit
                </button>
                <button
                    @click="deleteQuiz(quiz._id)"
                    class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                    Delete
                </button>
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
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '~/stores/auth';

const router = useRouter();
const authStore = useAuthStore();

// Quiz list state
const quizzes = ref([]);
const loading = ref(true);
const searchQuery = ref('');
const sortBy = ref('createdAt');
const sortOrder = ref('desc');

// Check authentication
onMounted(async () => {
  const isAuthenticated = await authStore.checkAuth();
  if (!isAuthenticated) {
    router.push('/login');
    return;
  }
  
  // Load quizzes
  await fetchQuizzes();
});

// Fetch quizzes from API
const fetchQuizzes = async () => {
  try {
    loading.value = true;
    
    const response = await fetch('/api/quiz', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authStore.token}`
      }
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch quizzes');
    }
    
    quizzes.value = data.quizzes;
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    alert(error.message || 'An error occurred while fetching quizzes');
  } finally {
    loading.value = false;
  }
};

// Filter and sort quizzes
const filteredQuizzes = computed(() => {
  let result = [...quizzes.value];
  
  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(quiz => 
      quiz.title.toLowerCase().includes(query) || 
      (quiz.description && quiz.description.toLowerCase().includes(query)) ||
      (quiz.tags && quiz.tags.some(tag => tag.toLowerCase().includes(query)))
    );
  }
  
  // Apply sorting
  result.sort((a, b) => {
    let valueA, valueB;
    
    if (sortBy.value === 'questionsCount') {
      valueA = a.questions.length;
      valueB = b.questions.length;
    } else {
      valueA = a[sortBy.value];
      valueB = b[sortBy.value];
    }
    
    // Handle string comparison
    if (typeof valueA === 'string') {
      valueA = valueA.toLowerCase();
      valueB = valueB.toLowerCase();
    }
    
    // Apply sort order
    if (sortOrder.value === 'asc') {
      return valueA > valueB ? 1 : -1;
    } else {
      return valueA < valueB ? 1 : -1;
    }
  });
  
  return result;
});

// Format date
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString();
};

// Quiz actions
const practiceQuiz = (quizId) => {
  router.push(`/quiz/practice?id=${quizId}`);
};

const editQuiz = (quizId) => {
  router.push(`/quiz/edit/${quizId}`);
};

const viewQuiz = (quizId) => {
  router.push(`/quiz/view/${quizId}`);
};

const deleteQuiz = async (quizId) => {
  if (!confirm('Are you sure you want to delete this quiz? This action cannot be undone.')) {
    return;
  }
  
  try {
    const response = await fetch(`/api/quiz/${quizId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authStore.token}`
      }
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to delete quiz');
    }
    
    // Remove the deleted quiz from the list
    quizzes.value = quizzes.value.filter(quiz => quiz._id !== quizId);
  } catch (error) {
    console.error('Error deleting quiz:', error);
    alert(error.message || 'An error occurred while deleting the quiz');
  }
};

definePageMeta({
  middleware: 'auth',
  requiresAuth: true
});
</script>
