// Web Audio API celestial synthesizer for Kajal's Starlit Spectrum

class CelestialAudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private ambientGain: GainNode | null = null;
  private isAmbientPlaying: boolean = false;
  private ambientOscs: OscillatorNode[] = [];

  private initContext() {
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.ctx = new AudioCtxClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.ambientGain && this.ctx) {
      this.ambientGain.gain.setTargetAtTime(this.isMuted ? 0 : 0.08, this.ctx.currentTime, 0.2);
    }
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public startAmbient() {
    if (this.isAmbientPlaying) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.setValueAtTime(this.isMuted ? 0 : 0.08, this.ctx.currentTime);
      this.ambientGain.connect(this.ctx.destination);

      // Deep root & fifth chords for cosmic peaceful feeling (D minor / D pentatonic celestial)
      const freqs = [146.83, 220.0, 293.66, 440.0, 587.33, 659.25];
      this.ambientOscs = freqs.map((f, i) => {
        const osc = this.ctx!.createOscillator();
        const panner = this.ctx!.createStereoPanner ? this.ctx!.createStereoPanner() : null;
        const subGain = this.ctx!.createGain();

        osc.type = i % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(f, this.ctx!.currentTime);

        // Gentle LFO detune for lush celestial chorus
        const lfo = this.ctx!.createOscillator();
        lfo.frequency.setValueAtTime(0.1 + i * 0.05, this.ctx!.currentTime);
        const lfoGain = this.ctx!.createGain();
        lfoGain.gain.setValueAtTime(1.5, this.ctx!.currentTime);
        lfo.connect(osc.detune);
        lfo.start();

        subGain.gain.setValueAtTime(0.15 / (i + 1), this.ctx!.currentTime);

        if (panner) {
          panner.pan.setValueAtTime((i % 2 === 0 ? 0.3 : -0.3) * (i * 0.2), this.ctx!.currentTime);
          osc.connect(subGain);
          subGain.connect(panner);
          panner.connect(this.ambientGain!);
        } else {
          osc.connect(subGain);
          subGain.connect(this.ambientGain!);
        }

        osc.start();
        return osc;
      });

      this.isAmbientPlaying = true;
    } catch {
      // Audio context might be restricted before interaction
    }
  }

  // Play sparkling chime on jhumka or maang tikka hover
  public playSparkle(freqMultiplier = 1.0) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const baseFreqs = [523.25, 659.25, 783.99, 1046.5, 1318.51];
    const now = this.ctx.currentTime;

    baseFreqs.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq * freqMultiplier, now + idx * 0.04);

      gain.gain.setValueAtTime(0.001, now + idx * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.08, now + idx * 0.04 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.04 + 0.6);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(now + idx * 0.04);
      osc.stop(now + idx * 0.04 + 0.7);
    });
  }

  // Play water drop / gold particle chime when typing wish
  public playParticleDrop() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    const randomNote = 800 + Math.random() * 600;
    osc.type = 'sine';
    osc.frequency.setValueAtTime(randomNote, now);
    osc.frequency.exponentialRampToValueAtTime(randomNote * 1.5, now + 0.08);

    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.22);
  }

  // Ascending shooting star harmonic glissando when submitting wish
  public playShootingStar() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(1800, now + 1.2);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.12, now + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 1.9);

    // Chime cascade at apex
    setTimeout(() => {
      this.playSparkle(1.5);
    }, 900);
  }

  // Soft breeze rustle
  public playBreeze() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 1.5;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.05;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(400, now);
    filter.Q.setValueAtTime(2.0, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.05, now + 0.5);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.4);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(now);
  }
}

export const celestialAudio = new CelestialAudioEngine();
