import { motion } from 'framer-motion'
import type { OwlMood } from '../types/game'

interface OwlMentorProps {
  mood: OwlMood
}

export function OwlMentor({ mood }: OwlMentorProps) {
  const isHappy = mood === 'happy' || mood === 'celebrating'
  const wingAngle = mood === 'celebrating' ? [-5, 20, -5] : [-3, 5, -3]

  return (
    <motion.div
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      className="relative"
      style={{ width: 140, height: 170 }}
    >
      <svg viewBox="0 0 140 170" width="140" height="170">
        {/* Left wing */}
        <motion.g
          style={{ transformOrigin: '35px 90px' }}
          animate={{ rotate: wingAngle }}
          transition={{ duration: mood === 'celebrating' ? 0.4 : 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ellipse cx="20" cy="95" rx="18" ry="30" fill="#6D4C20" />
          <ellipse cx="20" cy="95" rx="14" ry="25" fill="#8B6914" />
        </motion.g>

        {/* Right wing */}
        <motion.g
          style={{ transformOrigin: '105px 90px' }}
          animate={{ rotate: wingAngle.map(a => -a) }}
          transition={{ duration: mood === 'celebrating' ? 0.4 : 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ellipse cx="120" cy="95" rx="18" ry="30" fill="#6D4C20" />
          <ellipse cx="120" cy="95" rx="14" ry="25" fill="#8B6914" />
        </motion.g>

        {/* Body */}
        <ellipse cx="70" cy="100" rx="42" ry="50" fill="#8B6914" />
        <ellipse cx="70" cy="105" rx="32" ry="38" fill="#F5E6C8" />

        {/* Belly feather lines */}
        <path d="M50,90 Q70,85 90,90" stroke="#E8D5B0" strokeWidth="1.5" fill="none" />
        <path d="M48,100 Q70,95 92,100" stroke="#E8D5B0" strokeWidth="1.5" fill="none" />
        <path d="M50,110 Q70,105 90,110" stroke="#E8D5B0" strokeWidth="1.5" fill="none" />

        {/* Head */}
        <ellipse cx="70" cy="55" rx="38" ry="32" fill="#8B6914" />

        {/* Ear tufts */}
        <polygon points="38,30 32,15 48,35" fill="#6D4C20" />
        <polygon points="102,30 108,15 92,35" fill="#6D4C20" />

        {/* Eye whites */}
        <circle cx="54" cy="52" r="14" fill="white" />
        <circle cx="86" cy="52" r="14" fill="white" />

        {/* Pupils */}
        <motion.g>
          <circle cx="56" cy="54" r="7" fill="#1A1A2E" />
          <circle cx="88" cy="54" r="7" fill="#1A1A2E" />
          {/* Highlights */}
          <circle cx="53" cy="50" r="2.5" fill="white" />
          <circle cx="85" cy="50" r="2.5" fill="white" />
        </motion.g>

        {/* Blink overlay */}
        <motion.g
          animate={{ scaleY: [1, 1, 0.05, 1, 1] }}
          transition={{
            duration: 4,
            repeat: Infinity,
            times: [0, 0.47, 0.5, 0.53, 1],
            ease: 'easeInOut',
          }}
          style={{ transformOrigin: '70px 52px' }}
        >
          <circle cx="54" cy="52" r="14.5" fill="#8B6914" opacity="0" />
          <circle cx="86" cy="52" r="14.5" fill="#8B6914" opacity="0" />
        </motion.g>
        {/* Eyelid blink animation — drawn as covering rects that squish */}
        <motion.rect
          x="39" y="38" width="31" height="28" rx="14" fill="#8B6914"
          animate={{ scaleY: [0, 0, 1, 0, 0] }}
          transition={{
            duration: 4,
            repeat: Infinity,
            times: [0, 0.47, 0.5, 0.53, 1],
            ease: 'easeInOut',
          }}
          style={{ transformOrigin: '54px 52px' }}
        />
        <motion.rect
          x="71" y="38" width="31" height="28" rx="14" fill="#8B6914"
          animate={{ scaleY: [0, 0, 1, 0, 0] }}
          transition={{
            duration: 4,
            repeat: Infinity,
            times: [0, 0.47, 0.5, 0.53, 1],
            ease: 'easeInOut',
          }}
          style={{ transformOrigin: '86px 52px' }}
        />

        {/* Glasses */}
        <circle cx="54" cy="52" r="16" fill="none" stroke="#555" strokeWidth="2" />
        <circle cx="86" cy="52" r="16" fill="none" stroke="#555" strokeWidth="2" />
        <line x1="70" y1="52" x2="70" y2="52" stroke="#555" strokeWidth="2" />
        <path d="M69,50 Q70,48 71,50" stroke="#555" strokeWidth="2" fill="none" />
        <line x1="38" y1="50" x2="32" y2="46" stroke="#555" strokeWidth="2" />
        <line x1="102" y1="50" x2="108" y2="46" stroke="#555" strokeWidth="2" />

        {/* Beak */}
        <polygon points="64,64 70,72 76,64" fill="#FF8C42" />

        {/* Mouth / smile */}
        {isHappy && (
          <path d="M62,73 Q70,79 78,73" stroke="#FF8C42" strokeWidth="1.5" fill="none" />
        )}

        {/* Graduation cap */}
        <polygon points="40,28 70,16 100,28 70,32" fill="#1A1A2E" />
        <rect x="67" y="8" width="6" height="10" fill="#1A1A2E" />
        <rect x="64" y="6" width="12" height="4" rx="2" fill="#FFD93D" />
        {/* Tassel */}
        <line x1="100" y1="28" x2="108" y2="38" stroke="#FFD93D" strokeWidth="2" />
        <circle cx="108" cy="40" r="3" fill="#FFD93D" />

        {/* Feet */}
        <g>
          <path d="M52,148 L48,158 L52,155 L56,158 L60,155 L62,158 L58,148" fill="#FF8C42" />
          <path d="M78,148 L74,158 L78,155 L82,158 L86,155 L88,158 L84,148" fill="#FF8C42" />
        </g>
      </svg>

      {/* Celebrating sparkles */}
      {mood === 'celebrating' && (
        <>
          <motion.div
            className="absolute text-lg"
            style={{ top: -10, left: 0 }}
            animate={{ y: [-5, -15], opacity: [1, 0], scale: [0.5, 1.2] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            ✨
          </motion.div>
          <motion.div
            className="absolute text-lg"
            style={{ top: -5, right: 0 }}
            animate={{ y: [-5, -20], opacity: [1, 0], scale: [0.5, 1.2] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: 0.3 }}
          >
            ⭐
          </motion.div>
        </>
      )}
    </motion.div>
  )
}
