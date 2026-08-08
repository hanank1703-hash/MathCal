const musicLibrary = [
  {
    id: 'morning-light',
    name: 'Morning Light',
    mood: 'good',
    duration: 120,
    active: true,
    params: {
      key: 'C',
      mode: 'major',
      tempo: 58,
      brightness: 0.7,
      chords: [
        [261.63, 329.63, 392.00],  // C major
        [220.00, 329.63, 440.00],  // Am
        [174.61, 261.63, 349.23],  // F
        [196.00, 246.94, 392.00],  // G
      ],
      melody: [523.25, 587.33, 659.26, 587.33, 523.25, 493.88, 523.25],
      padVolume: 0.08,
      pianoVolume: 0.12,
    },
  },
  {
    id: 'golden-hour',
    name: 'Golden Hour',
    mood: 'good',
    duration: 105,
    active: true,
    params: {
      key: 'G',
      mode: 'major',
      tempo: 54,
      brightness: 0.65,
      chords: [
        [196.00, 246.94, 293.66],  // G
        [164.81, 246.94, 329.63],  // Em
        [261.63, 329.63, 392.00],  // C
        [293.66, 369.99, 440.00],  // D
      ],
      melody: [392.00, 440.00, 493.88, 523.25, 493.88, 440.00, 392.00],
      padVolume: 0.09,
      pianoVolume: 0.11,
    },
  },
  {
    id: 'quiet-evening',
    name: 'Quiet Evening',
    mood: 'average',
    duration: 115,
    active: true,
    params: {
      key: 'G',
      mode: 'major',
      tempo: 48,
      brightness: 0.5,
      chords: [
        [196.00, 246.94, 293.66],  // G
        [164.81, 246.94, 329.63],  // Em
        [261.63, 329.63, 392.00],  // C
        [220.00, 261.63, 329.63],  // Am
      ],
      melody: [493.88, 440.00, 392.00, 329.63, 392.00, 440.00, 493.88],
      padVolume: 0.1,
      pianoVolume: 0.09,
    },
  },
  {
    id: 'still-waters',
    name: 'Still Waters',
    mood: 'average',
    duration: 110,
    active: true,
    params: {
      key: 'F',
      mode: 'major',
      tempo: 44,
      brightness: 0.45,
      chords: [
        [174.61, 220.00, 261.63],  // F
        [146.83, 220.00, 293.66],  // Dm
        [130.81, 196.00, 261.63],  // C
        [155.56, 196.00, 233.08],  // Bb
      ],
      melody: [349.23, 329.63, 293.66, 261.63, 293.66, 349.23, 329.63],
      padVolume: 0.11,
      pianoVolume: 0.08,
    },
  },
  {
    id: 'gentle-rain',
    name: 'Gentle Rain',
    mood: 'bad',
    duration: 120,
    active: true,
    params: {
      key: 'A',
      mode: 'minor',
      tempo: 42,
      brightness: 0.35,
      chords: [
        [220.00, 261.63, 329.63],  // Am
        [174.61, 220.00, 261.63],  // F
        [261.63, 329.63, 392.00],  // C
        [164.81, 246.94, 329.63],  // Em
      ],
      melody: [440.00, 392.00, 329.63, 293.66, 329.63, 392.00, 440.00],
      padVolume: 0.12,
      pianoVolume: 0.1,
      hasRain: true,
    },
  },
  {
    id: 'warm-embrace',
    name: 'Warm Embrace',
    mood: 'bad',
    duration: 118,
    active: true,
    params: {
      key: 'D',
      mode: 'minor',
      tempo: 40,
      brightness: 0.3,
      chords: [
        [146.83, 174.61, 220.00],  // Dm
        [155.56, 196.00, 233.08],  // Bb
        [196.00, 246.94, 293.66],  // Gm
        [130.81, 164.81, 196.00],  // C
      ],
      melody: [293.66, 261.63, 220.00, 196.00, 220.00, 261.63, 293.66],
      padVolume: 0.13,
      pianoVolume: 0.09,
    },
  },
  {
    id: 'deep-breath',
    name: 'Deep Breath',
    mood: 'stressful',
    duration: 120,
    active: true,
    params: {
      key: 'D',
      mode: 'minor',
      tempo: 36,
      brightness: 0.25,
      chords: [
        [146.83, 174.61, 220.00],  // Dm
        [155.56, 196.00, 233.08],  // Bb
        [130.81, 164.81, 196.00],  // C
        [110.00, 146.83, 174.61],  // Am (low)
      ],
      melody: [293.66, 261.63, 220.00, 174.61, 220.00, 261.63, 220.00],
      padVolume: 0.14,
      pianoVolume: 0.06,
      hasBreathing: true,
    },
  },
  {
    id: 'letting-go',
    name: 'Letting Go',
    mood: 'stressful',
    duration: 120,
    active: true,
    params: {
      key: 'E',
      mode: 'minor',
      tempo: 34,
      brightness: 0.2,
      chords: [
        [164.81, 196.00, 246.94],  // Em
        [130.81, 196.00, 261.63],  // C
        [196.00, 246.94, 293.66],  // G
        [146.83, 220.00, 293.66],  // Dm
      ],
      melody: [329.63, 293.66, 246.94, 220.00, 246.94, 293.66, 329.63],
      padVolume: 0.15,
      pianoVolume: 0.05,
      hasBreathing: true,
    },
  },
];

export function getTrackForMood(mood) {
  const tracks = musicLibrary.filter(t => t.mood === mood && t.active);
  return tracks[Math.floor(Math.random() * tracks.length)];
}

export default musicLibrary;
