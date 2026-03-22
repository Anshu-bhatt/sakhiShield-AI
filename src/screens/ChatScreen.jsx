import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { sendToClaude } from '../api/Grok_API'
import ChatBubble from '../components/ChatBubble'
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
  const synthRef = useRef(null)
  const audioRef = useRef(null)
  const audioUrlRef = useRef('')
  const previousLengthRef = useRef(1)

  const [messages, setMessages] = useState([WELCOME_MESSAGE])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [showQuickReplies, setShowQuickReplies] = useState(true)
  const [liveTranscript, setLiveTranscript] = useState('')
  const [selectedLang, setSelectedLang] = useState('gu-IN')
  const [ttsEnabled, setTtsEnabled] = useState(true)
  const [isTtsSupported, setIsTtsSupported] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [hasGujaratiVoice, setHasGujaratiVoice] = useState(false)

  const cleanForSpeech = useCallback((text = '') => {
    let normalized = text.replace('[SHOW_SCAN_BUTTON]', ' ')

    // Remove all emojis/symbols so TTS does not narrate emoji names.
    normalized = normalized
      .replace(/[\p{Extended_Pictographic}\uFE0F\u200D]/gu, ' ')
      .replace(/[*_`~#>|]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()

    return normalized
  }, [])

  const stopSpeaking = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel()
    }

    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      audioRef.current = null
    }

    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current)
      audioUrlRef.current = ''
    }

    setIsSpeaking(false)
  }, [])

  const speakText = useCallback(async (text) => {
    const content = cleanForSpeech(text)
    if (!content) return

    stopSpeaking()

    if (synthRef.current && hasGujaratiVoice) {
      const utterance = new SpeechSynthesisUtterance(content)
      utterance.lang = 'gu-IN'
      utterance.rate = 1
      utterance.pitch = 1

      const voices = synthRef.current.getVoices()
      if (voices.length) {
        const preferredVoice = voices.find(v => v.lang === 'gu-IN')
          || voices.find(v => v.lang?.startsWith('gu'))
        if (preferredVoice) utterance.voice = preferredVoice
      }

      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => setIsSpeaking(false)
      utterance.onerror = () => setIsSpeaking(false)

      synthRef.current.speak(utterance)
      return
    }

    // Cloud fallback for systems without Gujarati browser voices.
    const response = await fetch('http://localhost:5000/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: content, lang: 'gu' })
    })

    if (!response.ok) {
      throw new Error(`TTS backend error: ${response.status}`)
    }

    const audioBlob = await response.blob()
    const objectUrl = URL.createObjectURL(audioBlob)
    const audio = new Audio(objectUrl)

    audioUrlRef.current = objectUrl
    audioRef.current = audio

    audio.onplay = () => setIsSpeaking(true)
    audio.onended = () => {
      setIsSpeaking(false)
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current)
        audioUrlRef.current = ''
      }
    }
    audio.onerror = () => {
      setIsSpeaking(false)
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current)
        audioUrlRef.current = ''
      }
    }

    await audio.play()
  }, [cleanForSpeech, hasGujaratiVoice, stopSpeaking])

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

  // Initialize text-to-speech support
  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    // Cloud TTS fallback exists, so feature is considered supported in modern browsers.
    setIsTtsSupported(true)

    if (!('speechSynthesis' in window)) {
      return () => {
        stopSpeaking()
      }
    }

    synthRef.current = window.speechSynthesis

    const updateVoiceAvailability = () => {
      const voices = synthRef.current?.getVoices() || []
      const gujaratiAvailable = voices.some(v =>
        v.lang === 'gu-IN' || v.lang?.toLowerCase().startsWith('gu')
      )
      setHasGujaratiVoice(gujaratiAvailable)
    }

    window.speechSynthesis.addEventListener('voiceschanged', updateVoiceAvailability)
    updateVoiceAvailability()

    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', updateVoiceAvailability)
      stopSpeaking()
    }
  }, [stopSpeaking])

  // Auto-read new assistant messages when TTS is enabled.
  useEffect(() => {
    if (!ttsEnabled || !isTtsSupported || loading) {
      previousLengthRef.current = messages.length
      return
    }

    if (messages.length <= previousLengthRef.current) {
      previousLengthRef.current = messages.length
      return
    }

    const lastMessage = messages[messages.length - 1]
    if (lastMessage?.role === 'assistant') {
      void speakText(lastMessage.content)
    }

    previousLengthRef.current = messages.length
  }, [messages, loading, ttsEnabled, isTtsSupported, speakText])

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
        {isTtsSupported && (
          <button
            onClick={() => {
              if (isSpeaking) stopSpeaking()
              setTtsEnabled(prev => !prev)
            }}
            className={`text-xs px-3 py-2 rounded-full font-bold ${
              ttsEnabled
                ? 'bg-white text-purple-700'
                : 'bg-purple-500 text-white'
            }`}
          >
            {ttsEnabled ? '🔊 અવાજ ચાલુ' : '🔇 અવાજ બંધ'}
          </button>
        )}
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
            onSpeak={() => void speakText(msg.content)}
            canSpeak={isTtsSupported && msg.role === 'assistant'}
            isSpeaking={isSpeaking}
            onStopSpeaking={stopSpeaking}
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