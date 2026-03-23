import mongoose from 'mongoose'

// User Device Schema
const userDeviceSchema = new mongoose.Schema({
  deviceId: { type: String, unique: true, required: true },
  createdAt: { type: Date, default: Date.now },
  lastActive: { type: Date, default: Date.now }
})

// Alert Logs Schema
const alertLogSchema = new mongoose.Schema({
  deviceId: { type: String, required: true },
  message: String,
  type: String, // 'warning', 'info', 'danger'
  timestamp: { type: Date, default: Date.now }
})

// Fraud Detection Schema
const fraudDetectionSchema = new mongoose.Schema({
  deviceId: { type: String, required: true },
  fraudType: String, // 'phishing', 'scam', 'suspicious_link', etc.
  details: String,
  severity: String, // 'low', 'medium', 'high'
  timestamp: { type: Date, default: Date.now }
})

// Quiz Schema
const quizSchema = new mongoose.Schema({
  quizId: { type: String, unique: true, required: true },
  title: String,
  description: String,
  questions: [
    {
      questionId: String,
      scene: String,
      question: String,
      options: [String],
      correctAnswer: String,
      feedbackCorrect: String,
      feedbackIncorrect: String,
      points: Number
    }
  ],
  createdAt: { type: Date, default: Date.now }
})

// Quiz Results Schema
const quizResultSchema = new mongoose.Schema({
  deviceId: { type: String, required: true },
  quizId: { type: String, required: true },
  score: { type: Number, required: true },
  totalQuestions: { type: Number, required: true },
  percentage: { type: Number, required: true },
  answers: [
    {
      questionId: String,
      selectedAnswer: String,
      correctAnswer: String,
      isCorrect: Boolean
    }
  ],
  completedAt: { type: Date, default: Date.now }
})

export const UserDevice = mongoose.model('UserDevice', userDeviceSchema)
export const AlertLog = mongoose.model('AlertLog', alertLogSchema)
export const FraudDetection = mongoose.model('FraudDetection', fraudDetectionSchema)
export const Quiz = mongoose.model('Quiz', quizSchema)
export const QuizResult = mongoose.model('QuizResult', quizResultSchema)
