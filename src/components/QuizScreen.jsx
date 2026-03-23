import { useState, useEffect } from 'react'
import { getQuizzes, initializeQuizzes } from '../api/Database_API'
import QuizQuestion from './QuizQuestion'
import QuizResults from './QuizResults'
import QuizHistory from './QuizHistory'

export default function QuizScreen() {
  const [quizzes, setQuizzes] = useState([])
  const [selectedQuiz, setSelectedQuiz] = useState(null)
  const [showResults, setShowResults] = useState(false)
  const [quizResults, setQuizResults] = useState(null)
  const [showHistory, setShowHistory] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadQuizzes()
  }, [])

  const loadQuizzes = async () => {
    setLoading(true)
    await initializeQuizzes()
    const data = await getQuizzes()
    setQuizzes(data || [])
    setLoading(false)
  }

  if (loading) {
    return <div className="p-6 text-center">લોડ થઈ રહ્યું છે...</div>
  }

  if (showHistory) {
    return <QuizHistory onBack={() => setShowHistory(false)} />
  }

  if (selectedQuiz && !showResults) {
    return (
      <QuizQuestion
        quiz={selectedQuiz}
        onComplete={(results) => {
          setQuizResults(results)
          setShowResults(true)
        }}
        onBack={() => setSelectedQuiz(null)}
      />
    )
  }

  if (showResults && quizResults) {
    return (
      <QuizResults
        results={quizResults}
        onBack={() => {
          setShowResults(false)
          setQuizResults(null)
          setSelectedQuiz(null)
        }}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-purple-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-purple-900 mb-2">🧠 ક્વિઝ</h1>
        <p className="text-gray-600 mb-6">તમારું જ્ઞાન પરીક્ષણ કરો અને શીખો</p>

        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setShowHistory(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            📊 મારાં પરિણામ
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {quizzes.map((quiz) => (
            <div
              key={quiz.quizId}
              className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
              onClick={() => setSelectedQuiz(quiz)}
            >
              <h3 className="text-xl font-bold text-purple-900 mb-2">{quiz.title}</h3>
              <p className="text-gray-600 mb-4">{quiz.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  {quiz.questions.length} પ્રશ્નો
                </span>
                <button className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600">
                  શરૂ કરો
                </button>
              </div>
            </div>
          ))}
        </div>

        {quizzes.length === 0 && (
          <div className="max-w-2xl mx-auto p-12 text-center">
            <p className="text-gray-500 text-lg">કોઈ ક્વિઝ ઉપલબ્ધ નથી</p>
          </div>
        )}
      </div>
    </div>
  )
}
