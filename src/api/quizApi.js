import { getDeviceId } from '../utils/deviceId'

const API_URL = 'http://10.209.232.160:5000'

// Generate fresh quiz questions using AI
export async function generateQuiz() {
  try {
    console.log('🤖 Requesting fresh quiz questions...')

    const response = await fetch(`${API_URL}/api/quiz/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    console.log('✅ Fresh quiz generated:', data.questions.length, 'questions')
    return data
  } catch (error) {
    console.error('❌ Failed to generate quiz:', error)
    throw error
  }
}

// Submit quiz answers and get results
export async function submitQuiz(quizId, questions, answers, timeTaken) {
  try {
    const deviceId = getDeviceId()
    console.log('📊 Submitting quiz answers...')

    const response = await fetch(`${API_URL}/api/quiz/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        deviceId,
        quizId,
        questions,
        answers,
        timeTaken
      })
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    console.log('✅ Quiz submitted successfully:', data.badge)
    return data
  } catch (error) {
    console.error('❌ Failed to submit quiz:', error)
    throw error
  }
}

// Get quiz history for user
export async function getQuizHistory() {
  try {
    const deviceId = getDeviceId()
    const response = await fetch(`${API_URL}/api/quiz-history/${deviceId}`)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data.history || []
  } catch (error) {
    console.error('❌ Failed to get quiz history:', error)
    return []
  }
}