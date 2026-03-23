import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getDeviceId } from '../utils/deviceId'
import { saveFraud, saveQuizResult } from '../api/Database_API'
import './QuizScreen.css'

// Static quiz data - no API required
const STATIC_QUIZ_QUESTIONS = [
  {
    questionId: 'q1',
    scene: 'તમને WhatsApp પર message આવ્યો: "Congratulations! તમે ₹50,000 જીત્યા. ઇનામ લેવા આધાર + PAN card photo મોકલો."',
    question: 'તમે શું કરશો?',
    options: ['ફટાફટ document મોકલો', 'Message ignore કરો અને 1930 પર report કરો ✅', 'Friend ને પૂછો', 'ફક્ત આધાર મોકલો'],
    correctAnswer: 'Message ignore કરો અને 1930 પર report કરો ✅',
    feedbackCorrect: 'શાબ્બાશ! ઇનામ-ઇનામ message = 100% ફ્રૉડ. Document ક્યારેય ન મોકલો.',
    feedbackIncorrect: 'ના! આ ફ્રૉડ છે. 1930 = સાઇબર ક્રાઇમ હેલ્પલાઇન.',
    points: 20
  },
  {
    questionId: 'q2',
    scene: 'રમા બહેનને ફોન આવ્યો: "હું SBI bank manager છું. તમારું account બંધ થઈ જશે. OTP જણાવો."',
    question: 'OTP આપવો જોઈએ?',
    options: ['હા, account બચાવવા આપવો પડે', 'ના — બેંક ક્યારેય OTP ફોન પર નથી માંગતી ✅', 'OTP ના છેલ્લા 2 digit જ આપો', 'Bank branch જઈને verify કરો'],
    correctAnswer: 'ના — બેંક ક્યારેય OTP ફોન પર નથી માંગતી ✅',
    feedbackCorrect: '100% સાચું! OTP = ATM ની ચાવી. ફોન પર ક્યારેય ન આપો।',
    feedbackIncorrect: 'ખોટું! Bank ક્યારેય OTP ફોન પર નથી માંગતી।',
    points: 20
  },
  {
    questionId: 'q3',
    scene: 'તમને UPI app માં "Collect Request" આવ્યો ₹500 ના માટે unknown number તરફથી।',
    question: 'Request accept કરવો?',
    options: ['હા — receive કરવા accept કરવો પડે', 'ના — Collect Request Decline કરો ✅', 'પહેલાં બીજું કશું ચેક કરો', 'આધી રકમ accept કરો'],
    correctAnswer: 'ના — Collect Request Decline કરો ✅',
    feedbackCorrect: 'બિલકુલ! UPI Collect = તમારો પૈસા જાય. Decline કરો!',
    feedbackIncorrect: 'ના! Collect Request એટલે તમારો પૈસો બહાર જાય છે।',
    points: 20
  },
  {
    questionId: 'q4',
    scene: 'તમને આવ્યો message: "તમે ₹10,000 loan માટે qualify થયા છો. અહીં click કરો — unknown number તરફથી"',
    question: 'Link પર click કરવું?',
    options: ['હા — ₹10,000 ની જરૂર છે', 'ના — Link delete કરો અને number block કરો ✅', 'Link ખોલો પણ કોઈ info ન ભરો', 'Friend ને પૂછો'],
    correctAnswer: 'ના — Link delete કરો અને number block કરો ✅',
    feedbackCorrect: 'સવો જવાબ! Fake loan links = bank details ચોરાય. Real loan માટે bank branch જો।',
    feedbackIncorrect: 'ના! આ fake loan link છે। Link delete કરો, number block કરો।',
    points: 20
  },
  {
    questionId: 'q5',
    scene: 'WhatsApp પર: "Govt scheme — ₹2000 તમારા account મા આવશે. Aadhar + bank passbook photo મોકલો"',
    question: 'આ message ને કેમ શંકા થાય છે?',
    options: ['Government ક્યારેય photo માંગતો નથી ✅', 'Message બہુ ઔપચારિક લાગે છે', 'Link ખૂબ લાંબો છે', 'કોઈ શંકા નથી — તરત photo મોકલો'],
    correctAnswer: 'Government ક્યારેય photo માંગતો નથી ✅',
    feedbackCorrect: 'બિલકુલ! Government ક્યારેય WhatsApp પર photo માંગતો નથી.',
    feedbackIncorrect: 'ખોટું! Government ક્યારેય આ રીતે contact કરતો નથી।',
    points: 20
  }
]

