import { motion } from 'framer-motion'

interface ContinueButtonProps {
  onClick: () => void
  label?: string
}

export function ContinueButton({ onClick, label = 'Continue' }: ContinueButtonProps) {
  return (
    <motion.button
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.3 }}
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.05 }}
      onClick={onClick}
      className="cursor-pointer border-none font-bold text-white rounded-full"
      style={{
        background: 'linear-gradient(135deg, #FF9800, #FF5722)',
        boxShadow: '0 6px 20px rgba(255,87,34,0.35), 0 3px 0 #E64A19',
        padding: 'clamp(14px, 3vw, 20px) clamp(36px, 8vw, 60px)',
        fontSize: 'clamp(1.1rem, 3vw, 1.4rem)',
        letterSpacing: '0.5px',
      }}
    >
      {label} →
    </motion.button>
  )
}
