import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { sendToClaude } from '../api/Grok_API'
import ChatBubble from '../components/chatBubble'
import TypingIndicator from '../components/TypingIndicator'
import SafetyTipBanner from '../components/SafetyTipBanner'
import MicButton from '../components/MicButton'
import LanguageSelector from '../components/LanguageSelector'
import ListeningOverlay from '../components/ListeningOverlay'
import { useSpeechRecognition } from '../hooks/useSpeechRecognition'
import { QUICK_REPLIES, WELCOME_MESSAGE } from '../data/chatData'

export default function ChatScreen() {
  const navigate = useNavigate()
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  const [messages, setMessages] = useState([WELCOME_MESSAGE])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [showQuickReplies, setShowQuickReplies] = useState(true)
  const [liveTranscript, setLiveTranscript] = useState('')
  const [selectedLang, setSelectedLang] = useState('gu-IN')

  // Define handleSend as useCallback first
  const handleSend = useCallback(async (text) => {
    const userText = (text || input).trim()
    if (!userText || loading) return

    setInput('')
    setShowQuickReplies(false)
    setLoading(true)

    // Add user message
    const userMsg = { role: 'user', content: userText, id: Date.now() }
    const updatedMessages = [...messages, userMsg]
    setMessages(updatedMessages)

    // Build history for Claude (exclude welcome id, only role+content)
    const history = updatedMessages
      .filter(m => m.id !== 'welcome')
      .map(m => ({ role: m.role, content: m.content }))

    // Get Claude reply
    const reply = await sendToClaude(history)

    setMessages(prev => [
      ...prev,
      { role: 'assistant', content: reply, id: Date.now() + 1 }
    ])
    setLoading(false)
  }, [input, loading, messages])

  // Memoized callback for speech result
  const handleSpeechResult = useCallback((transcript, isFinal) => {
    setLiveTranscript(transcript)
    if (isFinal && transcript.trim()) {
      setInput(transcript)
      setLiveTranscript('')
      // Auto send after voice
      setTimeout(() => handleSend(transcript), 300)
    }
  }, [handleSend])

  // Memoized callback for speech error
  const handleSpeechError = useCallback((msg) => {
    setLiveTranscript('')
    // Show error as bot message
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: msg,
      id: Date.now()
    }])
  }, [])

  // Speech recognition hook
  const { isListening, isSupported, startListening, stopListening, toggleLanguage } =
    useSpeechRecognition({
      onResult: handleSpeechResult,
      onError: handleSpeechError
    })

  // Language change handler
  function handleLanguageChange(langCode) {
    setSelectedLang(langCode)
    toggleLanguage(langCode)
  }

  // Auto scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">

      {/* ── Header ── */}
      <div className="bg-purple-700 text-white px-4 py-3 flex items-center gap-3 shadow-md">
        <button
          onClick={() => navigate('/')}
          className="text-white text-xl p-1"
        >
          ←
        </button>
        <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-xl">
          🛡️
        </div>
        <div className="flex-1">
          <div className="font-bold text-base">VittSakhi</div>
          <div className="text-xs text-purple-200">તમારી AI સખી 🟢 ઑનલાઈન</div>
        </div>
        <button
          onClick={() => navigate('/scan')}
          className="bg-purple-500 text-white text-xs px-3 py-2 rounded-full font-bold"
        >
          📎 સ્કેન
        </button>
      </div>

      {/* ── Safety Tip Banner ── */}
      <SafetyTipBanner />

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-2">

        {/* Quick Reply chips — show only at start */}
        {showQuickReplies && (
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2 text-center">
              — પ્રશ્ન પુછો અથવા નીચેથી પસંદ કરો —
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {QUICK_REPLIES.map(q => (
                <button
                  key={q.id}
                  onClick={() => handleSend(q.text)}
                  className="bg-purple-50 border border-purple-300 text-purple-700 text-xs px-3 py-2 rounded-full font-medium active:bg-purple-100 transition-colors"
                >
                  {q.emoji} {q.text}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message list */}
        {messages.map(msg => (
          <ChatBubble
            key={msg.id}
            message={msg}
            onScanClick={() => navigate('/scan')}
          />
        ))}

        {/* Typing indicator */}
        {loading && <TypingIndicator />}

        <div ref={bottomRef} />
      </div>

      {/* ── Input Area ── */}
      <div className="bg-white border-t border-gray-200 px-3 py-2">

        {/* Language selector row */}
        <div className="flex justify-end mb-2">
          <LanguageSelector
            selected={selectedLang}
            onChange={handleLanguageChange}
          />
        </div>

        {/* Input row */}
        <div className="flex items-end gap-2">

          {/* Attach/Scan button */}
          <button
            onClick={() => navigate('/scan')}
            className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-xl flex-shrink-0"
          >
            📎
          </button>

          {/* Text input */}
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="બોલો 🎤 અથવા ટાઇપ કરો..."
            rows={1}
            className="flex-1 border border-gray-300 rounded-2xl px-4 py-2 text-sm outline-none resize-none focus:border-purple-400 max-h-24"
            style={{ lineHeight: '1.5' }}
          />

          {/* Mic button */}
          <MicButton
            isListening={isListening}
            isSupported={isSupported}
            onPress={startListening}
            onRelease={stopListening}
          />

          {/* Send button */}
          <button
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            className={`w-10 h-10 rounded-full flex items-center justify-center text-white flex-shrink-0 transition-colors ${
              input.trim() && !loading
                ? 'bg-purple-700 active:bg-purple-800'
                : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            ➤
          </button>
        </div>
      </div>

      {/* Listening overlay — outside input area */}
      <ListeningOverlay
        isListening={isListening}
        transcript={liveTranscript}
      />
    </div>
  )
}