import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'
import googleTTS from 'google-tts-api'
import { connectDB } from './db/db.js'
import { UserDevice, AlertLog, FraudDetection, Quiz, QuizResult } from './db/models.js'
import { QUIZZES } from './src/data/quizData.js'

function loadEnvFile(fileName = '.env.local') {
  const envPath = path.resolve(process.cwd(), fileName)

  if (!fs.existsSync(envPath)) {
    console.warn(`⚠️ Env file not found: ${fileName}`)
    return
  }

  const fileBuffer = fs.readFileSync(envPath)
  let content = fileBuffer.toString('utf8')

  // Windows tools may save .env as UTF-16LE, which dotenv.config() won't parse.
  if (content.includes('\u0000')) {
    content = fileBuffer.toString('utf16le')
  }

  const parsed = dotenv.parse(content)
  for (const [key, value] of Object.entries(parsed)) {
    if (!process.env[key]) {
      process.env[key] = value
    }
  }

  console.log(`📄 Loaded ${Object.keys(parsed).length} env vars from ${fileName}`)
}

function getGroqApiKey() {
  const rawApiKey = process.env.GROQ_API_KEY || process.env.VITE_GROK_API || ''
  return rawApiKey.trim().replace(/^['\"]|['\"]$/g, '')
}

loadEnvFile('.env.local')

// Connect to MongoDB
connectDB()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
  res.status(200).json({
    service: 'SakhiShield backend',
    status: 'ok',
    endpoints: ['/api/grok', '/api/tts', '/api/register-device', '/api/save-alert', '/api/save-fraud', '/api/alerts/:deviceId', '/api/frauds/:deviceId']
  })
})

app.post('/api/tts', async (req, res) => {
  try {
    const { text = '', lang = 'gu' } = req.body || {}
    const cleanedText = String(text).replace(/\s+/g, ' ').trim()

    if (!cleanedText) {
      return res.status(400).json({ error: 'Text is required for TTS.' })
    }

    // Keep payload small to avoid oversized query URLs for provider endpoint.
    const safeText = cleanedText.slice(0, 350)
    const selectedLang = String(lang).startsWith('gu') ? 'gu' : 'gu'
    const audioUrl = googleTTS.getAudioUrl(safeText, {
      lang: selectedLang,
      slow: false,
      host: 'https://translate.google.com'
    })

    const ttsResponse = await fetch(audioUrl)
    if (!ttsResponse.ok) {
      return res.status(502).json({ error: 'Failed to fetch TTS audio.' })
    }

    const audioBuffer = Buffer.from(await ttsResponse.arrayBuffer())
    res.setHeader('Content-Type', 'audio/mpeg')
    res.setHeader('Cache-Control', 'no-store')
    return res.status(200).send(audioBuffer)
  } catch (error) {
    console.error('❌ TTS error:', error)
    return res.status(500).json({ error: 'TTS generation failed.', details: error.message })
  }
})

// Groq API proxy endpoint
app.post('/api/grok', async (req, res) => {
  try {
    const { messages, system } = req.body

    // Get API key from environment
    const GROQ_API_KEY = getGroqApiKey()

    console.log('📝 Received request:', { messages: messages.length, hasSystem: !!system })
    console.log('🔑 API Key available:', !!GROQ_API_KEY)

    if (!GROQ_API_KEY) {
      console.error('❌ Error: Groq API key not found in environment')
      return res.status(400).json({ error: 'Groq API key not configured. Check .env.local file.' })
    }

    // Build message array with system message at the beginning
    const allMessages = [
      { role: 'system', content: system },
      ...messages
    ]

    // Call Groq API
    console.log('🚀 Calling Groq API...')
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-120b',
        max_tokens: 300,
        messages: allMessages
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('❌ Groq API error:', response.status, errorData)

      if (response.status === 401) {
        return res.status(401).json({
          error: 'Groq authentication failed. Please verify GROQ_API_KEY in .env.local.',
          details: errorData
        })
      }

      return res.status(response.status).json({ error: `Groq API Error: ${response.status}`, details: errorData })
    }

    const data = await response.json()
    console.log('✅ Success! Got response from Groq')
    res.json({
      success: true,
      content: data.choices[0].message.content
    })

  } catch (error) {
    console.error('❌ Server error:', error)
    res.status(500).json({ error: 'Server error', details: error.message })
  }
})

