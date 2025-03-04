import { connectToDatabase } from '~/server/utils/dbConnect';
import User from '~/server/models/User';
import jwt from 'jsonwebtoken';
import config from '~/server/config/config';
import { verifyToken } from '~/server/utils/auth';

export default defineEventHandler(async (event) => {
  try {
    // Verify the current token
    const decoded = await verifyToken(event);
    
    await connectToDatabase();
    
    // Find the user
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return createError({
        statusCode: 404,
        message: 'User not found'
      });
    }
    
    // Update last login time
    user.lastLogin = new Date();
    await user.save();
    
    // Generate a new JWT token
    const token = jwt.sign(
      { 
        userId: user._id,
        email: user.email,
        role: user.role 
      },
      config.jwtSecret,
      { expiresIn: '30d' }
    );
    
    // Return user info and new token
    return {
      success: true,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        role: user.role
      },
      token
    };
  } catch (error: any) {
    console.error('Token refresh error:', error);
    return createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'An error occurred during token refresh'
    });
  }
});
