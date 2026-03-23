import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getDeviceId } from '../utils/deviceId'
import { saveFraud, saveQuizResult } from '../api/Database_API'
import './QuizScreen.css'

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
  const deviceId = getDeviceId()

  // Fetch and initialize quiz questions from API
  useEffect(() => {
    const initializeQuiz = async () => {
      try {
        console.log('🎯 Fetching random quiz questions from API...')
        // Add timestamp to prevent caching - GET 5 RANDOM QUESTIONS EACH TIME
        const response = await fetch(`http://localhost:5001/api/quiz-random/gujarati_fraud_awareness?t=${Date.now()}`)
        const data = await response.json()

        if (data.quiz && data.quiz.questions) {
          console.log('🎯 Questions received:', data.quiz.questions.map(q => q.questionId).join(', '))
          console.log('🎯 Shuffling answer options...')
          const shuffled = data.quiz.questions.map(q => shuffleOptions(q))
          console.log('✅ Quiz ready with shuffled answer options!')
          setShuffledQuestions(shuffled)
        }
      } catch (error) {
        console.error('❌ Failed to load quiz:', error)
        // Fallback: show error message
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
    console.log('🔄 Fetching NEW random questions for restart...')
    setCurrentQuestion(0)
    setScore(0)
    setAnswered(false)
    setSelectedAnswer(null)
    setQuizComplete(false)
    setShowResult(false)

    // Fetch NEW 5 RANDOM questions
    try {
      const response = await fetch(`http://localhost:5001/api/quiz-random/gujarati_fraud_awareness?t=${Date.now()}`)
      const data = await response.json()

      if (data.quiz && data.quiz.questions) {
        console.log('🔄 NEW random questions:', data.quiz.questions.map(q => q.questionId).join(', '))
        setTimeout(() => {
          const newShuffled = data.quiz.questions.map(q => shuffleOptions(q))
          console.log('✅ Quiz reset with NEW questions and shuffled options!')
          setShuffledQuestions(newShuffled)
        }, 0)
      }
    } catch (error) {
      console.error('❌ Failed to reset quiz:', error)
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

      <h3 className="question-text">{question.question}</h3>

      <div className="options-list">
        {question.options.map((option, index) => (
          <button
            key={index}
            className={`option-btn ${
              answered &&
              (index === question.correct ? 'correct' : 'disabled')
            } ${answered && index === selectedAnswer && index !== question.correct ? 'wrong' : ''}`}
            onClick={() => handleAnswer(index)}
            disabled={answered}
          >
            {option}
          </button>
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
