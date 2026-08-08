import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.3, duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

function GoogleIcon() {
  return (
    <svg className="google-icon" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

export default function WelcomeScreen({ onLogin }) {
  return (
    <div className="screen">
      <div className="screen-bg">
        <div className="gradient-orb gradient-orb-1" />
        <div className="gradient-orb gradient-orb-2" />
        <div className="gradient-orb gradient-orb-3" />
      </div>

      <div className="content">
        <motion.div
          custom={0}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          style={{ marginBottom: '0.5rem' }}
        >
          <span style={{ fontSize: '3rem' }}>🌙</span>
        </motion.div>

        <motion.h1
          custom={1}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
        >
          Calm Moment
        </motion.h1>

        <div className="spacer-md" />

        <motion.p
          className="subtitle"
          custom={2}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
        >
          Take a little time for yourself.
        </motion.p>

        <div className="spacer-xl" />
        <div className="spacer-xl" />

        <motion.button
          className="btn-primary btn-google"
          custom={3}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          onClick={onLogin}
          whileTap={{ scale: 0.97 }}
        >
          <GoogleIcon />
          Continue with Google
        </motion.button>
      </div>
    </div>
  );
}
