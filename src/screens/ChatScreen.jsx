import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { sendToClaude } from '../api/Grok_API'
import ChatBubble from '../components/ChatBubble'
import TypingIndicator from '../components/TypingIndicator'
import MicButton from '../components/MicButton'
import LanguageSelector from '../components/LanguageSelector'
import ListeningOverlay from '../components/ListeningOverlay'
import { useSpeechRecognition } from '../hooks/useSpeechRecognition'
import { QUICK_REPLIES, WELCOME_MESSAGE, SAFETY_TIPS } from '../data/chatData'

/* ─── Safety tip banner ──────────────────────────────── */
function SafetyTipBanner() {
  const [idx, setIdx] = useState(0)
  const [show, setShow] = useState(true)

  useEffect(() => {
    const id = setInterval(() => {
      setShow(false)
      setTimeout(() => { setIdx(i => (i + 1) % SAFETY_TIPS.length); setShow(true) }, 380)
    }, 4200)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="flex items-center gap-2 px-4 py-2 flex-shrink-0"
      style={{ background: '#FFFBEB', borderBottom: '1px solid #FDE68A' }}>
      <span className="text-sm flex-shrink-0">💡</span>
      <p
        className={`text-xs font-semibold flex-1 min-w-0 truncate tip-text ${show ? '' : 'tip-hide'}`}
        style={{ color: '#92400E' }}
      >
        {SAFETY_TIPS[idx]}
      </p>
    </div>
  )
}

/* ─── Achievement toast ──────────────────────────────── */
function Toast({ msg, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3000); return () => clearTimeout(t) }, [onDone])
  return (
    <div className="fixed z-50 anim-toast"
      style={{ top: 14, left: '50%', transform: 'translateX(-50%)', width: 'calc(100% - 32px)', maxWidth: 440 }}>
      <div className="flex items-center gap-3 px-5 py-4 rounded-2xl shadow-xl font-bold text-white text-sm leading-relaxed"
        style={{ background: 'linear-gradient(135deg,#F59E0B,#D97706)' }}>
        <span className="text-2xl">🎉</span>
        <span>{msg}</span>
      </div>
    </div>
  )
}

