import mongoose from 'mongoose'
import { connectDB } from './db/db.js'
import { UserDevice, QuizResult, AlertLog, FraudDetection } from './db/models.js'

await connectDB()

console.log('\n=== Checking MongoDB Data ===\n')

// Check registered devices
const devices = await UserDevice.find()
console.log(`📱 Total Devices Registered: ${devices.length}`)
if (devices.length > 0) {
  devices.slice(0, 3).forEach(d => {
    console.log(`  - Device: ${d.deviceId}`)
    console.log(`    Created: ${d.createdAt}`)
    console.log(`    Last Active: ${d.lastActive}`)
  })
}

// Check quiz results
const quizResults = await QuizResult.find()
console.log(`\n📊 Total Quiz Results: ${quizResults.length}`)
if (quizResults.length > 0) {
  quizResults.slice(0, 3).forEach(r => {
    console.log(`  - Device: ${r.deviceId}`)
    console.log(`    Quiz: ${r.quizId}`)
    console.log(`    Score: ${r.score}/${r.totalQuestions}`)
    console.log(`    Percentage: ${r.percentage}%`)
  })
}

// Check alerts
const alerts = await AlertLog.find()
console.log(`\n📢 Total Alerts: ${alerts.length}`)
if (alerts.length > 0) {
  alerts.slice(0, 3).forEach(a => {
    console.log(`  - Device: ${a.deviceId}`)
    console.log(`    Message: ${a.message}`)
    console.log(`    Type: ${a.type}`)
  })
}

// Check frauds
const frauds = await FraudDetection.find()
console.log(`\n🚨 Total Fraud Detections: ${frauds.length}`)
if (frauds.length > 0) {
  frauds.slice(0, 3).forEach(f => {
    console.log(`  - Device: ${f.deviceId}`)
    console.log(`    Type: ${f.fraudType}`)
    console.log(`    Severity: ${f.severity}`)
  })
}

console.log('\n=== ✅ Data Summary Complete ===\n')
process.exit(0)
