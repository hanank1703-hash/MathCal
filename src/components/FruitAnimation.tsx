import { motion } from 'framer-motion'

interface FruitAnimationProps {
  emoji: string
  groupA: number
  groupB: number
  mode: 'static' | 'demo' | 'counting'
  countUpTo?: number
}

export function FruitAnimation({ emoji, groupA, groupB, mode, countUpTo }: FruitAnimationProps) {
  const totalCount = countUpTo ?? 0

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center gap-3 flex-wrap justify-center">
        <div className="flex gap-1">
          {Array.from({ length: groupA }).map((_, i) => (
            <motion.span
              key={`a-${i}`}
              initial={mode === 'demo' ? { scale: 0, opacity: 0 } : {}}
              animate={{
                scale: mode === 'counting' && totalCount > i ? [1, 1.3, 1] : 1,
                opacity: 1,
              }}
              transition={{
                delay: mode === 'demo' ? i * 0.3 : 0,
                type: 'spring',
                stiffness: 300,
                damping: 15,
              }}
              style={{ fontSize: 'clamp(2rem, 7vw, 3rem)' }}
            >
              {emoji}
            </motion.span>
          ))}
        </div>

        <motion.span
          initial={mode === 'demo' ? { scale: 0 } : {}}
          animate={{ scale: 1 }}
          transition={{ delay: mode === 'demo' ? groupA * 0.3 : 0, type: 'spring', stiffness: 300 }}
          className="font-extrabold"
          style={{ color: '#FF9800', fontSize: 'clamp(1.5rem, 5vw, 2.5rem)' }}
        >
          +
        </motion.span>

        <div className="flex gap-1">
          {Array.from({ length: groupB }).map((_, i) => (
            <motion.span
              key={`b-${i}`}
              initial={mode === 'demo' ? { scale: 0, opacity: 0 } : {}}
              animate={{
                scale: mode === 'counting' && totalCount > groupA + i ? [1, 1.3, 1] : 1,
                opacity: 1,
              }}
              transition={{
                delay: mode === 'demo' ? (groupA + 1 + i) * 0.3 : 0,
                type: 'spring',
                stiffness: 300,
                damping: 15,
              }}
              style={{ fontSize: 'clamp(2rem, 7vw, 3rem)' }}
            >
              {emoji}
            </motion.span>
          ))}
        </div>

        <motion.span
          initial={mode === 'demo' ? { scale: 0 } : {}}
          animate={{ scale: 1 }}
          transition={{ delay: mode === 'demo' ? (groupA + groupB + 1) * 0.3 : 0, type: 'spring', stiffness: 300 }}
          className="font-extrabold"
          style={{ color: '#FF9800', fontSize: 'clamp(1.5rem, 5vw, 2.5rem)' }}
        >
          = {mode === 'counting' && totalCount >= groupA + groupB ? groupA + groupB : '?'}
        </motion.span>
      </div>

      {mode === 'counting' && totalCount > 0 && (
        <div className="flex gap-3 mt-1">
          {Array.from({ length: Math.min(totalCount, groupA + groupB) }).map((_, i) => (
            <motion.span
              key={`count-${i}`}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0, type: 'spring', stiffness: 400, damping: 15 }}
              className="font-extrabold rounded-full bg-white/80 flex items-center justify-center"
              style={{
                color: '#4CAF50',
                fontSize: 'clamp(0.9rem, 3vw, 1.2rem)',
                width: 'clamp(28px, 6vw, 36px)',
                height: 'clamp(28px, 6vw, 36px)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}
            >
              {i + 1}
            </motion.span>
          ))}
        </div>
      )}
    </div>
  )
}
