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
    
    // Find the quiz
    const quiz = await Quiz.findById(id);
    
    if (!quiz) {
      return createError({
        statusCode: 404,
        message: 'Quiz not found'
      });
    }
    
    // Check if user has permission to update this quiz
    if (quiz.createdBy.toString() !== user.userId && user.role !== 'admin') {
      return createError({
        statusCode: 403,
        message: 'You do not have permission to update this quiz'
      });
    }
    
    // Update quiz
    quiz.title = title;
    quiz.description = description;
    quiz.questions = questions;
    quiz.tags = tags || [];
    quiz.isPublic = isPublic || false;
    quiz.updatedAt = new Date();
    
    await quiz.save();
    
    // Record activity
    const activity = new Activity({
      user: user.userId,
      type: 'edited',
      quiz: quiz._id,
      quizTitle: quiz.title,
      description: `Updated quiz with ${questions.length} questions`
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
    console.error('Error updating quiz:', error);
    return createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'An error occurred while updating the quiz'
    });
  }
});
