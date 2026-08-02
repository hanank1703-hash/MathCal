import { motion } from 'framer-motion'

const BUTTON_COLORS = [
  { bg: 'linear-gradient(135deg, #FF6B6B, #ee5a5a)', shadow: 'rgba(238,90,90,0.4)', border: '#d94a4a' },
  { bg: 'linear-gradient(135deg, #4ECDC4, #3dbdb5)', shadow: 'rgba(62,189,181,0.4)', border: '#2ea69e' },
  { bg: 'linear-gradient(135deg, #FFD93D, #f0c930)', shadow: 'rgba(240,201,48,0.4)', border: '#d4b328' },
  { bg: 'linear-gradient(135deg, #A78BFA, #9370f0)', shadow: 'rgba(147,112,240,0.4)', border: '#7c5cd4' },
]

interface AnswerButtonProps {
  value: number
  index: number
  onClick: (value: number) => void
  disabled: boolean
  state: 'default' | 'correct' | 'incorrect' | 'dimmed'
}

export function AnswerButton({ value, index, onClick, disabled, state }: AnswerButtonProps) {
  const color = BUTTON_COLORS[index % BUTTON_COLORS.length]

  const getStyle = () => {
    if (state === 'correct') {
      return {
        background: 'linear-gradient(135deg, #4CAF50, #45a049)',
        boxShadow: '0 6px 20px rgba(76,175,80,0.5), 0 4px 0 #388E3C',
      }
    }
    if (state === 'dimmed') {
      return {
        background: 'linear-gradient(135deg, #ccc, #bbb)',
        boxShadow: '0 4px 10px rgba(0,0,0,0.1), 0 3px 0 #aaa',
        opacity: 0.6,
      }
    }
    return {
      background: color.bg,
      boxShadow: `0 6px 20px ${color.shadow}, 0 4px 0 ${color.border}`,
    }
  }

  return (
    <motion.button
      initial={{ y: 30, opacity: 0 }}
      animate={{
        y: 0,
        opacity: 1,
        ...(state === 'correct' ? { scale: [1, 1.15, 1] } : {}),
        ...(state === 'incorrect' ? { x: [0, -8, 8, -8, 0] } : {}),
      }}
      transition={{
        y: { type: 'spring', stiffness: 200, damping: 15, delay: index * 0.1 },
        opacity: { delay: index * 0.1 },
        scale: { duration: 0.4 },
        x: { duration: 0.4 },
      }}
      whileTap={disabled ? {} : { scale: 0.92 }}
      whileHover={disabled ? {} : { scale: 1.08 }}
      onClick={() => !disabled && onClick(value)}
      disabled={disabled}
      className="cursor-pointer border-none rounded-2xl font-extrabold text-white select-none"
      style={{
        ...getStyle(),
        minWidth: 'clamp(80px, 20vw, 110px)',
        minHeight: 'clamp(80px, 20vw, 110px)',
        fontSize: 'clamp(1.8rem, 5vw, 2.5rem)',
        transition: 'background 0.3s',
      }}
    >
      {value}
    </motion.button>
  )
}
