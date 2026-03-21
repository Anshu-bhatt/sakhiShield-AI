export default function TypingIndicator() {
  return (
    <div className="flex justify-start mb-3">
      <div className="w-8 h-8 rounded-full bg-purple-700 flex items-center justify-center text-white text-sm mr-2 flex-shrink-0">
        🛡️
      </div>
      <div className="bg-white shadow-sm border border-gray-100 px-4 py-3 rounded-2xl rounded-bl-none">
        <div className="flex gap-1 items-center">
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}} />
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}} />
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}} />
        </div>
      </div>
    </div>
  )
}