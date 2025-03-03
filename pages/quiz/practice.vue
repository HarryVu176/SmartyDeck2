<template>
  <div class="min-h-screen bg-gray-100">
    <header class="bg-white shadow">
      <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <h1 class="text-3xl font-bold text-gray-900">Practice Quiz</h1>
        <div class="flex items-center space-x-4">
          <NuxtLink 
            to="/dashboard" 
            class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Back to Dashboard
          </NuxtLink>
        </div>
      </div>
    </header>
    
    <main>
      <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div class="px-4 py-6 sm:px-0">
          <div class="bg-white shadow overflow-hidden sm:rounded-lg p-6">
            <!-- Quiz Info -->
            <div v-if="quiz" class="mb-6">
              <h2 class="text-2xl font-bold">{{ quiz.title }}</h2>
              <p v-if="quiz.description" class="text-gray-600 mt-2">{{ quiz.description }}</p>
              
              <!-- Quiz Progress -->
              <div v-if="quizState === 'in-progress'" class="mt-4">
                <div class="flex justify-between items-center mb-2">
                  <span class="text-sm font-medium text-gray-700">
                    Question {{ currentQuestionIndex + 1 }} of {{ quiz.questions.length }}
                  </span>
                  <span class="text-sm font-medium text-gray-700">
                    Time: {{ formatTime(elapsedTime) }}
                  </span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    class="bg-indigo-600 h-2.5 rounded-full" 
                    :style="`width: ${(currentQuestionIndex + 1) / quiz.questions.length * 100}%`"
                  ></div>
                </div>
              </div>
            </div>
            
            <!-- Quiz Not Found -->
            <div v-if="!quiz" class="text-center py-12">
              <h2 class="text-2xl font-bold text-gray-900 mb-4">No Quiz Found</h2>
              <p class="text-gray-600 mb-6">There is no quiz available for practice.</p>
              <NuxtLink 
                to="/quiz/create" 
                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Create a Quiz
              </NuxtLink>
            </div>
            
            <!-- Quiz Start Screen -->
            <div v-else-if="quizState === 'not-started'" class="text-center py-12">
              <h2 class="text-2xl font-bold text-gray-900 mb-4">Ready to Start?</h2>
              <p class="text-gray-600 mb-6">
                This quiz has {{ quiz.questions.length }} questions.
                Take your time and good luck!
              </p>
              <button 
                @click="startQuiz"
                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Start Quiz
              </button>
            </div>
            
            <!-- Quiz In Progress -->
            <div v-else-if="quizState === 'in-progress'" class="py-4">
              <div class="mb-6">
                <div class="flex justify-between">
                  <h3 class="text-lg font-medium text-gray-900">
                    Question {{ currentQuestionIndex + 1 }}
                    <span class="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" 
                          :class="{
                            'bg-green-100 text-green-800': currentQuestion.difficulty === 'easy',
                            'bg-yellow-100 text-yellow-800': currentQuestion.difficulty === 'medium',
                            'bg-red-100 text-red-800': currentQuestion.difficulty === 'hard'
                          }">
                      {{ currentQuestion.difficulty }}
                    </span>
                  </h3>
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                    {{ getQuestionTypeName(currentQuestion.type) }}
                  </span>
                </div>
                <p class="mt-2 text-gray-700">{{ currentQuestion.question }}</p>
              </div>
              
              <!-- Multiple Choice Question -->
              <div v-if="currentQuestion.type === 'multiple_choice'" class="space-y-3">
                <div 
                  v-for="(option, index) in currentQuestion.options" 
                  :key="index"
                  class="flex items-center"
                >
                  <input
                    :id="`option-${index}`"
                    type="radio"
                    :name="'question-options'"
                    :value="option"
                    v-model="userAnswers[currentQuestionIndex]"
                    class="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                  />
                  <label :for="`option-${index}`" class="ml-3 block text-sm font-medium text-gray-700">
                    {{ option }}
                  </label>
                </div>
              </div>
              
              <!-- Multi-Select Question -->
              <div v-else-if="currentQuestion.type === 'multi_select'" class="space-y-3">
                <div 
                  v-for="(option, index) in currentQuestion.options" 
                  :key="index"
                  class="flex items-center"
                >
                  <input
                    :id="`option-${index}`"
                    type="checkbox"
                    :value="option"
                    v-model="userAnswers[currentQuestionIndex]"
                    class="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                  />
                  <label :for="`option-${index}`" class="ml-3 block text-sm font-medium text-gray-700">
                    {{ option }}
                  </label>
                </div>
              </div>
              
              <!-- True/False Question -->
              <div v-else-if="currentQuestion.type === 'true_false'" class="space-y-3">
                <div class="flex items-center">
                  <input
                    id="option-true"
                    type="radio"
                    name="true-false"
                    value="True"
                    v-model="userAnswers[currentQuestionIndex]"
                    class="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                  />
                  <label for="option-true" class="ml-3 block text-sm font-medium text-gray-700">
                    True
                  </label>
                </div>
                <div class="flex items-center">
                  <input
                    id="option-false"
                    type="radio"
                    name="true-false"
                    value="False"
                    v-model="userAnswers[currentQuestionIndex]"
                    class="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                  />
                  <label for="option-false" class="ml-3 block text-sm font-medium text-gray-700">
                    False
                  </label>
                </div>
              </div>
              
              <!-- Matching Question -->
              <div v-else-if="currentQuestion.type === 'matching'" class="space-y-4">
                <div v-for="(match, matchIndex) in currentQuestion.matches" :key="matchIndex" class="grid grid-cols-2 gap-4">
                  <div class="p-3 bg-gray-50 rounded-md">
                    {{ match.item }}
                  </div>
                  <select
                    v-model="userAnswers[currentQuestionIndex][matchIndex]"
                    class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  >
                    <option value="">Select a match</option>
                    <option 
                      v-for="(matchOption, optIndex) in currentQuestion.matches" 
                      :key="optIndex"
                      :value="matchOption.match"
                    >
                      {{ matchOption.match }}
                    </option>
                  </select>
                </div>
              </div>
              
              <!-- Navigation Buttons -->
              <div class="mt-8 flex justify-between">
                <button
                  v-if="currentQuestionIndex > 0"
                  @click="previousQuestion"
                  class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Previous
                </button>
                <div v-else></div>
                
                <button
                  v-if="currentQuestionIndex < quiz.questions.length - 1"
                  @click="nextQuestion"
                  class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Next
                </button>
                <button
                  v-else
                  @click="finishQuiz"
                  class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Finish Quiz
                </button>
              </div>
            </div>
            
            <!-- Quiz Results -->
            <div v-else-if="quizState === 'completed'" class="py-4">
              <div class="text-center mb-8">
                <h2 class="text-2xl font-bold text-gray-900 mb-2">Quiz Completed!</h2>
                <p class="text-gray-600">
                  You scored {{ score }} out of {{ quiz.questions.length }} ({{ Math.round(score / quiz.questions.length * 100) }}%)
                </p>
                <p class="text-gray-600 mt-1">
                  Time taken: {{ formatTime(elapsedTime) }}
                </p>
              </div>
              
              <!-- Results Summary -->
              <div class="mb-8 bg-gray-50 p-4 rounded-lg">
                <h3 class="text-lg font-medium text-gray-900 mb-4">Summary</h3>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div class="bg-white p-4 rounded-lg shadow">
                    <div class="text-2xl font-bold text-green-600 mb-1">{{ correctAnswers }}</div>
                    <div class="text-sm text-gray-500">Correct Answers</div>
                  </div>
                  <div class="bg-white p-4 rounded-lg shadow">
                    <div class="text-2xl font-bold text-red-600 mb-1">{{ incorrectAnswers }}</div>
                    <div class="text-sm text-gray-500">Incorrect Answers</div>
                  </div>
                  <div class="bg-white p-4 rounded-lg shadow">
                    <div class="text-2xl font-bold text-indigo-600 mb-1">{{ Math.round(score / quiz.questions.length * 100) }}%</div>
                    <div class="text-sm text-gray-500">Accuracy</div>
                  </div>
                </div>
              </div>
              
              <!-- Detailed Results -->
              <div>
                <h3 class="text-lg font-medium text-gray-900 mb-4">Detailed Results</h3>
                <div class="space-y-6">
                  <div 
                    v-for="(question, index) in quiz.questions" 
                    :key="index"
                    class="bg-gray-50 p-4 rounded-lg"
                  >
                    <div class="flex items-start justify-between">
                      <h4 class="text-md font-medium text-gray-900">
                        Question {{ index + 1 }}
                        <span 
                          class="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                          :class="isAnswerCorrect(index) ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                        >
                          {{ isAnswerCorrect(index) ? 'Correct' : 'Incorrect' }}
                        </span>
                      </h4>
                      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                        {{ getQuestionTypeName(question.type) }}
                      </span>
                    </div>
                    
                    <p class="mt-2 text-gray-700">{{ question.question }}</p>
                    
                    <!-- Multiple Choice Results -->
                    <div v-if="question.type === 'multiple_choice'" class="mt-3 space-y-2">
                      <div 
                        v-for="(option, optIndex) in question.options" 
                        :key="optIndex"
                        class="flex items-center"
                        :class="{
                          'text-green-700 font-medium': option === question.correctAnswer,
                          'text-red-700 font-medium': option === userAnswers[index] && option !== question.correctAnswer
                        }"
                      >
                        <span class="flex-shrink-0 h-5 w-5 flex items-center justify-center mr-2">
                          <svg v-if="option === question.correctAnswer" class="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                          </svg>
                          <svg v-else-if="option === userAnswers[index] && option !== question.correctAnswer" class="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                          </svg>
                          <span v-else class="h-5 w-5"></span>
                        </span>
                        {{ option }}
                        <span v-if="option === userAnswers[index]" class="ml-2 text-sm text-gray-500">(Your answer)</span>
                      </div>
                    </div>
                    
                    <!-- Multi-Select Results -->
                    <div v-else-if="question.type === 'multi_select'" class="mt-3 space-y-2">
                      <div 
                        v-for="(option, optIndex) in question.options" 
                        :key="optIndex"
                        class="flex items-center"
                        :class="{
                          'text-green-700 font-medium': question.correctAnswers.includes(option) && userAnswers[index]?.includes(option),
                          'text-red-700 font-medium': (!question.correctAnswers.includes(option) && userAnswers[index]?.includes(option)) || 
                                                     (question.correctAnswers.includes(option) && !userAnswers[index]?.includes(option))
                        }"
                      >
                        <span class="flex-shrink-0 h-5 w-5 flex items-center justify-center mr-2">
                          <svg v-if="question.correctAnswers.includes(option) && userAnswers[index]?.includes(option)" class="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                          </svg>
                          <svg v-else-if="(!question.correctAnswers.includes(option) && userAnswers[index]?.includes(option))" class="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                          </svg>
                          <svg v-else-if="(question.correctAnswers.includes(option) && !userAnswers[index]?.includes(option))" class="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1.707-5.293a1 1 0 01-1.414-1.414L8.586 10 6.293 7.707a1 1 0 011.414-1.414L10 8.586l2.293-2.293a1 1 0 111.414 1.414L11.414 10l2.293 2.293a1 1 0 01-1.414 1.414L10 11.414l-2.293 2.293z" clip-rule="evenodd" />
                          </svg>
                          <span v-else class="h-5 w-5"></span>
                        </span>
                        {{ option }}
                        <span v-if="userAnswers[index]?.includes(option)" class="ml-2 text-sm text-gray-500">(Your answer)</span>
                      </div>
                    </div>
                    
                    <!-- True/False Results -->
                    <div v-else-if="question.type === 'true_false'" class="mt-3 space-y-2">
                      <div 
                        class="flex items-center"
                        :class="{ 'text-green-700 font-medium': 'True' === question.correctAnswer }"
                      >
                        <span class="flex-shrink-0 h-5 w-5 flex items-center justify-center mr-2">
                          <svg v-if="'True' === question.correctAnswer" class="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                          </svg>
                          <svg v-else-if="'True' === userAnswers[index] && 'True' !== question.correctAnswer" class="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                          </svg>
                          <span v-else class="h-5 w-5"></span>
                        </span>
                        True
                        <span v-if="userAnswers[index] === 'True'" class="ml-2 text-sm text-gray-500">(Your answer)</span>
                      </div>
                      <div 
                        class="flex items-center"
                        :class="{ 'text-green-700 font-medium': 'False' === question.correctAnswer }"
                      >
                        <span class="flex-shrink-0 h-5 w-5 flex items-center justify-center mr-2">
                          <svg v-if="'False' === question.correctAnswer" class="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            // pages/quiz/practice.vue (continued)
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                          </svg>
                          <svg v-else-if="'False' === userAnswers[index] && 'False' !== question.correctAnswer" class="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                          </svg>
                          <span v-else class="h-5 w-5"></span>
                        </span>
                        False
                        <span v-if="userAnswers[index] === 'False'" class="ml-2 text-sm text-gray-500">(Your answer)</span>
                      </div>
                    </div>
                    
                    <!-- Matching Results -->
                    <div v-else-if="question.type === 'matching'" class="mt-3 space-y-2">
                      <div 
                        v-for="(match, matchIndex) in question.matches" 
                        :key="matchIndex"
                        class="grid grid-cols-2 gap-4"
                      >
                        <div class="p-3 bg-white rounded-md border">
                          {{ match.item }}
                        </div>
                        <div 
                          class="p-3 rounded-md border flex items-center"
                          :class="{
                            'bg-green-50 border-green-200': userAnswers[index]?.[matchIndex] === match.match,
                            'bg-red-50 border-red-200': userAnswers[index]?.[matchIndex] !== match.match
                          }"
                        >
                          <span class="flex-shrink-0 h-5 w-5 flex items-center justify-center mr-2">
                            <svg v-if="userAnswers[index]?.[matchIndex] === match.match" class="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                            </svg>
                            <svg v-else class="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                            </svg>
                          </span>
                          <div>
                            <div>{{ userAnswers[index]?.[matchIndex] || 'No answer' }}</div>
                            <div v-if="userAnswers[index]?.[matchIndex] !== match.match" class="text-sm text-gray-500">
                              Correct: {{ match.match }}
                            </div>
                          </div>
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
              
              <!-- Action Buttons -->
              <div class="mt-8 flex justify-center space-x-4">
                <button
                  @click="restartQuiz"
                  class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Restart Quiz
                </button>
                <NuxtLink
                  to="/dashboard"
                  class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Back to Dashboard
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '~/stores/auth';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

