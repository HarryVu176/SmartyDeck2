<template>
  <div class="min-h-screen bg-gray-100">
    <header class="bg-white shadow">
      <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <h1 class="text-3xl font-bold text-gray-900">Create Quiz</h1>
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
    
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div class="flex items-center">
        <div class="w-full bg-gray-200 rounded-full h-2.5">
          <div class="bg-indigo-600 h-2.5 rounded-full" :style="`width: ${step === 'input' ? '50%' : '100%'}`"></div>
        </div>
        <div class="ml-4 text-sm font-medium text-gray-700">
          {{ step === 'input' ? 'Step 1 of 2' : 'Step 2 of 2' }}
        </div>
      </div>
      <div class="flex justify-between mt-2 text-xs text-gray-500">
        <span :class="step === 'input' ? 'font-medium text-indigo-600' : ''">Configure Quiz</span>
        <span :class="step === 'preview' ? 'font-medium text-indigo-600' : ''">Review & Save</span>
      </div>
    </div>
    
    <main>
      <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div class="px-4 py-6 sm:px-0">
          <div class="bg-white shadow overflow-hidden sm:rounded-lg p-6">
            <div v-if="step === 'input'">
              <h2 class="text-2xl font-bold mb-6">Generate Quiz from Text</h2>
              
              <!-- Content Input -->
              <div class="mb-6">
                <label for="content" class="block text-sm font-medium text-gray-700 mb-2">
                  Enter text or paste content for quiz generation
                </label>
                <textarea
                  id="content"
                  v-model="quizContent"
                  rows="10"
                  class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Paste your content here..."
                  required
                ></textarea>
                <div class="mt-1 text-xs text-gray-500 flex justify-end">
                  {{ quizContent.length }} characters
                  <span v-if="quizContent.length > 0" class="ml-1">
                    (approximately {{ Math.ceil(quizContent.length / 5) }} words)
                  </span>
                </div>
                <p class="mt-2 text-sm text-gray-500">
                  Paste the text content you want to create a quiz from. The AI will generate questions based on this content.
                </p>
              </div>
              
              <!-- Question Types Selection -->
              <div class="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 class="text-lg font-medium text-gray-900 mb-3">Question Types</h3>
                <p class="text-sm text-gray-500 mb-4">Select the types of questions you want to include in your quiz.</p>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div v-for="type in questionTypes" :key="type.id" class="flex items-start p-3 bg-white rounded-md shadow-sm">
                    <div class="flex items-center h-5">
                      <input
                        :id="type.id"
                        v-model="selectedQuestionTypes"
                        :value="type.id"
                        type="checkbox"
                        class="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                      />
                    </div>
                    <div class="ml-3 text-sm">
                      <label :for="type.id" class="font-medium text-gray-700">{{ type.name }}</label>
                      <p class="text-gray-500">{{ type.description }}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Question Counts -->
              <div class="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div class="flex justify-between items-center mb-3">
                  <h3 class="text-lg font-medium text-gray-900">Number of Questions</h3>
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                    Total: {{ totalQuestions }}/25
                  </span>
                </div>
                <p class="text-sm text-gray-500 mb-4">
                  Specify how many questions of each type you want.
                </p>
                
                <div class="space-y-3">
                  <div v-for="type in questionTypes" :key="`count-${type.id}`" 
                       :class="{'opacity-50': !selectedQuestionTypes.includes(type.id)}">
                    <div class="flex items-center justify-between mb-1">
                      <label :for="`count-${type.id}`" class="block text-sm font-medium text-gray-700">
                        {{ type.name }}:
                      </label>
                      <span class="text-xs text-gray-500">{{ questionCounts[type.id] }} questions</span>
                    </div>
                    <input
                      :id="`count-${type.id}`"
                      v-model.number="questionCounts[type.id]"
                      type="range"
                      min="0"
                      max="25"
                      :disabled="!selectedQuestionTypes.includes(type.id)"
                      class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>
                
                <div v-if="totalQuestions > 25" class="mt-4 text-sm text-red-600 bg-red-50 p-2 rounded">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 inline mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                  </svg>
                  Total questions cannot exceed 25. Please reduce the number of questions.
                </div>
              </div>
              
              <!-- Custom Instructions -->
              <div class="mb-6">
                <label for="instructions" class="block text-sm font-medium text-gray-700 mb-2">
                  Custom Instructions (Optional)
                </label>
                <textarea
                  id="instructions"
                  v-model="customInstructions"
                  rows="3"
                  class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Add any specific instructions for quiz generation..."
                ></textarea>
              </div>
              
              <!-- Generate Button -->
              <div class="flex justify-end mt-8">
                <button
                  @click="generateQuiz"
                  :disabled="isGenerating || !isFormValid"
                  class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  <span v-if="isGenerating" class="flex items-center">
                    <svg class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating Quiz...
                  </span>
                  <span v-else class="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V15a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clip-rule="evenodd" />
                    </svg>
                    Generate Quiz
                  </span>
                </button>
              </div>
            </div>
            
            <!-- Quiz Preview and Edit Step -->
            <div v-else-if="step === 'preview'">
              <div class="flex justify-between items-center mb-6">
                <h2 class="text-2xl font-bold">Quiz Preview</h2>
                <div class="flex space-x-4">
                  <button
                    @click="step = 'input'"
                    class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Back to Edit
                  </button>
                  <button
                    @click="saveQuiz"
                    class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Save Quiz
                  </button>
                  <button
                    @click="startPractice"
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
                    v-model="quizTitle"
                    type="text"
                    class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Enter a title for your quiz"
                  />
                </div>
                <div>
                  <label for="quiz-description" class="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                  <textarea
                    id="quiz-description"
                    v-model="quizDescription"
                    rows="2"
                    class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Add a description for your quiz"
                  ></textarea>
                </div>
              </div>
              
              <!-- Questions Preview -->
              <div class="space-y-6">
                <div v-for="(question, index) in generatedQuiz.questions" :key="question.id" 
                     class="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                  <div class="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                    <h3 class="text-lg font-medium text-gray-900 flex items-center">
                      <span class="bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded-full mr-2">
                        Q{{ index + 1 }}
                      </span>
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
                    <div class="flex space-x-2">
                      <button
                        @click="moveQuestion(index, -1)"
                        :disabled="index === 0"
                        class="text-gray-500 hover:text-gray-700 disabled:opacity-30"
                        title="Move up"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fill-rule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                        </svg>
                      </button>
                      <button
                        @click="moveQuestion(index, 1)"
                        :disabled="index === generatedQuiz.questions.length - 1"
                        class="text-gray-500 hover:text-gray-700 disabled:opacity-30"
                        title="Move down"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fill-rule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                        </svg>
                      </button>
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
                  </div>
                  
                  <div class="p-4">
                    <!-- Question Text -->
                    <div class="mb-3">
                      <label class="block text-sm font-medium text-gray-700 mb-1">Question</label>
                      <textarea
                        v-model="question.question"
                        rows="2"
                        class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
                          class="ml-2 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
                          class="ml-2 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
                          class="block w-full border border-gray-300 rounded-md shadow-sm py-1 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          placeholder="Item"
                        />
                        <div class="flex items-center">
                          <input
                            v-model="question.matches[matchIndex].match"
                            type="text"
                            class="block w-full border border-gray-300 rounded-md shadow-sm py-1 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
                        class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      ></textarea>
                    </div>
                    
                    <!-- Difficulty Selector -->
                    <div class="mb-3">
                      <label class="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                      <div class="flex space-x-4">
                        <label class="inline-flex items-center">
                          <input type="radio" v-model="question.difficulty" value="easy" class="focus:ring-green-500 h-4 w-4 text-green-600 border-gray-300">
                          <span class="ml-2 text-sm text-gray-700">Easy</span>
                        </label>
                        <label class="inline-flex items-center">
                          <input type="radio" v-model="question.difficulty" value="medium" class="focus:ring-yellow-500 h-4 w-4 text-yellow-600 border-gray-300">
                          <span class="ml-2 text-sm text-gray-700">Medium</span>
                        </label>
                        <label class="inline-flex items-center">
                          <input type="radio" v-model="question.difficulty" value="hard" class="focus:ring-red-500 h-4 w-4 text-red-600 border-gray-300">
                          <span class="ml-2 text-sm text-gray-700">Hard</span>
                        </label>
                      </div>
                    </div>
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
            
            <!-- Save Quiz Modal -->
            <div v-if="showSaveModal" class="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
              <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
                <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                  <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <div class="sm:flex sm:items-start">
                      <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 sm:mx-0 sm:h-10 sm:w-10">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                        </svg>
                      </div>
                      <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                        <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                          Save Quiz
                        </h3>
                        <div class="mt-4 space-y-4">
                          <div>
                            <label for="save-title" class="block text-sm font-medium text-gray-700">Quiz Title</label>
                            <input
                              id="save-title"
                              v-model="quizTitle"
                              type="text"
                              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                              placeholder="Enter a title for your quiz"
                              required
                            />
                          </div>
                          <div>
                            <label for="save-description" class="block text-sm font-medium text-gray-700">Description (Optional)</label>
                            <textarea
                              id="save-description"
                              v-model="quizDescription"
                              rows="3"
                              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                              placeholder="Add a description for your quiz"
                            ></textarea>
                          </div>
                          <div>
                            <label for="save-tags" class="block text-sm font-medium text-gray-700">Tags (Optional)</label>
                            <input
                              id="save-tags"
                              v-model="quizTags"
                              type="text"
                              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                              placeholder="Enter tags separated by commas"
                            />
                          </div>
                          <div class="flex items-center">
                            <input
                              id="save-public"
                              v-model="quizIsPublic"
                              type="checkbox"
                              class="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                            />
                            <label for="save-public" class="ml-2 block text-sm text-gray-700">
                              Make this quiz public
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                    <button 
                      type="button" 
                      @click="confirmSaveQuiz"
                      :disabled="!quizTitle"
                      class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Save
                    </button>
                    <button 
                      type="button" 
                      @click="showSaveModal = false"
                      class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      Cancel
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
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '~/stores/auth';
import { v4 as uuidv4 } from 'uuid';

