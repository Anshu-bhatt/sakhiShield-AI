// src/components/ListeningOverlay.jsx — CREATE this file

export default function ListeningOverlay({ isListening, transcript }) {
  if (!isListening) return null

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center pb-32">
      <div className="bg-white rounded-3xl p-6 mx-4 w-full max-w-sm text-center shadow-2xl">
        
        {/* Animated mic rings */}
        <div className="relative w-20 h-20 mx-auto mb-4">
          <div className="absolute inset-0 rounded-full bg-red-100 animate-ping opacity-75" />
          <div className="absolute inset-2 rounded-full bg-red-200 animate-ping opacity-50"
            style={{ animationDelay: '0.2s' }} />
          <div className="relative w-full h-full rounded-full bg-red-500 flex items-center justify-center">
            <span className="text-white text-3xl">🎤</span>
          </div>
        </div>

        <p className="text-gray-800 font-bold text-lg mb-1">
          સમધાય છે...
        </p>
        <p className="text-gray-500 text-sm mb-3">
          ગુજરાતી, હિંદી કે અંગ્રેજીમાં બોલો
        </p>

        {/* Live transcript */}
        {transcript && (
          <div className="bg-purple-50 rounded-2xl p-3 min-h-12">
            <p className="text-purple-700 text-sm font-medium">
              "{transcript}"
            </p>
          </div>
        )}

        {!transcript && (
          <div className="flex justify-center gap-1">
            {[0, 1, 2, 3, 4].map(i => (
              <div
                key={i}
                className="w-1.5 bg-purple-400 rounded-full animate-bounce"
                style={{
                  height: `${12 + Math.random() * 16}px`,
                  animationDelay: `${i * 100}ms`
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}