// Quiz state
const quiz = ref(null);
const quizState = ref('not-started'); // 'not-started', 'in-progress', 'completed'
const currentQuestionIndex = ref(0);
const userAnswers = ref([]);
const startTime = ref(null);
const endTime = ref(null);
const elapsedTime = ref(0);
const timerInterval = ref(null);

// Check authentication
onMounted(async () => {
  const isAuthenticated = await authStore.checkAuth();
  if (!isAuthenticated) {
    router.push('/login');
    return;
  }
  
  // Load quiz from localStorage if coming from quiz creation
  const practiceQuiz = localStorage.getItem('practiceQuiz');
  if (practiceQuiz) {
    quiz.value = JSON.parse(practiceQuiz);
    localStorage.removeItem('practiceQuiz'); // Clear after loading
  } else if (route.query.id) {
    // Load quiz from API if ID is provided
    await loadQuiz(route.query.id);
  }
  
  // Initialize user answers array
  if (quiz.value) {
    initializeUserAnswers();
  }
});

// Clean up timer on component unmount
onUnmounted(() => {
  if (timerInterval.value) {
    clearInterval(timerInterval.value);
  }
});

// Load quiz from API
const loadQuiz = async (quizId) => {
  try {
    const response = await fetch(`/api/quiz/${quizId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authStore.token}`
      }
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to load quiz');
    }
    
    quiz.value = data.quiz;
  } catch (error) {
    console.error('Error loading quiz:', error);
    alert(error.message || 'An error occurred while loading the quiz');
  }
};

