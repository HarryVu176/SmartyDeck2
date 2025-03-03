import { connectToDatabase } from '~/server/utils/dbConnect';
import Quiz from '~/server/models/Quiz';
import { verifyToken } from '~/server/utils/auth';

export default defineEventHandler(async (event) => {
  try {
    // Verify user authentication
    const user = await verifyToken(event);
    
    await connectToDatabase();
    
    const id = event.context.params?.id;
    
    // Get the quiz
    const quiz = await Quiz.findById(id).lean();
    
    if (!quiz) {
      return createError({
        statusCode: 404,
        message: 'Quiz not found'
      });
    }
    
    // Check if user has access to this quiz
    if (quiz.createdBy.toString() !== user.userId && !quiz.isPublic) {
      return createError({
        statusCode: 403,
        message: 'You do not have permission to access this quiz'
      });
    }
    
    return {
      success: true,
      quiz
    };
  } catch (error: any) {
    console.error('Error fetching quiz:', error);
    return createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'An error occurred while fetching the quiz'
    });
  }
});
