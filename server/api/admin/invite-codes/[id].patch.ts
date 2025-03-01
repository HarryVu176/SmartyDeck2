import { connectToDatabase } from '~/server/utils/dbConnect';
import InviteCode from '~/server/models/InviteCode';
import { verifyAdmin } from '~/server/utils/auth';

export default defineEventHandler(async (event) => {
  try {
    // Verify that the user is an admin
    await verifyAdmin(event);
    
    await connectToDatabase();
    
    const id = event.context.params?.id;
    const updates = await readBody(event);
    
    // Update the invite code
    const inviteCode = await InviteCode.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );
    
    if (!inviteCode) {
      return createError({
        statusCode: 404,
        message: 'Invite code not found'
      });
    }
    
    return {
      success: true,
      inviteCode
    };
  } catch (error: any) {
    console.error('Error updating invite code:', error);
    return createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'An error occurred while updating the invite code'
    });
  }
}); 