import { Anthropic } from '@anthropic-ai/sdk';
import config from '../config/config';
import { v4 as uuidv4 } from 'uuid';

interface QuizGenerationOptions {
  content: string;
  questionTypes: string[];
  questionCounts: Record<string, number>;
  instructions?: string;
}

export async function generateQuizWithClaude(options: QuizGenerationOptions) {
  try {
    const { content, questionTypes, questionCounts, instructions } = options;
    
    // Calculate total questions
    const totalQuestions = Object.values(questionCounts).reduce((sum, count) => sum + count, 0);
    
    if (totalQuestions <= 0 || totalQuestions > 50) {
      throw new Error('Total questions must be between 1 and 50');
    }
    
    // Build the prompt for Claude
    const prompt = buildQuizGenerationPrompt(content, questionTypes, questionCounts, instructions);
    
    // Initialize Anthropic client
    const anthropic = new Anthropic({
      apiKey: config.claudeApiKey,
    });
    
    // Call Claude API
    const response = await anthropic.messages.create({
      model: 'claude-3-7-sonnet-20250219',
      max_tokens: 4000,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });
    
    if (response.content[0].type === 'text') {
      const parsedResponse = parseClaudeResponse(response.content[0].text);
      
      // Post-process the response to ensure it's properly formatted
      return postProcessQuizData(parsedResponse, questionTypes, questionCounts);
    } else {
      throw new Error('Unexpected response, report to developer.');
    }
  } catch (error) {
    console.error('Error generating quiz with Claude:', error);
    throw error;
  }
}

function buildQuizGenerationPrompt(
  content: string,
  questionTypes: string[],
  questionCounts: Record<string, number>,
  instructions?: string
): string {
  let prompt = `Please create a comprehensive quiz based on the following content. Analyze the content carefully and generate diverse, engaging questions that test understanding at different levels.
  
Content:
"""
${content}
"""

Generate the following question types:
`;

  // Add question types and counts
  questionTypes.forEach(type => {
    const formattedType = type === 'multiple_choice' ? 'Multiple Choice' :
                          type === 'multi_select' ? 'Multi-Select' :
                          type === 'true_false' ? 'True/False' :
                          type === 'matching' ? 'Matching' : type;
    
    prompt += `- ${formattedType}: ${questionCounts[type]} questions\n`;
  });
  
  // Add custom instructions if provided
  if (instructions) {
    prompt += `\nAdditional instructions: ${instructions}\n`;
  }
  
  prompt += `\nGuidelines for question creation:
1. Create a variety of questions with different difficulty levels (easy, medium, hard)
2. If the content contains code examples:
   - Include questions about the code's output
   - Ask about what happens if certain parts of the code were modified
   - Test understanding of the concepts demonstrated in the code
   - Include questions about potential errors or edge cases
3. For theoretical content:
   - Test factual recall
   - Test conceptual understanding
   - Include application questions where appropriate
4. Ensure questions are directly based on the provided content
5. Make sure all questions have clear, unambiguous answers
6. Provide detailed explanations for all answers

Specific guidelines for each question type:
- Multiple Choice: Create questions with 4-5 options where only one is correct. Make distractors plausible.
- Multi-Select: Create questions where 2-3 options are correct out of 5-6 total options.
- True/False: Create clear statements that are definitively true or false based on the content. For True/False questions, the correctAnswer must be exactly "True" or "False" (case sensitive).
- Matching: Create 4-6 items to be matched with their corresponding pairs.

Format the quiz as a JSON object with the following structure:
{
  "questions": [
    {
      "id": "unique_id",
      "type": "multiple_choice", // or "multi_select", "true_false", "matching"
      "difficulty": "easy", // or "medium", "hard"
      "question": "Question text",
      "options": ["Option A", "Option B", "Option C", "Option D"], // for multiple choice, multi-select
      "correctAnswer": "Option A", // for multiple choice, true_false
      "correctAnswers": ["Option A", "Option C"], // for multi-select
      "matches": [
        {"item": "Item 1", "match": "Match 1"},
        {"item": "Item 2", "match": "Match 2"}
      ], // for matching questions
      "explanation": "Detailed explanation of the correct answer"
    }
  ]
}

IMPORTANT NOTES:
1. For true_false questions, the correctAnswer field must be exactly "True" or "False" (case sensitive).
2. For true_false questions, do not include an options array.
3. Each question must have a unique ID.
4. All questions must have an explanation field.
5. Return ONLY the JSON object as specified, with no additional text or markdown formatting.

Make sure all questions are directly based on the provided content and are factually accurate.`;

  return prompt;
}

function parseClaudeResponse(response: string): any {
  try {
    // First, try to extract JSON from code blocks
    const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/) || 
                      response.match(/```\n([\s\S]*?)\n```/);
    
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1]);
    }
    
    // If no code blocks, try to find JSON directly
    const jsonRegex = /{[\s\S]*}/;
    const directMatch = response.match(jsonRegex);
    
    if (directMatch) {
      return JSON.parse(directMatch[0]);
    }
    
    // If still no match, try to clean up the response and parse it
    const cleanedResponse = response.replace(/^[^{]*/, '').replace(/[^}]*$/, '');
    return JSON.parse(cleanedResponse);
  } catch (error) {
    console.error('Error parsing Claude response:', error);
    console.error('Raw response:', response);
    throw new Error('Failed to generate quiz, report to developer -- PARSE ERROR.');
  }
}

