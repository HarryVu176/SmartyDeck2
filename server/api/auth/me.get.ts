import { connectToDatabase } from '~/server/utils/dbConnect';
import User from '~/server/models/User';
import { verifyToken } from '~/server/utils/auth';

export default defineEventHandler(async (event) => {
  try {
    const decoded = await verifyToken(event);
    
    await connectToDatabase();
    
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return createError({
        statusCode: 404,
        message: 'User not found'
      });
    }
    
    return {
      success: true,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        role: user.role
      }
    };
  } catch (error: any) {
    console.error('Error fetching user:', error);
    return createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'An error occurred while fetching user data'
    });
  }
}); 