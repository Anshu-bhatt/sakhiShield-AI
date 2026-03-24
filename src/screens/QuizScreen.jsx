import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { generateQuiz, submitQuiz, syncOfflineQuizResults } from '../api/quizApi'
import StarParticles from '../components/StarParticles'
import RewardBadge from '../components/RewardBadge'

export default function QuizScreen() {
  const navigate = useNavigate()

  // States for quiz flow
  const [screen, setScreen] = useState('loading') // loading, start, question, results
  const [questions, setQuestions] = useState([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [selectedAnswer, setSelectedAnswer] = useState('')
  const [showResult, setShowResult] = useState(false)
  const [timeLeft, setTimeLeft] = useState(30) // seconds per question
  const [startTime, setStartTime] = useState(null)
  const [quizId, setQuizId] = useState('')

  // States for results
  const [quizResult, setQuizResult] = useState(null)
  const [pointsFloating, setPointsFloating] = useState('')
  const [currentPoints, setCurrentPoints] = useState(0)

  // Load fresh questions on mount
  useEffect(() => {
    loadQuiz()
    // Try to sync any offline results on mount
    syncOfflineQuizResults().catch(() => {
      // Silent fail - just log to console
    })
  }, [])

  // Timer for questions
  useEffect(() => {
    let timer
    if (screen === 'question' && timeLeft > 0 && !showResult) {
      timer = setTimeout(() => {
        setTimeLeft(prev => prev - 1)
      }, 1000)
    } else if (timeLeft === 0 && !showResult) {
      // Auto-submit when time runs out
      handleAnswerSubmit('')
    }

    return () => clearTimeout(timer)
  }, [timeLeft, screen, showResult])

  const loadQuiz = async () => {
    try {
      setScreen('loading')
      const data = await generateQuiz()
      setQuestions(data.questions)
      setQuizId(data.quizId)

      setTimeout(() => {
        setScreen('start')
      }, 2000) // Show loading for 2 seconds
    } catch (error) {
      console.error('Failed to load quiz:', error)
      alert('ક્વિઝ લોડ કરવામાં સમસ્યા આવી. કૃપા પછીથી પ્રયાસ કરો.')
      navigate('/')
    }
  }

  const startQuiz = () => {
    setScreen('question')
    setStartTime(Date.now())
    setTimeLeft(30)
  }

  const handleAnswerSelect = (option) => {
    if (showResult) return
    setSelectedAnswer(option)
  }

  const handleAnswerSubmit = (answer) => {
    if (showResult) return

    const finalAnswer = answer || selectedAnswer
    setAnswers(prev => ({
      ...prev,
      [questions[currentQuestionIndex].id]: finalAnswer
    }))

    // Convert key to option text for correctness checking
    const keyIndex = finalAnswer.charCodeAt(0) - 65 // Convert A,B,C,D to 0,1,2,3
    const selectedOptionText = questions[currentQuestionIndex].options[keyIndex]
    const isCorrect = selectedOptionText === questions[currentQuestionIndex].correctAnswer

    if (isCorrect) {
      const points = questions[currentQuestionIndex].points || 20
      setCurrentPoints(prev => prev + points)
      setPointsFloating(`+${points} ⭐`)

      setTimeout(() => setPointsFloating(''), 1500)
    }

    setShowResult(true)
  }

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
      setSelectedAnswer('')
      setShowResult(false)
      setTimeLeft(30)
    } else {
      finishQuiz()
    }
  }

  const finishQuiz = async () => {
    try {
      const timeTaken = Math.round((Date.now() - startTime) / 1000)

      // Convert key-based answers (A, B, C, D) to option text
      const convertedAnswers = {}
      Object.keys(answers).forEach(questionId => {
        const question = questions.find(q => q.id === questionId)
        const selectedKey = answers[questionId]
        if (question && selectedKey) {
          const keyIndex = selectedKey.charCodeAt(0) - 65 // Convert A,B,C,D to 0,1,2,3
          convertedAnswers[questionId] = question.options[keyIndex] || selectedKey
        }
      })

      const result = await submitQuiz(quizId, questions, convertedAnswers, timeTaken)
      setQuizResult(result)
      setScreen('results')
    } catch (error) {
      console.error('Failed to submit quiz:', error)
      alert('પરિણામ સેવ કરવામાં સમસ્યા આવી.')
    }
  }

  const restartQuiz = () => {
    // Reset all states
    setCurrentQuestionIndex(0)
    setAnswers({})
    setSelectedAnswer('')
    setShowResult(false)
    setCurrentPoints(0)
    setQuizResult(null)

    // Load fresh questions
    loadQuiz()
  }

  const goToChat = () => {
    navigate('/chat')
  }

  // SCREEN 1: LOADING
  if (screen === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 flex flex-col items-center justify-center relative overflow-hidden">
        <StarParticles />

        <div className="text-center z-10">
          {/* Spinning Shield */}
          <div className="text-8xl mb-8 animate-spin-slow">
            🛡️
          </div>

          {/* Loading Text */}
          <h2 className="text-white text-2xl font-bold mb-4">
            નવા સવાલ તૈયાર થાય છે...
          </h2>

          {/* Animated Dots */}
          <div className="flex justify-center gap-2 mb-6">
            <div className="dot-bounce"></div>
            <div className="dot-bounce"></div>
            <div className="dot-bounce"></div>
          </div>

          <p className="text-purple-200 text-lg">
            આજના scam scenarios લોડ થાય છે
          </p>
        </div>
      </div>
    )
  }

  // SCREEN 2: START CARD
  if (screen === 'start') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl p-8 max-w-sm w-full text-center">
          <div className="text-6xl mb-6">🏆</div>

          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            આજની સુરક્ષા ક્વિઝ
          </h1>

          <p className="text-gray-600 mb-8">
            5 સવાલ • 100 points • ગુજરાતી
          </p>

          <div className="flex justify-center gap-4 mb-8">
            <div className="bg-blue-50 px-4 py-2 rounded-full">
              <span className="text-blue-600 font-medium">⏱️ 2 મિનિટ</span>
            </div>
            <div className="bg-purple-50 px-4 py-2 rounded-full">
              <span className="text-purple-600 font-medium">❓ 5 સવાલ</span>
            </div>
            <div className="bg-amber-50 px-4 py-2 rounded-full">
              <span className="text-amber-600 font-medium">⭐ 100 પોઇન્ટ</span>
            </div>
          </div>

          <button
            onClick={startQuiz}
            className="w-full bg-gradient-to-r from-amber-400 to-amber-500 text-white font-bold py-4 px-8 rounded-full text-lg press animate-pulse hover:animate-none active:scale-95 transition-transform"
          >
            શરૂ કરો! 🚀
          </button>
        </div>
      </div>
    )
  }

  // SCREEN 3: ACTIVE QUESTION
  if (screen === 'question') {
    const question = questions[currentQuestionIndex]
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100
    const timePercent = (timeLeft / 30) * 100

    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700">
        {/* Header Section */}
        <div className="p-4 pb-6">
          {/* Back Button */}
          <button
            onClick={() => navigate('/')}
            className="text-white mb-4 press flex items-center gap-2"
          >
            ← પાછું
          </button>

          {/* Progress Bar */}
          <div className="bg-white/20 rounded-full h-2 mb-4">
            <div
              className="bg-gradient-to-r from-violet-400 to-amber-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          <div className="flex justify-between items-center text-white">
            <span className="font-medium">સવાલ {currentQuestionIndex + 1} ની {questions.length}</span>
            <span className="bg-white/20 px-3 py-1 rounded-full">⭐ {currentPoints} pts</span>
          </div>

          {/* Timer Bar */}
          <div className="mt-3 bg-white/20 rounded-full h-1">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${
                timePercent > 50 ? 'bg-green-400' : timePercent > 20 ? 'bg-yellow-400' : 'bg-red-400'
              }`}
              style={{ width: `${timePercent}%` }}
            ></div>
          </div>
        </div>

        {/* Question Card */}
        <div className="px-4">
          <div className="bg-white rounded-3xl shadow-xl p-6 relative">
            {/* Floating Points */}
            {pointsFloating && (
              <div className="absolute -top-4 right-4 text-amber-500 font-bold text-xl animate-pointFloat z-10">
                {pointsFloating}
              </div>
            )}

            {/* Category Chip */}
            <div className="inline-block bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium mb-4">
              💸 {question?.category || 'સુરક્ષા'}
            </div>

            {/* Question */}
            <h3 className="text-xl font-bold text-gray-800 mb-6">
              {question?.question}
            </h3>

            {/* Options */}
            <div className="space-y-3 mb-6">
              {(question?.options || []).map((option, index) => {
                const key = String.fromCharCode(65 + index) // A, B, C, D
                let buttonClass = "w-full p-4 text-left rounded-2xl border-2 transition-all press "

                if (!showResult) {
                  buttonClass += selectedAnswer === key
                    ? "bg-violet-100 border-violet-600 text-violet-700"
                    : "bg-white border-gray-200 hover:border-violet-300"
                } else {
                  if (option === question.correctAnswer) {
                    buttonClass += "bg-emerald-50 border-emerald-500 text-emerald-700 animate-correctPulse"
                  } else if (selectedAnswer === key && option !== question.correctAnswer) {
                    buttonClass += "bg-red-50 border-red-400 text-red-600 animate-shakeWrong"
                  } else {
                    buttonClass += "bg-gray-50 border-gray-300 text-gray-500"
                  }
                }

                return (
                  <button
                    key={key}
                    onClick={() => handleAnswerSelect(key)}
                    disabled={showResult}
                    className={buttonClass}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 bg-violet-100 text-violet-700 rounded-full flex items-center justify-center font-bold text-sm">
                        {key}
                      </span>
                      <span>{option}</span>
                      {showResult && option === question.correctAnswer && (
                        <span className="ml-auto text-emerald-600">✅</span>
                      )}
                      {showResult && selectedAnswer === key && option !== question.correctAnswer && (
                        <span className="ml-auto text-red-500">❌</span>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Submit/Next Button */}
            {!showResult ? (
              <button
                onClick={() => handleAnswerSubmit(selectedAnswer)}
                disabled={!selectedAnswer}
                className={`w-full py-4 rounded-2xl font-bold text-lg press transition-all ${
                  selectedAnswer
                    ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                જવાબ આપો
              </button>
            ) : (
              <div className="space-y-4">
                {/* Explanation */}
                <div className="bg-violet-50 border-l-4 border-violet-500 p-4 rounded-lg">
                  <div className="flex items-start gap-3">
                    <span className="text-xl">💡</span>
                    <p className="text-violet-800">{question?.explanation}</p>
                  </div>
                </div>

                <button
                  onClick={nextQuestion}
                  className="w-full bg-gradient-to-r from-amber-400 to-amber-500 text-white font-bold py-4 rounded-2xl press"
                >
                  {currentQuestionIndex < questions.length - 1 ? 'આગે વધો →' : 'પરિણામ જુઓ 🏆'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // SCREEN 4: RESULTS
  if (screen === 'results' && quizResult) {
    const getGujaratiMessage = () => {
      if (quizResult.score === 5) {
        return "વાહ! તમે એક સાચા digital સુરક્ષા expert છો! 🏆"
      } else if (quizResult.score === 4) {
        return "બહુજ સરસ! તમે લગભગ champion છો! ⭐"
      } else if (quizResult.score === 3) {
        return "સારી કોશિશ! થોડી વાર practice કરજો! 🛡️"
      } else {
        return "હાર ના માનો! વધુ practice થી બધુ આવશે! 💪"
      }
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 flex items-center justify-center p-4 relative overflow-hidden">
        <StarParticles />

        <div className="bg-white rounded-3xl shadow-xl p-8 max-w-sm w-full text-center z-10 relative">
          {/* Animated Badge */}
          <div className="mb-6">
            <RewardBadge
              badge={quizResult.badge}
              badgeColor={quizResult.badgeColor}
              score={quizResult.score}
              totalQuestions={quizResult.totalQuestions}
            />
          </div>

          {/* Score Counter */}
          <div className="mb-6">
            <div className="text-4xl font-bold text-amber-600 mb-2">
              {quizResult.totalPoints} / 100
            </div>
            <p className="text-gray-600">પોઇન્ટ</p>
          </div>

          {/* Correct Count */}
          <p className="text-emerald-600 font-bold text-lg mb-4">
            {quizResult.score} માંથી {quizResult.totalQuestions} સાચા! 🎉
          </p>

          {/* Personalized Message */}
          <p className="text-gray-700 mb-6 leading-relaxed">
            {getGujaratiMessage()}
          </p>

          {/* Achievement Stars */}
          <div className="flex justify-center gap-1 mb-8">
            {Array.from({ length: 5 }, (_, i) => (
              <span
                key={i}
                className={`text-2xl ${i < quizResult.score ? 'text-amber-400' : 'text-gray-300'}`}
              >
                ⭐
              </span>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={restartQuiz}
              className="w-full bg-gradient-to-r from-violet-500 to-purple-600 text-white font-bold py-3 rounded-2xl press"
            >
              ફરી રમવાનું! 🔄
            </button>

            <button
              onClick={goToChat}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-3 rounded-2xl press"
            >
              VittSakhi સાથે વાત કરો 💬
            </button>
          </div>
        </div>
      </div>
    )
  }

  return null
}