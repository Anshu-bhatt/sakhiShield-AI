import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { SAFETY_TIPS } from '../data/chatData'

/* ─── Rotating safety tip ──────────────────────────────────── */
function SafetyTip() {
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
    <div className="mx-4 rounded-2xl px-4 py-3 flex items-start gap-3"
      style={{ background: 'linear-gradient(135deg,#FFFBEB,#FEF3C7)', border: '1px solid #FDE68A' }}>
      <span className="text-xl flex-shrink-0 mt-0.5">💡</span>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold uppercase tracking-wide mb-0.5" style={{ color: '#B45309' }}>
          આજ ની સલાહ
        </p>
        <p
          className={`text-sm font-semibold leading-relaxed tip-text ${show ? '' : 'tip-hide'}`}
          style={{ color: '#92400E' }}
        >
          {SAFETY_TIPS[idx]}
        </p>
      </div>
    </div>
  )
}

/* ─── Feature Card ──────────────────────────────────────────── */
function FeatureCard({ emoji, title, subtitle, accent, bg, onClick, delay }) {
  return (
    <button
      onClick={onClick}
      className={`w-full press rounded-2xl bg-white flex items-center gap-4 px-5 py-4 anim-slide-up`}
      style={{
        animationDelay: `${delay}ms`,
        boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
        borderLeft: `4px solid ${accent}`,
        minHeight: 76,
      }}
    >
      {/* Icon pill */}
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
        style={{ background: bg }}>
        {emoji}
      </div>

      {/* Text */}
      <div className="flex-1 text-left min-w-0">
        <p className="font-extrabold text-base leading-tight" style={{ color: accent }}>
          {title}
        </p>
        <p className="text-xs mt-0.5 font-medium leading-relaxed" style={{ color: '#78716C' }}>
          {subtitle}
        </p>
      </div>

      {/* Arrow */}
      <div className="text-2xl font-bold flex-shrink-0" style={{ color: accent, opacity: .6 }}>›</div>
    </button>
  )
}

/* ─── Floating tip FAB + bottom-sheet ──────────────────────── */
function TipFAB() {
  const [open, setOpen] = useState(false)
  const [idx] = useState(() => Math.floor(Math.random() * SAFETY_TIPS.length))

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed z-40 anim-fab press"
        style={{
          bottom: 24, right: 16, width: 52, height: 52, borderRadius: '50%',
          background: 'linear-gradient(135deg,#F59E0B,#FBBF24)',
          boxShadow: '0 6px 20px rgba(245,158,11,.45)',
          fontSize: 22, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}
        aria-label="Safety tip"
      >💡</button>
    )
  }

  return (
    <div className="sheet-wrap">
      <div className="sheet-bg" onClick={() => setOpen(false)} />
      <div className="sheet-card">
        <div className="sheet-handle" />
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl"
            style={{ background: '#FEF3C7' }}>💡</div>
          <div>
            <p className="font-extrabold text-gray-900">આજ ની સલાહ</p>
            <p className="text-xs font-medium" style={{ color: '#78716C' }}>Safety Tip</p>
          </div>
        </div>
        <div className="rounded-2xl p-4 mb-5"
          style={{ background: '#FFFBEB', border: '1px solid #FDE68A' }}>
          <p className="font-bold leading-relaxed" style={{ color: '#92400E', fontSize: 15 }}>
            {SAFETY_TIPS[idx]}
          </p>
        </div>
        <button
          onClick={() => setOpen(false)}
          className="w-full py-3.5 rounded-2xl font-extrabold text-white press"
          style={{ background: 'linear-gradient(to right,#7C3AED,#6D28D9)', fontSize: 15, minHeight: 50 }}
        >
          સમજ્યા ✓
        </button>
      </div>
    </div>
  )
}

/* ─── Achievement toast ─────────────────────────────────────── */
function Toast({ msg, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3200); return () => clearTimeout(t) }, [onDone])
  return (
    <div className="fixed z-50 anim-toast"
      style={{ top: 14, left: '50%', transform: 'translateX(-50%)', width: 'calc(100% - 32px)', maxWidth: 440 }}>
      <div className="flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl font-bold text-white text-sm leading-relaxed"
        style={{ background: 'linear-gradient(135deg,#F59E0B,#D97706)' }}>
        <span className="text-2xl">🎉</span>
        <span>{msg}</span>
      </div>
    </div>
  )
}

