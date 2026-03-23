import { useState } from 'react'
import { submitQuiz } from '../api/Database_API'

export default function QuizQuestion({ quiz, onComplete, onBack }) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState({})
  const [loading, setLoading] = useState(false)

  const question = quiz.questions[currentQuestion]
  const isAnswered = answers[question.questionId] !== undefined

  const handleAnswer = (option) => {
    setAnswers({
      ...answers,
      [question.questionId]: option
    })
  }

  const handleNext = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const handlePrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    const answerArray = quiz.questions.map((q) => ({
      questionId: q.questionId,
      selectedAnswer: answers[q.questionId] || ''
    }))

    const results = await submitQuiz(quiz.quizId, answerArray)
    setLoading(false)
    onComplete(results)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 p-6">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={onBack}
          className="mb-6 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
        >
          ← પાછા જાઓ
        </button>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-purple-900 mb-2">{quiz.title}</h2>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-purple-600 h-2 rounded-full transition-all"
                style={{ width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              પ્રશ્ન {currentQuestion + 1}/{quiz.questions.length}
            </p>
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-6">{question.question}</h3>

            <div className="space-y-3">
              {question.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswer(option)}
                  className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                    answers[question.questionId] === option
                      ? 'border-purple-600 bg-purple-100'
                      : 'border-gray-200 bg-gray-50 hover:border-purple-400'
                  }`}
                >
                  <div className="flex items-center">
                    <div
                      className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                        answers[question.questionId] === option
                          ? 'border-purple-600 bg-purple-600'
                          : 'border-gray-400'
                      }`}
                    >
                      {answers[question.questionId] === option && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                    <span className="text-gray-800">{option}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-4 justify-between">
            <button
              onClick={handlePrev}
              disabled={currentQuestion === 0}
              className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← પાછું
            </button>

            <div className="flex gap-4">
              {currentQuestion < quiz.questions.length - 1 ? (
                <button
                  onClick={handleNext}
                  disabled={!isAnswered}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  આગલું →
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={loading || !isAnswered}
                  className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'પ્રસ્તુત કરી રહ્યું છે...' : 'સમાપ્ત કરો'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
