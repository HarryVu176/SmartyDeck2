import mongoose from 'mongoose';

// Schema for quiz options
const optionSchema = new mongoose.Schema({
  text: String,
  isCorrect: Boolean
}, { _id: false });

// Schema for matching items
const matchingItemSchema = new mongoose.Schema({
  item: String,
  match: String
}, { _id: false });

// Schema for quiz questions
const questionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['multiple_choice', 'multi_select', 'true_false', 'matching'],
    required: true
  },
  question: {
    type: String,
    required: true
  },
  options: [optionSchema],
  correctAnswer: String, // For multiple choice and true/false
  correctAnswers: [String], // For multi-select
  matches: [matchingItemSchema], // For matching questions
  explanation: String
}, { _id: true });

// Main quiz schema
const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  questions: [questionSchema],
  tags: [String],
  isPublic: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

export default mongoose.models.Quiz || mongoose.model('Quiz', quizSchema); 