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
    endpoints: ['/api/grok', '/api/tts', '/api/analyze-link', '/api/register-device', '/api/save-alert', '/api/save-fraud', '/api/alerts/:deviceId', '/api/frauds/:deviceId', '/api/quiz/generate', '/api/quiz/submit']
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

    // Protect against quiz data being sent to fraud detection
    if (fraudType === 'quiz_wrong_answer') {
      return res.status(400).json({
        error: 'Quiz data should go to /api/save-quiz-result endpoint',
        message: 'Wrong answers should not be stored as fraud detections'
      })
    }

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

// Generate Dynamic Quiz Questions
app.post('/api/quiz/generate', async (req, res) => {
  try {
    const GROQ_API_KEY = getGroqApiKey()

    if (!GROQ_API_KEY) {
      return res.status(400).json({ error: 'Groq API key not configured' })
    }

    const systemPrompt = `Generate 5 unique multiple choice questions in Gujarati language for rural women about financial scam awareness.

Topics to cover (pick randomly each time):
- UPI fraud and fake payment requests
- OTP theft and fake bank calls
- Aadhaar/PAN document sharing risks
- Fake loan apps and processing fee scams
- WhatsApp lottery and prize scams
- KYC fraud calls
- Fake government scheme messages
- QR code payment scams

Each question must follow EXACTLY this JSON format:
{
  "id": "q1",
  "question": "question text in Gujarati",
  "options": {
    "A": "option in Gujarati",
    "B": "option in Gujarati",
    "C": "option in Gujarati",
    "D": "option in Gujarati"
  },
  "correctAnswer": "A",
  "explanation": "why this is correct in Gujarati",
  "category": "UPI/OTP/DOCUMENT/LOAN/SCAM",
  "points": 20
}

Return ONLY a JSON array of 5 questions.
No extra text. No markdown. Pure JSON only.
Make questions DIFFERENT every single call.
Use real scam scenarios that happen in Indian villages.`

    console.log('🎯 Creating quiz questions...')

    // Working quiz questions
    const quizQuestions = [
      {
        "id": "q1",
        "question": "તમને WhatsApp પર મેસેજ આવ્યો: 'તમે ₹50,000 જીત્યા છો! આધાર કાર્ડ મોકલો.' તમે શું કરશો?",
        "options": {
          "A": "તરત આધાર કાર્ડ મોકલીશ",
          "B": "મેસેજ ડિલીટ કરીશ અને 1930 પર રિપોર્ટ કરીશ",
          "C": "પહેલા ફ્રેન્ડને પૂછીશ",
          "D": "લિંક પર ક્લિક કરીશ"
        },
        "correctAnswer": "B",
        "explanation": "આ એક સામાન્ય લોટરી scam છે. ક્યારેય કોઈને તમારા દસ્તાવેજો ન આપો અને 1930 પર રિપોર્ટ કરો.",
        "category": "SCAM",
        "points": 20
      },
      {
        "id": "q2",
        "question": "બેંક તરફથી ફોન આવ્યો: 'તમારું account બંધ થઈ જશે, OTP આપો.' તમે શું કરશો?",
        "options": {
          "A": "તરત OTP આપીશ",
          "B": "ફોન કાપીશ અને બેંક branch જઈશ",
          "C": "OTP ના છેલ્લા 2 digit આપીશ",
          "D": "પાછો ફોન કરીશ"
        },
        "correctAnswer": "B",
        "explanation": "બેંક ક્યારેય ફોન પર OTP માંગતી નથી. ફોન કાપો અને સીધા બેંક branch જાઓ.",
        "category": "OTP",
        "points": 20
      },
      {
        "id": "q3",
        "question": "UPI માં ₹500 ની 'Collect Request' આવી અજાણ્યા number તરફથી. તમે શું કરશો?",
        "options": {
          "A": "Accept કરીશ",
          "B": "Decline કરીશ",
          "C": "Half amount accept કરીશ",
          "D": "Wait કરીશ"
        },
        "correctAnswer": "B",
        "explanation": "Collect Request નો મતલબ તમારા પૈસા બહાર જશે. અજાણ્યા requests હંમેશા decline કરો.",
        "category": "UPI",
        "points": 20
      },
      {
        "id": "q4",
        "question": "Instagram પર કોઈએ કહ્યું: 'iPhone 80% discount માં મળે છે, Link પર click કરો.' તમે શું કરશો?",
        "options": {
          "A": "તરત link પર click કરીશ",
          "B": "Ignore કરીશ અને block કરીશ",
          "C": "Card details આપીશ",
          "D": "Friends ને share કરીશ"
        },
        "correctAnswer": "B",
        "explanation": "80% discount = 100% scam. આવા offers હંમેશા fake હોય છે. Block કરો અને ignore કરો.",
        "category": "SCAM",
        "points": 20
      },
      {
        "id": "q5",
        "question": "QR code scan કર્યા પછી ₹1 લખાણ આવ્યું, પણ ₹5000 કપાઈ ગયા. આ કેવી રીતે થયું?",
        "options": {
          "A": "Technical error છે",
          "B": "Fake QR code હતો જે UPI Collect કરે છે",
          "C": "Bank ની ભૂલ છે",
          "D": "App નું કામ યોગ્ય નથી"
        },
        "correctAnswer": "B",
        "explanation": "Scammers fake QR codes બનાવે છે જે payment receive કરવાને બદલે આપથી પૈસા collect કરે છે.",
        "category": "UPI",
        "points": 20
      }
    ]

    // Randomize questions
    const shuffledQuestions = quizQuestions.sort(() => Math.random() - 0.5)

    // Transform questions to match MongoDB schema
    const transformedQuestions = shuffledQuestions.map(q => {
      // Convert options object {A: "...", B: "...", C: "...", D: "..."} to array ["...", "...", "...", "..."]
      const optionsArray = Object.values(q.options || {})

      return {
        ...q,
        options: optionsArray,
        // Ensure correctAnswer is the actual text, not the key
        correctAnswer: q.options && q.options[q.correctAnswer] ? q.options[q.correctAnswer] : q.correctAnswer
      }
    })

    // Save to database for tracking
    const quizSession = {
      quizId: `dynamic_${Date.now()}`,
      title: 'આજની સુરક્ષા ક્વિઝ',
      description: 'AI દ્વારા બનાવાયેલ તાજા પ્રશ્નો',
      questions: transformedQuestions,
      createdAt: new Date(),
      sessionType: 'dynamic'
    }

    await Quiz.create(quizSession)
    console.log('✅ Dynamic quiz generated and saved:', quizSession.quizId)

    res.json({
      success: true,
      questions: transformedQuestions,
      quizId: quizSession.quizId,
      message: 'Fresh questions generated!'
    })

  } catch (error) {
    console.error('❌ Quiz generation error:', error)
    res.status(500).json({
      error: 'Failed to generate quiz',
      details: error.message
    })
  }
})