/* ══ HOME SCREEN ════════════════════════════════════════════════ */
export default function HomeScreen() {
  const navigate = useNavigate()
  const [toast, setToast] = useState(false)
  const shownRef = useRef(false)

  useEffect(() => {
    if (!shownRef.current) {
      shownRef.current = true
      if (!sessionStorage.getItem('sakhi_hi')) {
        sessionStorage.setItem('sakhi_hi', '1')
        setTimeout(() => setToast(true), 1000)
      }
    }
  }, [])

  const cards = [
    {
      emoji: '💬', title: 'વિત્તસખી ચેટ',
      subtitle: 'ગુજરાતીમાં banking saval puchho',
      accent: '#7C3AED', bg: '#EDE9FE', path: '/chat',
    },
    {
      emoji: '🎯', title: 'ક્વિઝ રમો',
      subtitle: 'Fraud ઓળખો, points kamao',
      accent: '#059669', bg: '#D1FAE5', path: '/quiz',
    },
    {
      emoji: '🏛️', title: 'સરકારી યોજનાઓ',
      subtitle: 'ગુજરાત મહિલાઓ માટે લાભો',
      accent: '#059669', bg: '#DCFCE7', path: '/schemes',
    },
    {
      emoji: '👤', title: 'મારો પ્રોફાઇલ',
      subtitle: 'Records ane achievements',
      accent: '#2563EB', bg: '#DBEAFE', path: '/profile',
    },
  ]

  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#FAFAF9' }}>

      {toast && <Toast msg="SakhiShield માં આપનું સ્વાગત! Safe raho 💜" onDone={() => setToast(false)} />}

      {/* ── Hero header ── */}
      <div
        className="relative pt-12 pb-10 px-6 text-center overflow-hidden flex-shrink-0"
        style={{ background: 'linear-gradient(150deg,#7C3AED 0%,#6D28D9 55%,#4338CA 100%)' }}
      >
        {/* Decorative blobs */}
        <div className="absolute top-3 right-3 w-28 h-28 rounded-full pointer-events-none"
          style={{ background: 'rgba(255,255,255,.08)' }} />
        <div className="absolute -bottom-4 -left-4 w-20 h-20 rounded-full pointer-events-none"
          style={{ background: 'rgba(255,255,255,.06)' }} />

        {/* Shield */}
        <div
          className="anim-shield-float anim-shield-pulse mx-auto mb-5 flex items-center justify-center"
          style={{
            width: 96, height: 96, borderRadius: '50%',
            background: 'rgba(255,255,255,.16)',
            border: '2px solid rgba(255,255,255,.28)',
            backdropFilter: 'blur(6px)',
            fontSize: 44,
          }}
        >
          🛡️
        </div>

        <h1 className="text-white font-black text-3xl tracking-tight leading-tight anim-slide-up">
          SakhiShield AI
        </h1>
        <p className="mt-2 font-semibold text-sm anim-slide-up d-100" style={{ color: '#C4B5FD' }}>
          તમારી સખી, તમારી સુરક્ષા 💜
        </p>

        {/* Mini stats row */}
        <div className="mt-6 flex justify-center gap-8 anim-slide-up d-200">
          {[['🛡️', '100%', 'Safe'], ['🔒', 'DPDP', '2023'], ['🌐', 'ગુજ', 'Gujarati']].map(([e, v, l]) => (
            <div key={l} className="flex flex-col items-center gap-0.5">
              <span className="text-lg">{e}</span>
              <span className="text-white font-black text-xs">{v}</span>
              <span className="text-xs font-medium" style={{ color: '#C4B5FD' }}>{l}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Soft wave divider */}
      <div style={{ background: '#FAFAF9', marginTop: -2 }}>
        <svg viewBox="0 0 480 32" preserveAspectRatio="none" className="w-full block" style={{ height: 32 }}>
          <path d="M0,0 Q120,32 240,16 T480,0 L480,32 L0,32 Z"
            fill="linear-gradient(150deg,#7C3AED,#4338CA)" />
          <path d="M0,0 Q120,32 240,16 T480,0 L480,32 L0,32 Z"
            style={{ fill: '#6D28D9' }} />
        </svg>
      </div>

      {/* ── Feature cards ── */}
      <div className="flex flex-col gap-3 px-4 pt-4 pb-4">
        {cards.map((c, i) => (
          <FeatureCard key={c.path} {...c} delay={80 + i * 90} onClick={() => navigate(c.path)} />
        ))}
      </div>

      {/* ── Safety tip ── */}
      <div className="pb-4">
        <SafetyTip />
      </div>

      {/* ── Footer ── */}
      <div className="text-center pb-8 mt-auto">
        <p className="text-xs font-semibold" style={{ color: '#A8A29E' }}>
          🔒 ડેટા ફોનમાં જ રહે છે · DPDP Act 2023
        </p>
      </div>

      {/* Floating tip FAB */}
      <TipFAB />
    </div>
  )
}