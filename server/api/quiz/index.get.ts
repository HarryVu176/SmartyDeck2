import { connectToDatabase } from '~/server/utils/dbConnect';
import Quiz from '~/server/models/Quiz';
import { verifyToken } from '~/server/utils/auth';

export default defineEventHandler(async (event) => {
  try {
    // Verify user authentication
    const user = await verifyToken(event);
    
    await connectToDatabase();
    
    // Get quizzes created by the user
    const quizzes = await Quiz.find({ createdBy: user.userId })
      .sort({ createdAt: -1 })
      .lean();
    
    return {
      success: true,
      quizzes
    };
  } catch (error: any) {
    console.error('Error fetching quizzes:', error);
    return createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'An error occurred while fetching quizzes'
    });
  }
});
