import { motion } from 'framer-motion';

const moods = [
  { id: 'good', emoji: '😌', label: 'Good' },
  { id: 'average', emoji: '🙂', label: 'Average' },
  { id: 'bad', emoji: '😔', label: 'Bad' },
  { id: 'stressful', emoji: '😣', label: 'Stressful' },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.4 },
  },
};

const titleVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 25, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

export default function MoodScreen({ onSelectMood }) {
  return (
    <div className="screen">
      <div className="screen-bg">
        <div className="gradient-orb gradient-orb-1" />
        <div className="gradient-orb gradient-orb-2" />
      </div>

      <motion.div
        className="content"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.p
          className="subtitle"
          variants={titleVariants}
          style={{ marginBottom: '0.5rem' }}
        >
          Take a moment for yourself.
        </motion.p>

        <motion.h2 variants={titleVariants}>
          How was your day?
        </motion.h2>

        <div className="spacer-xl" />

        <div className="mood-grid">
          {moods.map((mood) => (
            <motion.button
              key={mood.id}
              className="mood-card"
              variants={cardVariants}
              whileHover={{ y: -4, boxShadow: '0 12px 40px rgba(0,0,0,0.25)' }}
              whileTap={{ scale: 0.93 }}
              onClick={() => onSelectMood(mood.id)}
            >
              <span className="mood-emoji">{mood.emoji}</span>
              <span className="mood-label">{mood.label}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
