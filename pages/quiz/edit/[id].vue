<template>
  <div class="min-h-screen bg-gray-100">
    <header class="bg-white shadow">
      <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <h1 class="text-3xl font-bold text-gray-900">Edit Quiz</h1>
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
          
          <!-- Quiz Editor -->
          <div v-else-if="quiz" class="bg-white shadow overflow-hidden sm:rounded-lg p-6">
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-2xl font-bold">Edit Quiz</h2>
              <div class="flex space-x-4">
                <button
                  @click="saveQuiz"
                  :disabled="isSaving"
                  class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  <span v-if="isSaving">Saving...</span>
                  <span v-else>Save Changes</span>
                </button>
                <button
                  @click="practiceQuiz"
                  class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Practice Now
                </button>
              </div>
            </div>
            
            <!-- Quiz Title and Description -->
            <div class="mb-6 grid grid-cols-1 gap-4">
              <div>
                <label for="quiz-title" class="block text-sm font-medium text-gray-700 mb-1">Quiz Title</label>
                <input
                  id="quiz-title"
                  v-model="quiz.title"
                  type="text"
                  class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="Enter a title for your quiz"
                />
              </div>
              <div>
                <label for="quiz-description" class="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                <textarea
                  id="quiz-description"
                  v-model="quiz.description"
                  rows="2"
                  class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="Add a description for your quiz"
                ></textarea>
              </div>
              <div>
                <label for="quiz-tags" class="block text-sm font-medium text-gray-700 mb-1">Tags (Optional)</label>
                <input
                  id="quiz-tags"
                  v-model="tagsString"
                  type="text"
                  class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="Enter tags separated by commas"
                />
              </div>
              <div class="flex items-center">
                <input
                  id="quiz-public"
                  v-model="quiz.isPublic"
                  type="checkbox"
                  class="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                />
                <label for="quiz-public" class="ml-2 block text-sm text-gray-700">
                  Make this quiz public
                </label>
              </div>
            </div>
            
            <!-- Questions Editor -->
            <div class="space-y-6">
              <div v-for="(question, index) in quiz.questions" :key="question.id" class="bg-gray-50 p-4 rounded-lg">
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
                  <button
                    @click="removeQuestion(index)"
                    class="text-red-600 hover:text-red-900"
                    title="Remove question"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                    </svg>
                  </button>
                </div>
                
                <!-- Question Text -->
                <div class="mb-3">
                  <textarea
                    v-model="question.question"
                    rows="2"
                    class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  ></textarea>
                </div>
                
                <!-- Multiple Choice Options -->
                <div v-if="question.type === 'multiple_choice'" class="mb-3 space-y-2">
                  <div v-for="(option, optIndex) in question.options" :key="optIndex" class="flex items-center">
                    <input
                      :id="`q${index}-opt${optIndex}`"
                      type="radio"
                      :name="`question-${index}`"
                      :checked="option === question.correctAnswer"
                      @change="question.correctAnswer = option"
                      class="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                    />
                    <input
                      v-model="question.options[optIndex]"
                      type="text"
                      class="ml-2 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                    <button
                      @click="removeOption(question, optIndex)"
                      class="ml-2 text-red-600 hover:text-red-900"
                      title="Remove option"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                      </svg>
                    </button>
                  </div>
                  <button
                    @click="addOption(question)"
                    class="mt-2 inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Add Option
                  </button>
                </div>
                
                <!-- Multi-Select Options -->
                <div v-else-if="question.type === 'multi_select'" class="mb-3 space-y-2">
                  <div v-for="(option, optIndex) in question.options" :key="optIndex" class="flex items-center">
                    <input
                      :id="`q${index}-opt${optIndex}`"
                      type="checkbox"
                      :checked="question.correctAnswers.includes(option)"
                      @change="toggleCorrectAnswer(question, option)"
                      class="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                    />
                    <input
                      v-model="question.options[optIndex]"
                      type="text"
                      class="ml-2 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                    <button
                      @click="removeOption(question, optIndex)"
                      class="ml-2 text-red-600 hover:text-red-900"
                      title="Remove option"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                      </svg>
                    </button>
                  </div>
                  <button
                    @click="addOption(question)"
                    class="mt-2 inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Add Option
                  </button>
                </div>
                
                <!-- True/False Options -->
                <div v-else-if="question.type === 'true_false'" class="mb-3 space-y-2">
                  <div class="flex items-center">
                    <input
                      :id="`q${index}-true`"
                      type="radio"
                      :name="`question-${index}`"
                      :checked="question.correctAnswer === 'True'"
                      @change="question.correctAnswer = 'True'"
                      class="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                    />
                    <label :for="`q${index}-true`" class="ml-2 block text-sm text-gray-700">True</label>
                  </div>
                  <div class="flex items-center">
                    <input
                      :id="`q${index}-false`"
                      type="radio"
                      :name="`question-${index}`"
                      :checked="question.correctAnswer === 'False'"
                      @change="question.correctAnswer = 'False'"
                      class="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                    />
                    <label :for="`q${index}-false`" class="ml-2 block text-sm text-gray-700">False</label>
                  </div>
                </div>
                
                <!-- Matching Items -->
                <div v-else-if="question.type === 'matching'" class="mb-3 space-y-2">
                  <div v-for="(match, matchIndex) in question.matches" :key="matchIndex" class="grid grid-cols-2 gap-4">
                    <input
                      v-model="question.matches[matchIndex].item"
                      type="text"
                      class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="Item"
                    />
                    <div class="flex items-center">
                      <input
                        v-model="question.matches[matchIndex].match"
                        type="text"
                        class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder="Match"
                      />
                      <button
                        @click="removeMatch(question, matchIndex)"
                        class="ml-2 text-red-600 hover:text-red-900"
                        title="Remove match"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <button
                    @click="addMatch(question)"
                    class="mt-2 inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Add Match Pair
                  </button>
                </div>
                
                <!-- Explanation -->
                <div>
                  <label :for="`explanation-${index}`" class="block text-sm font-medium text-gray-700 mb-1">Explanation</label>
                  <textarea
                    :id="`explanation-${index}`"
                    v-model="question.explanation"
                    rows="2"
                    class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  ></textarea>
                </div>
              </div>
            </div>
            
            <!-- Add New Question Button -->
            <div class="mt-6 flex justify-center">
              <button
                @click="addNewQuestion"
                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Add New Question
              </button>
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
import { v4 as uuidv4 } from 'uuid';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

