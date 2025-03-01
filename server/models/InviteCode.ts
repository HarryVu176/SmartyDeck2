import mongoose from 'mongoose';
import crypto from 'crypto';

const inviteCodeSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    default: () => crypto.randomBytes(4).toString('hex').toUpperCase()
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isUsed: {
    type: Boolean,
    default: false
  },
  usedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  usageCount: {
    type: Number,
    default: 0
  },
  maxUses: {
    type: Number,
    default: 1, // Default to one-time use
    min: 0  // Changed from 1 to 0, where 0 means unlimited
  },
  expiresAt: {
    type: Date,
    required: false, // Changed from true to false to allow null for no expiration
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Check if invite code is valid (not expired and not reached max uses)
inviteCodeSchema.methods.isValid = function() {
  const notExpired = !this.expiresAt || new Date() < this.expiresAt;
  const notMaxedOut = this.maxUses === 0 || this.usageCount < this.maxUses;
  return notExpired && notMaxedOut;
};

export default mongoose.models.InviteCode || mongoose.model('InviteCode', inviteCodeSchema); 