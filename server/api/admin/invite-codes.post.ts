import { connectToDatabase } from '~/server/utils/dbConnect';
import InviteCode from '~/server/models/InviteCode';
import { verifyAdmin } from '~/server/utils/auth';

export default defineEventHandler(async (event) => {
  try {
    // Verify that the user is an admin
    const user = await verifyAdmin(event);
    
    await connectToDatabase();
    
    // Get request body
    const { 
      count = 1, 
      expiresInDays = 7,
      maxUses = 1, // Default to one-time use
      customCode = undefined // New parameter for custom code
    } = await readBody(event);
    
    // Validate count and maxUses
    if (count < 1 || count > 100) {
      return createError({
        statusCode: 400,
        message: 'Count must be between 1 and 100'
      });
    }
    
    if (maxUses < 0 || maxUses > 1000) {
      return createError({
        statusCode: 400,
        message: 'Maximum uses must be between 0 and 1000 (0 means unlimited)'
      });
    }
    
    // If custom code is provided, validate it's only for a single code
    if (customCode && count > 1) {
      return createError({
        statusCode: 400,
        message: 'Custom code can only be used when generating a single invite code'
      });
    }
    
    // Check if custom code already exists
    if (customCode) {
      const existingCode = await InviteCode.findOne({ code: customCode });
      if (existingCode) {
        return createError({
          statusCode: 400,
          message: 'This custom code already exists'
        });
      }
    }
    
    // Generate invite codes
    const inviteCodes = [];
    
    for (let i = 0; i < count; i++) {
      // Set expiration date if provided, otherwise set to null for no expiration
      let expiresAt = null;
      if (expiresInDays !== null) {
        expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + expiresInDays);
      }
      
      const inviteCodeData = {
        code: customCode ? customCode : undefined,
        createdBy: user.userId,
        expiresAt,
        maxUses // 0 means unlimited
      };
      
      // Add custom code if provided (only for the first code)
      if (i === 0 && customCode) {
        inviteCodeData.code = customCode;
      }
      
      const inviteCode = new InviteCode(inviteCodeData);
      
      await inviteCode.save();
      inviteCodes.push({
        code: inviteCode.code,
        expiresAt: inviteCode.expiresAt,
        maxUses: inviteCode.maxUses
      });
    }
    
    return {
      success: true,
      inviteCodes
    };
  } catch (error: any) {
    console.error('Error generating invite codes:', error);
    return createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'An error occurred while generating invite codes'
    });
  }
}); 