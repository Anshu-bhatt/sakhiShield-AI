import { useEffect, useState } from 'react'

export default function RewardBadge({ badge, badgeColor, score, totalQuestions, animate = true }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    if (animate) {
      setTimeout(() => setMounted(true), 500) // Delay for dramatic effect
    } else {
      setMounted(true)
    }
  }, [animate])

  const getBadgeEmoji = () => {
    if (badge.includes('🏆')) return '🏆'
    if (badge.includes('⭐')) return '⭐'
    if (badge.includes('🛡️')) return '🛡️'
    return '📚'
  }

  const getBadgeGlow = () => {
    switch (badgeColor) {
      case 'gold': return 'shadow-amber-500/50 bg-gradient-to-br from-amber-300 to-amber-500'
      case 'silver': return 'shadow-gray-400/50 bg-gradient-to-br from-gray-300 to-gray-400'
      case 'bronze': return 'shadow-orange-400/50 bg-gradient-to-br from-orange-300 to-orange-500'
      default: return 'shadow-violet-400/50 bg-gradient-to-br from-violet-300 to-violet-500'
    }
  }

  return (
    <div className={`relative transition-all duration-700 ${mounted ? 'animate-badgePop' : 'scale-0'}`}>
      {/* Badge Glow Effect */}
      <div className={`absolute inset-0 ${getBadgeGlow()} rounded-full blur-xl ${badgeColor === 'gold' ? 'animate-goldenGlow' : ''}`}></div>

      {/* Main Badge */}
      <div className="relative bg-white rounded-full p-8 shadow-2xl border-4 border-gray-100">
        <div className="text-center">
          {/* Badge Emoji */}
          <div className={`text-6xl mb-4 ${badgeColor === 'gold' ? 'animate-spin-slow' : ''}`}>
            {getBadgeEmoji()}
          </div>

          {/* Badge Title */}
          <h3 className="font-bold text-xl text-gray-800 mb-2">
            {badge}
          </h3>

          {/* Score */}
          <div className="text-3xl font-bold text-amber-600 mb-1">
            {score}/{totalQuestions}
          </div>
          <p className="text-sm text-gray-600">સાચા જવાબ</p>
        </div>
      </div>
    </div>
  )
}