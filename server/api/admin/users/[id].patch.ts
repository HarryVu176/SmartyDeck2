import { connectToDatabase } from '~/server/utils/dbConnect';
import User from '~/server/models/User';
import { verifyAdmin } from '~/server/utils/auth';

export default defineEventHandler(async (event) => {
  try {
    // Verify that the user is an admin
    const admin = await verifyAdmin(event);
    
    await connectToDatabase();
    
    const id = event.context.params.id;
    const updates = await readBody(event);
    
    // Get the user to update
    const user = await User.findById(id);
    
    if (!user) {
      return createError({
        statusCode: 404,
        message: 'User not found'
      });
    }
    
    // Prevent admins from modifying other admins unless they're modifying themselves
    if (user.role === 'admin' && user._id.toString() !== admin.userId) {
      return createError({
        statusCode: 403,
        message: 'Cannot modify another admin user'
      });
    }
    
    // Handle password update separately
    if (updates.password) {
      user.setPassword(updates.password);
      delete updates.password;
    }
    
    // Apply other updates
    Object.keys(updates).forEach(key => {
      user[key] = updates[key];
    });
    
    await user.save();
    
    return {
      success: true,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        expiresAt: user.expiresAt,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      }
    };
  } catch (error) {
    console.error('Error updating user:', error);
    return createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'An error occurred while updating the user'
    });
  }
}); 