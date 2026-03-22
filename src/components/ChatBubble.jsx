export default function ChatBubble({
  message,
  onScanClick,
  onSpeak,
  canSpeak,
  isSpeaking,
  onStopSpeaking
}) {

  // Check if Claude wants to show scan button
  const showScanButton = message.content?.includes('[SHOW_SCAN_BUTTON]')
  const cleanContent = message.content?.replace('[SHOW_SCAN_BUTTON]', '').trim()

  const isUser = message.role === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      
      {/* Avatar for assistant */}
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-purple-700 flex items-center justify-center text-white text-sm mr-2 mt-1 flex-shrink-0">
          🛡️
        </div>
      )}

      <div className={`max-w-[78%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-2`}>
        
        {/* Message bubble */}
        <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
          isUser
            ? 'bg-purple-600 text-white rounded-br-none'
            : 'bg-white text-gray-800 shadow-sm rounded-bl-none border border-gray-100'
        }`}>
          {cleanContent}
        </div>

        {/* Text-to-speech controls for assistant messages */}
        {!isUser && canSpeak && (
          <div className="flex gap-2">
            <button
              onClick={onSpeak}
              className="text-xs bg-purple-50 border border-purple-200 text-purple-700 px-3 py-1 rounded-full"
            >
              🔊 સાંભળો
            </button>
            {isSpeaking && (
              <button
                onClick={onStopSpeaking}
                className="text-xs bg-gray-100 border border-gray-300 text-gray-700 px-3 py-1 rounded-full"
              >
                ⏹ બંધ
              </button>
            )}
          </div>
        )}

        {/* Scan button if needed */}
        {showScanButton && !isUser && (
          <button
            onClick={onScanClick}
            className="bg-purple-700 text-white px-4 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 shadow-md active:scale-95 transition-transform"
          >
            <span>📎</span>
            <span>અપલોડ અને સ્કેન કરો</span>
          </button>
        )}
      </div>
    </div>
  )
}