// Post-process the quiz data to ensure it's properly formatted
function postProcessQuizData(data: any, questionTypes: string[], questionCounts: Record<string, number>) {
  if (!data || !data.questions || !Array.isArray(data.questions)) {
    throw new Error('Invalid quiz data format');
  }
  
  // Process each question to ensure it's properly formatted
  data.questions = data.questions.map(question => {
    // Ensure each question has an ID
    if (!question.id) {
      question.id = uuidv4();
    }
    
    // Ensure difficulty is set
    if (!question.difficulty || !['easy', 'medium', 'hard'].includes(question.difficulty)) {
      question.difficulty = 'medium';
    }
    
    // Process true/false questions
    if (question.type === 'true_false') {
      // Ensure correctAnswer is exactly "True" or "False"
      if (question.correctAnswer) {
        // Normalize to "True" or "False"
        const normalizedAnswer = question.correctAnswer.toString().trim();
        if (normalizedAnswer.toLowerCase() === 'true') {
          question.correctAnswer = 'True';
        } else if (normalizedAnswer.toLowerCase() === 'false') {
          question.correctAnswer = 'False';
        }
      } else {
        // If correctAnswer is missing, try to infer from the explanation
        const explanation = question.explanation?.toLowerCase() || '';
        if (explanation.includes('true') && !explanation.includes('false')) {
          question.correctAnswer = 'True';
        } else if (explanation.includes('false') && !explanation.includes('true')) {
          question.correctAnswer = 'False';
        } else {
          // Default to False if we can't determine
          question.correctAnswer = 'False';
        }
      }
      
      // Remove options array if present for true/false questions
      delete question.options;
    }
    
    // Ensure multiple choice questions have options and a correctAnswer
    if (question.type === 'multiple_choice') {
      if (!question.options || !Array.isArray(question.options) || question.options.length < 2) {
        question.options = ['Option A', 'Option B', 'Option C', 'Option D'];
        question.correctAnswer = 'Option A';
      }
      
      // Ensure correctAnswer is one of the options
      if (!question.options.includes(question.correctAnswer)) {
        question.correctAnswer = question.options[0];
      }
    }
    
    // Ensure multi-select questions have options and correctAnswers
    if (question.type === 'multi_select') {
      if (!question.options || !Array.isArray(question.options) || question.options.length < 2) {
        question.options = ['Option A', 'Option B', 'Option C', 'Option D', 'Option E'];
      }
      
      if (!question.correctAnswers || !Array.isArray(question.correctAnswers) || question.correctAnswers.length === 0) {
        question.correctAnswers = [question.options[0], question.options[1]];
      }
      
      // Ensure all correctAnswers are in the options
      question.correctAnswers = question.correctAnswers.filter(answer => question.options.includes(answer));
      
      // If no correct answers remain, set the first option as correct
      if (question.correctAnswers.length === 0) {
        question.correctAnswers = [question.options[0]];
      }
    }
    
    // Ensure matching questions have matches
    if (question.type === 'matching') {
      if (!question.matches || !Array.isArray(question.matches) || question.matches.length < 2) {
        question.matches = [
          { item: 'Item 1', match: 'Match 1' },
          { item: 'Item 2', match: 'Match 2' }
        ];
      }
      
      // Ensure each match has item and match properties
      question.matches = question.matches.map(match => {
        if (!match.item || !match.match) {
          return { item: 'Item', match: 'Match' };
        }
        return match;
      });
    }
    
    // Ensure explanation exists
    if (!question.explanation) {
      question.explanation = 'No explanation provided.';
    }
    
    return question;
  });
  
  // Ensure we have the right number of questions for each type
  const processedQuestions = [];
  
  for (const type of questionTypes) {
    const typeQuestions = data.questions.filter(q => q.type === type);
    const requiredCount = questionCounts[type];
    
    // If we have too many questions of this type, take only what we need
    if (typeQuestions.length > requiredCount) {
      processedQuestions.push(...typeQuestions.slice(0, requiredCount));
    } 
    // If we have too few, duplicate some to meet the count
    else if (typeQuestions.length < requiredCount && typeQuestions.length > 0) {
      processedQuestions.push(...typeQuestions);
      
      // Add duplicates with new IDs to meet the count
      for (let i = typeQuestions.length; i < requiredCount; i++) {
        const duplicatedQuestion = { ...typeQuestions[i % typeQuestions.length] };
        duplicatedQuestion.id = uuidv4();
        processedQuestions.push(duplicatedQuestion);
      }
    }
    // If we have none of this type but need some, create placeholders
    else if (typeQuestions.length === 0 && requiredCount > 0) {
      for (let i = 0; i < requiredCount; i++) {
        const placeholderQuestion = createPlaceholderQuestion(type);
        processedQuestions.push(placeholderQuestion);
      }
    }
    // If we have exactly the right number, just add them
    else {
      processedQuestions.push(...typeQuestions);
    }
  }
  
  return { questions: processedQuestions };
}

// Create a placeholder question of the specified type
function createPlaceholderQuestion(type: string) {
  const question: any = {
    id: uuidv4(),
    type,
    difficulty: 'medium',
    question: `Placeholder question for ${type}`,
    explanation: 'This is a placeholder question. Please edit it with your own content.'
  };
  
  switch (type) {
    case 'multiple_choice':
      question.options = ['Option A', 'Option B', 'Option C', 'Option D'];
      question.correctAnswer = 'Option A';
      break;
    case 'multi_select':
      question.options = ['Option A', 'Option B', 'Option C', 'Option D', 'Option E'];
      question.correctAnswers = ['Option A', 'Option B'];
      break;
    case 'true_false':
      question.correctAnswer = 'True';
      break;
    case 'matching':
      question.matches = [
        { item: 'Item 1', match: 'Match 1' },
        { item: 'Item 2', match: 'Match 2' },
        { item: 'Item 3', match: 'Match 3' }
      ];
      break;
  }
  
  return question;
}
