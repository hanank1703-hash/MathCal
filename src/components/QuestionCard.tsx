import { motion } from 'framer-motion'
import type { Question } from '../types/game'
import { FruitAnimation } from './FruitAnimation'

interface QuestionCardProps {
  question: Question
}

export function QuestionCard({ question }: QuestionCardProps) {
  if (question.visual) {
    return (
      <motion.div
        key={`${question.a}-${question.b}-visual`}
        initial={{ x: 80, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="flex flex-col items-center gap-4"
      >
        <FruitAnimation
          emoji={question.visual.emoji}
          groupA={question.a}
          groupB={question.b}
          mode="static"
        />
        <div
          className="font-extrabold text-gray-700 mt-2"
          style={{ fontSize: 'clamp(1.2rem, 4vw, 1.6rem)' }}
        >
          How many in total?
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      key={`${question.a}-${question.b}`}
      initial={{ x: 80, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      className="rounded-3xl px-8 py-6 text-center"
      style={{
        background: 'white',
        boxShadow: '0 8px 30px rgba(0,0,0,0.1)',
      }}
    >
      <div className="flex items-center justify-center gap-3" style={{ fontSize: 'clamp(2.2rem, 8vw, 3.5rem)' }}>
        <motion.span
          className="font-extrabold"
          style={{ color: '#2196F3' }}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 0.5 }}
        >
          {question.a}
        </motion.span>
        <span className="font-bold" style={{ color: '#FF9800' }}>+</span>
        <motion.span
          className="font-extrabold"
          style={{ color: '#2196F3' }}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {question.b}
        </motion.span>
        <span className="font-bold" style={{ color: '#FF9800' }}>=</span>
        <motion.span
          className="font-extrabold"
          style={{ color: '#9C27B0' }}
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          ?
        </motion.span>
      </div>
    </motion.div>
  )
}
