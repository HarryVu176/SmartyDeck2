import { connectToDatabase } from '~/server/utils/dbConnect';
import User from '~/server/models/User';
import { verifyAdmin } from '~/server/utils/auth';

export default defineEventHandler(async (event) => {
  try {
    // Verify that the user is an admin
    await verifyAdmin(event);
    
    await connectToDatabase();
    
    const inviteCodeId = event.context.params.id;
    
    // Get users who used this invite code
    const users = await User.find({ inviteCode: inviteCodeId })
      .select('username email role createdAt expiresAt')
      .sort({ createdAt: -1 })
      .lean();
    
    return {
      success: true,
      users
    };
  } catch (error) {
    console.error('Error fetching users for invite code:', error);
    return createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'An error occurred while fetching users'
    });
  }
}); 