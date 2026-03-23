import { useState, useRef, useEffect } from 'react'

/* ── Slide data ───────────────────────────────────────────────── */
const SLIDES = [
    {
        emoji: '🛡️',
        title: 'SakhiShield ke saath\nsafe raho',
        titleGu: 'સખીશિલ્ડ સાથે સુરક્ષિત',
        subtitle: 'Tumhara digital suraksha kavach',
        subtitleGu: 'તમારો ડિજિટલ સુરક્ષા કવચ',
        bg: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 60%, #4338CA 100%)',
        illustrationBg: 'rgba(255,255,255,0.15)',
        accentColor: '#C4B5FD',
    },
    {
        emoji: '💬',
        title: 'Gujarati ma apna\nsaval puchho',
        titleGu: 'ગુજરાતીમાં સવાલ પૂછો',
        subtitle: 'VittSakhi tumhari baat samjhe',
        subtitleGu: 'વિત્તસખી સમજે છે',
        bg: 'linear-gradient(135deg, #F59E0B 0%, #D97706 60%, #B45309 100%)',
        illustrationBg: 'rgba(255,255,255,0.15)',
        accentColor: '#FDE68A',
    },
    {
        emoji: '📄',
        title: 'Document share karta\npehla scan karo',
        titleGu: 'Document share karte pehla',
        subtitle: 'Apni personal info protect karo',
        subtitleGu: 'અંગત માહિતી સુરક્ષિત રાખો',
        bg: 'linear-gradient(135deg, #10B981 0%, #059669 60%, #047857 100%)',
        illustrationBg: 'rgba(255,255,255,0.15)',
        accentColor: '#A7F3D0',
    },
]

/* ── Single Slide ─────────────────────────────────────────────── */
function OnboardingSlide({ slide, active }) {
    return (
        <div
            className="min-w-full h-full flex flex-col items-center justify-center px-8"
            style={{ background: slide.bg }}
        >
            {/* Emoji illustration */}
            <div
                className="w-32 h-32 rounded-full flex items-center justify-center mb-8 shadow-2xl"
                style={{
                    background: slide.illustrationBg,
                    backdropFilter: 'blur(8px)',
                    border: '2px solid rgba(255,255,255,0.3)',
                    transform: active ? 'scale(1)' : 'scale(0.7)',
                    opacity: active ? 1 : 0,
                    transition: 'transform 0.5s cubic-bezier(.2,.8,.4,1), opacity 0.5s ease',
                }}
            >
                <span className="text-6xl select-none">{slide.emoji}</span>
            </div>

            {/* Title */}
            <h2
                className="text-white text-center font-black leading-tight mb-3 text-2xl"
                style={{
                    transform: active ? 'translateY(0)' : 'translateY(20px)',
                    opacity: active ? 1 : 0,
                    transition: 'transform 0.5s ease 0.1s, opacity 0.5s ease 0.1s',
                    whiteSpace: 'pre-line',
                }}
            >
                {slide.title}
            </h2>

            {/* Gujarati subtitle */}
            <p
                className="text-center font-bold text-base leading-relaxed mb-2"
                style={{
                    color: slide.accentColor,
                    transform: active ? 'translateY(0)' : 'translateY(20px)',
                    opacity: active ? 1 : 0,
                    transition: 'transform 0.5s ease 0.15s, opacity 0.5s ease 0.15s',
                }}
            >
                {slide.titleGu}
            </p>

            <p
                className="text-white/70 text-center text-sm font-semibold leading-relaxed"
                style={{
                    transform: active ? 'translateY(0)' : 'translateY(20px)',
                    opacity: active ? 1 : 0,
                    transition: 'transform 0.5s ease 0.2s, opacity 0.5s ease 0.2s',
                }}
            >
                {slide.subtitleGu}
            </p>
        </div>
    )
}

/* ══ ONBOARDING SCREEN ══════════════════════════════════════════ */
export default function OnboardingScreen({ onComplete }) {
    const [current, setCurrent] = useState(0)
    const [transitioning, setTransitioning] = useState(false)
    const startX = useRef(null)
    const trackRef = useRef(null)

    /* Swipe support */
    function handleTouchStart(e) {
        startX.current = e.touches[0].clientX
    }

    function handleTouchEnd(e) {
        if (startX.current === null) return
        const dx = e.changedTouches[0].clientX - startX.current
        startX.current = null
        if (dx < -50 && current < SLIDES.length - 1) goTo(current + 1)
        else if (dx > 50 && current > 0) goTo(current - 1)
    }

    function goTo(index) {
        if (transitioning) return
        setTransitioning(true)
        setCurrent(index)
        setTimeout(() => setTransitioning(false), 500)
    }

    function handleNext() {
        if (current < SLIDES.length - 1) goTo(current + 1)
        else onComplete()
    }

    /* Auto-advance option — removed to keep user in control */

    return (
        <div
            className="fixed inset-0 z-50 flex flex-col overflow-hidden"
            style={{ maxWidth: 480, margin: '0 auto' }}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
        >
            {/* Skip button */}
            <button
                onClick={onComplete}
                className="absolute top-5 right-5 z-10 px-4 py-2 rounded-full text-xs font-bold text-white/70 hover:text-white transition-colors"
                style={{ minHeight: '36px' }}
            >
                Skip ›
            </button>

            {/* Slides track */}
            <div className="flex-1 overflow-hidden relative">
                <div
                    ref={trackRef}
                    className="flex h-full"
                    style={{
                        transform: `translateX(-${current * 100}%)`,
                        transition: 'transform 0.4s cubic-bezier(.2,.8,.4,1)',
                        width: `${SLIDES.length * 100}%`,
                    }}
                >
                    {SLIDES.map((slide, i) => (
                        <div
                            key={i}
                            style={{ width: `${100 / SLIDES.length}%`, height: '100%' }}
                        >
                            <OnboardingSlide slide={slide} active={i === current} />
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom controls */}
            <div
                className="px-6 pb-10 pt-6 flex flex-col items-center gap-5"
                style={{
                    background: SLIDES[current].bg,
                    transition: 'background 0.4s ease',
                }}
            >
                {/* Progress dots */}
                <div className="flex gap-3 items-center">
                    {SLIDES.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => goTo(i)}
                            className="rounded-full transition-all"
                            style={{
                                width: i === current ? 28 : 10,
                                height: 10,
                                background: i === current ? '#FFFFFF' : 'rgba(255,255,255,0.35)',
                                transition: 'width 0.3s ease, background 0.3s ease',
                            }}
                        />
                    ))}
                </div>

                {/* Next / Get Started button */}
                <button
                    onClick={handleNext}
                    className="w-full py-4 rounded-2xl font-black text-base press-scale shadow-xl"
                    style={{
                        background: 'rgba(255,255,255,0.95)',
                        color: '#7C3AED',
                        minHeight: '52px',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                    }}
                >
                    {current < SLIDES.length - 1 ? 'આગળ →' : '🚀 શરૂ કરો — Start!'}
                </button>
            </div>
        </div>
    )
}