// Function to shuffle array with verified randomization
function shuffleArray(array) {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    console.log(`  Swap positions ${i} ↔ ${j}`)
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  const order = shuffled.map(q => q.questionId || q.id).join(' → ')
  console.log('✅ Questions shuffled:', order)
  return shuffled
}

// Function to shuffle question options but track correct answer
function shuffleOptions(question) {
  const optionsWithIndex = question.options.map((opt) => ({
    text: opt,
    isCorrect: opt === question.correctAnswer
  }))

  const shuffled = shuffleArray(optionsWithIndex)
  const newCorrectIndex = shuffled.findIndex(opt => opt.isCorrect)

  console.log(`📝 ${question.questionId}: Options shuffled - Correct answer moved to position ${newCorrectIndex}`)

  return {
    ...question,
    options: shuffled.map(opt => opt.text),
    correct: newCorrectIndex,
    feedback: {
      correct: question.feedbackCorrect,
      incorrect: question.feedbackIncorrect
    }
  }
}

export default function QuizScreen() {
  const navigate = useNavigate()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [score, setScore] = useState(0)
  const [answered, setAnswered] = useState(false)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [quizComplete, setQuizComplete] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [shuffledQuestions, setShuffledQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [speaking, setSpeaking] = useState(false)
  const deviceId = getDeviceId()

  // Text-to-Speech function
  const speakQuestion = async () => {
    if (speaking || questions.length === 0) return

    const question = questions[currentQuestion]
    // Just read the question, not the full scene + options (to avoid exceeding TTS limit)
    const textToSpeak = question.question

    setSpeaking(true)
    try {
      console.log('🔊 Speaking question...')
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textToSpeak, lang: 'gu' })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const audioBlob = await response.blob()
      const audioUrl = URL.createObjectURL(audioBlob)
      const audio = new Audio(audioUrl)

      audio.onended = () => {
        setSpeaking(false)
        URL.revokeObjectURL(audioUrl)
      }

      audio.onerror = () => {
        setSpeaking(false)
        console.error('❌ Audio playback failed')
      }

      audio.play().catch(err => {
        setSpeaking(false)
        console.error('❌ Play error:', err)
      })
    } catch (error) {
      console.error('❌ TTS error:', error)
      setSpeaking(false)
    }
  }

  // Fetch and initialize quiz questions from MongoDB API
  useEffect(() => {
    const initializeQuiz = async () => {
      try {
        console.log('🎯 Fetching quiz questions from MongoDB...')
        const response = await fetch(`/api/quiz-random/gujarati_fraud_awareness?t=${Date.now()}`)

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`)
        }

        const data = await response.json()

        if (data.quiz && data.quiz.questions) {
          console.log('🎯 Questions received from MongoDB:', data.quiz.questions.map(q => q.questionId).join(', '))
          console.log('🎯 Shuffling answer options...')
          const shuffled = data.quiz.questions.map(q => shuffleOptions(q))
          console.log('✅ Quiz ready with shuffled answer options!')
          setShuffledQuestions(shuffled)
        } else {
          throw new Error('No questions in response')
        }
      } catch (error) {
        console.error('❌ Failed to load quiz from MongoDB:', error)
        // Fallback to static data if API fails
        console.log('📦 Using fallback static questions...')
        const shuffled = STATIC_QUIZ_QUESTIONS.map(q => shuffleOptions(q))
        setShuffledQuestions(shuffled)
      } finally {
        setLoading(false)
      }
    }

    initializeQuiz()
  }, [])

  // Use shuffled questions, fallback to empty array if not loaded yet
  const questions = shuffledQuestions.length > 0 ? shuffledQuestions : []

  if (loading) {
    return (
      <div className="quiz-container">
        <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
          ક્વિઝ લોડ થઈ રહ્યું છે...
        </div>
      </div>
    )
  }

  if (!loading && questions.length === 0) {
    return (
      <div className="quiz-container">
        <div className="quiz-header-top">
          <button onClick={() => navigate('/')} className="back-btn">
            ← પાછું
          </button>
          <h2>ક્વિઝ</h2>
          <div style={{ width: '60px' }}></div>
        </div>
        <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
          ક્વિઝ લોડ કરી શક્યા નથી. કૃપા પછીથી પ્રયાસ કરો.
        </div>
      </div>
    )
  }

  const handleAnswer = (index) => {
    if (answered) return
    setSelectedAnswer(index)
    setAnswered(true)

    const isCorrect = index === questions[currentQuestion].correct
    if (isCorrect) {
      setScore(score + questions[currentQuestion].points)
    } else {
      // Save fraud alert for wrong answer
      saveFraud(
        'quiz_wrong_answer',
        `Question: ${questions[currentQuestion].question}`,
        'low'
      )
    }
    setShowResult(true)
  }

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setAnswered(false)
      setSelectedAnswer(null)
      setShowResult(false)
    } else {
      setQuizComplete(true)
      saveQuizResultData()
    }
  }

  const saveQuizResultData = async () => {
    const percentage = Math.round((score / (questions.length * 20)) * 100)
    await saveQuizResult('gujarati_fraud_awareness', Math.round(score / 20), questions.length, percentage)
  }

  const resetQuiz = async () => {
    console.log('🔄 Fetching NEW questions from MongoDB for restart...')
    setCurrentQuestion(0)
    setScore(0)
    setAnswered(false)
    setSelectedAnswer(null)
    setQuizComplete(false)
    setShowResult(false)

    try {
      const response = await fetch(`/api/quiz-random/gujarati_fraud_awareness?t=${Date.now()}`)

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()

      if (data.quiz && data.quiz.questions) {
        console.log('🔄 NEW questions from MongoDB:', data.quiz.questions.map(q => q.questionId).join(', '))
        setTimeout(() => {
          const newShuffled = data.quiz.questions.map(q => shuffleOptions(q))
          console.log('✅ Quiz reset with NEW questions from MongoDB and shuffled options!')
          setShuffledQuestions(newShuffled)
        }, 0)
      }
    } catch (error) {
      console.error('❌ Failed to reset quiz:', error)
      // Fallback to static data
      const newShuffled = STATIC_QUIZ_QUESTIONS.map(q => shuffleOptions(q))
      setShuffledQuestions(newShuffled)
    }
  }

  if (quizComplete) {
    const percentage = Math.round((score / (questions.length * 20)) * 100)
    const emoji = percentage >= 80 ? '🏆' : percentage >= 60 ? '👍' : '💪'
    const title =
      percentage >= 80
        ? 'અભિનંદન, સખી ચેમ્પિયન!'
        : percentage >= 60
        ? 'સારો પ્રયાસ!'
        : 'ફરી પ્રયાસ કરો!'

    return (
      <div className="quiz-container">
        <div className="quiz-header-top">
          <button onClick={() => navigate('/')} className="back-btn">
            ← હોમ
          </button>
          <h2>પરિણામ</h2>
          <div style={{ width: '60px' }}></div>
        </div>
        <div className="result-card">
          <div className="result-emoji">{emoji}</div>
          <h2 className="result-title">{title}</h2>
          <p className="result-score">
            {Math.round(score / 20)}/{questions.length} સાચા જવાબ
          </p>
          <div className="points-earned">+{score} પોઇન્ટ</div>
          <button className="quiz-btn" onClick={resetQuiz}>
            ફરી રમો
          </button>
        </div>
      </div>
    )
  }

  const question = questions[currentQuestion]
  const progress = ((currentQuestion + 1) / questions.length) * 100

  return (
    <div className="quiz-container">
      {/* Header with Back Button */}
      <div className="quiz-header-top">
        <button onClick={() => navigate('/')} className="back-btn">
          ← પાછું
        </button>
        <h2>ક્વિઝ</h2>
        <div style={{ width: '60px' }}></div>
      </div>

      <div className="quiz-progress">
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      <div className="quiz-header">
        <span className="question-number">
          સવાલ {currentQuestion + 1} / {questions.length}
        </span>
        <span className="points-badge">+{question.points} પોઇન્ટ</span>
      </div>

      <div className="scenario-card">
        <div className="scenario-label">📍 સ્થિતિ</div>
        <p className="scenario-text">{question.scene}</p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h3 className="question-text" style={{ flex: 1 }}>{question.question}</h3>
        <button
          onClick={speakQuestion}
          disabled={speaking}
          style={{
            background: speaking ? '#ccc' : '#ff6b6b',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '50px',
            height: '50px',
            fontSize: '24px',
            cursor: speaking ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            marginLeft: '10px',
            opacity: speaking ? 0.6 : 1,
            transition: 'all 0.3s'
          }}
          title="વાર્તા સાંભળો"
        >
          {speaking ? '⏸️' : '🔊'}
        </button>
      </div>

      <div className="options-list">
        {question.options.map((option, index) => (
          <div key={index} style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '12px' }}>
            <button
              className={`option-btn ${
                answered &&
                (index === question.correct ? 'correct' : 'disabled')
              } ${answered && index === selectedAnswer && index !== question.correct ? 'wrong' : ''}`}
              onClick={() => handleAnswer(index)}
              disabled={answered}
              style={{ flex: 1 }}
            >
              {option}
            </button>
            <button
              onClick={async () => {
                const textToSpeak = option.replace('✅', '').replace('—', ' ').trim().substring(0, 350)
                try {
                  const response = await fetch('/api/tts', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text: textToSpeak, lang: 'gu' })
                  })

                  if (!response.ok) {
                    console.error('TTS error:', response.status)
                    return
                  }

                  const audioBlob = await response.blob()
                  const audioUrl = URL.createObjectURL(audioBlob)
                  const audio = new Audio(audioUrl)
                  audio.onended = () => URL.revokeObjectURL(audioUrl)
                  audio.onerror = () => {
                    console.error('❌ Audio playback failed')
                    URL.revokeObjectURL(audioUrl)
                  }
                  audio.play().catch(err => console.error('❌ Play error:', err))
                } catch (error) {
                  console.error('❌ TTS error:', error)
                }
              }}
              style={{
                background: '#4ecdc4',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                fontSize: '18px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
              title="વિકલ્પ સાંભળો"
            >
              🔊
            </button>
          </div>
        ))}
      </div>

      {showResult && (
        <div
          className={`feedback ${
            selectedAnswer === question.correct ? 'feedback-correct' : 'feedback-wrong'
          }`}
        >
          <h4>
            {selectedAnswer === question.correct ? '✅ સાચો જવાબ!' : '❌ ખોટો જવાબ'}
          </h4>
          <p>
            {selectedAnswer === question.correct
              ? question.feedback.correct
              : question.feedback.incorrect}
          </p>
          <button className="quiz-btn" onClick={handleNext}>
            {currentQuestion < questions.length - 1 ? 'આગળ વધો' : 'પરિણામ જુઓ'}
          </button>
        </div>
      )}
    </div>
  )
}
