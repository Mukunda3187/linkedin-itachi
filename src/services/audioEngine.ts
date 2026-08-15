// Web Audio API Procedural Sound Engine for Cinematic Itachi Experience

class AudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  private initCtx() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Subtle hover whisper tone when mouse hovers over Itachi's eyes
   */
  public playEyeHover() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(140, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(220, this.ctx.currentTime + 0.15);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(400, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.04, this.ctx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.25);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.26);
    } catch {
      // AudioContext might require user gesture
    }
  }

  /**
   * Full cinematic Sharingan awakening sequence sound
   * Deep sub-bass boom, Tsukuyomi frequency rise, spinning resonance, and Mangekyo lock
   */
  public playSharinganActivation() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      // 1. Sub-bass boom & impact
      const subOsc = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(130, now);
      subOsc.frequency.exponentialRampToValueAtTime(32, now + 1.2);

      subGain.gain.setValueAtTime(0.4, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);

      subOsc.connect(subGain);
      subGain.connect(this.ctx.destination);
      subOsc.start(now);
      subOsc.stop(now + 1.9);

      // 2. Sharingan high-resonance vortex swirl
      const swirlOsc = this.ctx.createOscillator();
      const swirlGain = this.ctx.createGain();
      const swirlFilter = this.ctx.createBiquadFilter();

      swirlOsc.type = 'sawtooth';
      swirlOsc.frequency.setValueAtTime(180, now + 0.1);
      swirlOsc.frequency.exponentialRampToValueAtTime(880, now + 1.4);
      swirlOsc.frequency.exponentialRampToValueAtTime(440, now + 2.2);

      swirlFilter.type = 'bandpass';
      swirlFilter.frequency.setValueAtTime(400, now);
      swirlFilter.frequency.exponentialRampToValueAtTime(1800, now + 1.4);
      swirlFilter.Q.setValueAtTime(8, now);

      swirlGain.gain.setValueAtTime(0.001, now);
      swirlGain.gain.linearRampToValueAtTime(0.12, now + 0.3);
      swirlGain.gain.linearRampToValueAtTime(0.18, now + 1.3);
      swirlGain.gain.exponentialRampToValueAtTime(0.001, now + 2.4);

      swirlOsc.connect(swirlFilter);
      swirlFilter.connect(swirlGain);
      swirlGain.connect(this.ctx.destination);
      swirlOsc.start(now + 0.05);
      swirlOsc.stop(now + 2.5);

      // 3. Mangekyo harmonic chime lock
      const chimeOsc = this.ctx.createOscillator();
      const chimeGain = this.ctx.createGain();
      chimeOsc.type = 'triangle';
      chimeOsc.frequency.setValueAtTime(523.25, now + 1.6); // C5
      chimeOsc.frequency.setValueAtTime(659.25, now + 1.8); // E5
      chimeOsc.frequency.setValueAtTime(783.99, now + 2.0); // G5

      chimeGain.gain.setValueAtTime(0.001, now + 1.6);
      chimeGain.gain.linearRampToValueAtTime(0.15, now + 1.7);
      chimeGain.gain.exponentialRampToValueAtTime(0.0001, now + 3.2);

      chimeOsc.connect(chimeGain);
      chimeGain.connect(this.ctx.destination);
      chimeOsc.start(now + 1.6);
      chimeOsc.stop(now + 3.3);

    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }

  /**
   * Sound effect when clicking "COPY WHOLE TEXT"
   */
  public playCopySuccess() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.12); // A5

      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.36);
    } catch {
      // ignore
    }
  }

  /**
   * Subtle click / interaction feedback
   */
  public playClickTick() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.04);

      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.06);
    } catch {
      // ignore
    }
  }
}

export const audioEngine = new AudioEngine();
