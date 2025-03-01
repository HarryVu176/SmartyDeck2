import { connectToDatabase } from '~/server/utils/dbConnect';
import User from '~/server/models/User';
import { verifyAdmin } from '~/server/utils/auth';

export default defineEventHandler(async (event) => {
  try {
    // Verify that the user is an admin
    await verifyAdmin(event);
    
    await connectToDatabase();
    
    // Get all users, sorted by creation date (newest first)
    const users = await User.find()
      .select('username email role createdAt expiresAt lastLogin')
      .sort({ createdAt: -1 })
      .lean();
    
    return {
      success: true,
      users
    };
  } catch (error: any) {
    console.error('Error fetching users:', error);
    return createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'An error occurred while fetching users'
    });
  }
}); 