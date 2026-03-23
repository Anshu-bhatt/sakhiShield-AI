export default function QuizResults({ results, onBack }) {
  const passPercentage = 70
  const isPassed = results.percentage >= passPercentage

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-blue-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-8">
            {isPassed ? (
              <>
                <h1 className="text-5xl font-bold text-green-600 mb-4">🎉 ઉત્તમ!</h1>
                <p className="text-2xl text-gray-800">તમે પાસ કર્યા!</p>
              </>
            ) : (
              <>
                <h1 className="text-5xl font-bold text-orange-600 mb-4">📚 આગળ પણ છે</h1>
                <p className="text-2xl text-gray-800">ફરીથી પ્રયાસ કરો</p>
              </>
            )}
          </div>

          <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg p-8 mb-8">
            <div className="text-6xl font-bold text-purple-900 mb-2">{results.percentage}%</div>
            <div className="text-xl text-gray-700">
              {results.score}/{results.totalQuestions} સાચા જવાબ
            </div>
          </div>

          <div className="mb-8 text-left">
            <h3 className="text-xl font-bold text-gray-800 mb-4">જવાબોની સમીક્ષા:</h3>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {results.answers.map((answer, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-lg border-l-4 ${
                    answer.isCorrect
                      ? 'bg-green-50 border-green-500'
                      : 'bg-red-50 border-red-500'
                  }`}
                >
                  <p className="font-bold text-gray-800 mb-2">પ્રશ્ન {idx + 1}</p>
                  <p className="text-gray-700 mb-2">તમારો જવાબ: {answer.selectedAnswer}</p>
                  {!answer.isCorrect && (
                    <p className="text-green-700">સાચો જવાબ: {answer.correctAnswer}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={onBack}
              className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-lg font-bold"
            >
              ← પાછા જાઓ
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
