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

export const UserDevice = mongoose.model('UserDevice', userDeviceSchema)
export const AlertLog = mongoose.model('AlertLog', alertLogSchema)
export const FraudDetection = mongoose.model('FraudDetection', fraudDetectionSchema)