// Quiz state
const quiz = ref(null);
const loading = ref(true);
const isSaving = ref(false);
const tagsString = ref('');

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
    
    // Set tags string
    if (quiz.value.tags && Array.isArray(quiz.value.tags)) {
      tagsString.value = quiz.value.tags.join(', ');
    }
  } catch (error) {
    console.error('Error fetching quiz:', error);
    quiz.value = null;
  } finally {
    loading.value = false;
  }
};

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

// Question editing functions
const removeQuestion = (index) => {
  if (confirm('Are you sure you want to remove this question?')) {
    quiz.value.questions.splice(index, 1);
  }
};

const addOption = (question) => {
  question.options.push(`Option ${question.options.length + 1}`);
};

const removeOption = (question, index) => {
  // Check if this option is marked as correct
  if (question.type === 'multiple_choice' && question.correctAnswer === question.options[index]) {
    question.correctAnswer = '';
  } else if (question.type === 'multi_select' && question.correctAnswers.includes(question.options[index])) {
    const answerIndex = question.correctAnswers.indexOf(question.options[index]);
    question.correctAnswers.splice(answerIndex, 1);
  }
  
  // Remove the option
  question.options.splice(index, 1);
};

const toggleCorrectAnswer = (question, option) => {
  const index = question.correctAnswers.indexOf(option);
  if (index === -1) {
    question.correctAnswers.push(option);
  } else {
    question.correctAnswers.splice(index, 1);
  }
};

const addMatch = (question) => {
  if (!question.matches) {
    question.matches = [];
  }
  question.matches.push({ item: '', match: '' });
};

const removeMatch = (question, index) => {
  question.matches.splice(index, 1);
};

// Add a new blank question
const addNewQuestion = () => {
  const questionType = 'multiple_choice';
  
  const newQuestion = {
    id: uuidv4(),
    type: questionType,
    difficulty: 'medium',
    question: '',
    explanation: ''
  };
  
  // Add type-specific properties
  if (questionType === 'multiple_choice') {
    newQuestion.options = ['Option A', 'Option B', 'Option C', 'Option D'];
    newQuestion.correctAnswer = '';
  } else if (questionType === 'multi_select') {
    newQuestion.options = ['Option A', 'Option B', 'Option C', 'Option D'];
    newQuestion.correctAnswers = [];
  } else if (questionType === 'true_false') {
    newQuestion.correctAnswer = '';
  } else if (questionType === 'matching') {
    newQuestion.matches = [
      { item: '', match: '' },
      { item: '', match: '' }
    ];
  }
  
  quiz.value.questions.push(newQuestion);
};

// Save quiz
const saveQuiz = async () => {
  try {
    isSaving.value = true;
    
    // Validate quiz title
    if (!quiz.value.title.trim()) {
      alert('Please enter a title for your quiz');
      isSaving.value = false;
      return;
    }
    
    // Prepare the quiz data
    const quizData = {
      title: quiz.value.title,
      description: quiz.value.description,
      questions: quiz.value.questions,
      tags: tagsString.value.split(',').map(tag => tag.trim()).filter(tag => tag),
      isPublic: quiz.value.isPublic
    };
    
    // Call the API to update the quiz
    const response = await fetch(`/api/quiz/${quiz.value._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      },
      body: JSON.stringify(quizData)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to update quiz');
    }
    
    alert('Quiz updated successfully');
    
    // Redirect to quiz list
    router.push('/quiz');
  } catch (error) {
    console.error('Error updating quiz:', error);
    alert(error.message || 'An error occurred while updating the quiz');
  } finally {
    isSaving.value = false;
  }
};

// Practice quiz
const practiceQuiz = () => {
  router.push(`/quiz/practice?id=${quiz.value._id}`);
};

definePageMeta({
  middleware: 'auth',
  requiresAuth: true
});
</script>
