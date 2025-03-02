import { Anthropic } from '@anthropic-ai/sdk';
import config from '../config/config';

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
      return parseClaudeResponse(response.content[0].text);
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
    prompt += `- ${type}: ${questionCounts[type]} questions\n`;
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
      "matches": { // for matching questions
        "Item 1": "Match 1",
        "Item 2": "Match 2"
      },
      "explanation": "Detailed explanation of the correct answer"
    }
  ]
}

Make sure all questions are directly based on the provided content and are factually accurate.`;

  return prompt;
}

function parseClaudeResponse(response: string): any {
  try {
    // Extract JSON from Claude's response
    const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/) || 
                      response.match(/```\n([\s\S]*?)\n```/) ||
                      response.match(/{[\s\S]*}/);
                      
    if (!jsonMatch) {
      throw new Error('Could not extract JSON from Claude response');
    }
    
    const jsonString = jsonMatch[0].startsWith('{') ? jsonMatch[0] : jsonMatch[1];
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Error parsing Claude response:', error);
    throw new Error('Failed to parse quiz data from Claude response');
  }
} 