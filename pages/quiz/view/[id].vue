<template>
  <div class="min-h-screen bg-gray-100">
    <header class="bg-white shadow">
      <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <h1 class="text-3xl font-bold text-gray-900">View Quiz</h1>
        <div class="flex items-center space-x-4">
          <NuxtLink 
            to="/quiz" 
            class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Back to Quizzes
          </NuxtLink>
        </div>
      </div>
    </header>
    
    <main>
      <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div class="px-4 py-6 sm:px-0">
          <!-- Loading State -->
          <div v-if="loading" class="text-center py-12">
            <svg class="animate-spin h-10 w-10 text-indigo-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p class="text-gray-600">Loading quiz...</p>
          </div>
          
          <!-- Quiz Viewer -->
          <div v-else-if="quiz" class="bg-white shadow overflow-hidden sm:rounded-lg">
            <!-- Quiz Header -->
            <div class="px-4 py-5 sm:px-6 border-b border-gray-200">
              <div class="flex justify-between items-start">
                <div>
                  <h2 class="text-2xl font-bold text-gray-900">{{ quiz.title }}</h2>
                  <p v-if="quiz.description" class="mt-1 text-sm text-gray-500">{{ quiz.description }}</p>
                </div>
                <div class="flex space-x-3">
                  <button
                    v-if="isOwner"
                    @click="editQuiz"
                    class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Edit Quiz
                  </button>
                  <button
                    @click="practiceQuiz"
                    class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Practice Quiz
                  </button>
                </div>
              </div>
              
              <!-- Quiz Metadata -->
              <div class="mt-4 flex flex-wrap gap-4 text-sm text-gray-500">
                <div class="flex items-center">
                  <svg class="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                  </svg>
                  {{ quiz.questions.length }} questions
                </div>
                <div class="flex items-center">
                  <svg class="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" />
                  </svg>
                  Created {{ formatDate(quiz.createdAt) }}
                </div>
                <div v-if="quiz.updatedAt && quiz.updatedAt !== quiz.createdAt" class="flex items-center">
                  <svg class="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd" />
                  </svg>
                  Updated {{ formatDate(quiz.updatedAt) }}
                </div>
                <div v-if="quiz.isPublic" class="flex items-center">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Public
                  </span>
                </div>
              </div>
              
              <!-- Tags -->
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
            </div>
            
            <!-- Questions List -->
            <div class="divide-y divide-gray-200">
              <div 
                v-for="(question, index) in quiz.questions" 
                :key="question.id || index"
                class="px-4 py-5 sm:px-6"
              >
                <div class="flex justify-between items-start mb-2">
                  <h3 class="text-lg font-medium text-gray-900">
                    Question {{ index + 1 }}
                    <span class="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" 
                          :class="{
                            'bg-green-100 text-green-800': question.difficulty === 'easy',
                            'bg-yellow-100 text-yellow-800': question.difficulty === 'medium',
                            'bg-red-100 text-red-800': question.difficulty === 'hard'
                          }">
                      {{ question.difficulty }}
                    </span>
                    <span class="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                      {{ getQuestionTypeName(question.type) }}
                    </span>
                  </h3>
                </div>
                
                <p class="text-gray-700 mb-4">{{ question.question }}</p>
                
                <!-- Multiple Choice Options -->
                <div v-if="question.type === 'multiple_choice'" class="mb-4 space-y-2">
                  <div 
                    v-for="(option, optIndex) in question.options" 
                    :key="optIndex"
                    class="flex items-center"
                  >
                    <div class="flex-shrink-0 h-5 w-5 flex items-center justify-center mr-2">
                      <svg v-if="option === question.correctAnswer" class="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                      </svg>
                      <div v-else class="h-5 w-5 rounded-full border border-gray-300"></div>
                    </div>
                    <span :class="{ 'font-medium': option === question.correctAnswer }">
                      {{ option }}
                    </span>
                  </div>
                </div>
                
                <!-- Multi-Select Options -->
                <div v-else-if="question.type === 'multi_select'" class="mb-4 space-y-2">
                  <div 
                    v-for="(option, optIndex) in question.options" 
                    :key="optIndex"
                    class="flex items-center"
                  >
                    <div class="flex-shrink-0 h-5 w-5 flex items-center justify-center mr-2">
                      <svg v-if="question.correctAnswers.includes(option)" class="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                      </svg>
                      <div v-else class="h-5 w-5 rounded border border-gray-300"></div>
                    </div>
                    <span :class="{ 'font-medium': question.correctAnswers.includes(option) }">
                      {{ option }}
                    </span>
                  </div>
                </div>
                
                <!-- True/False Options -->
                <div v-else-if="question.type === 'true_false'" class="mb-4 space-y-2">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-5 w-5 flex items-center justify-center mr-2">
                      <svg v-if="question.correctAnswer === 'True'" class="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                      </svg>
                      <div v-else class="h-5 w-5 rounded-full border border-gray-300"></div>
                    </div>
                    <span :class="{ 'font-medium': question.correctAnswer === 'True' }">True</span>
                  </div>
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-5 w-5 flex items-center justify-center mr-2">
                      <svg v-if="question.correctAnswer === 'False'" class="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                      </svg>
                      <div v-else class="h-5 w-5 rounded-full border border-gray-300"></div>
                    </div>
                    <span :class="{ 'font-medium': question.correctAnswer === 'False' }">False</span>
                  </div>
                </div>
                
                <!-- Matching Items -->
                <div v-else-if="question.type === 'matching'" class="mb-4 space-y-2">
                  <div v-for="(match, matchIndex) in question.matches" :key="matchIndex" class="grid grid-cols-2 gap-4">
                    <div class="p-3 bg-gray-50 rounded-md">
                      {{ match.item }}
                    </div>
                    <div class="p-3 bg-green-50 rounded-md border border-green-200">
                      {{ match.match }}
                    </div>
                  </div>
                </div>
                
                <!-- Explanation -->
                <div v-if="question.explanation" class="mt-4 p-3 bg-indigo-50 text-indigo-700 rounded-md">
                  <div class="font-medium mb-1">Explanation:</div>
                  <div>{{ question.explanation }}</div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Quiz Not Found -->
          <div v-else class="text-center py-12 bg-white shadow overflow-hidden sm:rounded-lg">
            <svg class="h-16 w-16 text-gray-400 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 class="text-lg font-medium text-gray-900 mb-2">Quiz Not Found</h3>
            <p class="text-gray-500 mb-6">The quiz you're looking for doesn't exist or you don't have permission to access it.</p>
            <NuxtLink 
              to="/quiz" 
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Back to Quizzes
            </NuxtLink>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '~/stores/auth';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

