import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const moodColors = {
  good: 'var(--accent-mint)',
  average: 'var(--accent-sky)',
  bad: 'var(--accent-rose)',
  stressful: 'var(--accent-lavender)',
};

export default function MessageScreen({ quote, mood, onContinue }) {
  const [showButton, setShowButton] = useState(false);
  const words = quote.split(' ');

  useEffect(() => {
    const timer = setTimeout(() => setShowButton(true), words.length * 120 + 800);
    return () => clearTimeout(timer);
  }, [words.length]);

  return (
    <div className="screen">
      <div className="screen-bg">
        <div className="gradient-orb gradient-orb-1" style={{ opacity: 0.2 }} />
        <div className="gradient-orb gradient-orb-3" />
      </div>

      <div className="content">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          style={{
            width: 40,
            height: 2,
            background: moodColors[mood] || 'var(--accent-lavender)',
            borderRadius: 1,
            marginBottom: '2rem',
            opacity: 0.5,
          }}
        />

        <p className="quote-text" style={{ textAlign: 'center' }}>
          {words.map((word, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.3 + i * 0.12,
                duration: 0.5,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
              style={{ display: 'inline-block', marginRight: '0.3em' }}
            >
              {word}
            </motion.span>
          ))}
        </p>

        <div className="spacer-xl" />
        <div className="spacer-xl" />

        {showButton && (
          <motion.button
            className="btn-primary btn-continue"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
            whileTap={{ scale: 0.97 }}
            onClick={onContinue}
          >
            Continue
          </motion.button>
        )}
      </div>
    </div>
  );
}
