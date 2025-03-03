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
    const { quizId, answers, score, timeSpent } = await readBody(event);
    
    // Validate required fields
    if (!quizId || !answers || score === undefined || timeSpent === undefined) {
      return createError({
        statusCode: 400,
        message: 'Missing required fields'
      });
    }
    
    // Find the quiz
    const quiz = await Quiz.findById(quizId);
    
    if (!quiz) {
      return createError({
        statusCode: 404,
        message: 'Quiz not found'
      });
    }
    
    // Calculate percentage score
    const percentage = Math.round((score / quiz.questions.length) * 100);
    
    // Record activity
    const activity = new Activity({
      user: user.userId,
      type: 'practiced',
      quiz: quiz._id,
      quizTitle: quiz.title,
      description: `Score: ${score}/${quiz.questions.length} (${percentage}%)`,
      score: score,
      timeSpent: timeSpent
    });
    
    await activity.save();
    
    return {
      success: true,
      message: 'Quiz results saved successfully'
    };
  } catch (error: any) {
    console.error('Error saving quiz results:', error);
    return createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'An error occurred while saving quiz results'
    });
  }
});
