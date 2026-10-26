/**
 * Web Audio API Sound Synthesizer for «علامة | تحدي المعرفة»
 * 100% Offline, zero external audio assets, works instantly in Edge/Chrome
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private soundEnabled: boolean = true;

  constructor() {
    // AudioContext will be initialized on first user interaction to comply with browser autoplay policies
  }

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
  }

  public isSoundEnabled(): boolean {
    return this.soundEnabled;
  }

  /**
   * Joyful melodic fanfare for correct answers
   */
  public playCorrect() {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + i * 0.08);

      gain.gain.setValueAtTime(0, now + i * 0.08);
      gain.gain.linearRampToValueAtTime(0.2, now + i * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.26);
    });
  }

  /**
   * Funny comic cartoon boing/wobble for incorrect answers (humorous & non-violent)
   */
  public playWrong() {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Cartoon descending slide
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(110, now + 0.35);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.38);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.4);

    // Second cartoon "wobble boing"
    const boing = ctx.createOscillator();
    const boingGain = ctx.createGain();
    boing.type = 'sine';
    boing.frequency.setValueAtTime(180, now + 0.15);
    boing.frequency.linearRampToValueAtTime(90, now + 0.45);

    boingGain.gain.setValueAtTime(0.2, now + 0.15);
    boingGain.gain.exponentialRampToValueAtTime(0.005, now + 0.48);

    boing.connect(boingGain);
    boingGain.connect(ctx.destination);

    boing.start(now + 0.15);
    boing.stop(now + 0.5);
  }

  /**
   * Clock tick for countdown
   */
  public playTick() {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.05);
  }

  /**
   * Timeout comic buzzer
   */
  public playTimeout() {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    [0, 0.16].forEach((offset) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(196, now + offset); // G3

      gain.gain.setValueAtTime(0.12, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.01, now + offset + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + offset);
      osc.stop(now + offset + 0.14);
    });
  }

  /**
   * Triumphant victory fanfare for winners
   */
  public playVictory() {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [
      { f: 523.25, t: 0, d: 0.12 },     // C5
      { f: 659.25, t: 0.12, d: 0.12 },  // E5
      { f: 783.99, t: 0.24, d: 0.12 },  // G5
      { f: 1046.50, t: 0.36, d: 0.4 },  // C6
      { f: 880.00, t: 0.8, d: 0.15 },   // A5
      { f: 1046.50, t: 0.98, d: 0.6 },  // C6
    ];

    notes.forEach(({ f, t, d }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, now + t);

      gain.gain.setValueAtTime(0, now + t);
      gain.gain.linearRampToValueAtTime(0.22, now + t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + t + d);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + t);
      osc.stop(now + t + d + 0.05);
    });
  }

  /**
   * Soft UI click
   */
  public playClick() {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.03);

    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.035);
  }

  /**
   * Funny cartoon chicken cluck ("بق بق بقوووق!")
   * 100% Web Audio API synthesized sound
   */
  public playCluck() {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Series of 3 quick rhythmic clucks with pitch drops
    const clucks = [
      { t: 0, startFreq: 750, endFreq: 420, dur: 0.08, vol: 0.18 },
      { t: 0.1, startFreq: 820, endFreq: 460, dur: 0.09, vol: 0.22 },
      { t: 0.22, startFreq: 960, endFreq: 380, dur: 0.18, vol: 0.26 },
    ];

    clucks.forEach(({ t, startFreq, endFreq, dur, vol }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(startFreq, now + t);
      osc.frequency.exponentialRampToValueAtTime(endFreq, now + t + dur);

      gain.gain.setValueAtTime(0, now + t);
      gain.gain.linearRampToValueAtTime(vol, now + t + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + t + dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + t);
      osc.stop(now + t + dur + 0.02);
    });
  }

  /**
   * Cute chick chirp ("صوص صوص!")
   */
  public playChirp() {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    [0, 0.12].forEach((offset) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1400, now + offset);
      osc.frequency.exponentialRampToValueAtTime(2400, now + offset + 0.04);
      osc.frequency.exponentialRampToValueAtTime(1800, now + offset + 0.08);

      gain.gain.setValueAtTime(0.12, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.09);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + offset);
      osc.stop(now + offset + 0.1);
    });
  }

  /**
   * Comic cartoon spring boing when chick jumps or gets poked
   */
  public playFunnyBoing() {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    // Frequency wobble to simulate vibrating spring
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.linearRampToValueAtTime(560, now + 0.12);
    osc.frequency.linearRampToValueAtTime(320, now + 0.22);
    osc.frequency.linearRampToValueAtTime(620, now + 0.35);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.4);
  }

  /**
   * Funny chicken giggle / laughter
   */
  public playChickenLaugh() {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const pulses = [600, 680, 620, 720, 640, 750];
    pulses.forEach((f, i) => {
      const t = i * 0.07;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, now + t);
      osc.frequency.linearRampToValueAtTime(f + 60, now + t + 0.04);

      gain.gain.setValueAtTime(0.1, now + t);
      gain.gain.exponentialRampToValueAtTime(0.001, now + t + 0.06);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + t);
      osc.stop(now + t + 0.065);
    });
  }

  /**
   * Majestic Royal Fanfare for Youssef celebration («مارش النصر الملكي ليوسف»)
   * Grand brass chords + sparkling arpeggios + celebration climax
   */
  public playYoussefFanfare() {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Brass fanfare herald chords (Bb major triumphant progression)
    // Bb4 (466.16), D5 (587.33), F5 (698.46), Bb5 (932.33)
    const fanfareMotif = [
      { f: 466.16, t: 0, d: 0.14, v: 0.22 },
      { f: 466.16, t: 0.16, d: 0.14, v: 0.22 },
      { f: 466.16, t: 0.32, d: 0.14, v: 0.22 },
      { f: 587.33, t: 0.48, d: 0.38, v: 0.28 },
      { f: 466.16, t: 0.90, d: 0.12, v: 0.22 },
      { f: 587.33, t: 1.04, d: 0.12, v: 0.25 },
      { f: 698.46, t: 1.18, d: 0.45, v: 0.30 },
      { f: 932.33, t: 1.68, d: 0.95, v: 0.35 },
    ];

    fanfareMotif.forEach(({ f, t, d, v }) => {
      // Main brass oscillator
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(f, now + t);

      // Lowpass filter for warm rich horn/trumpet texture
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1400, now + t);
      filter.frequency.exponentialRampToValueAtTime(700, now + t + d);

      gain.gain.setValueAtTime(0, now + t);
      gain.gain.linearRampToValueAtTime(v, now + t + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + t + d);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + t);
      osc.stop(now + t + d + 0.05);

      // Harmony layer
      const harm = ctx.createOscillator();
      const harmGain = ctx.createGain();
      harm.type = 'triangle';
      harm.frequency.setValueAtTime(f * 0.5, now + t);
      harmGain.gain.setValueAtTime(0, now + t);
      harmGain.gain.linearRampToValueAtTime(v * 0.4, now + t + 0.03);
      harmGain.gain.exponentialRampToValueAtTime(0.001, now + t + d);
      harm.connect(harmGain);
      harmGain.connect(ctx.destination);
      harm.start(now + t);
      harm.stop(now + t + d + 0.05);
    });

    // Sparkling victory glissando at climax
    const sparkleNotes = [1046.50, 1174.66, 1318.51, 1567.98, 1760.00, 2093.00];
    sparkleNotes.forEach((f, idx) => {
      const t = 1.75 + idx * 0.06;
      const spkOsc = ctx.createOscillator();
      const spkGain = ctx.createGain();
      spkOsc.type = 'sine';
      spkOsc.frequency.setValueAtTime(f, now + t);

      spkGain.gain.setValueAtTime(0.12, now + t);
      spkGain.gain.exponentialRampToValueAtTime(0.001, now + t + 0.2);

      spkOsc.connect(spkGain);
      spkGain.connect(ctx.destination);

      spkOsc.start(now + t);
      spkOsc.stop(now + t + 0.22);
    });
  }

  /**
   * Streak sound effect when player gets consecutive correct answers
   */
  public playStreakSound() {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [659.25, 783.99, 987.77, 1318.51, 1567.98]; // E5, G5, B5, E6, G6
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + i * 0.06);

      gain.gain.setValueAtTime(0, now + i * 0.06);
      gain.gain.linearRampToValueAtTime(0.2, now + i * 0.06 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + i * 0.06);
      osc.stop(now + i * 0.06 + 0.36);
    });
  }

  /**
   * Party Confetti Pop with realistic air-burst and fluttering sizzle
   */
  public playConfettiPop() {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Fast pop impulse
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(280, now);
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.08);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.1);

    // White noise shimmer buffer
    try {
      const bufferSize = ctx.sampleRate * 0.25;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(3200, now + 0.02);
      filter.Q.setValueAtTime(1.5, now + 0.02);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.18, now + 0.02);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(ctx.destination);

      noise.start(now + 0.02);
      noise.stop(now + 0.26);
    } catch {
      // Audio buffer fallback safe
    }
  }

  /**
   * Comic cute surprised squawk / chirp when chick reacts or is poked
   */
  public playSurpriseSquawk() {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(1400, now + 0.06);
    osc.frequency.exponentialRampToValueAtTime(950, now + 0.16);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.2);
  }

  /**
   * Royal sparkling chime when crowning the champion
   */
  public playCrownSparkle() {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [880, 1108.73, 1318.51, 1661.22, 2093.00, 2637.02]; // A major sparkle
    notes.forEach((f, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now + i * 0.07);

      gain.gain.setValueAtTime(0, now + i * 0.07);
      gain.gain.linearRampToValueAtTime(0.16, now + i * 0.07 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.07 + 0.45);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + i * 0.07);
      osc.stop(now + i * 0.07 + 0.5);
    });
  }

  /**
   * Urgent countdown heartbeat & warning sound when time is about to expire (secondsLeft <= 5)
   * Pitch and intensity escalate as seconds tick down to 0!
   */
  public playUrgentCountdown(secondsLeft: number) {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const sec = Math.max(1, Math.min(5, secondsLeft));
    // Escalating frequency: 5s -> 620Hz, 4s -> 740Hz, 3s -> 880Hz, 2s -> 1050Hz, 1s -> 1300Hz
    const freqTable: Record<number, number> = {
      5: 620,
      4: 740,
      3: 880,
      2: 1050,
      1: 1300,
    };
    const freq = freqTable[sec] || 800;

    // First sharp urgent tick
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(freq, now);

    const gainLevel = 0.12 + (6 - sec) * 0.03; // Slightly louder as time dwindles
    gain1.gain.setValueAtTime(gainLevel, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);

    osc1.start(now);
    osc1.stop(now + 0.08);

    // If 1 or 2 seconds left: add an accelerated second echo tick (double ping) for extreme tension
    if (sec <= 2) {
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sawtooth';
      osc2.frequency.setValueAtTime(freq * 1.25, now + 0.08);

      gain2.gain.setValueAtTime(gainLevel * 0.9, now + 0.08);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      osc2.connect(gain2);
      gain2.connect(ctx.destination);

      osc2.start(now + 0.08);
      osc2.stop(now + 0.16);
    }
  }

  /**
   * Snappy energetic alert chime when question is stolen in 1 vs 1 mode
   */
  public playStealChime() {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // Fast high-energy two-tone alert chime (F5 -> C6)
    const notes = [
      { f: 698.46, t: 0, d: 0.1 },
      { f: 1046.50, t: 0.11, d: 0.28 },
    ];
    notes.forEach(({ f, t, d }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, now + t);

      gain.gain.setValueAtTime(0, now + t);
      gain.gain.linearRampToValueAtTime(0.2, now + t + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, now + t + d);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + t);
      osc.stop(now + t + d + 0.02);
    });
  }

  // =========================================================================
  // Accessible Classroom Text-to-Speech (Web Speech API)
  // Allows the app to read questions aloud in natural clear Arabic for classroom students
  // =========================================================================

  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private speechActive: boolean = false;
  private cachedVoices: SpeechSynthesisVoice[] = [];

  public isSpeechSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  public isSpeaking(): boolean {
    if (!this.isSpeechSupported()) return false;
    return window.speechSynthesis.speaking || this.speechActive;
  }

  public stopSpeech() {
    if (!this.isSpeechSupported()) return;
    try {
      this.speechActive = false;
      this.currentUtterance = null;
      window.speechSynthesis.cancel();
    } catch {
      // Safe fallback
    }
  }

  /**
   * Finds the best natural Arabic voice available in the system
   */
  private getBestArabicVoice(): SpeechSynthesisVoice | null {
    if (!this.isSpeechSupported()) return null;

    let voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) {
      voices = this.cachedVoices;
    } else {
      this.cachedVoices = voices;
    }

    if (!voices || voices.length === 0) return null;

    // 1. Look for Egyptian Arabic (ar-EG)
    const egVoice = voices.find(
      (v) => v.lang.toLowerCase() === 'ar-eg' || v.lang.toLowerCase() === 'ar_eg'
    );
    if (egVoice) return egVoice;

    // 2. Look for Saudi or Gulf Arabic (ar-SA)
    const saVoice = voices.find(
      (v) => v.lang.toLowerCase() === 'ar-sa' || v.lang.toLowerCase() === 'ar_sa'
    );
    if (saVoice) return saVoice;

    // 3. Any standard Arabic voice
    const arVoice = voices.find((v) => v.lang.toLowerCase().startsWith('ar'));
    if (arVoice) return arVoice;

    // 4. Voice with "Arabic" or "عربي" in name
    const namedVoice = voices.find(
      (v) =>
        v.name.toLowerCase().includes('arabic') ||
        v.name.includes('عربي') ||
        v.name.toLowerCase().includes('salma') ||
        v.name.toLowerCase().includes('tarik') ||
        v.name.toLowerCase().includes('maged') ||
        v.name.toLowerCase().includes('laila')
    );
    if (namedVoice) return namedVoice;

    return null;
  }

  /**
   * Reads Arabic text aloud with natural human pitch and cadence
   */
  public speakText(text: string, onEnd?: () => void, onError?: () => void) {
    if (!this.isSpeechSupported()) {
      onError?.();
      return;
    }

    try {
      // Stop any prior utterance
      this.stopSpeech();

      // Clean up text (strip emojis, formatting, brackets, excessive spaces)
      const cleanText = text
        .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
        .replace(/[«»*•_`~[\]()]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      if (!cleanText) {
        onEnd?.();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'ar-EG';
      // Completely natural, human speech pitch & rate (normal tone, no distortion)
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      // Select authentic natural Arabic voice
      const arabicVoice = this.getBestArabicVoice();
      if (arabicVoice) {
        utterance.voice = arabicVoice;
      }

      this.speechActive = true;
      this.currentUtterance = utterance;

      utterance.onend = () => {
        this.speechActive = false;
        this.currentUtterance = null;
        onEnd?.();
      };

      utterance.onerror = (e) => {
        this.speechActive = false;
        this.currentUtterance = null;
        if (e.error !== 'interrupted' && e.error !== 'canceled') {
          onError?.();
        }
      };

      window.speechSynthesis.speak(utterance);
    } catch {
      this.speechActive = false;
      onError?.();
    }
  }
}

export const soundEngine = new SoundEngine();

