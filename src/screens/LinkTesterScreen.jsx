import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

export default function LinkTesterScreen() {
  const navigate = useNavigate()
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const analyzeLink = useCallback(async () => {
    if (!url.trim()) {
      alert('કૃપા કરીને લિંક paste કરો')
      return
    }

    let finalUrl = url.trim()

    // Auto-add https:// if protocol is missing
    if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      finalUrl = 'https://' + finalUrl
    }

    // Basic URL validation with auto-correction
    try {
      new URL(finalUrl)
    } catch {
      alert('અયોગ્ય લિંક! કૃપા કરીને સાચી URL paste કરો\nExample: google.com અથવા https://google.com')
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const response = await fetch(`${API_BASE_URL}/api/analyze-link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: finalUrl,  // Use the corrected URL
          language: 'gujarati'
        })
      })

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`)
      }

      const data = await response.json()
      setResult(data)

    } catch (error) {
      console.error('❌ Link analysis failed:', error)
      setResult({
        isSafe: false,
        riskLevel: 'unknown',
        message: 'તકનીકી સમસ્યા આવી. કૃપા કરીને બીજી વખત પ્રયાસ કરો 🔄',
        details: ['ઇન્ટરનેટ કનેક્શન ચકાસો', 'થોડી વાર પછી પ્રયાસ કરો'],
        recommendations: ['આ લિંક પર click ન કરો', 'કોઈ માહિતી share ન કરો']
      })
    } finally {
      setLoading(false)
    }
  }, [url])

  const clearAll = () => {
    setUrl('')
    setResult(null)
  }

  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case 'safe': return '#059669'      // Green
      case 'low': return '#D97706'       // Orange
      case 'medium': return '#DC2626'    // Red
      case 'high': return '#991B1B'      // Dark red
      default: return '#78716C'          // Gray
    }
  }

  const getRiskEmoji = (riskLevel) => {
    switch (riskLevel) {
      case 'safe': return '✅'
      case 'low': return '⚠️'
      case 'medium': return '🚨'
      case 'high': return '☠️'
      default: return '❓'
    }
  }

  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#FAFAF9' }}>

      {/* Header */}
      <div
        className="relative pt-12 pb-8 px-6 flex items-center overflow-hidden flex-shrink-0"
        style={{ background: 'linear-gradient(150deg,#DC2626 0%,#B91C1C 55%,#991B1B 100%)' }}
      >
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute left-4 top-12 w-10 h-10 rounded-full flex items-center justify-center text-white press"
          style={{ background: 'rgba(255,255,255,0.2)' }}
        >
          ←
        </button>

        {/* Decorative elements */}
        <div className="absolute top-3 right-3 w-20 h-20 rounded-full pointer-events-none"
          style={{ background: 'rgba(255,255,255,.08)' }} />

        <div className="flex-1 text-center">
          {/* Security shield icon */}
          <div
            className="mx-auto mb-4 flex items-center justify-center"
            style={{
              width: 80, height: 80, borderRadius: '50%',
              background: 'rgba(255,255,255,.16)',
              border: '2px solid rgba(255,255,255,.28)',
              backdropFilter: 'blur(6px)',
              fontSize: 36,
            }}
          >
            🔗
          </div>

          <h1 className="text-white font-black text-2xl tracking-tight leading-tight">
            લિંક ટેસ્ટર
          </h1>
          <p className="mt-2 font-semibold text-sm" style={{ color: '#FCA5A5' }}>
            શંકાસ્પદ લિંક ચકાસો 🔍
          </p>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 px-4 pt-6">

        {/* Instructions */}
        <div className="mb-6 p-4 rounded-2xl" style={{ background: '#FEF3C7', border: '1px solid #FDE68A' }}>
          <div className="flex items-start gap-3">
            <span className="text-xl flex-shrink-0 mt-0.5">💡</span>
            <div>
              <p className="font-bold text-sm mb-2" style={{ color: '#92400E' }}>
                કેવી રીતે વાપરવું:
              </p>
              <ul className="text-xs font-medium space-y-1" style={{ color: '#B45309' }}>
                <li>1. WhatsApp લિંક copy કરો</li>
                <li>2. નીચે paste કરો (https:// ની જરૂર નથી)</li>
                <li>3. "ચકાસો" button દબાવો</li>
                <li>4. પરિણામ જુઓ અને સલાહ અનુસરો</li>
              </ul>
            </div>
          </div>
        </div>

        {/* URL Input */}
        <div className="mb-6">
          <label className="block font-bold text-sm mb-2" style={{ color: '#374151' }}>
            લિંક અહીં paste કરો:
          </label>
          <div className="relative">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="bit.ly/suspicious-link અથવા google.com"
              className="w-full px-4 py-3 rounded-xl border-2 font-medium text-sm"
              style={{
                borderColor: url ? '#7C3AED' : '#E5E7EB',
                background: '#FFFFFF',
                color: '#374151'
              }}
              disabled={loading}
            />
            {url && (
              <button
                onClick={clearAll}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center press"
                style={{ background: '#F3F4F6', color: '#6B7280' }}
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={analyzeLink}
            disabled={loading || !url.trim()}
            className="flex-1 py-3 rounded-xl font-bold text-white press flex items-center justify-center gap-2"
            style={{
              background: url.trim() && !loading
                ? 'linear-gradient(135deg,#DC2626,#B91C1C)'
                : '#D1D5DB',
              color: url.trim() && !loading ? '#FFFFFF' : '#9CA3AF'
            }}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ચકાસી રહ્યા છીએ...
              </>
            ) : (
              <>
                🔍 ચકાસો
              </>
            )}
          </button>

          {url && (
            <button
              onClick={clearAll}
              className="px-4 py-3 rounded-xl font-bold press"
              style={{
                background: '#F3F4F6',
                color: '#6B7280'
              }}
            >
              Clear
            </button>
          )}
        </div>

        {/* Results */}
        {result && (
          <div className="mb-6">
            <div
              className="p-4 rounded-2xl border-2"
              style={{
                borderColor: getRiskColor(result.riskLevel),
                background: result.isSafe ? '#F0FDF4' : '#FEF2F2'
              }}
            >
              {/* Risk Level Header */}
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                  style={{ background: 'rgba(255,255,255,0.8)' }}
                >
                  {getRiskEmoji(result.riskLevel)}
                </div>
                <div className="flex-1">
                  <p className="font-black text-lg" style={{ color: getRiskColor(result.riskLevel) }}>
                    {result.isSafe ? 'સુરક્ષિત લાગે છે ✅' : 'જોખમી લિંક! ⚠️'}
                  </p>
                  <p className="text-xs font-medium" style={{ color: '#6B7280' }}>
                    Risk Level: {result.riskLevel?.toUpperCase()}
                  </p>
                </div>
              </div>

              {/* Main Message */}
              <div className="mb-4 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.6)' }}>
                <p className="font-bold text-sm leading-relaxed" style={{ color: '#374151' }}>
                  {result.message}
                </p>
              </div>

              {/* Details */}
              {result.details && result.details.length > 0 && (
                <div className="mb-4">
                  <p className="font-bold text-xs mb-2" style={{ color: '#6B7280' }}>
                    વિગતો:
                  </p>
                  <ul className="space-y-1">
                    {result.details.map((detail, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-xs mt-0.5">•</span>
                        <span className="text-xs font-medium" style={{ color: '#374151' }}>
                          {detail}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recommendations */}
              {result.recommendations && result.recommendations.length > 0 && (
                <div>
                  <p className="font-bold text-xs mb-2" style={{ color: getRiskColor(result.riskLevel) }}>
                    સલાહ:
                  </p>
                  <ul className="space-y-1">
                    {result.recommendations.map((rec, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-xs mt-0.5">→</span>
                        <span className="text-xs font-bold" style={{ color: getRiskColor(result.riskLevel) }}>
                          {rec}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Common Scam Types */}
        <div className="mb-8">
          <h3 className="font-bold text-lg mb-4" style={{ color: '#374151' }}>
            સામાન્ય સ્કૅમ પ્રકારો:
          </h3>
          <div className="space-y-3">
            {[
              { emoji: '🏛️', title: 'નકલી સરકાર', desc: 'Fake government websites માટે documents માંગે છે' },
              { emoji: '💸', title: 'લોન સ્કૅમ', desc: 'Easy loan આપવાનું કહીને fees માંગે છે' },
              { emoji: '🎁', title: 'ઇનામ સ્કૅમ', desc: '"તમે જીત્યા છો" કહીને પૈસા માંગે છે' },
              { emoji: '📞', title: 'OTP સ્કૅમ', desc: 'Bank વતી OTP અને details માંગે છે' },
            ].map((scam, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 rounded-xl" style={{ background: '#FFFFFF' }}>
                <span className="text-2xl flex-shrink-0 mt-0.5">{scam.emoji}</span>
                <div className="flex-1">
                  <p className="font-bold text-sm" style={{ color: '#374151' }}>{scam.title}</p>
                  <p className="text-xs font-medium mt-0.5" style={{ color: '#6B7280' }}>{scam.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}