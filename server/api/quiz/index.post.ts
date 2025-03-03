import { connectToDatabase } from '~/server/utils/dbConnect';
import Quiz from '~/server/models/Quiz';
import Activity from '~/server/models/Activity';
import { verifyToken } from '~/server/utils/auth';

export default defineEventHandler(async (event) => {
  try {
    // Verify user authentication
    const user = await verifyToken(event);
    
    await connectToDatabase();
    
    // Get request body
    const { title, description, questions, tags, isPublic } = await readBody(event);
    
    // Validate required fields
    if (!title || !questions || !Array.isArray(questions) || questions.length === 0) {
      return createError({
        statusCode: 400,
        message: 'Missing required fields'
      });
    }
    
    // Validate questions
    for (const question of questions) {
      if (!question.question) {
        return createError({
          statusCode: 400,
          message: 'All questions must have question text'
        });
      }
      
      if (question.type === 'multiple_choice' || question.type === 'multi_select') {
        if (!Array.isArray(question.options) || question.options.length < 2) {
          return createError({
            statusCode: 400,
            message: 'Multiple choice and multi-select questions must have at least 2 options'
          });
        }
      }
      
      if (question.type === 'multiple_choice' && !question.correctAnswer) {
        return createError({
          statusCode: 400,
          message: 'Multiple choice questions must have a correct answer'
        });
      }
      
      if (question.type === 'multi_select' && (!Array.isArray(question.correctAnswers) || question.correctAnswers.length === 0)) {
        return createError({
          statusCode: 400,
          message: 'Multi-select questions must have at least one correct answer'
        });
      }
      
      if (question.type === 'matching' && (!Array.isArray(question.matches) || question.matches.length < 2)) {
        return createError({
          statusCode: 400,
          message: 'Matching questions must have at least 2 pairs'
        });
      }
    }
    
    // Create new quiz
    const quiz = new Quiz({
      title,
      description,
      createdBy: user.userId,
      questions,
      tags: tags || [],
      isPublic: isPublic || false
    });
    
    // Save quiz
    await quiz.save();
    
    // Record activity
    const activity = new Activity({
      user: user.userId,
      type: 'created',
      quiz: quiz._id,
      quizTitle: quiz.title,
      description: `Created a new quiz with ${questions.length} questions`
    });
    
    await activity.save();
    
    return {
      success: true,
      quiz: {
        _id: quiz._id,
        title: quiz.title,
        description: quiz.description,
        questions: quiz.questions,
        tags: quiz.tags,
        isPublic: quiz.isPublic,
        createdAt: quiz.createdAt,
        updatedAt: quiz.updatedAt
      }
    };
  } catch (error: any) {
    console.error('Error saving quiz:', error);
    return createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'An error occurred while saving the quiz'
    });
  }
});