const router = useRouter();
const authStore = useAuthStore();

// Check authentication
onMounted(async () => {
  const isAuthenticated = await authStore.checkAuth();
  if (!isAuthenticated) {
    router.push('/login');
  }
});

// Quiz generation form
const step = ref('input');
const quizContent = ref('');
const customInstructions = ref('');
const isGenerating = ref(false);
const generatedQuiz = ref({ questions: [] });

// Quiz metadata
const quizTitle = ref('');
const quizDescription = ref('');
const quizTags = ref('');
const quizIsPublic = ref(false);
const showSaveModal = ref(false);

// Question types
const questionTypes = [
  { 
    id: 'multiple_choice', 
    name: 'Multiple Choice', 
    description: 'Questions with a single correct answer from multiple options.' 
  },
  { 
    id: 'multi_select', 
    name: 'Multi-Select', 
    description: 'Questions with multiple correct answers that must all be selected.' 
  },
  { 
    id: 'true_false', 
    name: 'True/False', 
    description: 'Simple questions with True or False as the only options.' 
  },
  { 
    id: 'matching', 
    name: 'Matching', 
    description: 'Questions where items must be matched with their corresponding pairs.' 
  }
];

// Selected question types and counts
const selectedQuestionTypes = ref(['multiple_choice']);
const questionCounts = ref({
  multiple_choice: 5,
  multi_select: 0,
  true_false: 0,
  matching: 0
});

