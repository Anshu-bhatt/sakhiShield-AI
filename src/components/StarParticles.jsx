import { useEffect, useState } from 'react'

export default function StarParticles() {
  const [particles, setParticles] = useState([])

  useEffect(() => {
    // Create 25 star particles with random properties
    const newParticles = Array.from({ length: 25 }, (_, i) => ({
      id: i,
      emoji: ['✨', '⭐', '💫', '🌟'][Math.floor(Math.random() * 4)],
      size: ['text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl'][Math.floor(Math.random() * 5)],
      left: Math.random() * 100, // 0-100%
      duration: 2 + Math.random() * 3, // 2-5 seconds
      delay: Math.random() * 2, // 0-2 second delay
      opacity: 0.3 + Math.random() * 0.7 // 0.3-1.0 opacity
    }))

    setParticles(newParticles)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className={`absolute ${particle.size} animate-floatUp`}
          style={{
            left: `${particle.left}%`,
            animationDuration: `${particle.duration}s`,
            animationDelay: `${particle.delay}s`,
            opacity: particle.opacity
          }}
        >
          {particle.emoji}
        </div>
      ))}
    </div>
  )
}