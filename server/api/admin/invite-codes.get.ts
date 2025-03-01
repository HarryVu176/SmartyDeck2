import { connectToDatabase } from '~/server/utils/dbConnect';
import InviteCode from '~/server/models/InviteCode';
import { verifyAdmin } from '~/server/utils/auth';

export default defineEventHandler(async (event) => {
  try {
    // Verify that the user is an admin
    await verifyAdmin(event);
    
    await connectToDatabase();
    
    // Get all invite codes, sorted by creation date (newest first)
    const inviteCodes = await InviteCode.find()
      .sort({ createdAt: -1 })
      .populate('createdBy', 'username email')
      .lean();
    
    return {
      success: true,
      inviteCodes
    };
  } catch (error) {
    console.error('Error fetching invite codes:', error);
    return createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'An error occurred while fetching invite codes'
    });
  }
}); 