// Initialize user answers based on question types
const initializeUserAnswers = () => {
  userAnswers.value = quiz.value.questions.map(question => {
    if (question.type === 'multiple_choice' || question.type === 'true_false') {
      return '';
    } else if (question.type === 'multi_select') {
      return [];
    } else if (question.type === 'matching') {
      return Array(question.matches.length).fill('');
    }
    return null;
  });
};

// Start the quiz
const startQuiz = () => {
  quizState.value = 'in-progress';
  startTime.value = new Date();
  
  // Start timer
  timerInterval.value = setInterval(() => {
    const now = new Date();
    elapsedTime.value = Math.floor((now - startTime.value) / 1000);
  }, 1000);
};

// Navigate to previous question
const previousQuestion = () => {
  if (currentQuestionIndex.value > 0) {
    currentQuestionIndex.value--;
  }
};

// Navigate to next question
const nextQuestion = () => {
  if (currentQuestionIndex.value < quiz.value.questions.length - 1) {
    currentQuestionIndex.value++;
  }
};

// Finish the quiz
const finishQuiz = () => {
  // Stop timer
  if (timerInterval.value) {
    clearInterval(timerInterval.value);
  }
  
  endTime.value = new Date();
  quizState.value = 'completed';
  
  // Calculate final elapsed time
  elapsedTime.value = Math.floor((endTime.value - startTime.value) / 1000);
  
  // Save quiz results to API
  saveQuizResults();
};

