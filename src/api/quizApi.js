import { getDeviceId } from '../utils/deviceId'
import { QUIZZES } from '../data/quizData'

const API_URL = 'http://localhost:5000'

// Generate fresh quiz questions using AI (or fallback to stored quiz)
export async function generateQuiz() {
  try {
    console.log('🤖 Requesting fresh quiz questions...')

    // Try dynamic generation first
    try {
      const response = await fetch(`${API_URL}/api/quiz/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        timeout: 5000
      })

      if (response.ok) {
        const data = await response.json()
        console.log('✅ Fresh quiz generated:', data.questions.length, 'questions')
        return data
      }
    } catch (err) {
      console.warn('⚠️ Dynamic generation failed, trying server quiz...')
    }

    // Try server-side quiz
    try {
      const response = await fetch(`${API_URL}/api/quiz-random/gujarati_fraud_awareness`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        timeout: 5000
      })

      if (response.ok) {
        const data = await response.json()
        console.log('✅ Quiz loaded from server:', data.quiz.questions.length, 'questions')
        return {
          quizId: data.quiz.quizId,
          questions: data.quiz.questions
        }
      }
    } catch (err) {
      console.warn('⚠️ Server quiz failed, using local fallback...')
    }

    // Fallback: Use local quiz data
    console.log('📦 Using local quiz as fallback')
    const localQuiz = QUIZZES[0] // Get gujarati_fraud_awareness Quiz

    // Shuffle questions and take 5 random ones
    const shuffled = [...localQuiz.questions].sort(() => Math.random() - 0.5)
    const randomQuestions = shuffled.slice(0, 5)

    console.log('✅ Quiz loaded locally:', randomQuestions.length, 'questions')
    return {
      quizId: localQuiz.quizId,
      questions: randomQuestions
    }
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

    // Try server submit first
    try {
      const response = await fetch(`${API_URL}/api/quiz/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceId,
          quizId,
          questions,
          answers,
          timeTaken
        }),
        timeout: 5000
      })

      if (response.ok) {
        const data = await response.json()
        console.log('✅ Quiz submitted to server:', data.badge)
        return data
      }
    } catch (err) {
      console.warn('⚠️ Server submission failed, calculating locally...')
    }

    // Fallback: Calculate results locally
    console.log('📱 Calculating score locally (offline mode)')

    let correctCount = 0
    let totalPoints = 0
    const results = []

    questions.forEach(question => {
      const userAnswer = answers[question.id]
      const isCorrect = userAnswer === question.correctAnswer

      if (isCorrect) {
        correctCount++
        totalPoints += question.points || 20
      }

      results.push({
        questionId: question.id,
        question: question.question,
        userAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect,
        points: isCorrect ? (question.points || 20) : 0
      })
    })

    // Calculate badge
    let badge = 'Suraksha Learner 📚'
    let badgeColor = 'gray'

    if (correctCount === 5) {
      badge = 'Suraksha Champion 🏆'
      badgeColor = 'gold'
    } else if (correctCount === 4) {
      badge = 'Suraksha Star ⭐'
      badgeColor = 'silver'
    } else if (correctCount === 3) {
      badge = 'Suraksha Warrior 🛡️'
      badgeColor = 'bronze'
    }

    const result = {
      success: true,
      score: correctCount,
      totalQuestions: questions.length,
      percentage: Math.round((correctCount / questions.length) * 100),
      totalPoints,
      correctCount,
      badge,
      badgeColor,
      timeTaken,
      results,
      offline: true
    }

    // Save to localStorage for persistence
    try {
      const quizHistory = JSON.parse(localStorage.getItem('quiz_results') || '[]')
      const quizRecord = {
        deviceId,
        quizId,
        score: correctCount,
        totalQuestions: questions.length,
        percentage: result.percentage,
        totalPoints,
        badge,
        timestamp: new Date().toISOString(),
        answers: results
      }
      quizHistory.push(quizRecord)
      localStorage.setItem('quiz_results', JSON.stringify(quizHistory))
      console.log('💾 Quiz result saved to localStorage')
    } catch (err) {
      console.warn('⚠️ Failed to save to localStorage:', err)
    }

    console.log('✅ Quiz calculated locally:', result.badge)
    return result
  } catch (error) {
    console.error('❌ Failed to submit quiz:', error)
    throw error
  }
}

// Get quiz history for user
export async function getQuizHistory() {
  try {
    const deviceId = getDeviceId()

    // Try to fetch from server first
    try {
      const response = await fetch(`${API_URL}/api/quiz-history/${deviceId}`, {
        timeout: 5000
      })

      if (response.ok) {
        const data = await response.json()
        console.log('✅ Quiz history loaded from server:', data.history?.length || 0, 'results')
        return data.history || []
      }
    } catch (err) {
      console.warn('⚠️ Server history unavailable, loading from localStorage...')
    }

    // Fallback: Load from localStorage
    const localHistory = JSON.parse(localStorage.getItem('quiz_results') || '[]')
    console.log('📱 Quiz history loaded from device storage:', localHistory.length, 'results')
    return localHistory
  } catch (error) {
    console.error('❌ Failed to get quiz history:', error)
    return []
  }
}

// Sync offline quiz results to server when online
export async function syncOfflineQuizResults() {
  try {
    const offlineResults = JSON.parse(localStorage.getItem('quiz_results') || '[]')

    if (offlineResults.length === 0) {
      console.log('ℹ️ No offline results to sync')
      return { synced: 0 }
    }

    console.log('🔄 Syncing', offlineResults.length, 'offline results to server...')

    let syncedCount = 0
    const failedResults = []

    for (const result of offlineResults) {
      try {
        const response = await fetch(`${API_URL}/api/save-quiz-result`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            deviceId: result.deviceId,
            quizId: result.quizId,
            score: result.score,
            totalQuestions: result.totalQuestions,
            percentage: result.percentage,
            totalPoints: result.totalPoints,
            badge: result.badge
          }),
          timeout: 5000
        })

        if (response.ok) {
          syncedCount++
          console.log(`✅ Synced quiz result for ${result.quizId}`)
        } else {
          failedResults.push(result)
        }
      } catch (err) {
        failedResults.push(result)
      }
    }

    // Update localStorage with only failed results
    if (failedResults.length === 0) {
      localStorage.removeItem('quiz_results')
      console.log(`✅ All ${syncedCount} offline results synced successfully!`)
    } else {
      localStorage.setItem('quiz_results', JSON.stringify(failedResults))
      console.log(`⚠️ Synced ${syncedCount}/${offlineResults.length} results, ${failedResults.length} still pending`)
    }

    return { synced: syncedCount, pending: failedResults.length }
  } catch (error) {
    console.error('❌ Sync error:', error)
    return { synced: 0, error: error.message }
  }
}