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
  id: String,
  type: {
    type: String,
    enum: ['multiple_choice', 'multi_select', 'true_false', 'matching'],
    required: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  question: {
    type: String,
    required: true
  },
  options: {
    type: [String], // Changed from [optionSchema] to [String]
    default: undefined
  },
  correctAnswer: String, // For multiple choice and true/false
  correctAnswers: [String], // For multi-select
  matches: {
    type: [matchingItemSchema],
    default: undefined
  }, // For matching questions
  explanation: String
}, { _id: false }); // Set _id to false to prevent MongoDB from adding _id to each question

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