// Computed properties
const totalQuestions = computed(() => {
  return Object.keys(questionCounts.value).reduce((total, type) => {
    return total + (selectedQuestionTypes.value.includes(type) ? questionCounts.value[type] : 0);
  }, 0);
});

const isFormValid = computed(() => {
  return quizContent.value.trim().length > 0 && 
         selectedQuestionTypes.value.length > 0 && 
         totalQuestions.value > 0 && 
         totalQuestions.value <= 25;
});

// Helper function to get question type name
const getQuestionTypeName = (type) => {
  const questionType = questionTypes.find(qt => qt.id === type);
  return questionType ? questionType.name : type;
};

// Generate quiz
const generateQuiz = async () => {
  if (!isFormValid.value) return;
  
  isGenerating.value = true;
  
  try {
    // Prepare the request data
    const requestData = {
      content: quizContent.value,
      questionTypes: selectedQuestionTypes.value,
      questionCounts: {},
      instructions: customInstructions.value || undefined
    };
    
    // Only include counts for selected question types
    selectedQuestionTypes.value.forEach(type => {
      requestData.questionCounts[type] = questionCounts.value[type];
    });
    
    // Call the API to generate the quiz using the fetchWithAuth helper
    const response = await authStore.fetchWithAuth('/api/quiz/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to generate quiz');
    }
    
    // Set the generated quiz
    generatedQuiz.value = data.quiz;
    
    // Set a default title based on content
    quizTitle.value = `Quiz on ${quizContent.value.substring(0, 30).trim()}...`;
    
    // Move to preview step
    step.value = 'preview';
  } catch (error) {
    console.error('Error generating quiz:', error);
    
    // Check if it's an authentication error
    if (error.message === 'Session expired' || error.message === 'Not authenticated') {
      alert('Your session has expired. Please log in again.');
      router.push('/login');
      return;
    }
    
    alert(error.message || 'An error occurred while generating the quiz');
  } finally {
    isGenerating.value = false;
  }
};

