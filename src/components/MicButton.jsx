// src/components/MicButton.jsx — CREATE this file

export default function MicButton({ isListening, isSupported, onPress, onRelease }) {
  if (!isSupported) return null

  return (
    <button
      onMouseDown={onPress}
      onMouseUp={onRelease}
      onTouchStart={onPress}
      onTouchEnd={onRelease}
      className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
        isListening
          ? 'bg-red-500 scale-110 shadow-lg shadow-red-300 animate-pulse'
          : 'bg-purple-100 active:bg-purple-200'
      }`}
      title={isListening ? 'સમધાય છે...' : 'બોલો'}
    >
      {isListening ? (
        <span className="text-white text-lg">🔴</span>
      ) : (
        <span className="text-purple-600 text-lg">🎤</span>
      )}
    </button>
  )
}