import { connectToDatabase } from '~/server/utils/dbConnect';
import { verifyToken } from '~/server/utils/auth';
import { generateQuizWithClaude } from '~/server/utils/claudeService';

export default defineEventHandler(async (event) => {
  try {
    // Verify user authentication
    const user = await verifyToken(event);
    
    await connectToDatabase();
    
    // Get request body
    const { content, questionTypes, questionCounts, instructions } = await readBody(event);
    
    // Validate required fields
    if (!content || !questionTypes || !questionCounts) {
      return createError({
        statusCode: 400,
        message: 'Missing required fields'
      });
    }
    
    // Validate content length
    if (content.length < 50) {
      return createError({
        statusCode: 400,
        message: 'Content is too short. Please provide more text for quiz generation.'
      });
    }
    
    // Validate question types
    const validQuestionTypes = ['multiple_choice', 'multi_select', 'true_false', 'matching'];
    for (const type of questionTypes) {
      if (!validQuestionTypes.includes(type)) {
        return createError({
          statusCode: 400,
          message: `Invalid question type: ${type}`
        });
      }
    }
    
    // Calculate total questions
    const totalQuestions = Object.values(questionCounts).reduce((sum: number, count: number) => sum + count, 0);
    
    if (totalQuestions <= 0 || totalQuestions > 50) {
      return createError({
        statusCode: 400,
        message: 'Total questions must be between 1 and 50'
      });
    }
    
    // Generate quiz using Claude
    const quiz = await generateQuizWithClaude({
      content,
      questionTypes,
      questionCounts,
      instructions
    });
    
    return {
      success: true,
      quiz
    };
  } catch (error: any) {
    console.error('Error generating quiz:', error);
    return createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'An error occurred while generating the quiz'
    });
  }
});