// Quiz state
const quiz = ref(null);
const loading = ref(true);

// Check authentication
onMounted(async () => {
  const isAuthenticated = await authStore.checkAuth();
  if (!isAuthenticated) {
    router.push('/login');
    return;
  }
  
  // Load quiz
  const quizId = route.params.id;
  if (quizId) {
    await fetchQuiz(quizId);
  }
});

// Fetch quiz from API
const fetchQuiz = async (quizId) => {
  try {
    loading.value = true;
    
    const response = await fetch(`/api/quiz/${quizId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authStore.token}`
      }
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch quiz');
    }
    
    quiz.value = data.quiz;
  } catch (error) {
    console.error('Error fetching quiz:', error);
    quiz.value = null;
  } finally {
    loading.value = false;
  }
};

// Check if current user is the owner of the quiz
const isOwner = computed(() => {
  return quiz.value && quiz.value.createdBy === authStore.user?.id;
});

// Get question type name
const getQuestionTypeName = (type) => {
  const typeMap = {
    'multiple_choice': 'Multiple Choice',
    'multi_select': 'Multi-Select',
    'true_false': 'True/False',
    'matching': 'Matching'
  };
  return typeMap[type] || type;
};

// Format date
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString();
};

// Navigate to edit page
const editQuiz = () => {
  router.push(`/quiz/edit/${quiz.value._id}`);
};

// Navigate to practice page
const practiceQuiz = () => {
  router.push(`/quiz/practice?id=${quiz.value._id}`);
};

definePageMeta({
  middleware: 'auth',
  requiresAuth: true
});
</script>
