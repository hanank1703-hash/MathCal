import { motion, AnimatePresence } from 'framer-motion'
import { useTypewriter } from '../hooks/useTypewriter'

interface SpeechBubbleProps {
  message: string
  onComplete?: () => void
}

export function SpeechBubble({ message, onComplete }: SpeechBubbleProps) {
  const { displayedText, isComplete } = useTypewriter(message, 35)

  if (isComplete && onComplete) {
    setTimeout(onComplete, 0)
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={message}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className="relative ml-2 max-w-xs"
      >
        <div
          className="rounded-2xl px-5 py-3 text-gray-800 font-semibold leading-relaxed"
          style={{
            background: 'white',
            boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
            fontSize: 'clamp(0.95rem, 2.5vw, 1.15rem)',
            minWidth: 160,
          }}
        >
          <span style={{ whiteSpace: 'pre-line' }}>{displayedText}</span>
          {!isComplete && (
            <motion.span
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.5, repeat: Infinity }}
              className="inline-block ml-0.5"
            >
              |
            </motion.span>
          )}
        </div>

        {/* Speech tail pointing to owl */}
        <div
          className="absolute"
          style={{
            left: -10,
            top: 18,
            width: 0,
            height: 0,
            borderTop: '8px solid transparent',
            borderBottom: '8px solid transparent',
            borderRight: '12px solid white',
          }}
        />
      </motion.div>
    </AnimatePresence>
  )
}
