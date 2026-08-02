import { motion } from 'framer-motion'

export function Background() {
  return (
    <div className="fixed inset-0 overflow-hidden" style={{ zIndex: 0 }}>
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, #87CEEB 0%, #B8E4F9 40%, #E0F4FF 70%, #c8e6c9 85%, #81c784 100%)',
        }}
      />

      <motion.div
        className="absolute rounded-full bg-white/70"
        style={{ width: 120, height: 50, top: '8%', left: '10%', borderRadius: '50px', filter: 'blur(2px)' }}
        animate={{ x: [0, 40, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute rounded-full bg-white/60"
        style={{ width: 160, height: 60, top: '12%', right: '15%', borderRadius: '50px', filter: 'blur(3px)' }}
        animate={{ x: [0, -30, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute rounded-full bg-white/50"
        style={{ width: 100, height: 40, top: '5%', left: '50%', borderRadius: '50px', filter: 'blur(2px)' }}
        animate={{ x: [0, 50, 0] }}
        transition={{ duration: 30, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div
        className="absolute"
        style={{
          width: 60,
          height: 60,
          top: '3%',
          right: '8%',
          background: 'radial-gradient(circle, #FFD93D 30%, #FFD93D00 70%)',
          borderRadius: '50%',
          filter: 'blur(1px)',
        }}
      />

      <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 1200 120" preserveAspectRatio="none" style={{ height: '15%' }}>
        <path d="M0,60 Q300,20 600,50 T1200,40 L1200,120 L0,120 Z" fill="#66bb6a" opacity="0.5" />
        <path d="M0,80 Q200,50 500,70 T1200,60 L1200,120 L0,120 Z" fill="#4caf50" opacity="0.4" />
      </svg>
    </div>
  )
}
