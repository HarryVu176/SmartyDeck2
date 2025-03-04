import { connectToDatabase } from '~/server/utils/dbConnect';
import User from '~/server/models/User';
import jwt from 'jsonwebtoken';
import config from '~/server/config/config';

export default defineEventHandler(async (event) => {
  try {
    await connectToDatabase();
    
    // Get request body
    const { email, password } = await readBody(event);
    
    // Validate required fields
    if (!email || !password) {
      return createError({
        statusCode: 400,
        message: 'Email and password are required'
      });
    }
    
    // Find user and include password and salt fields which are normally excluded
    const user = await User.findOne({ email }).select('+password +salt');
    
    if (!user) {
      return createError({
        statusCode: 401,
        message: 'Invalid email or password'
      });
    }
    
    // Validate password
    if (!user.validPassword(password)) {
      return createError({
        statusCode: 401,
        message: 'Invalid email or password'
      });
    }
    
    // Update last login time
    user.lastLogin = new Date();
    await user.save();
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id,
        email: user.email,
        role: user.role 
      },
      config.jwtSecret,
      { expiresIn: '30d' }
    );
    
    // Return user info and token
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
  } catch (error) {
    console.error('Login error:', error);
    return createError({
      statusCode: 500,
      message: 'An error occurred during login'
    });
  }
}); 