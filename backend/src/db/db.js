import mongoose from 'mongoose'

const MONGO_URI = 'mongodb://localhost:27017/SakhiSieldai'

export async function connectDB() {
  try {
    await mongoose.connect(MONGO_URI)
    console.log('✅ MongoDB Connected')
  } catch (error) {
    console.error('❌ MongoDB Connection Failed:', error)
    process.exit(1)
  }
}