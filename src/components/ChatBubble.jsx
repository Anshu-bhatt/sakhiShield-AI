import { useState, useEffect } from 'react'

export default function ChatBubble({
  message, onScanClick, onSpeak, canSpeak, isSpeaking, onStopSpeaking,
}) {
  const hasScan = message.content?.includes('[SHOW_SCAN_BUTTON]')
  const cleanText = message.content?.replace('[SHOW_SCAN_BUTTON]', '').trim()
  const isUser = message.role === 'user'
  const [in_, setIn] = useState(false)

  useEffect(() => { const t = setTimeout(() => setIn(true), 16); return () => clearTimeout(t) }, [])

  return (
    <div
      className={`flex mb-3 ${isUser ? 'justify-end' : 'justify-start'}`}
      style={{
        opacity: in_ ? 1 : 0,
        transform: in_ ? 'translateY(0) scale(1)' : 'translateY(12px) scale(.97)',
        transition: 'opacity .28s ease, transform .28s cubic-bezier(.2,.8,.4,1)',
      }}
    >
      {/* Bot avatar */}
      {!isUser && (
        <div className="flex-shrink-0 mr-2 mt-1 flex items-center justify-center rounded-full shadow-sm"
          style={{
            width: 32, height: 32, fontSize: 16,
            background: 'linear-gradient(135deg,#7C3AED,#6D28D9)'
          }}>
          🛡️
        </div>
      )}

      <div className={`flex flex-col gap-1.5 ${isUser ? 'items-end' : 'items-start'}`}
        style={{ maxWidth: '78%' }}>

        {/* Bubble */}
        <div
          className="px-4 py-3 text-sm font-semibold leading-relaxed"
          style={isUser
            ? {
              borderRadius: '18px 18px 4px 18px',
              background: 'linear-gradient(135deg,#7C3AED,#6D28D9)',
              color: '#fff',
              boxShadow: '0 2px 10px rgba(109,40,217,.28)',
            }
            : {
              borderRadius: '18px 18px 18px 4px',
              background: '#fff',
              color: '#1C1917',
              borderLeft: '3px solid #C4B5FD',
              boxShadow: '0 1px 6px rgba(0,0,0,.07)',
              border: '1px solid #F0EDE8',
              borderLeftWidth: 3,
              borderLeftColor: '#C4B5FD',
            }
          }
        >
          {cleanText?.split('\n').map((line, i, arr) => (
            <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
          ))}
        </div>

        {/* TTS controls */}
        {!isUser && canSpeak && (
          <div className="flex gap-2">
            <button onClick={onSpeak}
              className="press px-3 py-1.5 rounded-full text-xs font-bold"
              style={{ background: '#EDE9FE', border: '1px solid #C4B5FD', color: '#5B21B6', minHeight: 28 }}>
              🔊 સાંભળો
            </button>
            {isSpeaking && (
              <button onClick={onStopSpeaking}
                className="press px-3 py-1.5 rounded-full text-xs font-bold"
                style={{ background: '#F3F4F6', border: '1px solid #D1D5DB', color: '#374151', minHeight: 28 }}>
                ⏹ બંધ
              </button>
            )}
          </div>
        )}

        {/* Scan CTA */}
        {hasScan && !isUser && (
          <button onClick={onScanClick}
            className="press flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-extrabold text-white shadow-md"
            style={{ background: 'linear-gradient(135deg,#7C3AED,#6D28D9)' }}>
            <span>📎</span><span>અપલોડ અને સ્કેન કરો</span>
          </button>
        )}
      </div>

      {/* User avatar */}
      {isUser && (
        <div className="flex-shrink-0 ml-2 mt-1 flex items-center justify-center rounded-full shadow-sm"
          style={{
            width: 32, height: 32, fontSize: 16,
            background: 'linear-gradient(135deg,#F59E0B,#D97706)', color: 'white'
          }}>
          👩
        </div>
      )}
    </div>
  )
}