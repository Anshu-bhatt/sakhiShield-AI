import { getDeviceId } from '../utils/deviceId'

const API_URL = 'http://localhost:5000'

export async function registerDevice() {
  try {
    const deviceId = getDeviceId()
    const response = await fetch(`${API_URL}/api/register-device`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId })
    })
    const data = await response.json()
    console.log('✅ Device registered:', data)
    return data
  } catch (error) {
    console.error('❌ Device registration failed:', error)
  }
}

export async function saveAlert(message, type = 'info') {
  try {
    const deviceId = getDeviceId()
    const response = await fetch(`${API_URL}/api/save-alert`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId, message, type })
    })
    console.log('📢 Alert saved')
    return response.json()
  } catch (error) {
    console.error('❌ Failed to save alert:', error)
  }
}

export async function saveFraud(fraudType, details, severity = 'high') {
  try {
    const deviceId = getDeviceId()
    const response = await fetch(`${API_URL}/api/save-fraud`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId, fraudType, details, severity })
    })
    console.log('🚨 Fraud detected and saved')
    return response.json()
  } catch (error) {
    console.error('❌ Failed to save fraud:', error)
  }
}

export async function getAlerts() {
  try {
    const deviceId = getDeviceId()
    const response = await fetch(`${API_URL}/api/alerts/${deviceId}`)
    const data = await response.json()
    return data.alerts
  } catch (error) {
    console.error('❌ Failed to fetch alerts:', error)
  }
}

export async function getFrauds() {
  try {
    const deviceId = getDeviceId()
    const response = await fetch(`${API_URL}/api/frauds/${deviceId}`)
    const data = await response.json()
    return data.frauds
  } catch (error) {
    console.error('❌ Failed to fetch frauds:', error)
  }
}

// Quiz APIs
export async function initializeQuizzes() {
  try {
    const response = await fetch(`${API_URL}/api/init-quizzes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    })
    console.log('✅ Quizzes initialized')
    return response.json()
  } catch (error) {
    console.error('❌ Failed to initialize quizzes:', error)
  }
}

export async function getQuizzes() {
  try {
    const response = await fetch(`${API_URL}/api/quizzes`)
    const data = await response.json()
    return data.quizzes
  } catch (error) {
    console.error('❌ Failed to fetch quizzes:', error)
    return []
  }
}

export async function getQuiz(quizId) {
  try {
    const response = await fetch(`${API_URL}/api/quiz/${quizId}`)
    const data = await response.json()
    return data.quiz
  } catch (error) {
    console.error('❌ Failed to fetch quiz:', error)
  }
}

export async function submitQuiz(quizId, answers) {
  try {
    const deviceId = getDeviceId()
    const response = await fetch(`${API_URL}/api/submit-quiz`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId, quizId, answers })
    })
    const data = await response.json()
    console.log('📊 Quiz submitted:', data)
    return data
  } catch (error) {
    console.error('❌ Failed to submit quiz:', error)
  }
}

export async function getQuizHistory() {
  try {
    const deviceId = getDeviceId()
    const response = await fetch(`${API_URL}/api/quiz-history/${deviceId}`)
    const data = await response.json()
    return data.history
  } catch (error) {
    console.error('❌ Failed to fetch quiz history:', error)
    return []
  }
}

export async function saveQuizResult(quizId, score, totalQuestions, percentage) {
  try {
    const deviceId = getDeviceId()
    const response = await fetch(`${API_URL}/api/save-quiz-result`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId, quizId, score, totalQuestions, percentage })
    })
    const data = await response.json()
    console.log('📊 Quiz result saved:', data)
    return data
  } catch (error) {
    console.error('❌ Failed to save quiz result:', error)
  }
}
