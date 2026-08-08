export default class AudioEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.reverb = null;
    this.isPlaying = false;
    this.isPaused = false;
    this.startTime = 0;
    this.pauseTime = 0;
    this.duration = 120;
    this.progressInterval = null;
    this.onProgress = null;
    this.onComplete = null;
    this.scheduledNodes = [];
    this.analyser = null;
    this.analyserData = null;
  }

  async init() {
    if (this.ctx) return;
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0;

    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 256;
    this.analyser.smoothingTimeConstant = 0.85;
    this.analyserData = new Uint8Array(this.analyser.frequencyBinCount);

    this.reverb = await this._createReverb();

    this.reverb.connect(this.masterGain);
    this.masterGain.connect(this.analyser);
    this.analyser.connect(this.ctx.destination);
  }

  async _createReverb() {
    const length = this.ctx.sampleRate * 4;
    const impulse = this.ctx.createBuffer(2, length, this.ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const data = impulse.getChannelData(ch);
      for (let i = 0; i < length; i++) {
        const t = i / this.ctx.sampleRate;
        data[i] = (Math.random() * 2 - 1) * Math.exp(-t * 1.5) * 0.5;
      }
    }
    const convolver = this.ctx.createConvolver();
    convolver.buffer = impulse;

    const dryGain = this.ctx.createGain();
    dryGain.gain.value = 0.4;
    const wetGain = this.ctx.createGain();
    wetGain.gain.value = 0.6;

    const input = this.ctx.createGain();
    input.connect(dryGain);
    input.connect(convolver);
    convolver.connect(wetGain);

    const output = this.ctx.createGain();
    dryGain.connect(output);
    wetGain.connect(output);

    input._output = output;
    return input;
  }

  _connectToReverb(node) {
    node.connect(this.reverb);
    if (this.reverb._output) {
      this.reverb._output.connect(this.masterGain);
    }
  }

  _playNote(freq, time, dur, vel = 0.15) {
    const osc = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.value = freq;

    osc2.type = 'sine';
    osc2.frequency.value = freq * 2.01;

    const osc2Gain = this.ctx.createGain();
    osc2Gain.gain.value = vel * 0.15;
    osc2.connect(osc2Gain);
    osc2Gain.connect(gain);

    osc.connect(gain);

    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(vel, time + 0.015);
    gain.gain.exponentialRampToValueAtTime(vel * 0.5, time + 0.15);
    gain.gain.setTargetAtTime(vel * 0.3, time + 0.15, 0.5);
    gain.gain.setTargetAtTime(0.0001, time + dur - 0.5, 0.4);

    this._connectToReverb(gain);

    osc.start(time);
    osc.stop(time + dur + 1);
    osc2.start(time);
    osc2.stop(time + dur + 1);

    this.scheduledNodes.push(osc, osc2);
  }

  _createPad(freq, time, dur, vol = 0.08) {
    const detunes = [-6, -2, 2, 6, 10];
    detunes.forEach((d, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = i % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.value = freq;
      osc.detune.value = d;

      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.value = 0.1 + Math.random() * 0.15;
      lfoGain.gain.value = 1.5;
      lfo.connect(lfoGain);
      lfoGain.connect(osc.detune);

      const v = vol / detunes.length;
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(v, time + 3);
      gain.gain.setValueAtTime(v, time + dur - 3);
      gain.gain.linearRampToValueAtTime(0, time + dur);

      osc.connect(gain);
      this._connectToReverb(gain);

      osc.start(time);
      osc.stop(time + dur + 0.5);
      lfo.start(time);
      lfo.stop(time + dur + 0.5);

      this.scheduledNodes.push(osc, lfo);
    });
  }

  _createRainTexture(time, dur, vol = 0.04) {
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(2, bufferSize, this.ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const data = buffer.getChannelData(ch);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1);
      }
    }

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 3000;
    filter.Q.value = 0.3;

    const filter2 = this.ctx.createBiquadFilter();
    filter2.type = 'highpass';
    filter2.frequency.value = 1000;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(vol, time + 4);
    gain.gain.setValueAtTime(vol, time + dur - 4);
    gain.gain.linearRampToValueAtTime(0, time + dur);

    source.connect(filter);
    filter.connect(filter2);
    filter2.connect(gain);
    gain.connect(this.masterGain);

    source.start(time);
    source.stop(time + dur + 0.5);
    this.scheduledNodes.push(source);
  }

  _createBreathingTexture(time, dur, vol = 0.05) {
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1);
    }

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 500;

    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    lfo.frequency.value = 0.125;
    lfoGain.gain.value = vol;

    lfo.connect(lfoGain);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(0.001, time + 2);

    source.connect(filter);
    filter.connect(gain);
    lfoGain.connect(gain.gain);
    gain.connect(this.masterGain);

    source.start(time);
    source.stop(time + dur + 0.5);
    lfo.start(time);
    lfo.stop(time + dur + 0.5);
    this.scheduledNodes.push(source, lfo);
  }

  _generateMusic(track) {
    const p = track.params;
    const now = this.ctx.currentTime;
    const dur = track.duration;
    const beatLen = 60 / p.tempo;

    for (let i = 0; i < dur; i += beatLen * 8) {
      p.chords.forEach((chord, ci) => {
        const chordTime = now + i + ci * beatLen * 2;
        if (chordTime > now + dur - 2) return;

        const chordDur = beatLen * 2.5;

        chord.forEach(freq => {
          this._createPad(freq * 0.5, chordTime, chordDur + 2, p.padVolume);
        });
      });
    }

    const melodyDelay = beatLen * 2;
    let melodyTime = now + melodyDelay;
    const melodyNotes = [];

    while (melodyTime < now + dur - 4) {
      const chordIdx = Math.floor((melodyTime - now) / (beatLen * 2)) % p.chords.length;
      const chord = p.chords[chordIdx];
      const availableNotes = [...p.melody, ...chord.map(f => f * 2)];

      const numNotes = 2 + Math.floor(Math.random() * 3);
      for (let n = 0; n < numNotes; n++) {
        const note = availableNotes[Math.floor(Math.random() * availableNotes.length)];
        const noteDur = beatLen * (1 + Math.random() * 2);
        const velocity = p.pianoVolume * (0.6 + Math.random() * 0.4);

        if (melodyTime < now + dur - 2) {
          melodyNotes.push({ freq: note, time: melodyTime, dur: noteDur, vel: velocity });
        }
        melodyTime += beatLen * (0.5 + Math.random() * 1.5);
      }

      melodyTime += beatLen * (1 + Math.random() * 3);
    }

    melodyNotes.forEach(n => {
      this._playNote(n.freq, n.time, n.dur, n.vel);
    });

    if (p.hasRain) {
      this._createRainTexture(now, dur, 0.03);
    }

    if (p.hasBreathing) {
      this._createBreathingTexture(now, dur, 0.04);
    }

    this._createPad(p.chords[0][0] * 0.25, now, dur, p.padVolume * 0.4);
  }

  getAnalyserData() {
    if (!this.analyser) return new Uint8Array(128).fill(128);
    this.analyser.getByteFrequencyData(this.analyserData);
    return this.analyserData;
  }

  async play(track) {
    await this.init();
    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }

    this.stop();

    this.duration = track.duration;
    this.isPlaying = true;
    this.isPaused = false;
    this.startTime = this.ctx.currentTime;

    this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
    this.masterGain.gain.setValueAtTime(0, this.ctx.currentTime);
    this.masterGain.gain.linearRampToValueAtTime(1, this.ctx.currentTime + 2);

    this.masterGain.gain.setValueAtTime(1, this.ctx.currentTime + this.duration - 3);
    this.masterGain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + this.duration);

    this._generateMusic(track);

    this.progressInterval = setInterval(() => {
      if (!this.isPlaying || this.isPaused) return;
      const elapsed = this.ctx.currentTime - this.startTime;
      const progress = Math.min(elapsed / this.duration, 1);

      if (this.onProgress) {
        this.onProgress(progress, elapsed, this.duration);
      }

      if (progress >= 1) {
        this.isPlaying = false;
        clearInterval(this.progressInterval);
        if (this.onComplete) this.onComplete();
      }
    }, 100);
  }

  pause() {
    if (!this.isPlaying || this.isPaused) return;
    this.isPaused = true;
    this.pauseTime = this.ctx.currentTime;
    this.ctx.suspend();
  }

  resume() {
    if (!this.isPaused) return;
    this.isPaused = false;
    this.ctx.resume();
  }

  stop() {
    this.isPlaying = false;
    this.isPaused = false;

    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = null;
    }

    this.scheduledNodes.forEach(node => {
      try { node.stop(); } catch {}
    });
    this.scheduledNodes = [];

    if (this.masterGain) {
      this.masterGain.gain.cancelScheduledValues(0);
      this.masterGain.gain.value = 0;
    }
  }

  setVolume(v) {
    if (!this.masterGain) return;
    this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
    this.masterGain.gain.setTargetAtTime(v, this.ctx.currentTime, 0.1);
  }

  destroy() {
    this.stop();
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
    }
  }
}
