import { useState, useEffect } from 'react'
import { SAFETY_TIPS } from '../data/chatData'

export default function SafetyTipBanner() {
  const [tipIndex, setTipIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex(prev => (prev + 1) % SAFETY_TIPS.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center gap-2">
      <span className="text-amber-500 text-sm">💡</span>
      <p className="text-amber-700 text-xs font-medium flex-1 truncate">
        {SAFETY_TIPS[tipIndex]}
      </p>
    </div>
  )
}