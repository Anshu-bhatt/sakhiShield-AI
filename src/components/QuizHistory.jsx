import { useState, useEffect } from 'react'
import { getQuizHistory } from '../api/Database_API'

export default function QuizHistory({ onBack }) {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadHistory()
  }, [])

  const loadHistory = async () => {
    setLoading(true)
    const data = await getQuizHistory()
    setHistory(data || [])
    setLoading(false)
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('gu-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return <div className="p-6 text-center">લોડ થઈ રહ્યું છે...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 p-6">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={onBack}
          className="mb-6 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
        >
          ← પાછા જાઓ
        </button>

        <h1 className="text-3xl font-bold text-purple-900 mb-2">📊 મારાં પરિણામ</h1>
        <p className="text-gray-600 mb-6">તમારી ક્વિઝ હિસ્ટરી</p>

        {history.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center shadow-lg">
            <p className="text-gray-500 text-lg">અજ્ઞાત ક્વિઝ પરીણામ</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {history.map((record, idx) => {
              const isPassed = record.percentage >= 70
              return (
                <div
                  key={idx}
                  className={`bg-white rounded-lg p-6 shadow-lg border-l-4 ${
                    isPassed ? 'border-green-500' : 'border-orange-500'
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">ક્વિઝ #{record.quizId}</h3>
                      <p className="text-sm text-gray-500">{formatDate(record.completedAt)}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-purple-900">
                        {record.percentage}%
                      </div>
                      <p className="text-sm text-gray-600">
                        {record.score}/{record.totalQuestions}
                      </p>
                    </div>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all ${
                        isPassed ? 'bg-green-500' : 'bg-orange-500'
                      }`}
                      style={{ width: `${record.percentage}%` }}
                    ></div>
                  </div>

                  <div className="mt-4 text-sm">
                    {isPassed ? (
                      <span className="text-green-600 font-bold">✅ પાસ</span>
                    ) : (
                      <span className="text-orange-600 font-bold">📚 ફરીથી પ્રયાસ કરો</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {history.length > 0 && (
          <div className="mt-8 bg-white rounded-lg p-6 shadow-lg">
            <h3 className="font-bold text-gray-800 mb-4">📈 સારાંશ</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-gray-600 text-sm">કુલ ક્વિઝ</p>
                <p className="text-3xl font-bold text-purple-900">{history.length}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">સરેરાશ સ્કોર</p>
                <p className="text-3xl font-bold text-blue-900">
                  {Math.round(history.reduce((sum, r) => sum + r.percentage, 0) / history.length)}%
                </p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">પાસ કર્યા</p>
                <p className="text-3xl font-bold text-green-900">
                  {history.filter((r) => r.percentage >= 70).length}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
