import { useState, useRef, useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import WelcomeScreen from './screens/WelcomeScreen';
import MoodScreen from './screens/MoodScreen';
import MessageScreen from './screens/MessageScreen';
import PrepareScreen from './screens/PrepareScreen';
import MusicScreen from './screens/MusicScreen';
import CompletionScreen from './screens/CompletionScreen';
import Particles from './components/Particles';

import { getRandomQuote } from './data/quotes';
import { getTrackForMood } from './data/musicLibrary';
import { signInWithGoogle, isAuthenticated } from './utils/auth';
import { saveSession } from './utils/storage';
import AudioEngine from './audio/AudioEngine';

const SCREENS = {
  WELCOME: 'welcome',
  MOOD: 'mood',
  MESSAGE: 'message',
  PREPARE: 'prepare',
  MUSIC: 'music',
  COMPLETION: 'completion',
};

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] } },
  exit: { opacity: 0, y: -15, transition: { duration: 0.4, ease: 'easeIn' } },
};

export default function App() {
  const [screen, setScreen] = useState(
    isAuthenticated() ? SCREENS.MOOD : SCREENS.WELCOME
  );
  const [mood, setMood] = useState(null);
  const [quote, setQuote] = useState('');
  const [track, setTrack] = useState(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const audioEngineRef = useRef(null);
  const sessionRef = useRef({});

  useEffect(() => {
    audioEngineRef.current = new AudioEngine();
    return () => {
      audioEngineRef.current?.destroy();
    };
  }, []);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      await signInWithGoogle();
      setScreen(SCREENS.MOOD);
    } catch {
      setIsLoggingIn(false);
    }
  };

  const handleSelectMood = (selectedMood) => {
    setMood(selectedMood);
    const q = getRandomQuote(selectedMood);
    setQuote(q);
    const t = getTrackForMood(selectedMood);
    setTrack(t);
    sessionRef.current = {
      mood: selectedMood,
      quote: q,
      trackId: t?.id,
      trackName: t?.name,
    };
    setScreen(SCREENS.MESSAGE);
  };

  const handleMessageContinue = async () => {
    if (audioEngineRef.current) {
      await audioEngineRef.current.init();
    }
    setScreen(SCREENS.PREPARE);
  };

  const handlePrepareReady = useCallback(() => {
    setScreen(SCREENS.MUSIC);
  }, []);

  const handleMusicComplete = useCallback(() => {
    saveSession({ ...sessionRef.current, completed: true });
    setScreen(SCREENS.COMPLETION);
  }, []);

  const handleRestart = () => {
    audioEngineRef.current?.stop();
    setMood(null);
    setQuote('');
    setTrack(null);
    sessionRef.current = {};
    setScreen(SCREENS.MOOD);
  };

  return (
    <div className="app-container">
      <Particles />

      <AnimatePresence mode="wait">
        {screen === SCREENS.WELCOME && (
          <motion.div key="welcome" {...pageVariants} style={{ position: 'absolute', inset: 0 }}>
            <WelcomeScreen onLogin={handleLogin} isLoading={isLoggingIn} />
          </motion.div>
        )}

        {screen === SCREENS.MOOD && (
          <motion.div key="mood" {...pageVariants} style={{ position: 'absolute', inset: 0 }}>
            <MoodScreen onSelectMood={handleSelectMood} />
          </motion.div>
        )}

        {screen === SCREENS.MESSAGE && (
          <motion.div key="message" {...pageVariants} style={{ position: 'absolute', inset: 0 }}>
            <MessageScreen quote={quote} mood={mood} onContinue={handleMessageContinue} />
          </motion.div>
        )}

        {screen === SCREENS.PREPARE && (
          <motion.div key="prepare" {...pageVariants} style={{ position: 'absolute', inset: 0 }}>
            <PrepareScreen onReady={handlePrepareReady} audioEngine={audioEngineRef.current} />
          </motion.div>
        )}

        {screen === SCREENS.MUSIC && (
          <motion.div key="music" {...pageVariants} style={{ position: 'absolute', inset: 0 }}>
            <MusicScreen
              track={track}
              audioEngine={audioEngineRef.current}
              onComplete={handleMusicComplete}
            />
          </motion.div>
        )}

        {screen === SCREENS.COMPLETION && (
          <motion.div key="completion" {...pageVariants} style={{ position: 'absolute', inset: 0 }}>
            <CompletionScreen onRestart={handleRestart} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
