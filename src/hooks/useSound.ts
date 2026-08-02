import { useCallback, useRef } from 'react'

class SoundEngine {
  private ctx: AudioContext | null = null

  private getCtx(): AudioContext {
    if (!this.ctx) {
      this.ctx = new AudioContext()
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume()
    }
    return this.ctx
  }

  private tone(freq: number, duration: number, type: OscillatorType = 'sine', volume = 0.15) {
    const ctx = this.getCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = type
    osc.frequency.value = freq
    gain.gain.setValueAtTime(volume, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + duration)
  }

  pop() {
    this.tone(600, 0.08, 'sine', 0.08)
  }

  correct() {
    const ctx = this.getCtx()
    const now = ctx.currentTime
    const notes = [523, 659, 784]
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = freq
      gain.gain.setValueAtTime(0.15, now + i * 0.12)
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.3)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now + i * 0.12)
      osc.stop(now + i * 0.12 + 0.3)
    })
  }

  encourage() {
    this.tone(300, 0.2, 'sine', 0.1)
  }

  sparkle() {
    const ctx = this.getCtx()
    const now = ctx.currentTime
    const notes = [880, 1100, 1320, 1760]
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.value = freq
      gain.gain.setValueAtTime(0.08, now + i * 0.08)
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.2)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now + i * 0.08)
      osc.stop(now + i * 0.08 + 0.2)
    })
  }

  celebrate() {
    const ctx = this.getCtx()
    const now = ctx.currentTime
    const notes = [523, 659, 784, 1047]
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = freq
      gain.gain.setValueAtTime(0.12, now + i * 0.15)
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.15 + 0.4)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now + i * 0.15)
      osc.stop(now + i * 0.15 + 0.4)
    })
  }

  buttonTap() {
    this.tone(440, 0.03, 'sine', 0.06)
  }
}

const engine = new SoundEngine()

export function useSound() {
  const engineRef = useRef(engine)

  const play = useCallback((name: 'pop' | 'correct' | 'encourage' | 'sparkle' | 'celebrate' | 'buttonTap') => {
    engineRef.current[name]()
  }, [])

  return { play }
}