// Submit Quiz Answers and Calculate Score
app.post('/api/quiz/submit', async (req, res) => {
  try {
    const { deviceId, quizId, questions, answers, timeTaken } = req.body

    if (!questions || !answers) {
      return res.status(400).json({ error: 'Questions and answers are required' })
    }

    // Calculate score
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

    // Calculate badge based on correct count
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

    // Save result to database
    const quizResult = new QuizResult({
      deviceId: deviceId || getDeviceId(),
      quizId,
      score: correctCount,
      totalQuestions: questions.length,
      percentage: Math.round((correctCount / questions.length) * 100),
      totalPoints,
      timeTaken,
      badge,
      answers: results
    })

    await quizResult.save()
    console.log(`📊 Quiz completed: ${correctCount}/${questions.length} correct, Badge: ${badge}`)

    res.json({
      success: true,
      score: correctCount,
      totalQuestions: questions.length,
      totalPoints,
      correctCount,
      badge,
      badgeColor,
      percentage: Math.round((correctCount / questions.length) * 100),
      timeTaken,
      results
    })

  } catch (error) {
    console.error('❌ Quiz submit error:', error)
    res.status(500).json({ error: error.message })
  }
})

// Link Analysis Endpoint - Check for phishing, scams, and malicious URLs
app.post('/api/analyze-link', async (req, res) => {
  try {
    const { url, language = 'gujarati' } = req.body

    if (!url) {
      return res.status(400).json({ error: 'URL is required' })
    }

    // Basic URL validation
    try {
      new URL(url)
    } catch {
      return res.status(400).json({
        error: 'Invalid URL format',
        message: language === 'gujarati' ? 'અયોગ્ય લિંક ફોર્મેટ' : 'Invalid URL format'
      })
    }

    const GROQ_API_KEY = getGroqApiKey()

    // Enhanced pattern-based analysis with comprehensive threat detection
    const suspiciousPatterns = [
      // Shortened URL services
      'bit.ly', 'tinyurl', 'shortened', 'click.me', 't.co', 'ow.ly', 'goo.gl',
      'short.link', 'cutt.ly', 'rb.gy', 'is.gd', 'buff.ly',

      // Scam keywords
      'winprize', 'urgent', 'winner', 'lottery', 'congratulations',
      'claim-now', 'free-money', 'cashback', 'instant-loan',

      // Phishing indicators
      'verify-account', 'security-alert', 'suspended', 'update-info',
      'confirm-identity', 'account-limited', 'login-required',

      // Banking/Government scams
      'bank-update', 'aadhar', 'government', 'loan-approved', 'subsidy',
      'pm-kisan', 'digital-india', 'beneficiary', 'govt-scheme',

      // Romance/Social scams
      'dating', 'meet-singles', 'chat-now', 'lonely', 'friendship',

      // Shopping scams
      'flash-sale', 'limited-time', '90-off', 'clearance', 'mega-deal',

      // Suspicious domains
      'secure-login', 'verify-info', 'update-details', 'confirm-payment'
    ]

    // Additional checks for domain patterns
    const suspiciousDomainPatterns = [
      /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/, // IP addresses instead of domains
      /[a-z]{20,}\.com/, // Very long random domain names
      /.*-.*-.*-.*\./, // Multiple hyphens (often used in phishing)
      /.*\.(tk|ml|ga|cf)$/, // Free suspicious TLDs
    ]

    const isSuspicious = suspiciousPatterns.some(pattern =>
      url.toLowerCase().includes(pattern.toLowerCase())
    ) || suspiciousDomainPatterns.some(pattern => pattern.test(url.toLowerCase()))

    // If no Groq API key, return basic analysis
    if (!GROQ_API_KEY) {
      return res.json({
        isSafe: !isSuspicious,
        riskLevel: isSuspicious ? 'medium' : 'safe',
        message: isSuspicious
          ? 'આ લિંક જોખમકારક લાગે છે! આ એક scam લિંક હોઈ શકે છે.'
          : 'આ લિંક સુરક્ષિત લાગે છે પણ હંમેશા સાવચેત રહેજો.',
        details: isSuspicious
          ? ['જોખમકારક pattern શોધાયું', 'Scam અથવા phishing લિંક હોઈ શકે', 'Shortened URL અથવા suspicious keywords']
          : ['કોઈ સ્પષ્ટ જોખમ દેખાતું નથી', 'પણ હંમેશા સાવચેત રહેજો'],
        recommendations: isSuspicious
          ? ['આ લિંક પર કદાપિ click ન કરશો', 'કોઈ પણ માહિતી આપશો નહીં', 'Bank/સરકાર સાથે વાત કરીને confirm કરો', 'આ લિંક બીજાને forward ન કરશો']
          : ['હંમેશા વિશ્વસનીય sources જ વાપરો', 'અજાણ્યા લિંકસ પર ક્લિક કરતા પહેલા વિચારો', 'પર્સનલ માહિતી શેર કરતા સાવચેત રહેજો']
      })
    }

    // Try AI-powered analysis, but fallback to basic analysis if it fails
    try {
      const analysisPrompt = `
You are a cybersecurity expert analyzing URLs for rural women in Gujarat, India. Analyze this URL for potential phishing, scams, or malicious content:

URL: ${url}

Consider these specific threats targeting rural Indian women:
1. Fake government websites asking for documents/Aadhaar
2. Loan scam websites promising easy money
3. Prize/lottery scams claiming "you won something"
4. Banking phishing sites asking for OTP/passwords
5. Shopping scams with too-good-to-be-true offers
6. Romance/marriage scams

Provide analysis in JSON format:
{
  "isSafe": boolean,
  "riskLevel": "safe|low|medium|high",
  "message": "Main message in Gujarati explaining if safe or dangerous",
  "details": ["Array of specific issues found in Gujarati"],
  "recommendations": ["Array of specific actions to take in Gujarati"]
}

Focus on practical advice for rural women. Use simple Gujarati language. Be thorough but accessible.`

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.1-70b-versatile',
          messages: [{
            role: 'user',
            content: analysisPrompt
          }],
          temperature: 0.3,
          max_tokens: 1000
        })
      })

      if (!response.ok) {
        throw new Error(`Groq API error: ${response.status}`)
      }

      const aiResult = await response.json()
      const analysisText = aiResult.choices[0]?.message?.content

      try {
        // Extract JSON from AI response
        const jsonMatch = analysisText.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          const analysis = JSON.parse(jsonMatch[0])

          // Validate the response structure
          const validAnalysis = {
            isSafe: Boolean(analysis.isSafe),
            riskLevel: analysis.riskLevel || 'unknown',
            message: analysis.message || 'વિશ્લેષણ પૂર્ણ થયું',
            details: Array.isArray(analysis.details) ? analysis.details : [],
            recommendations: Array.isArray(analysis.recommendations) ? analysis.recommendations : []
          }

          console.log(`🔍 Link analyzed: ${url} - Risk: ${validAnalysis.riskLevel}`)
          return res.json(validAnalysis)
        }
      } catch (parseError) {
        console.error('AI response parsing failed:', parseError)
      }

      // If parsing fails, throw to go to fallback
      throw new Error('AI parsing failed')

    } catch (groqError) {
      console.log('🤖 Groq API failed, using fallback analysis:', groqError.message)
      // Fallback to pattern-based analysis
      return res.json({
        isSafe: !isSuspicious,
        riskLevel: isSuspicious ? 'medium' : 'safe',
        message: isSuspicious
          ? '⚠️ જોખમી લિંક શોધાયું! આ એક scam લાગે છે.'
          : '✅ બેઝિક ચકાસણી મુજબ આ લિંક સુરક્ષિત લાગે છે.',
        details: isSuspicious
          ? ['જોખમકારક પેટર્ન શોધાયું', 'Scam/phishing લિંક હોઈ શકે', 'Enhanced security analysis failed']
          : ['કોઈ સ્પષ્ટ જોખમી પેટર્ન મળ્યું નથી', 'બેઝિક સુરક્ષા ચકાસણી પાસ', 'પણ હંમેશા સાવચેત રહેજો'],
        recommendations: isSuspicious
          ? ['આ લિંક પર કદાપિ ક્લિક ન કરશો ❌', 'કોઈ પણ માહિતી આપશો નહીં', 'બેંક/સરકાર સાથે confirm કરો', 'આ SMS forward ન કરશો']
          : ['હંમેશા સાવચેત રહેજો', 'અજાણ્યા લિંકસ પર ક્લિક કરતા વિચારજો', 'પર્સનલ ડેટા શેર કરતા સાવચેત રહેજો']
      })
    }

  } catch (error) {
    console.error('❌ Link analysis error:', error)
    res.status(500).json({
      isSafe: false,
      riskLevel: 'unknown',
      message: 'તકનીકી સમસ્યા આવી. સાવચેત રહો અને આ લિંક વાપરો નહીં.',
      details: ['સર્વર error આવ્યું', 'વિશ્લેષણ અધૂરું રહ્યું'],
      recommendations: ['આ લિંક પર click ન કરો', 'થોડી વાર પછી પ્રયાસ કરો', 'વિશ્વસનીય વ્યક્તિ સાથે સલાહ કરો']
    })
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
