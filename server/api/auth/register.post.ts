import { connectToDatabase } from '~/server/utils/dbConnect';
import User from '~/server/models/User';
import InviteCode from '~/server/models/InviteCode';

export default defineEventHandler(async (event) => {
  try {
    await connectToDatabase();
    
    // Get request body
    const { email, username, password, inviteCode } = await readBody(event);
    
    // Validate required fields
    if (!email || !username || !password || !inviteCode) {
      return createError({
        statusCode: 400,
        message: 'Missing required fields'
      });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });
    
    if (existingUser) {
      return createError({
        statusCode: 409,
        message: 'User with this email or username already exists'
      });
    }
    
    // Validate invite code
    const inviteCodeDoc = await InviteCode.findOne({ code: inviteCode });
    
    if (!inviteCodeDoc) {
      return createError({
        statusCode: 400,
        message: 'Invalid invite code'
      });
    }
    
    if (!inviteCodeDoc.isValid()) {
      return createError({
        statusCode: 400,
        message: 'Invite code is expired or has reached maximum uses'
      });
    }
    
    // Create new user
    const user = new User({
      email,
      username,
      inviteCode: inviteCodeDoc._id,
      expiresAt: inviteCodeDoc.expiresAt // Set user expiration to match invite code
    });
    
    // Set password (this will hash it)
    user.setPassword(password);
    
    // Save user
    await user.save();
    
    // Update invite code usage
    inviteCodeDoc.usageCount += 1;
    if (inviteCodeDoc.maxUses > 0 && inviteCodeDoc.usageCount >= inviteCodeDoc.maxUses) {
      inviteCodeDoc.isUsed = true;
    }
    
    // Add user to usedBy array
    if (!inviteCodeDoc.usedBy) {
      inviteCodeDoc.usedBy = [];
    }
    inviteCodeDoc.usedBy.push(user._id);
    
    await inviteCodeDoc.save();
    
    // Return success without sensitive data
    return {
      success: true,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        role: user.role
      }
    };
  } catch (error) {
    console.error('Registration error:', error);
    return createError({
      statusCode: 500,
      message: 'An error occurred during registration'
    });
  }
}); 