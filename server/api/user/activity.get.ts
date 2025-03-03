import { connectToDatabase } from '~/server/utils/dbConnect';
import Activity from '~/server/models/Activity';
import { verifyToken } from '~/server/utils/auth';

export default defineEventHandler(async (event) => {
  try {
    // Verify user authentication
    const user = await verifyToken(event);
    
    await connectToDatabase();
    
    // Get recent activities for the user
    const activities = await Activity.find({ user: user.userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();
    
    // Format activities for the frontend
    const formattedActivities = activities.map(activity => ({
      id: activity._id,
      title: activity.quizTitle,
      type: activity.type.charAt(0).toUpperCase() + activity.type.slice(1),
      description: activity.description,
      date: activity.createdAt,
      score: activity.score,
      timeSpent: activity.timeSpent,
      quizId: activity.quiz
    }));
    
    return {
      success: true,
      activities: formattedActivities
    };
  } catch (error: any) {
    console.error('Error fetching user activity:', error);
    return createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'An error occurred while fetching user activity'
    });
  }
});
