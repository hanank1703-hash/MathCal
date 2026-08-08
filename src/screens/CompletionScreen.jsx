import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 25 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.4,
      duration: 1,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  }),
};

export default function CompletionScreen({ onRestart }) {
  return (
    <div className="screen">
      <div className="screen-bg">
        <div className="gradient-orb gradient-orb-1" style={{ opacity: 0.2 }} />
        <div className="gradient-orb gradient-orb-2" style={{ opacity: 0.15 }} />
        <div className="gradient-orb gradient-orb-3" style={{ opacity: 0.2 }} />
      </div>

      <div className="content">
        <motion.div
          custom={0}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          style={{
            width: 60,
            height: 60,
            borderRadius: '50%',
            border: '2px solid rgba(184, 164, 232, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1.5rem',
          }}
        >
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6, type: 'spring' }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent-lavender)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </motion.div>
        </motion.div>

        <motion.h2
          custom={1}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          style={{ fontWeight: 300 }}
        >
          You made space for yourself today.
        </motion.h2>

        <div className="spacer-lg" />

        <motion.p
          className="subtitle"
          custom={2}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
        >
          Come back whenever you need another moment.
        </motion.p>

        <div className="spacer-xl" />
        <div className="spacer-xl" />

        <motion.button
          className="btn-primary btn-continue"
          custom={3}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          whileTap={{ scale: 0.97 }}
          onClick={onRestart}
        >
          Take Another Moment
        </motion.button>
      </div>
    </div>
  );
}