// Register/Get User Device
app.post('/api/register-device', async (req, res) => {
  try {
    const { deviceId } = req.body

    let user = await UserDevice.findOne({ deviceId })
    if (!user) {
      user = new UserDevice({ deviceId })
      await user.save()
      console.log(`✅ New device registered: ${deviceId}`)
    } else {
      user.lastActive = new Date()
      await user.save()
    }

    res.json({ success: true, deviceId })
  } catch (error) {
    console.error('❌ Device registration error:', error)
    res.status(500).json({ error: error.message })
  }
})

// Save Alert Log
app.post('/api/save-alert', async (req, res) => {
  try {
    const { deviceId, message, type } = req.body
    const alert = new AlertLog({ deviceId, message, type })
    await alert.save()
    console.log(`📢 Alert saved for device ${deviceId}`)
    res.json({ success: true })
  } catch (error) {
    console.error('❌ Alert save error:', error)
    res.status(500).json({ error: error.message })
  }
})

// Save Fraud Detection
app.post('/api/save-fraud', async (req, res) => {
  try {
    const { deviceId, fraudType, details, severity } = req.body
    const fraud = new FraudDetection({ deviceId, fraudType, details, severity })
    await fraud.save()
    console.log(`🚨 Fraud detected for device ${deviceId}: ${fraudType}`)
    res.json({ success: true })
  } catch (error) {
    console.error('❌ Fraud save error:', error)
    res.status(500).json({ error: error.message })
  }
})

// Get User's Alert Logs
app.get('/api/alerts/:deviceId', async (req, res) => {
  try {
    const alerts = await AlertLog.find({ deviceId: req.params.deviceId }).sort({ timestamp: -1 })
    res.json({ alerts })
  } catch (error) {
    console.error('❌ Get alerts error:', error)
    res.status(500).json({ error: error.message })
  }
})

// Get User's Fraud Detection Logs
app.get('/api/frauds/:deviceId', async (req, res) => {
  try {
    const frauds = await FraudDetection.find({ deviceId: req.params.deviceId }).sort({ timestamp: -1 })
    res.json({ frauds })
  } catch (error) {
    console.error('❌ Get frauds error:', error)
    res.status(500).json({ error: error.message })
  }
})

// Save Quiz Result
app.post('/api/save-quiz-result', async (req, res) => {
  try {
    const { deviceId, quizId, score, totalQuestions, percentage } = req.body
    const result = new QuizResult({
      deviceId,
      quizId,
      score,
      totalQuestions,
      percentage
    })
    await result.save()
    console.log(`📊 Quiz result saved: ${quizId} - Score ${score}/${totalQuestions}`)
    res.json({ success: true, message: 'Quiz result saved' })
  } catch (error) {
    console.error('❌ Save quiz result error:', error)
    res.status(500).json({ error: error.message })
  }
})

// Get Quiz History for Device
app.get('/api/quiz-history/:deviceId', async (req, res) => {
  try {
    const history = await QuizResult.find({ deviceId: req.params.deviceId }).sort({ completedAt: -1 })
    res.json({ history })
  } catch (error) {
    console.error('❌ Get quiz history error:', error)
    res.status(500).json({ error: error.message })
  }
})

// Initialize quizzes in database (if not already there)
app.post('/api/init-quizzes', async (req, res) => {
  try {
    for (const quiz of QUIZZES) {
      const exists = await Quiz.findOne({ quizId: quiz.quizId })
      if (!exists) {
        await Quiz.create(quiz)
      }
    }
    console.log('✅ Quizzes initialized')
    res.json({ success: true, message: 'Quizzes initialized' })
  } catch (error) {
    console.error('❌ Quiz init error:', error)
    res.status(500).json({ error: error.message })
  }
})

