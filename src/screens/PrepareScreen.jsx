import { useEffect } from 'react';
import { motion } from 'framer-motion';

export default function PrepareScreen({ onReady, audioEngine }) {
  useEffect(() => {
    if (audioEngine) audioEngine.init();
    const timer = setTimeout(onReady, 7000);
    return () => clearTimeout(timer);
  }, [onReady, audioEngine]);

  return (
    <div className="screen">
      <div className="screen-bg">
        <div className="gradient-orb gradient-orb-2" style={{ opacity: 0.15 }} />
        <div className="gradient-orb gradient-orb-3" style={{ opacity: 0.2 }} />
      </div>

      <div className="content">
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 1.5, ease: 'easeOut' }}
          style={{ fontWeight: 300 }}
        >
          Close your eyes.
        </motion.h2>

        <div className="spacer-xl" />

        <motion.div
          className="breathing-circle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1.5 }}
        >
          <div className="breathing-circle-inner" />
        </motion.div>

        <div className="spacer-xl" />

        <motion.p
          className="subtitle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5, duration: 1.5, ease: 'easeOut' }}
        >
          Take a breath and just listen.
        </motion.p>

        <div className="spacer-lg" />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.4, 0] }}
          transition={{ delay: 4, duration: 3, ease: 'easeInOut' }}
          style={{
            display: 'flex',
            gap: '6px',
            alignItems: 'center',
          }}
        >
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.3, 0.7, 0.3],
              }}
              transition={{
                delay: 4 + i * 0.3,
                duration: 1.2,
                repeat: Infinity,
                repeatDelay: 0.6,
              }}
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: 'var(--accent-lavender)',
              }}
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
}
