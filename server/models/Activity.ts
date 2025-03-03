import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['created', 'practiced', 'edited', 'deleted'],
    required: true
  },
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz'
  },
  quizTitle: {
    type: String,
    required: true
  },
  description: String,
  score: Number,
  timeSpent: Number,
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

export default mongoose.models.Activity || mongoose.model('Activity', activitySchema);