// Get all quizzes
app.get('/api/quizzes', async (req, res) => {
  try {
    const quizzes = await Quiz.find({})
    res.json({ quizzes })
  } catch (error) {
    console.error('❌ Get quizzes error:', error)
    res.status(500).json({ error: error.message })
  }
})

// Get single quiz with questions
app.get('/api/quiz/:quizId', async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ quizId: req.params.quizId })
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' })
    }
    res.json({ quiz })
  } catch (error) {
    console.error('❌ Get quiz error:', error)
    res.status(500).json({ error: error.message })
  }
})

// Get random questions from quiz (5 random questions out of total)
app.get('/api/quiz-random/:quizId', async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ quizId: req.params.quizId })
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' })
    }

    // Proper Fisher-Yates shuffle algorithm
    const fisherYatesShuffle = (array) => {
      const shuffled = [...array]
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
      }
      return shuffled
    }

    // Shuffle all questions and take first 5
    const shuffledAllQuestions = fisherYatesShuffle(quiz.questions)
    const randomQuestions = shuffledAllQuestions.slice(0, 5)

    const quizWithRandomQuestions = {
      ...quiz.toObject(),
      questions: randomQuestions
    }

    console.log(`🎲 Random questions selected: ${randomQuestions.map(q => q.questionId).join(', ')}`)
    res.json({ quiz: quizWithRandomQuestions })
  } catch (error) {
    console.error('❌ Get random quiz error:', error)
    res.status(500).json({ error: error.message })
  }
})

// Submit quiz answers
app.post('/api/submit-quiz', async (req, res) => {
  try {
    const { deviceId, quizId, answers } = req.body

    const quiz = await Quiz.findOne({ quizId })
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' })
    }

    let score = 0
    const processedAnswers = answers.map((answer) => {
      const question = quiz.questions.find((q) => q.questionId === answer.questionId)
      const isCorrect = answer.selectedAnswer === question.correctAnswer
      if (isCorrect) score++

      return {
        questionId: answer.questionId,
        selectedAnswer: answer.selectedAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect
      }
    })

    const totalQuestions = quiz.questions.length
    const percentage = Math.round((score / totalQuestions) * 100)

    const result = new QuizResult({
      deviceId,
      quizId,
      score,
      totalQuestions,
      percentage,
      answers: processedAnswers
    })

    await result.save()
    console.log(`📊 Quiz submitted: ${quizId} - Score ${score}/${totalQuestions}`)

    res.json({
      success: true,
      score,
      totalQuestions,
      percentage,
      answers: processedAnswers
    })
  } catch (error) {
    console.error('❌ Submit quiz error:', error)
    res.status(500).json({ error: error.message })
  }
})

// Get quiz history for device
app.get('/api/quiz-history/:deviceId', async (req, res) => {
  try {
    const history = await QuizResult.find({ deviceId: req.params.deviceId }).sort({ completedAt: -1 })
    res.json({ history })
  } catch (error) {
    console.error('❌ Get quiz history error:', error)
    res.status(500).json({ error: error.message })
  }
})

app.listen(PORT, async () => {
  console.log(`🚀 Backend server running at http://localhost:${PORT}`)
  console.log(`📌 Using Groq API with key: ${getGroqApiKey() ? '✅ Loaded' : '❌ Not found'}`)

  // Initialize quizzes on startup
  try {
    console.log('⏳ Initializing quizzes...')
    for (const quiz of QUIZZES) {
      await Quiz.deleteOne({ quizId: quiz.quizId })
      await Quiz.create(quiz)
      console.log(`✅ Quiz initialized: ${quiz.quizId}`)
    }
    console.log('✅ All quizzes initialized successfully!')
  } catch (error) {
    console.error('❌ Failed to initialize quizzes:', error)
  }
})
