import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState, useRef } from 'react'

interface Particle {
  id: number
  x: number
  color: string
  size: number
  rotation: number
  xEnd: number
  delay: number
  shape: 'circle' | 'star' | 'rect'
}

const COLORS = ['#FF6B6B', '#4ECDC4', '#FFD93D', '#A78BFA', '#FF9800', '#4CAF50', '#E91E63', '#00BCD4']
const SHAPES: Particle['shape'][] = ['circle', 'star', 'rect']

function generateParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    size: 6 + Math.random() * 10,
    rotation: Math.random() * 720 - 360,
    xEnd: (Math.random() - 0.5) * 200,
    delay: Math.random() * 0.3,
    shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
  }))
}

interface CelebrationProps {
  show: boolean
  intensity?: 'small' | 'large'
  onComplete?: () => void
}

export function Celebration({ show, intensity = 'small', onComplete }: CelebrationProps) {
  const [particles, setParticles] = useState<Particle[]>([])
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null)

  useEffect(() => {
    if (show) {
      setParticles(generateParticles(intensity === 'large' ? 50 : 25))
      timerRef.current = setTimeout(() => {
        onComplete?.()
      }, 2000)
    } else {
      setParticles([])
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [show, intensity, onComplete])

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 100 }}>
          {particles.map((p) => (
            <motion.div
              key={p.id}
              initial={{
                x: `${p.x}vw`,
                y: '-5vh',
                opacity: 1,
                rotate: 0,
                scale: 1,
              }}
              animate={{
                x: `calc(${p.x}vw + ${p.xEnd}px)`,
                y: '110vh',
                opacity: [1, 1, 0.8, 0],
                rotate: p.rotation,
                scale: [1, 1.2, 0.8],
              }}
              transition={{
                duration: 2 + Math.random(),
                delay: p.delay,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
              className="absolute"
              style={{
                width: p.size,
                height: p.size,
              }}
            >
              {p.shape === 'circle' && (
                <div
                  className="w-full h-full rounded-full"
                  style={{ background: p.color }}
                />
              )}
              {p.shape === 'star' && (
                <div style={{ color: p.color, fontSize: p.size * 1.5, lineHeight: 1 }}>
                  ⭐
                </div>
              )}
              {p.shape === 'rect' && (
                <div
                  className="w-full h-full rounded-sm"
                  style={{ background: p.color, transform: 'rotate(45deg)' }}
                />
              )}
            </motion.div>
          ))}

          {intensity === 'large' && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.3, 1], opacity: [0, 1, 1] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span style={{ fontSize: 'clamp(4rem, 15vw, 8rem)' }}>🎉</span>
            </motion.div>
          )}
        </div>
      )}
    </AnimatePresence>
  )
}
