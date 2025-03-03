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
  // Format question types and counts
  let questionTypesAndCounts = '';
  questionTypes.forEach(type => {
    const formattedType = type === 'multiple_choice' ? 'Multiple Choice' :
                          type === 'multi_select' ? 'Multi-Select' :
                          type === 'true_false' ? 'True/False' :
                          type === 'matching' ? 'Matching' : type;
    
    questionTypesAndCounts += `- ${formattedType}: ${questionCounts[type]} questions\n`;
  });
  
  let prompt = `You are an expert quiz creator tasked with generating a comprehensive quiz based on provided content. Your goal is to create diverse, engaging questions that test understanding at different levels, focusing on broad knowledge and conceptual understanding rather than specific recall.

Here is the content on which to base the quiz:

<content>
${content}
</content>

Please generate the following question types and counts:

<question_types_and_counts>
${questionTypesAndCounts}
</question_types_and_counts>

Additional instructions:

<additional_instructions>
${instructions || 'No additional instructions provided.'}
</additional_instructions>

Before creating the quiz, analyze the content and plan your approach inside <content_analysis> tags:

1. Identify the main concepts and themes in the content.
2. List potential misconceptions or common errors related to each main concept.
3. Consider how these concepts can be applied or extended beyond the specific examples given.
4. Brainstorm potential real-world applications or scenarios for each main concept.
5. Identify any underlying principles or theories that the content is based on.
6. Consider how different elements of the content might be connected or interrelated.
7. Note any key terms, definitions, or formulas that are crucial to understanding the content.
8. Identify areas where the content could be extended or where additional research questions might arise.

Now, create the quiz questions following these guidelines:

1. Create a variety of questions with different difficulty levels (easy, medium, hard).
2. Focus on testing conceptual understanding and application of knowledge rather than mere factual recall.
3. If the content contains code examples:
   - Include questions about the code's output or behavior.
   - Ask about what happens if certain parts of the code were modified.
   - Test understanding of the underlying principles demonstrated in the code.
   - Include questions about potential errors, edge cases, or alternative implementations.
4. For theoretical content:
   - Test understanding of core concepts and their relationships.
   - Include questions that require applying concepts to new situations.
   - Ask about potential implications or consequences of the ideas presented.
5. Ensure questions are based on the provided content but encourage broader thinking.
6. Make sure all questions have clear, unambiguous answers.
7. Provide detailed explanations for all answers, focusing on the reasoning and conceptual understanding.

Specific guidelines for each question type:

- Multiple Choice: Create questions with 4-5 options where only one is correct. Make distractors plausible and related to common misconceptions or partial understandings.
- Multi-Select: Create questions where 2-3 options are correct out of 5-6 total options. Ensure options test different aspects of the concept.
- True/False: Create clear statements that are definitively true or false based on the content, focusing on key principles or implications. The correctAnswer must be exactly "True" or "False" (case sensitive).
- Matching: Create 4-6 items to be matched with their corresponding pairs, focusing on relationships between concepts or elements.

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

Ensure all questions are based on the provided content, encourage broad understanding, and are factually accurate. Again, Return ONLY the JSON object as specified, with no additional text or markdown formatting.`;

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