// Save quiz results
const saveQuizResults = async () => {
  try {
    // Only save results if the quiz came from the database
    if (!route.query.id) return;
    
    const resultsData = {
      quizId: route.query.id,
      answers: userAnswers.value,
      score: score.value,
      timeSpent: elapsedTime.value
    };
    
    await fetch('/api/quiz/results', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      },
      body: JSON.stringify(resultsData)
    });
  } catch (error) {
    console.error('Error saving quiz results:', error);
  }
};

// Restart the quiz
const restartQuiz = () => {
  initializeUserAnswers();
  currentQuestionIndex.value = 0;
  quizState.value = 'not-started';
  startTime.value = null;
  endTime.value = null;
  elapsedTime.value = 0;
};

// Format time (seconds) to MM:SS
const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
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

// Check if an answer is correct
const isAnswerCorrect = (index) => {
  const question = quiz.value.questions[index];
  const answer = userAnswers.value[index];
  
  if (!answer) return false;
  
  if (question.type === 'multiple_choice' || question.type === 'true_false') {
    return answer === question.correctAnswer;
  } else if (question.type === 'multi_select') {
    // Check if arrays have the same elements
    if (!answer.length || answer.length !== question.correctAnswers.length) return false;
    return question.correctAnswers.every(a => answer.includes(a)) && 
           answer.every(a => question.correctAnswers.includes(a));
  } else if (question.type === 'matching') {
    // Check if all matches are correct
    return question.matches.every((match, i) => answer[i] === match.match);
  }
  
  return false;
};

// Computed properties
const currentQuestion = computed(() => {
  return quiz.value?.questions[currentQuestionIndex.value] || null;
});

const score = computed(() => {
  if (!quiz.value) return 0;
  
  return quiz.value.questions.reduce((total, _, index) => {
    return total + (isAnswerCorrect(index) ? 1 : 0);
  }, 0);
});

const correctAnswers = computed(() => {
  return score.value;
});

const incorrectAnswers = computed(() => {
  return quiz.value ? quiz.value.questions.length - score.value : 0;
});

definePageMeta({
  middleware: 'auth',
  requiresAuth: true
});
</script>
