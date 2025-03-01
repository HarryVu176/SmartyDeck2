import jwt from 'jsonwebtoken';
import { H3Event } from 'h3';
import User from '~/server/models/User';

// Interface for decoded JWT token
interface DecodedToken {
  userId: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

// Verify JWT token from request
export const verifyToken = async (event: H3Event) => {
  // Get token from Authorization header
  const authHeader = getRequestHeader(event, 'Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized: No token provided'
    });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    // Verify token
    const decoded = jwt.verify(
      token, 
      process.env.JWT_SECRET || 'your-secret-key'
    ) as DecodedToken;
    
    // Check if user exists
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      throw createError({
        statusCode: 401,
        message: 'Unauthorized: User not found'
      });
    }
    
    // Check if user account is expired
    if (user.expiresAt && new Date() > user.expiresAt) {
      throw createError({
        statusCode: 401,
        message: 'Unauthorized: Account expired'
      });
    }
    
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw createError({
        statusCode: 401,
        message: 'Unauthorized: Token expired'
      });
    }
    
    throw createError({
      statusCode: 401,
      message: 'Unauthorized: Invalid token'
    });
  }
};

// Verify that the user is an admin
export const verifyAdmin = async (event: H3Event) => {
  const decoded = await verifyToken(event);
  
  if (decoded.role !== 'admin') {
    throw createError({
      statusCode: 403,
      message: 'Forbidden: Admin access required'
    });
  }
  
  return decoded;
}; 