/* ══ CHAT SCREEN ════════════════════════════════════════════════ */
export default function ChatScreen() {
  const navigate = useNavigate()
  const bottomRef = useRef(null)
  const inputRef = useRef(null)
  const synthRef = useRef(null)
  const audioRef = useRef(null)
  const audioUrlRef = useRef('')
  const prevLenRef = useRef(1)

  const [messages, setMessages] = useState([WELCOME_MESSAGE])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [showChips, setShowChips] = useState(true)
  const [activeChip, setActiveChip] = useState(null)
  const [liveTranscript, setLiveTranscript] = useState('')
  const [selectedLang, setSelectedLang] = useState('gu-IN')
  const [ttsEnabled, setTtsEnabled] = useState(true)
  const [isTtsSupported, setIsTtsSupported] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [hasGujVoice, setHasGujVoice] = useState(false)
  const [toast, setToast] = useState(false)
  const firstChat = useRef(false)

  /* ─── TTS helpers ─── */
  const clean = useCallback((t = '') =>
    t.replace('[SHOW_SCAN_BUTTON]', ' ')
      .replace(/[\p{Extended_Pictographic}\uFE0F\u200D]/gu, ' ')
      .replace(/[*_`~#>|]/g, ' ')
      .replace(/\s+/g, ' ').trim()
    , [])

  const stopSpeaking = useCallback(() => {
    synthRef.current?.cancel()
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null }
    if (audioUrlRef.current) { URL.revokeObjectURL(audioUrlRef.current); audioUrlRef.current = '' }
    setIsSpeaking(false)
  }, [])

  const speakText = useCallback(async (text) => {
    const content = clean(text)
    if (!content) return
    stopSpeaking()
    if (synthRef.current && hasGujVoice) {
      const u = new SpeechSynthesisUtterance(content)
      u.lang = 'gu-IN'; u.rate = 1; u.pitch = 1
      const v = synthRef.current.getVoices()
      const pv = v.find(x => x.lang === 'gu-IN') || v.find(x => x.lang?.startsWith('gu'))
      if (pv) u.voice = pv
      u.onstart = () => setIsSpeaking(true)
      u.onend = u.onerror = () => setIsSpeaking(false)
      synthRef.current.speak(u)
      return
    }
    try {
      const r = await fetch('http://localhost:5000/api/tts', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: content, lang: 'gu' }),
      })
      if (!r.ok) return
      const blob = await r.blob()
      const url = URL.createObjectURL(blob)
      const a = new Audio(url)
      audioUrlRef.current = url; audioRef.current = a
      a.onplay = () => setIsSpeaking(true)
      a.onended = a.onerror = () => { setIsSpeaking(false); URL.revokeObjectURL(url); audioUrlRef.current = '' }
      await a.play()
    } catch { /* silent */ }
  }, [clean, hasGujVoice, stopSpeaking])

  /* ─── Send ─── */
  const handleSend = useCallback(async (text) => {
    const userText = (text || input).trim()
    if (!userText || loading) return
    setInput('')
    setShowChips(false)
    setActiveChip(null)
    setLoading(true)
    const userMsg = { role: 'user', content: userText, id: Date.now() }
    const updated = [...messages, userMsg]
    setMessages(updated)
    const history = updated.filter(m => m.id !== 'welcome').map(m => ({ role: m.role, content: m.content }))
    const reply = await sendToClaude(history)
    setMessages(prev => [...prev, { role: 'assistant', content: reply, id: Date.now() + 1 }])
    setLoading(false)
    if (!firstChat.current) { firstChat.current = true; setTimeout(() => setToast(true), 700) }
  }, [input, loading, messages])

  /* ─── Speech ─── */
  const handleSpeechResult = useCallback((tr, isFinal) => {
    setLiveTranscript(tr)
    if (isFinal && tr.trim()) { setInput(tr); setLiveTranscript(''); setTimeout(() => handleSend(tr), 300) }
  }, [handleSend])

  const handleSpeechError = useCallback((msg) => {
    setLiveTranscript('')
    setMessages(prev => [...prev, { role: 'assistant', content: msg, id: Date.now() }])
  }, [])

  const { isListening, isSupported, startListening, stopListening, toggleLanguage } =
    useSpeechRecognition({ onResult: handleSpeechResult, onError: handleSpeechError })

  function handleLangChange(code) { setSelectedLang(code); toggleLanguage(code) }

  /* ─── TTS init ─── */
  useEffect(() => {
    if (typeof window === 'undefined') return
    setIsTtsSupported(true)
    if (!('speechSynthesis' in window)) return () => stopSpeaking()
    synthRef.current = window.speechSynthesis
    const update = () => {
      const v = synthRef.current?.getVoices() || []
      setHasGujVoice(v.some(x => x.lang === 'gu-IN' || x.lang?.toLowerCase().startsWith('gu')))
    }
    window.speechSynthesis.addEventListener('voiceschanged', update)
    update()
    return () => { window.speechSynthesis.removeEventListener('voiceschanged', update); stopSpeaking() }
  }, [stopSpeaking])

  /* ─── Auto-speak new assistant messages ─── */
  useEffect(() => {
    if (!ttsEnabled || !isTtsSupported || loading) { prevLenRef.current = messages.length; return }
    if (messages.length <= prevLenRef.current) { prevLenRef.current = messages.length; return }
    const last = messages[messages.length - 1]
    if (last?.role === 'assistant') void speakText(last.content)
    prevLenRef.current = messages.length
  }, [messages, loading, ttsEnabled, isTtsSupported, speakText])

  /* ─── Scroll ─── */
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, loading])

  function onKeyDown(e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }

  return (
    <div className="flex flex-col" style={{ height: '100svh', height: '100vh', background: '#FAFAF9' }}>

      {toast && <Toast msg="🎉 Pehlo chat done! Smart cho tame! 💜" onDone={() => setToast(false)} />}

      {/* ══ HEADER ══ */}
      <div
        className="flex items-center gap-3 px-4 py-3 flex-shrink-0"
        style={{ background: 'linear-gradient(to right,#7C3AED,#6D28D9)', boxShadow: '0 2px 12px rgba(109,40,217,.35)' }}
      >
        {/* Back */}
        <button
          onClick={() => navigate('/')}
          className="press flex items-center justify-center rounded-xl text-white font-bold text-lg"
          style={{ width: 38, height: 38, background: 'rgba(255,255,255,.15)', flexShrink: 0 }}
        >←</button>

        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div
            className="flex items-center justify-center rounded-full"
            style={{
              width: 44, height: 44, fontSize: 22,
              background: 'linear-gradient(135deg,rgba(255,255,255,.28),rgba(255,255,255,.1))',
              border: '2px solid rgba(255,255,255,.32)',
            }}
          >🛡️</div>
          {/* Online dot */}
          <div className="absolute -bottom-0.5 -right-0.5 rounded-full"
            style={{ width: 14, height: 14, background: '#10B981', border: '2px solid #6D28D9' }}>
            <div className="online-ring" />
          </div>
        </div>

        {/* Title */}
        <div className="flex-1 min-w-0">
          <p className="font-black text-white text-base leading-tight">VittSakhi</p>
          <p className="text-xs font-semibold" style={{ color: '#C4B5FD' }}>Tamari Banking Sakhi</p>
        </div>

        {/* Scan pill */}
        <button
          onClick={() => navigate('/scan')}
          className="press font-black text-xs rounded-full px-3 py-2 flex-shrink-0"
          style={{ background: '#F59E0B', color: '#1C1917', minHeight: 36 }}
        >📎 Scan</button>

        {/* TTS toggle */}
        {isTtsSupported && (
          <button
            onClick={() => { if (isSpeaking) stopSpeaking(); setTtsEnabled(p => !p) }}
            className="press rounded-xl flex items-center justify-center text-lg flex-shrink-0"
            style={{
              width: 38, height: 38,
              background: ttsEnabled ? 'rgba(255,255,255,.9)' : 'rgba(255,255,255,.15)',
              color: ttsEnabled ? '#7C3AED' : 'white',
            }}
          >{ttsEnabled ? '🔊' : '🔇'}</button>
        )}
      </div>

      {/* Safety tip */}
      <SafetyTipBanner />

      {/* ══ MESSAGES ══ */}
      <div className="flex-1 overflow-y-auto px-4 pt-3 pb-2" style={{ overscrollBehavior: 'contain' }}>

        {/* Quick-reply chips row — shown before first send */}
        {showChips && (
          <div className="mb-4">
            <p className="text-center text-xs font-semibold mb-2" style={{ color: '#A8A29E' }}>
              — પ્રશ્ન પૂછો અથવા નીચેથી પસંદ કરો —
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {QUICK_REPLIES.map(q => (
                <button
                  key={q.id}
                  onClick={() => { setActiveChip(q.id); handleSend(q.text) }}
                  className="press text-xs font-bold px-3 py-2 rounded-full"
                  style={{
                    minHeight: 36,
                    background: activeChip === q.id ? '#7C3AED' : '#EDE9FE',
                    border: `1.5px solid ${activeChip === q.id ? '#7C3AED' : '#C4B5FD'}`,
                    color: activeChip === q.id ? '#fff' : '#5B21B6',
                    transition: 'all .2s ease',
                  }}
                >
                  {q.emoji} {q.text}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
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

        {loading && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* ══ INPUT AREA ══ */}
      <div className="flex-shrink-0 bg-white px-3 py-3"
        style={{ borderTop: '1px solid #EDE9FE', boxShadow: '0 -2px 12px rgba(124,58,237,.07)' }}>

        {/* Language selector */}
        <div className="flex justify-end mb-2">
          <LanguageSelector selected={selectedLang} onChange={handleLangChange} />
        </div>

        {/* Row */}
        <div className="flex items-center gap-2">

          {/* Attachment */}
          <button
            onClick={() => navigate('/scan')}
            className="press flex items-center justify-center rounded-2xl text-xl flex-shrink-0"
            style={{ width: 44, height: 44, background: '#EDE9FE' }}
          >📎</button>

          {/* Input */}
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="બોલો 🎤 અથવા ટાઇપ કરો..."
            className="flex-1 min-w-0 text-sm font-semibold outline-none rounded-full px-4"
            style={{
              height: 44,
              border: `1.5px solid ${input ? '#7C3AED' : '#E5E7EB'}`,
              boxShadow: input ? '0 0 0 3px #EDE9FE' : 'none',
              transition: 'border-color .2s, box-shadow .2s',
              background: '#FAFAF9',
              color: '#1C1917',
            }}
          />

          {/* Mic */}
          <div className="relative flex-shrink-0">
            {isListening && <>
              <div className="mic-ring" />
              <div className="mic-ring mic-ring-2" />
            </>}
            <MicButton
              isListening={isListening}
              isSupported={isSupported}
              onPress={startListening}
              onRelease={stopListening}
            />
          </div>

          {/* Send */}
          <button
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            className="press flex items-center justify-center rounded-2xl text-white flex-shrink-0"
            style={{
              width: 44, height: 44,
              background: input.trim() && !loading ? 'linear-gradient(135deg,#7C3AED,#6D28D9)' : '#D1D5DB',
              transition: 'background .2s',
              cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 2L11 13" /><path d="M22 2L15 22 11 13 2 9l20-7z" />
            </svg>
          </button>
        </div>
      </div>

      <ListeningOverlay isListening={isListening} transcript={liveTranscript} />
    </div>
  )
}