import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
    </svg>
  );
}

function RestartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
    </svg>
  );
}

function VolumeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
    </svg>
  );
}

function Visualization({ audioEngine, isPlaying }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const size = 180;
    canvas.width = size * 2;
    canvas.height = size * 2;

    const draw = () => {
      animRef.current = requestAnimationFrame(draw);
      const data = audioEngine?.getAnalyserData() || new Uint8Array(128).fill(0);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const baseRadius = 55;
      const numBars = 64;
      const time = Date.now() / 1000;

      for (let ring = 0; ring < 3; ring++) {
        ctx.beginPath();
        const ringRadius = baseRadius + ring * 25;
        const alpha = 0.08 - ring * 0.02;

        for (let i = 0; i <= numBars; i++) {
          const angle = (i / numBars) * Math.PI * 2 - Math.PI / 2;
          const dataIndex = Math.floor((i / numBars) * data.length) % data.length;
          const value = (data[dataIndex] || 0) / 255;
          const wave = Math.sin(time * 0.5 + i * 0.15 + ring) * 0.3;
          const r = ringRadius + (value + wave) * (15 - ring * 3);
          const x = cx + Math.cos(angle) * r;
          const y = cy + Math.sin(angle) * r;
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }

        ctx.closePath();
        ctx.strokeStyle = `rgba(184, 164, 232, ${alpha + (isPlaying ? 0.05 : 0)})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      const numDots = 24;
      for (let i = 0; i < numDots; i++) {
        const angle = (i / numDots) * Math.PI * 2 + time * 0.1;
        const dataIndex = Math.floor((i / numDots) * data.length) % data.length;
        const value = (data[dataIndex] || 0) / 255;
        const r = baseRadius + 60 + value * 20;
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;
        const dotSize = 1 + value * 2;

        ctx.beginPath();
        ctx.arc(x, y, dotSize, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(184, 164, 232, ${0.2 + value * 0.3})`;
        ctx.fill();
      }
    };

    draw();
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [audioEngine, isPlaying]);

  return <canvas ref={canvasRef} className="visualization-canvas" />;
}

export default function MusicScreen({ track, audioEngine, onComplete }) {
  const [progress, setProgress] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const hasStarted = useRef(false);

  const handleComplete = useCallback(() => {
    setIsPlaying(false);
    setTimeout(onComplete, 1500);
  }, [onComplete]);

  useEffect(() => {
    if (hasStarted.current || !track || !audioEngine) return;
    hasStarted.current = true;

    audioEngine.onProgress = (p, e) => {
      setProgress(p);
      setElapsed(e);
    };
    audioEngine.onComplete = handleComplete;

    const timer = setTimeout(() => {
      audioEngine.play(track);
      setIsPlaying(true);
    }, 800);

    return () => {
      clearTimeout(timer);
    };
  }, [track, audioEngine, handleComplete]);

  const togglePlay = () => {
    if (isPlaying) {
      audioEngine.pause();
      setIsPlaying(false);
    } else {
      audioEngine.resume();
      setIsPlaying(true);
    }
  };

  const restart = () => {
    audioEngine.play(track);
    setIsPlaying(true);
    setProgress(0);
    setElapsed(0);
  };

  const handleVolume = (e) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    audioEngine.setVolume(v);
  };

  const duration = track?.duration || 120;
  const remaining = Math.max(0, duration - elapsed);
  const circumference = 2 * Math.PI * 100;
  const dashOffset = circumference * (1 - progress);

  return (
    <div className="screen">
      <div className="screen-bg">
        <div className="gradient-orb gradient-orb-1" style={{ opacity: 0.15 }} />
        <div className="gradient-orb gradient-orb-2" style={{ opacity: 0.15 }} />
      </div>

      <motion.div
        className="content"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2 }}
      >
        <motion.p
          className="track-name"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          {track?.name || 'Your moment'}
        </motion.p>

        <div className="spacer-lg" />

        <div className="music-player">
          <div className="progress-ring-container">
            <div className="visualization-container">
              <Visualization audioEngine={audioEngine} isPlaying={isPlaying} />
            </div>

            <svg className="progress-ring" width="220" height="220" viewBox="0 0 220 220">
              <defs>
                <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="var(--accent-lavender)" />
                  <stop offset="100%" stopColor="var(--accent-sky)" />
                </linearGradient>
              </defs>
              <circle className="progress-ring-bg" cx="110" cy="110" r="100" />
              <circle
                className="progress-ring-fill"
                cx="110" cy="110" r="100"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
              />
            </svg>

            <div className="time-display">
              <span className="time-remaining">{formatTime(remaining)}</span>
              <span className="time-label">remaining</span>
            </div>
          </div>

          <div className="player-controls">
            <motion.button
              className="control-btn"
              whileTap={{ scale: 0.9 }}
              onClick={restart}
              aria-label="Restart"
            >
              <RestartIcon />
            </motion.button>

            <motion.button
              className="control-btn control-btn-large"
              whileTap={{ scale: 0.9 }}
              onClick={togglePlay}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <PauseIcon /> : <PlayIcon />}
            </motion.button>
          </div>

          <div className="volume-control">
            <VolumeIcon />
            <input
              type="range"
              className="volume-slider"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={handleVolume}
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
