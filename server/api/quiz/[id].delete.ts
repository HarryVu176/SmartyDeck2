import { connectToDatabase } from '~/server/utils/dbConnect';
import Quiz from '~/server/models/Quiz';
import Activity from '~/server/models/Activity';
import { verifyToken } from '~/server/utils/auth';

export default defineEventHandler(async (event) => {
  try {
    // Verify user authentication
    const user = await verifyToken(event);
    
    await connectToDatabase();
    
    const id = event.context.params?.id;
    
    // Find the quiz
    const quiz = await Quiz.findById(id);
    
    if (!quiz) {
      return createError({
        statusCode: 404,
        message: 'Quiz not found'
      });
    }
    
    // Check if user has permission to delete this quiz
    if (quiz.createdBy.toString() !== user.userId && user.role !== 'admin') {
      return createError({
        statusCode: 403,
        message: 'You do not have permission to delete this quiz'
      });
    }
    
    // Record activity before deletion
    const activity = new Activity({
      user: user.userId,
      type: 'deleted',
      quizTitle: quiz.title,
      description: `Deleted quiz with ${quiz.questions.length} questions`
    });
    
    await activity.save();
    
    // Delete the quiz
    await Quiz.findByIdAndDelete(id);
    
    return {
      success: true,
      message: 'Quiz deleted successfully'
    };
  } catch (error: any) {
    console.error('Error deleting quiz:', error);
    return createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'An error occurred while deleting the quiz'
    });
  }
});
