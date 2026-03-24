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

// Document Template Schema - For storing authentic document patterns
const documentTemplateSchema = new mongoose.Schema({
  documentType: { type: String, enum: ['aadhaar', 'pan', 'upi'], required: true },
  templateId: { type: String, unique: true, required: true },
  validationRules: {
    format: String,        // Aadhaar: "XXXX XXXX XXXX", PAN: "XXXXX0000X"
    length: Number,        // Aadhaar: 12, PAN: 10
    pattern: String,       // Regex patterns for validation
    checksum: String,      // Validation algorithm type
    structure: String      // Document structure pattern
  },
  commonFraudPatterns: [String], // Known fraud patterns
  validBankCodes: [String],      // For UPI - valid bank codes
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

// Document Verification Schema - For storing verification results
const documentVerificationSchema = new mongoose.Schema({
  deviceId: { type: String, required: true },
  documentType: { type: String, enum: ['aadhaar', 'pan', 'upi'], required: true },
  inputData: { type: String, required: true }, // User's document number/UPI ID (hashed)
  originalInput: String,                        // For display purposes (masked)
  verificationResult: {
    isValid: { type: Boolean, required: true },
    confidence: { type: Number, min: 0, max: 100 }, // 0-100%
    riskLevel: { type: String, enum: ['low', 'medium', 'high'], default: 'low' },
    issues: [String],                           // List of problems found
    fraudType: String,                          // Type of fraud detected if any
    recommendations: [String]                   // Security recommendations
  },
  timestamp: { type: Date, default: Date.now },
  ipAddress: String,
  userAgent: String
})

// Document Fraud Report Schema - For user-reported fraudulent documents
const documentFraudReportSchema = new mongoose.Schema({
  deviceId: { type: String, required: true },
  documentType: { type: String, enum: ['aadhaar', 'pan', 'upi'], required: true },
  reportedDocument: String,    // The fraudulent document (hashed)
  fraudDescription: String,    // User's description of the fraud
  source: String,             // Where they encountered this fraud
  evidenceUrl: String,        // Optional screenshot/evidence
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'false_positive'],
    default: 'pending'
  },
  reportedAt: { type: Date, default: Date.now },
  reviewedAt: Date,
  reviewedBy: String
})

export const UserDevice = mongoose.model('UserDevice', userDeviceSchema)
export const AlertLog = mongoose.model('AlertLog', alertLogSchema)
export const FraudDetection = mongoose.model('FraudDetection', fraudDetectionSchema)
export const Quiz = mongoose.model('Quiz', quizSchema)
export const QuizResult = mongoose.model('QuizResult', quizResultSchema)
export const DocumentTemplate = mongoose.model('DocumentTemplate', documentTemplateSchema)
export const DocumentVerification = mongoose.model('DocumentVerification', documentVerificationSchema)
export const DocumentFraudReport = mongoose.model('DocumentFraudReport', documentFraudReportSchema)
