import { motion } from 'framer-motion'

interface ProgressBarProps {
  current: number
  total: number
  levelName: string
}

export function ProgressBar({ current, total, levelName }: ProgressBarProps) {
  const percent = total > 0 ? (current / total) * 100 : 0

  return (
    <div className="w-full max-w-lg mx-auto px-4">
      <div className="flex items-center justify-between mb-1">
        <span
          className="font-bold text-white"
          style={{ fontSize: 'clamp(0.75rem, 2vw, 0.9rem)', textShadow: '0 1px 3px rgba(0,0,0,0.2)' }}
        >
          {levelName}
        </span>
        <span
          className="font-bold text-white"
          style={{ fontSize: 'clamp(0.75rem, 2vw, 0.9rem)', textShadow: '0 1px 3px rgba(0,0,0,0.2)' }}
        >
          {current}/{total}
        </span>
      </div>
      <div
        className="w-full rounded-full overflow-hidden"
        style={{ height: 16, background: 'rgba(255,255,255,0.4)', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)' }}
      >
        <motion.div
          className="h-full rounded-full"
          style={{
            background: 'linear-gradient(90deg, #4CAF50, #81C784)',
            boxShadow: '0 2px 8px rgba(76,175,80,0.4)',
          }}
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        />
      </div>
    </div>
  )
}