// Question editing functions
const removeQuestion = (index) => {
  if (confirm('Are you sure you want to remove this question?')) {
    generatedQuiz.value.questions.splice(index, 1);
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
  const questionType = selectedQuestionTypes.value[0] || 'multiple_choice';
  
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
  
  generatedQuiz.value.questions.push(newQuestion);
};

// Save quiz
const saveQuiz = () => {
  // Validate quiz title
  if (!quizTitle.value.trim()) {
    alert('Please enter a title for your quiz');
    return;
  }
  
  // Show save modal
  showSaveModal.value = true;
};

const confirmSaveQuiz = async () => {
  try {
    // Prepare the quiz data
    const quizData = {
      title: quizTitle.value,
      description: quizDescription.value,
      questions: generatedQuiz.value.questions,
      tags: quizTags.value.split(',').map(tag => tag.trim()).filter(tag => tag),
      isPublic: quizIsPublic.value
    };
    
    // Call the API to save the quiz using fetchWithAuth
    const response = await authStore.fetchWithAuth('/api/quiz', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(quizData)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to save quiz');
    }
    
    // Close the modal
    showSaveModal.value = false;
    
    // Redirect to the quiz page
    router.push(`/quiz/view/${data.quiz._id}`);
  } catch (error) {
    console.error('Error saving quiz:', error);
    
    // Check if it's an authentication error
    if (error.message === 'Session expired' || error.message === 'Not authenticated') {
      alert('Your session has expired. Please log in again.');
      router.push('/login');
      return;
    }
    
    alert(error.message || 'An error occurred while saving the quiz');
  }
};

const startPractice = async () => {
  try {
    // Validate quiz title
    if (!quizTitle.value.trim()) {
      quizTitle.value = `Quiz on ${quizContent.value.substring(0, 30).trim()}...`;
    }
    
    // Prepare the quiz data
    const quizData = {
      title: quizTitle.value,
      description: quizDescription.value,
      questions: generatedQuiz.value.questions,
      tags: quizTags.value ? quizTags.value.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
      isPublic: false
    };
    
    // Call the API to save the quiz using fetchWithAuth
    const response = await authStore.fetchWithAuth('/api/quiz', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(quizData)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to save quiz');
    }
    
    // Navigate to practice page with the saved quiz ID
    router.push(`/quiz/practice?id=${data.quiz._id}`);
  } catch (error) {
    console.error('Error saving quiz before practice:', error);
    
    // Check if it's an authentication error
    if (error.message === 'Session expired' || error.message === 'Not authenticated') {
      alert('Your session has expired. Please log in again.');
      router.push('/login');
      return;
    }
    
    // If saving fails, still allow practice using localStorage as fallback
    localStorage.setItem('practiceQuiz', JSON.stringify({
      title: quizTitle.value,
      description: quizDescription.value,
      questions: generatedQuiz.value.questions
    }));
    
    router.push('/quiz/practice');
  }
};

const moveQuestion = (index, direction) => {
  if (
    (direction < 0 && index === 0) || 
    (direction > 0 && index === generatedQuiz.value.questions.length - 1)
  ) {
    return;
  }
  
  const newIndex = index + direction;
  const questions = [...generatedQuiz.value.questions];
  const temp = questions[index];
  questions[index] = questions[newIndex];
  questions[newIndex] = temp;
  generatedQuiz.value.questions = questions;
};

definePageMeta({
  middleware: 'auth',
  requiresAuth: true
});
</script>
